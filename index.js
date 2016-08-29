var R = require('ramda');

function forEachFunctionInObject(object, callback) {
  for (var key in object) {
    //noinspection JSUnfilteredForInLoop
    if (typeof object[key] === 'function') {
      //noinspection JSUnfilteredForInLoop
      callback(key);
    }
  }
}

function getArgumentsArray(args) {
  var argsArray = [];
  argsArray.push.apply(argsArray, args);
  return argsArray;
}

var replaceMethodWithStub = R.curry(function(object, methodName) {
  object[methodName] = sinon.stub();
});

module.exports.onObject = function(target, autoReset, afterEachHook) {
  var activeStubs = {};
  var activeReplacements = {};

  if (typeof autoReset === 'undefined') {
    autoReset = true;
  }
  if (typeof afterEachHook === 'undefined') {
    afterEachHook = afterEach;
  }
  if (autoReset) {
    afterEachHook(reset);
  }

  function reset() {
    restoreKeysOf(activeStubs);
    restoreKeysOf(activeReplacements);
    activeStubs = {};
    activeReplacements = {};
  }

  function restoreKeysOf(object) {
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        restore(key);
      }
    }
  }

  function restore(key) {
    if (activeStubs.hasOwnProperty(key)) {
      activeStubs[key].restore();
      delete activeStubs[key];
    }
    if (activeReplacements.hasOwnProperty(key)) {
      target[key] = activeReplacements[key];
      delete activeReplacements[key];
    }
  }

  function stub() {
    var args = getArgumentsArray(arguments);

    if (args.length === 0) {
      forEachFunctionInObject(target, stub);
      return this;
    }

    var index = 0;
    while (index < args.length) {
      var key = args[index];
      restore(key);
      index++;

      if (typeof args[index] === 'function') {
        activeStubs[key] = sinon.stub(target, key, args[index]);
        index++;
      } else {
        activeStubs[key] = sinon.stub(target, key);
      }
    }
    return this;
  }

  function spy() {
    var args = getArgumentsArray(arguments);

    if (args.length === 0) {
      forEachFunctionInObject(target, spy);
      return this;
    }

    var index = 0;
    while (index < args.length) {
      var key = args[index];
      restore(key);
      activeStubs[key] = sinon.spy(target, key);
      index++;
    }
    return this;
  }

  function replace(key, replacement) {
    restore(key);
    activeReplacements[key] = target[key];
    target[key] = replacement;
    return this;
  }

  return {
    stub: stub,

    spy: spy,

    replace: replace,

    reset: function() {
      reset();
      return this;
    }
  };
};

module.exports.fromConstructor = function(target) {
  function getStub() {
    var instances = [], instanceArgs = [];
    var ReturnedConstructor = sinon.spy(StubConstructor);
    var additionalMethods = [];

    function StubConstructor() {
      instanceArgs.push(getArgumentsArray(arguments));
      instances.push(this);

      forEachFunctionInObject(target.prototype, replaceMethodWithStub(this));
      additionalMethods.forEach(replaceMethodWithStub(this));

      var index = 0;
      while (index < additionalMethods.length) {
        var methodName = additionalMethods[index];
        index++;

        if (typeof additionalMethods[index] === 'function') {
          this[methodName] = sinon.spy(additionalMethods[index]);
          index++;
        } else {
          replaceMethodWithStub(this)(methodName);
        }
      }
      return this;
    }

    ReturnedConstructor.stub = function(methodName) {
      var args = getArgumentsArray(arguments);
      additionalMethods = additionalMethods.concat(args);
      return this;
    };

    ReturnedConstructor.getInstances = function() {
      return instances;
    };

    ReturnedConstructor.getInstance = function(index) {
      if (typeof index === "undefined") {
        if (instances.length > 1) {
          throw new Error('Tried to access only instance of StubConstructor, but there were ' + instances.length + ' instances.');
        }
        index = 0;
      }
      if (instances.length <= index) {
        throw new Error('Tried to access StubConstructor instance ' + index + ', but there were only ' +
          instances.length + ' instances.');
      }

      return instances[index];
    };

    ReturnedConstructor.getInstancesArgs = function() {
      return instanceArgs;
    };

    ReturnedConstructor.getInstanceArgs = function(index) {
      if (typeof index === "undefined") {
        if (instances.length > 1) {
          throw new Error('Tried to access arguments of only instance of StubConstructor, but there were ' +
            instances.length +
            ' instances.');
        }
        index = 0;
      }
      if (instances.length <= index) {
        throw new Error('Tried to access arguments of StubConstructor instance ' + index + ', but there were only ' +
          instances.length + ' instances.');
      }

      return instanceArgs[index];
    };

    return ReturnedConstructor;
  }

  return {
    getStub: getStub
  };
};
