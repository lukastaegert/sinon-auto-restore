/* global sinon, afterEach */
var R = require('ramda')
var activeChanges = []

var isActiveChangesForThis = function (activeChanges) {
  return activeChanges.object === this
}

function getActiveChangesForObject (object) {
  var activeChangesForObject = activeChanges.filter(isActiveChangesForThis, object)[ 0 ]
  if (!activeChangesForObject) {
    activeChangesForObject = { object: object, activeStubs: {}, activeReplacements: {} }
    activeChanges.push(activeChangesForObject)
  }
  return activeChangesForObject
}

var createStubOrSpyForObjectKey = R.curry(function (stubbingFunction, object, args) {
  restoreKey(object, args[ 0 ])
  var activeStubs = getActiveChangesForObject(object).activeStubs
  activeStubs[ args[ 0 ] ] = R.apply(stubbingFunction, R.concat([ object ], args))
})

function replaceObjectKey (object, key, replacement) {
  restoreKey(object, key)
  var activeReplacements = getActiveChangesForObject(object).activeReplacements
  activeReplacements[ key ] = object[ key ]
  object[ key ] = replacement
}

function restoreKey (object, key) {
  var activeChangesForObject = getActiveChangesForObject(object)
  var activeStubs = activeChangesForObject.activeStubs
  var activeReplacements = activeChangesForObject.activeReplacements

  if (activeStubs.hasOwnProperty(key)) {
    activeStubs[ key ].restore()
    delete activeStubs[ key ]
  }
  if (activeReplacements.hasOwnProperty(key)) {
    object[ key ] = activeReplacements[ key ]
    delete activeReplacements[ key ]
  }
}

var applyToEachKeyInObject = function (object, appliedFunction) {
  R.compose(
    R.forEach(appliedFunction),
    R.keys
  )(object)
}

function restoreActiveChangesForObject (activeChangesForObject) {
  applyToEachKeyInObject(activeChangesForObject.activeStubs, function (key) {
    activeChangesForObject.activeStubs[ key ].restore()
  })
  applyToEachKeyInObject(activeChangesForObject.activeReplacements, function (key) {
    activeChangesForObject.object[ key ] = activeChangesForObject.activeReplacements[ key ]
  })
}

var applyToEachFunctionKeyInObject = function (appliedFunction, object) {
  R.compose(
    R.forEach(appliedFunction),
    R.filter(R.propIs(Function, R.__, object))
  )(Object.getOwnPropertyNames(object))
}

var applyToEachFunctionKeyInPrototypeChain = function (appliedFunction, object, prototypeLevels) {
  if (object && prototypeLevels >= 0) {
    applyToEachFunctionKeyInObject(appliedFunction, object)
    applyToEachFunctionKeyInPrototypeChain(appliedFunction, Object.getPrototypeOf(object), prototypeLevels - 1)
  }
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

var afterEachHook
var autoRestore = true

function restore () {
  activeChanges.forEach(restoreActiveChangesForObject)
  activeChanges.length = 0
}

module.exports.restore = restore

module.exports.configure = function (options) {
  afterEachHook = afterEachHook || options.afterEachHook
  if (typeof options.autoRestore !== 'undefined') {
    autoRestore = options.autoRestore
  }
}

module.exports.onObject = function (target) {
  if (autoRestore) {
    if (typeof afterEachHook === 'undefined') {
      afterEach(restore)
    } else {
      afterEachHook(restore)
    }
  }

  function getTargetStubber (stubbingFunction) {
    return function stubOrSpy () {
      var args = getArrayFromArrayLikeObject(arguments)

      if (args.length === 0) {
        applyToEachFunctionKeyInObject(stubOrSpy, target)
      } else if (args.length === 1 && typeof args[ 0 ] === 'number') {
        applyToEachFunctionKeyInPrototypeChain(stubOrSpy, target, args[ 0 ])
      } else {
        R.compose(
          R.forEach(createStubOrSpyForObjectKey(stubbingFunction, target)),
          parseStringFunctionArrayToArguments
        )(args)
      }
      return this
    }
  }

  function replace (key, replacement) {
    replaceObjectKey(target, key, replacement)
    return this
  }

  return {
    stub: getTargetStubber(sinon.stub),
    spy: getTargetStubber(sinon.spy),
    replace: replace
  }
}
