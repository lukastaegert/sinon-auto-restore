/* global sinon, afterEach */
var R = require('ramda')

var replaceMethodWithStub = R.curry(function (object, methodName) {
  object[ methodName ] = sinon.stub()
})

function forEachFunctionInObject (object, appliedFunction) {
  var key

  for (key in object) {
    // noinspection JSUnfilteredForInLoop
    if (typeof object[ key ] === 'function') {
      // noinspection JSUnfilteredForInLoop
      appliedFunction(key)
    }
  }
}

function getArgumentsArray (args) {
  var argsArray = []

  argsArray.push.apply(argsArray, args)
  return argsArray
}

module.exports.onObject = function (target, autoReset, afterEachHook) {
  var activeStubs = {}
  var activeReplacements = {}

  if (typeof autoReset === 'undefined' || autoReset) {
    if (typeof afterEachHook === 'undefined') {
      afterEach(reset)
    } else {
      afterEachHook(reset)
    }
  }

  function reset () {
    restoreKeysOf(activeStubs)
    restoreKeysOf(activeReplacements)
    activeStubs = {}
    activeReplacements = {}
  }

  function restoreKeysOf (object) {
    var key

    for (key in object) {
      if (object.hasOwnProperty(key)) {
        restore(key)
      }
    }
  }

  function restore (key) {
    if (activeStubs.hasOwnProperty(key)) {
      activeStubs[ key ].restore()
      delete activeStubs[ key ]
    }
    if (activeReplacements.hasOwnProperty(key)) {
      target[ key ] = activeReplacements[ key ]
      delete activeReplacements[ key ]
    }
  }

  function handleStubArgs (args) {
    var argIndex = 0
    var methodName

    while (argIndex < args.length) {
      methodName = args[ argIndex ]
      restore(methodName)
      argIndex++

      if (typeof args[ argIndex ] === 'function') {
        activeStubs[ methodName ] = sinon.stub(target, methodName, args[ argIndex ])
        argIndex++
      } else {
        activeStubs[ methodName ] = sinon.stub(target, methodName)
      }
    }
  }

  function handleSpyArgs (args) {
    var argIndex = 0
    var methodName

    while (argIndex < args.length) {
      methodName = args[ argIndex ]
      restore(methodName)
      activeStubs[ methodName ] = sinon.spy(target, methodName)
      argIndex++
    }
  }

  function stub () {
    var args = getArgumentsArray(arguments)

    if (args.length === 0) {
      forEachFunctionInObject(target, stub)
    } else {
      handleStubArgs(args)
    }
    return this
  }

  function spy () {
    var args = getArgumentsArray(arguments)

    if (args.length === 0) {
      forEachFunctionInObject(target, spy)
    } else {
      handleSpyArgs(args)
    }
    return this
  }

  function replace (key, replacement) {
    restore(key)
    activeReplacements[ key ] = target[ key ]
    target[ key ] = replacement
    return this
  }

  return {
    stub: stub,
    spy: spy,
    replace: replace,
    reset: function () {
      reset()
      return this
    }
  }
}

module.exports.fromConstructor = function (target) {
  function createStubs (object, stubsAndImplementations) {
    var index = 0
    var methodName

    while (index < stubsAndImplementations.length) {
      methodName = stubsAndImplementations[ index ]
      index++

      if (typeof stubsAndImplementations[ index ] === 'function') {
        object[ methodName ] = sinon.spy(stubsAndImplementations[ index ])
        index++
      } else {
        replaceMethodWithStub(object)(methodName)
      }
    }
  }

  function getStub () {
    var instances = []
    var instanceArgs = []
    var ReturnedConstructor = sinon.spy(StubConstructor)
    var additionalMethods = []

    function StubConstructor () {
      instanceArgs.push(getArgumentsArray(arguments))
      instances.push(this)

      forEachFunctionInObject(target.prototype, replaceMethodWithStub(this))
      createStubs(this, additionalMethods)
      return this
    }

    ReturnedConstructor.stub = function () {
      var args = getArgumentsArray(arguments)

      additionalMethods = additionalMethods.concat(args)
      return this
    }

    ReturnedConstructor.getInstances = function () {
      return instances
    }

    ReturnedConstructor.getInstance = function (index) {
      var instanceIndex = index || 0

      if (typeof index === 'undefined') {
        if (instances.length > 1) {
          throw new Error('Tried to access only instance of StubConstructor, but there were ' + instances.length + ' instances.')
        }
      }
      if (instances.length <= instanceIndex) {
        throw new Error('Tried to access StubConstructor instance ' + instanceIndex + ', but there were only ' +
          instances.length + ' instances.')
      }

      return instances[ instanceIndex ]
    }

    ReturnedConstructor.getInstancesArgs = function () {
      return instanceArgs
    }

    ReturnedConstructor.getInstanceArgs = function (index) {
      var instanceIndex = index || 0

      if (typeof index === 'undefined') {
        if (instances.length > 1) {
          throw new Error('Tried to access arguments of only instance of StubConstructor, but there were ' +
            instances.length + ' instances.')
        }
      }
      if (instances.length <= instanceIndex) {
        throw new Error('Tried to access arguments of StubConstructor instance ' + instanceIndex + ', but there were only ' +
          instances.length + ' instances.')
      }

      return instanceArgs[ instanceIndex ]
    }

    return ReturnedConstructor
  }

  return {
    getStub: getStub
  }
}
