/* global sinon, afterEach */
var R = require('ramda')

var replaceMethodWithStub = R.curry(function (object, methodName) {
  object[ methodName ] = sinon.stub()
})

var applyToEachFunctionKeyInObject = function (appliedFunction, object) {
  R.compose(
    R.forEach(appliedFunction),
    R.filter(R.propIs(Function, R.__, object)),
    R.keysIn
  )(object)
}

function getArrayFromArrayLikeObject (args) {
  return Array.prototype.slice.call(args)
}

function parseStringFunctionArrayToArguments (argsArray) {
  var index = 0
  var firstArg
  var result = []

  while (index < argsArray.length) {
    firstArg = argsArray[ index ]
    index++

    if (typeof argsArray[ index ] === 'function') {
      result.push([ firstArg, argsArray[ index ] ])
      index++
    } else {
      result.push([ firstArg ])
    }
  }
  return result
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
    return this
  }

  function restoreKeysOf (object) {
    for (var key in object) {
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

  var createStubOrSpy = R.curry(function (stubbingFunction, args) {
    restore(args[ 0 ])
    activeStubs[ args[ 0 ] ] = R.apply(stubbingFunction, R.concat([ target ], args))
  })

  function getTargetStubber (stubbingFunction) {
    return function stubOrSpy () {
      var args = getArrayFromArrayLikeObject(arguments)

      if (args.length === 0) {
        applyToEachFunctionKeyInObject(stubOrSpy, target)
      } else {
        R.compose(
          R.forEach(createStubOrSpy(stubbingFunction)),
          parseStringFunctionArrayToArguments
        )(args)
      }
      return this
    }
  }

  function replace (key, replacement) {
    restore(key)
    activeReplacements[ key ] = target[ key ]
    target[ key ] = replacement
    return this
  }

  return {
    stub: getTargetStubber(sinon.stub),
    spy: getTargetStubber(sinon.spy),
    replace: replace,
    reset: reset
  }
}

module.exports.fromConstructor = function (target) {
  function createStubs (object, stubsAndImplementations) {
    R.compose(
      R.forEach(function (args) {
        if (args.length === 2) {
          object[ args[ 0 ] ] = sinon.spy(args[ 1 ])
        } else {
          replaceMethodWithStub(object, args[ 0 ])
        }
      }),
      parseStringFunctionArrayToArguments
    )(stubsAndImplementations)
  }

  function getStub () {
    var instances = []
    var instanceArgs = []
    var ReturnedConstructor = sinon.spy(StubConstructor)
    var additionalMethods = []

    function StubConstructor () {
      instanceArgs.push(getArrayFromArrayLikeObject(arguments))
      instances.push(this)

      applyToEachFunctionKeyInObject(replaceMethodWithStub(this), target.prototype)
      createStubs(this, additionalMethods)
      return this
    }

    ReturnedConstructor.stub = function () {
      var args = getArrayFromArrayLikeObject(arguments)

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
