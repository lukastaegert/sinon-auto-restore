var sinonAutoRestore = require('../index')
var onObject = sinonAutoRestore.onObject

var expect = require('chai').expect
var td = require('testdouble')
var verify = td.verify
var isA = td.matchers.isA

var sinon, onAfterEach
var afterEachHook = function (callback) {
  onAfterEach = callback
}

function createSinonTestDouble () {
  sinon = td.object([ 'stub', 'spy' ])
  global.sinon = sinon
  td.when(sinon.stub(isA(Object), isA(String)), { ignoreExtraArgs: true }).thenDo(sinonStub)
  td.when(sinon.stub()).thenDo(sinonGetStub)
  td.when(sinon.spy(isA(Object), isA(String))).thenDo(sinonSpy)
  td.when(sinon.spy(isA(Function))).thenDo(sinonGetFunctionSpy)
}

function sinonStub (object, methodName) {
  object[ methodName ] = { restore: td.function(methodName + '#restore') }
  object[ methodName ].isSpiedOn = true
  return object[ methodName ]
}

function sinonSpy (object, methodName) {
  object[ methodName ].restore = td.function(methodName + '#restore')
  object[ methodName ].isSpiedOn = true
  return object[ methodName ]
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

      verify(sinon.stub(testObject, 'field1'))
    })

    it('should stub all fields of an object when called with no arguments', function () {
      onObject(testObject).stub()

      verify(sinon.stub(testObject, 'field1'), { times: 1 })
      verify(sinon.stub(testObject, 'field2'), { times: 1 })
    })

    it('should stub implementing a given functionality', function () {
      var replacementFunction = function () {}
      onObject(testObject).stub('field1', replacementFunction)

      verify(sinon.stub(testObject, 'field1', replacementFunction), { times: 1 })
    })

    it('should stub a list of methods', function () {
      onObject(testObject).stub('field1', 'field2')

      verify(sinon.stub(testObject, 'field1'), { times: 1 })
      verify(sinon.stub(testObject, 'field2'), { times: 1 })
    })

    it('should allow stubbing a list of methods while also providing functionalities', function () {
      var replacementFunction1 = function () {}
      var replacementFunction2 = function () {}
      onObject(testObject).stub('field1', replacementFunction1, 'field2', replacementFunction2)

      verify(sinon.stub(testObject, 'field1', replacementFunction1), { times: 1 })
      verify(sinon.stub(testObject, 'field2', replacementFunction2), { times: 1 })
    })

    it('should not fail if stubbing an already stubbed method', function () {
      onObject(testObject).stub('field1').stub('field1').stub().stub('field1')
    })
  })

  describe('spy', function () {
    it('should spy on a given field of an object', function () {
      onObject(testObject).spy('field1')

      verify(sinon.spy(testObject, 'field1'), { times: 1 })
    })

    it('should spy on all fields of an object when called with no arguments', function () {
      onObject(testObject).spy()

      verify(sinon.spy(testObject, 'field1'), { times: 1 })
      verify(sinon.spy(testObject, 'field2'), { times: 1 })
    })

    it('should spy on a list of methods', function () {
      onObject(testObject).spy('field1', 'field2')

      verify(sinon.spy(testObject, 'field1'), { times: 1 })
      verify(sinon.spy(testObject, 'field2'), { times: 1 })
    })

    it('should not fail if spying on an already spied upon method', function () {
      onObject(testObject).spy('field1').spy('field1').spy().spy('field1')
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

  describe('reset', function () {
    it('should remove all stubs, spies and replacements on reset', function () {
      var stubHandler = onObject(testObject).stub('field1').spy('field2').replace('field3', 'replacement')

      td.verify(testObject.field1.restore(), { times: 0 })
      td.verify(testObject.field2.restore(), { times: 0 })

      stubHandler.reset()

      td.verify(testObject.field1.restore(), { times: 1 })
      td.verify(testObject.field2.restore(), { times: 1 })
      expect(testObject.field3).to.equal('my string')
    })
  })

  describe('the autorestore functionality', function () {
    it('should not register a callback with the afterEachHook if autoReset is false', function () {
      onObject(testObject, false, afterEachHook)

      expect(onAfterEach).to.be.null
    })

    it('should register a callback with the afterEachHook if autoReset is true', function () {
      onObject(testObject, true, afterEachHook)

      expect(onAfterEach).to.be.a('function')
    })

    it('should restore all stubbed, spied and replaced fields on afterEach if autoreset is true', function () {
      onObject(testObject, true, afterEachHook).stub('field1').spy('field2').replace('field3', 'replacement')
      onAfterEach()

      td.verify(testObject.field1.restore())
      td.verify(testObject.field2.restore())
      expect(testObject.field3).to.equal('my string')
    })

    it('should register a callback with a global afterEach function if autoReset is true and no afterEachHook is provided', function () {
      var oldAfterEach = global.afterEach
      global.afterEach = afterEachHook
      onObject(testObject, true)

      expect(onAfterEach).to.be.a('function')
      global.afterEach = oldAfterEach
    })

    it('should restore all replaced variables on global afterEach if autoreset is true and no afterEachHook is provided', function () {
      var oldAfterEach = global.afterEach
      global.afterEach = afterEachHook
      onObject(testObject, true).stub('field1').spy('field2').replace('field3', 'replacement')
      onAfterEach()

      td.verify(testObject.field1.restore())
      td.verify(testObject.field2.restore())
      expect(testObject.field3).to.equal('my string')
      global.afterEach = oldAfterEach
    })
  })
})
