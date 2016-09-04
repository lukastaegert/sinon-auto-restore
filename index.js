/* global sinon, afterEach */
var R = require('ramda')

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

// we cannot directly define this as the result of R.reduce because then, each call would use the SAME empty array
// reference as reduce initializer
var parseStringFunctionArrayToArguments = function (argsArray) {
  return R.reduce(function (arrayOfArguments, argument) {
    if (typeof argument !== 'function') {
      arrayOfArguments.push([ argument ])
    } else {
      R.last(arrayOfArguments).push(argument)
    }
    return arrayOfArguments
  }, [])(argsArray)
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

  var restoreKeysOf = R.compose(R.forEach(restore), R.keysIn)

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
