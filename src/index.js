/* global sinon */

import {
  __,
  apply,
  compose,
  concat,
  curry,
  filter,
  forEach,
  keys,
  last,
  propIs,
  reduce
} from 'ramda'
const activeChanges = []

const isActiveChangeForObject = object => activeChange =>
  activeChange.object === object

function getActiveChangesForObject (object) {
  let activeChangesForObject = activeChanges.filter(
    isActiveChangeForObject(object)
  )[0]
  if (!activeChangesForObject) {
    activeChangesForObject = {
      object: object,
      activeStubs: {},
      activeReplacements: {}
    }
    activeChanges.push(activeChangesForObject)
  }
  return activeChangesForObject
}

const createStubOrSpyForObjectKey = curry(function (
  stubbingFunction,
  object,
  args
) {
  restoreKey(object, args[0])
  const activeStubs = getActiveChangesForObject(object).activeStubs
  activeStubs[args[0]] = apply(stubbingFunction, concat([object], args))
})

function replaceObjectKey (object, key, replacement) {
  restoreKey(object, key)
  const activeReplacements = getActiveChangesForObject(object)
    .activeReplacements
  activeReplacements[key] = object[key]
  object[key] = replacement
}

function restoreKey (object, key) {
  const activeChangesForObject = getActiveChangesForObject(object)
  const activeStubs = activeChangesForObject.activeStubs
  const activeReplacements = activeChangesForObject.activeReplacements

  if (activeStubs.hasOwnProperty(key)) {
    activeStubs[key].restore()
    delete activeStubs[key]
  }
  if (activeReplacements.hasOwnProperty(key)) {
    object[key] = activeReplacements[key]
    delete activeReplacements[key]
  }
}

const applyToEachKeyInObject = (object, appliedFunction) =>
  compose(forEach(appliedFunction), keys)(object)

function restoreActiveChangesForObject (activeChangesForObject) {
  applyToEachKeyInObject(activeChangesForObject.activeStubs, key => {
    activeChangesForObject.activeStubs[key].restore()
  })
  applyToEachKeyInObject(activeChangesForObject.activeReplacements, key => {
    activeChangesForObject.object[key] =
      activeChangesForObject.activeReplacements[key]
  })
}

const applyToEachFunctionKeyInObject = function (appliedFunction, object) {
  compose(forEach(appliedFunction), filter(propIs(Function, __, object)))(
    Object.getOwnPropertyNames(object)
  )
}

const applyToEachFunctionKeyInPrototypeChain = function (
  appliedFunction,
  object,
  prototypeLevels
) {
  if (object && prototypeLevels >= 0) {
    applyToEachFunctionKeyInObject(appliedFunction, object)
    applyToEachFunctionKeyInPrototypeChain(
      appliedFunction,
      Object.getPrototypeOf(object),
      prototypeLevels - 1
    )
  }
}

function getArrayFromArrayLikeObject (args) {
  return Array.prototype.slice.call(args)
}

// we cannot directly define this as the result of reduce because then, each call would use the SAME
// empty array reference as reduce initializer
const parseStringFunctionArrayToArguments = function (argsArray) {
  return reduce(function (arrayOfArguments, argument) {
    if (typeof argument !== 'function') {
      arrayOfArguments.push([argument])
    } else {
      last(arrayOfArguments).push(argument)
    }
    return arrayOfArguments
  }, [])(argsArray)
}

export function restore () {
  activeChanges.forEach(restoreActiveChangesForObject)
  activeChanges.length = 0
}

export function onObject (target) {
  const getTargetStubber = stubbingFunction =>
    function stubOrSpy () {
      const args = getArrayFromArrayLikeObject(arguments)

      if (args.length === 0) {
        applyToEachFunctionKeyInObject(stubOrSpy, target)
      } else if (args.length === 1 && typeof args[0] === 'number') {
        applyToEachFunctionKeyInPrototypeChain(stubOrSpy, target, args[0])
      } else {
        compose(
          forEach(createStubOrSpyForObjectKey(stubbingFunction, target)),
          parseStringFunctionArrayToArguments
        )(args)
      }
      return this
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
