var sinonAutoRestore = require('../index')
var onObject = sinonAutoRestore.onObject
var configure = sinonAutoRestore.configure
var restore = sinonAutoRestore.restore

var expect = require('chai').expect
var td = require('testdouble')
var verify = td.verify
var isA = td.matchers.isA

var sinon, onAfterEach
var afterEachHook = function (callback) {
  onAfterEach = callback
}

var stubbingEnabled = false

function createSinonTestDouble () {
  sinon = td.object([ 'stub', 'spy' ])
  global.sinon = sinon
  td.when(sinon.stub(isA(Object), isA(String)), { ignoreExtraArgs: true }).thenDo(sinonStub)
  td.when(sinon.stub()).thenDo(sinonGetStub)
  td.when(sinon.spy(isA(Object), isA(String))).thenDo(sinonSpy)
  td.when(sinon.spy(isA(Function))).thenDo(sinonGetFunctionSpy)
}

function checkIfStub (object, methodName) {
  var method = object[ methodName ]
  if (method.isStub || method.isSpiedOn) {
    throw new Error('tried to stub or spy on method ' + methodName + ' which was already stubbed or spied on')
  }
}

function sinonStub (object, methodName) {
  if (stubbingEnabled) {
    checkIfStub(object, methodName)
    var originalMethod = object[ methodName ]
    object[ methodName ] = function () {}
    object[ methodName ].restore = function () {
      object[ methodName ] = originalMethod
    }
    object[ methodName ].isStub = true
    return object[ methodName ]
  }
}

function sinonSpy (object, methodName) {
  if (stubbingEnabled) {
    checkIfStub(object, methodName)
    var originalMethod = object[ methodName ]
    object[ methodName ] = function () {
      originalMethod.apply(this, arguments)
    }
    object[ methodName ].restore = function () {
      object[ methodName ] = originalMethod
    }
    object[ methodName ].isSpiedOn = true
    return object[ methodName ]
  }
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
  createSinonTestDouble()
  onAfterEach = null
  stubbingEnabled = true
})

afterEach(function () {
  td.reset()
  delete global.sinon
})

describe('onObject', function () {
  var testObject

  beforeEach(function () {
    testObject = {
      field1: function () { return 1 },
      field2: function () { return 2 },
      field3: 'my string'
    }
    onAfterEach = null
  })

  describe('stub', function () {
    it('should stub a given field of an object', function () {
      onObject(testObject).stub('field1')

      stubbingEnabled = false
      verify(sinon.stub(testObject, 'field1'))
    })

    it('should stub all fields of an object when called with no arguments', function () {
      onObject(testObject).stub()

      stubbingEnabled = false
      verify(sinon.stub(testObject, 'field1'), { times: 1 })
      verify(sinon.stub(testObject, 'field2'), { times: 1 })
    })

    it('should stub implementing a given functionality', function () {
      var replacementFunction = function () {}
      onObject(testObject).stub('field1', replacementFunction)

      stubbingEnabled = false
      verify(sinon.stub(testObject, 'field1', replacementFunction), { times: 1 })
    })

    it('should stub a list of methods', function () {
      onObject(testObject).stub('field1', 'field2')

      stubbingEnabled = false
      verify(sinon.stub(testObject, 'field1'), { times: 1 })
      verify(sinon.stub(testObject, 'field2'), { times: 1 })
    })

    it('should allow stubbing a list of methods while also providing functionalities', function () {
      var replacementFunction1 = function () {}
      var replacementFunction2 = function () {}
      onObject(testObject).stub('field1', replacementFunction1, 'field2', replacementFunction2)

      stubbingEnabled = false
      verify(sinon.stub(testObject, 'field1', replacementFunction1), { times: 1 })
      verify(sinon.stub(testObject, 'field2', replacementFunction2), { times: 1 })
    })

    it('should not fail if stubbing an already stubbed method', function () {
      onObject(testObject).stub('field1').stub('field1').stub().stub('field1')
    })

    it('should not fail if stubbing the same object method with different onObject calls', function () {
      onObject(testObject).stub('field1')
      onObject(testObject).stub()
      onObject(testObject).stub('field1')
    })
  })

  describe('spy', function () {
    it('should spy on a given field of an object', function () {
      onObject(testObject).spy('field1')

      stubbingEnabled = false
      verify(sinon.spy(testObject, 'field1'), { times: 1 })
    })

    it('should spy on all fields of an object when called with no arguments', function () {
      onObject(testObject).spy()

      stubbingEnabled = false
      verify(sinon.spy(testObject, 'field1'), { times: 1 })
      verify(sinon.spy(testObject, 'field2'), { times: 1 })
    })

    it('should spy on a list of methods', function () {
      onObject(testObject).spy('field1', 'field2')

      stubbingEnabled = false
      verify(sinon.spy(testObject, 'field1'), { times: 1 })
      verify(sinon.spy(testObject, 'field2'), { times: 1 })
    })

    it('should not fail if spying on an already spied upon method', function () {
      onObject(testObject).spy('field1').spy('field1').spy().spy('field1')
    })

    it('should not fail if spying on the same object method with different onObject calls', function () {
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

  describe('the auto restore functionality', function () {
    it('should not register a callback with the afterEachHook if autoRestore is false', function () {
      configure({ autoRestore: false, afterEachHook: afterEachHook })
      onObject(testObject)

      expect(onAfterEach).to.be.null
    })

    it('should register a callback with the afterEachHook if autoReset is true', function () {
      configure({ autoRestore: true, afterEachHook: afterEachHook })
      onObject(testObject)

      expect(onAfterEach).to.be.a('function')
    })

    it('should restore all stubbed, spied and replaced fields on afterEach if autoreset is true', function () {
      configure({ autoRestore: true, afterEachHook: afterEachHook })
      onObject(testObject).stub('field1').spy('field2').replace('field3', 'replacement')
      onAfterEach()

      expect(testObject.field1.restore).to.be.undefined
      expect(testObject.field2.restore).to.be.undefined
      expect(testObject.field3).to.equal('my string')
    })

    it('should register a callback with a global afterEach function if autoReset is true and no afterEachHook is' +
      ' provided', function () {
      var oldAfterEach = global.afterEach
      global.afterEach = afterEachHook
      configure({ autoRestore: true })
      onObject(testObject)

      expect(onAfterEach).to.be.a('function')
      global.afterEach = oldAfterEach
    })

    it('should restore all replaced variables on global afterEach if autoreset is true and no afterEachHook is' +
      ' provided', function () {
      var oldAfterEach = global.afterEach
      global.afterEach = afterEachHook
      configure({ autoRestore: true })
      onObject(testObject).stub('field1').spy('field2').replace('field3', 'replacement')
      onAfterEach()

      expect(testObject.field1.restore).to.be.undefined
      expect(testObject.field2.restore).to.be.undefined
      expect(testObject.field3).to.equal('my string')
      global.afterEach = oldAfterEach
    })
  })
})
