/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

var sinonAutoRestore = require('../dist/index')
var onObject = sinonAutoRestore.onObject
var restore = sinonAutoRestore.restore
var expect = require('chai').expect

var sinon, testObject

function createSinonMock () {
  sinon = {
    stub: function (object, methodName, implementation) {
      if (arguments.length === 0) {
        return sinonGetStub()
      }
      if (arguments.length === 2 && typeof object === 'object' && typeof methodName === 'string') {
        return sinonStub(object, methodName)
      }
      if (arguments.length === 3 && typeof object === 'object' && typeof methodName === 'string' &&
        typeof implementation === 'function') {
        return sinonStub(object, methodName, implementation)
      }
      throw new Error('Called sinon.stub with ' + arguments.length + ' invalid arguments: ' +
        Array.prototype.slice.call(arguments))
    },
    spy: function (target, methodName) {
      if (arguments.length === 1 && typeof target === 'function') {
        return sinonGetFunctionSpy(target)
      }
      if (arguments.length === 2 && typeof target === 'object' && typeof methodName === 'string') {
        return sinonSpy(target, methodName)
      }
      throw new Error('Called sinon.spy with invalid arguments ', arguments)
    }
  }
  global.sinon = sinon
}

function checkIfStub (object, methodName) {
  var method = object[methodName]
  if (method.isStub || method.isSpiedOn) {
    throw new Error(
      'tried to stub or spy on method ' + methodName + ' which was already stubbed or spied on')
  }
}

function sinonStub (object, methodName, implementation) {
  checkIfStub(object, methodName)
  var originalMethod = object[methodName]
  object[methodName] = implementation || function () {}
  object[methodName].restore = function () {
    object[methodName] = originalMethod
  }
  object[methodName].isStub = true
  return object[methodName]
}

function sinonSpy (object, methodName) {
  checkIfStub(object, methodName)
  var originalMethod = object[methodName]
  object[methodName] = function () {
    originalMethod.apply(this, arguments)
  }
  object[methodName].restore = function () {
    object[methodName] = originalMethod
  }
  object[methodName].isSpiedOn = true
  return object[methodName]
}

function sinonGetStub () {
  var result = function () {}
  result.isStub = true
  return result
}

function sinonGetFunctionSpy (functionToBeSpiedOn) {
  functionToBeSpiedOn.isSpiedOn = true
  return functionToBeSpiedOn
}

beforeEach(function () {
  createSinonMock()
  var testPrototype2 = {
    proto2: function () { return 'p2' }
  }
  var testPrototype1 = Object.create(testPrototype2, {
    proto1: {writable: true, enumerable: false, value: function () { return 'p1' }}
  })
  testObject = Object.create(testPrototype1, {
    field1: {writable: true, enumerable: true, value: function () { return 1 }},
    field2: {writable: true, enumerable: false, value: function () { return 2 }},
    field3: {writable: true, enumerable: true, value: 'my string'}
  })
})

afterEach(function () {
  delete global.sinon
})

describe('onObject', function () {
  describe('stub', function () {
    it('should stub a given method of an object', function () {
      onObject(testObject).stub('field1')

      expect(testObject.field1.isStub).to.be.true
    })

    it('should stub all own methods of an object when called with no arguments', function () {
      onObject(testObject).stub()

      expect(testObject.field1.isStub).to.be.true
      expect(testObject.field2.isStub).to.be.true
      expect(testObject.proto1.isStub).to.be.undefined
      expect(testObject.proto1.isStub).to.be.undefined
    })

    it('should also stub methods of the direct prototype when called with 1', function () {
      onObject(testObject).stub(1)

      expect(testObject.field1.isStub).to.be.true
      expect(testObject.field2.isStub).to.be.true
      expect(testObject.proto1.isStub).to.be.true
      expect(testObject.proto2.isStub).to.be.undefined
    })

    it('should also stub methods of all prototypes when called with n large enough', function () {
      onObject(testObject).stub(8)

      expect(testObject.field1.isStub).to.be.true
      expect(testObject.field2.isStub).to.be.true
      expect(testObject.proto1.isStub).to.be.true
      expect(testObject.proto2.isStub).to.be.true
    })

    it('should stub implementing a given functionality', function () {
      var replacementFunction = function (arg) {
        return 'replaced' + arg
      }
      onObject(testObject).stub('field1', replacementFunction)

      expect(testObject.field1('it')).to.equal('replacedit')
    })

    it('should stub a list of methods', function () {
      onObject(testObject).stub('field1', 'proto1')

      expect(testObject.field1.isStub).to.be.true
      expect(testObject.field2.isStub).to.be.undefined
      expect(testObject.proto1.isStub).to.be.true
      expect(testObject.proto2.isStub).to.be.undefined
    })

    it('should allow stubbing a list of methods while also providing functionalities', function () {
      var replacementFunction1 = function (arg) {
        return 'first' + arg
      }
      var replacementFunction2 = function (arg) {
        return 'second' + arg
      }
      onObject(testObject).stub('field1', replacementFunction1, 'proto1', replacementFunction2)

      expect(testObject.field1('func')).to.equal('firstfunc')
      expect(testObject.proto1('func')).to.equal('secondfunc')
    })

    it('should not fail if stubbing an already stubbed method', function () {
      onObject(testObject).stub('field1').stub('field1').stub().stub('field1')
    })

    it('should not fail if stubbing the same object method with different onObject calls',
      function () {
        onObject(testObject).stub('field1')
        onObject(testObject).stub()
        onObject(testObject).stub('field1')
      })
  })

  describe('spy', function () {
    it('should spy on a given method of an object', function () {
      onObject(testObject).spy('field1')

      expect(testObject.field1.isSpiedOn).to.be.true
    })

    it('should spy on all own methods of an object when called with no arguments', function () {
      onObject(testObject).spy()

      expect(testObject.field1.isSpiedOn).to.be.true
      expect(testObject.field2.isSpiedOn).to.be.true
      expect(testObject.proto1.isSpiedOn).to.be.undefined
      expect(testObject.proto2.isSpiedOn).to.be.undefined
    })

    it('should also spy methods of the direct prototype when called with 1', function () {
      onObject(testObject).spy(1)

      expect(testObject.field1.isSpiedOn).to.be.true
      expect(testObject.field2.isSpiedOn).to.be.true
      expect(testObject.proto1.isSpiedOn).to.be.true
      expect(testObject.proto2.isSpiedOn).to.be.undefined
    })

    it('should also spy methods of all prototypes when called with n large enough', function () {
      onObject(testObject).spy(8)

      expect(testObject.field1.isSpiedOn).to.be.true
      expect(testObject.field2.isSpiedOn).to.be.true
      expect(testObject.proto1.isSpiedOn).to.be.true
      expect(testObject.proto2.isSpiedOn).to.be.true
    })

    it('should spy on a list of methods', function () {
      onObject(testObject).spy('field1', 'proto1')

      expect(testObject.field1.isSpiedOn).to.be.true
      expect(testObject.field2.isSpiedOn).to.be.undefined
      expect(testObject.proto1.isSpiedOn).to.be.true
      expect(testObject.proto2.isSpiedOn).to.be.undefined
    })

    it('should not fail if spying on an already spied upon method', function () {
      onObject(testObject).spy('field1').spy('field1').spy().spy('field1')
    })

    it('should not fail if spying on the same object method with different onObject calls',
      function () {
        onObject(testObject).spy('field1')
        onObject(testObject).spy()
        onObject(testObject).spy('field1')
      })
  })

  describe('replace', function () {
    it('should replace a given field of an object on replace', function () {
      onObject(testObject).replace('field1', 'replacement')

      expect(testObject.field1).to.equal('replacement')
    })

    it('should replace instead of stubbing when replacing a stubbed field', function () {
      onObject(testObject).stub('field1').replace('field1', 'replacement')

      expect(testObject.field1).to.equal('replacement')
    })

    it('should be able to replace an already replaced field', function () {
      onObject(testObject).replace('field1', 'replacement1').replace('field1', 'replacement2')

      expect(testObject.field1).to.equal('replacement2')
    })
  })
})

describe('restore', function () {
  it('should remove all stubs, spies and replacements', function () {
    onObject(testObject).stub('field1').spy('field2').replace('field3', 'replacement')
    restore()
    expect(testObject.field1.restore).to.be.undefined
    expect(testObject.field2.restore).to.be.undefined
    expect(testObject.field3).to.equal('my string')
  })
})
