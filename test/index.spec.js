var sinonAutoRestore = require('../index');
var onObject = sinonAutoRestore.onObject;
var fromConstructor = sinonAutoRestore.fromConstructor;

var chai = require('chai');
chai.use(require('sinon-chai'));
var expect = chai.expect;

var td = require('testdouble');
var verify = td.verify;
var isA = td.matchers.isA;

var sinon, onAfterEach;
var afterEachHook = function(callback) {
  onAfterEach = callback;
};

function createSinonTestDouble() {
  sinon = td.object(['stub', 'spy']);
  global.sinon = sinon;
  td.when(sinon.stub(isA(Object), isA(String)), {ignoreExtraArgs: true}).thenDo(sinonStubOrSpy);
  td.when(sinon.stub()).thenDo(sinonGetStub);
  td.when(sinon.spy(isA(Object), isA(String))).thenDo(sinonStubOrSpy);
  td.when(sinon.spy(isA(Function))).thenDo(sinonGetFunctionSpy);
}

function sinonStubOrSpy(object, methodName) {
  object[methodName] = {restore: td.function(methodName + '#restore')};
  return object[methodName];
}

function sinonGetStub() {
  var result = function() {};
  result.isStub = true;
  return result;
}

function sinonGetFunctionSpy(functionToBeSpiedOn) {
  functionToBeSpiedOn.isSpiedOn = true;
  return functionToBeSpiedOn;
}

beforeEach(function() {
  createSinonTestDouble();
  onAfterEach = null;
});

afterEach(function() {
  td.reset();
  delete global.sinon;
});

describe('onObject', function() {
  var testObject;

  beforeEach(function() {
    testObject = {
      field1: function() {return 1},
      field2: function() {return 2},
      field3: 'my string'
    };
    onAfterEach = null;
  });

  describe('stub', function() {
    it('should stub a given field of an object', function() {
      onObject(testObject).stub('field1');

      verify(sinon.stub(testObject, 'field1'));
    });

    it('should stub all fields of an object when called with no arguments', function() {
      onObject(testObject).stub();

      verify(sinon.stub(testObject, 'field1'), {times: 1});
      verify(sinon.stub(testObject, 'field2'), {times: 1});
    });

    it('should stub implementing a given functionality', function() {
      var replacementFunction = function() {};
      onObject(testObject).stub('field1', replacementFunction);

      verify(sinon.stub(testObject, 'field1', replacementFunction), {times: 1});
    });

    it('should stub a list of methods', function() {
      onObject(testObject).stub('field1', 'field2');

      verify(sinon.stub(testObject, 'field1'), {times: 1});
      verify(sinon.stub(testObject, 'field2'), {times: 1});
    });

    it('should allow stubbing a list of methods while also providing functionalities', function() {
      var replacementFunction1 = function() {};
      var replacementFunction2 = function() {};
      onObject(testObject).stub('field1', replacementFunction1, 'field2', replacementFunction2);

      verify(sinon.stub(testObject, 'field1', replacementFunction1), {times: 1});
      verify(sinon.stub(testObject, 'field2', replacementFunction2), {times: 1});
    });

    it('should not fail if stubbing an already stubbed method', function() {
      onObject(testObject).stub('field1').stub('field1').stub().stub('field1');
    });
  });

  describe('spy', function() {
    it('should spy on a given field of an object', function() {
      onObject(testObject).spy('field1');

      verify(sinon.spy(testObject, 'field1'), {times: 1});
    });

    it('should spy on all fields of an object when called with no arguments', function() {
      onObject(testObject).spy();

      verify(sinon.spy(testObject, 'field1'), {times: 1});
      verify(sinon.spy(testObject, 'field2'), {times: 1});
    });

    it('should spy on a list of methods', function() {
      onObject(testObject).spy('field1', 'field2');

      verify(sinon.spy(testObject, 'field1'), {times: 1});
      verify(sinon.spy(testObject, 'field2'), {times: 1});
    });

    it('should not fail if spying on an already spied upon method', function() {
      onObject(testObject).spy('field1').spy('field1').spy().spy('field1');
    });
  });

  describe('replace', function() {
    it('should replace a given field of an object on replace', function() {
      onObject(testObject).replace('field1', 'replacement');

      expect(testObject.field1).to.equal('replacement');
    });

    it('should replace instead of stubbing when replacing a stubbed field', function() {
      onObject(testObject).stub('field1').replace('field1', 'replacement');

      expect(testObject.field1).to.equal('replacement');
    });
  });

  describe('reset', function() {
    it('should remove all stubs, spies and replacements on reset', function() {
      onObject(testObject).stub('field1').spy('field2').replace('field3', 'replacement').reset();

      td.verify(testObject.field1.restore());
      td.verify(testObject.field2.restore());
      expect(testObject.field3).to.equal('my string');
    });
  });

  describe('the autorestore functionality', function() {
    it('should not register a callback with the afterEachHook if autoReset is false', function() {
      onObject(testObject, false, afterEachHook);

      expect(onAfterEach).to.be.null;
    });

    it('should register a callback with the afterEachHook if autoReset is true', function() {
      onObject(testObject, true, afterEachHook);

      expect(onAfterEach).to.be.a('function');
    });

    it('should restore all stubbed, spied and replaced fields on afterEach if autoreset is true', function() {
      onObject(testObject, true, afterEachHook).stub('field1').spy('field2').replace('field3', 'replacement');

      onAfterEach();

      td.verify(testObject.field1.restore());
      td.verify(testObject.field2.restore());
      expect(testObject.field3).to.equal('my string');
    });

    it('should register a callback with a global afterEach function if autoReset is true and no afterEachHook is provided', function() {
      var oldAfterEach = global.afterEach;
      global.afterEach = afterEachHook;

      onObject(testObject, true);

      expect(onAfterEach).to.be.a('function');
      global.afterEach = oldAfterEach;
    });

    it('should restore all replaced variables on global afterEach if autoreset is true and no afterEachHook is provided', function() {
      var oldAfterEach = global.afterEach;
      global.afterEach = afterEachHook;
      onObject(testObject, true).stub('field1').spy('field2').replace('field3', 'replacement');

      onAfterEach();

      td.verify(testObject.field1.restore());
      td.verify(testObject.field2.restore());
      expect(testObject.field3).to.equal('my string');
      global.afterEach = oldAfterEach;
    });
  })
});

describe('fromConstructor', function() {
  var TestConstructor;

  beforeEach(function() {
    TestConstructor = function() {};
    TestConstructor.prototype = {
      field1: function() {return 1},
      field2: function() {return 2}
    };
  });

  describe('getStub', function() {
    it('should return a function', function() {
      expect(fromConstructor(TestConstructor).getStub()).to.be.a('function');
    });

    it('should return a constructor which is also a spy', function() {
      var StubConstructor = fromConstructor(TestConstructor).getStub();

      expect(StubConstructor).to.have.property('isSpiedOn', true);
    });

    it('should return a constructor that creates an object with the given methods', function() {
      var StubConstructor = fromConstructor(TestConstructor).getStub();
      var stubbedObject = new StubConstructor();

      expect(stubbedObject.originalConstructorCalled).to.be.undefined;
    });

    describe('stub', function() {
      it('should provide additional methods to the constructor', function() {
        var stubbedObject = new (fromConstructor(TestConstructor).getStub().stub('otherField'))();

        expect(stubbedObject.otherField.isStub).to.be.true;
      });

      it('should allow stubbing a list of methods', function() {
        var stubbedObject = new (fromConstructor(TestConstructor).getStub().stub('otherField1', 'otherField2'))();

        expect(stubbedObject.otherField1.isStub).to.be.true;
        expect(stubbedObject.otherField2.isStub).to.be.true;
      });

      it('should allow providing an implementation to a stub', function() {
        function stubFunction() {return 'stubResult';}

        var stubbedObject = new (fromConstructor(TestConstructor).getStub().stub('otherField', stubFunction))();

        expect(stubbedObject.otherField()).to.equal('stubResult');
        expect(stubbedObject.otherField.isSpiedOn).to.be.true;
      });

      it('should allow stubbing a list of methods while also providing functionalities', function() {
        var replacementFunction1 = function() {return 'stubResult1';};
        var replacementFunction2 = function() {return 'stubResult2';};
        var stubbedObject = new (fromConstructor(TestConstructor).getStub()
          .stub('otherField1', replacementFunction1, 'otherField2', replacementFunction2))();

        expect(stubbedObject.otherField1()).to.equal('stubResult1');
        expect(stubbedObject.otherField1.isSpiedOn).to.be.true;
        expect(stubbedObject.otherField2()).to.equal('stubResult2');
        expect(stubbedObject.otherField2.isSpiedOn).to.be.true;
      });
    });

    describe('getInstances', function() {
      var StubConstructor;

      beforeEach(function() {
        StubConstructor = fromConstructor(TestConstructor).getStub();
      });

      it('should return an empty list if there are no instances', function() {
        expect(StubConstructor.getInstances()).to.deep.equal([]);
      });

      it('should return a list of instances', function() {
        var instance1 = new StubConstructor();
        var instance2 = new StubConstructor();
        expect(StubConstructor.getInstances()).to.deep.equal([instance1, instance2]);
      });
    });

    describe('getInstance', function() {
      var StubConstructor;

      beforeEach(function() {
        StubConstructor = fromConstructor(TestConstructor).getStub();
      });

      it('should return a single instance if one has been created', function() {
        var instance = new StubConstructor();
        expect(StubConstructor.getInstance()).to.equal(instance);
      });

      it('should throw an error if no instance has been created', function() {
        expect(StubConstructor.getInstance).to.throw(/0 instances/);
      });

      it('should throw an error if more than one instance has been created', function() {
        var instance1 = new StubConstructor();
        var instance2 = new StubConstructor();
        expect(StubConstructor.getInstance).to.throw(/2 instances/);
      });

      it('should return an instance with a given index', function() {
        var instance1 = new StubConstructor();
        var instance2 = new StubConstructor();
        expect(StubConstructor.getInstance(1)).to.equal(instance2);
      });

      it('should throw an error if not enough instances exist', function() {
        var instance = new StubConstructor();
        expect(function() {StubConstructor.getInstance(1)}).to.throw(/1 instances/);
      });
    });

    describe('getInstancesArgs', function() {
      var StubConstructor;

      beforeEach(function() {
        StubConstructor = fromConstructor(TestConstructor).getStub();
      });

      it('should return an empty list if there are no instances', function() {
        expect(StubConstructor.getInstancesArgs()).to.deep.equal([]);
      });

      it('should return a list of constructor arguments', function() {
        var instance1 = new StubConstructor('foo', 'bar');
        var instance2 = new StubConstructor('baz', 'bla');
        expect(StubConstructor.getInstancesArgs()).to.deep.equal([['foo', 'bar'], ['baz', 'bla']]);
      });
    });

    describe('getInstanceArgs', function() {
      var StubConstructor;

      beforeEach(function() {
        StubConstructor = fromConstructor(TestConstructor).getStub();
      });

      it('should return the arguments of a single instance if one has been created', function() {
        var instance = new StubConstructor('foo', 'bar');
        expect(StubConstructor.getInstanceArgs()).to.deep.equal(['foo', 'bar']);
      });

      it('should throw an error if no instance has been created', function() {
        expect(StubConstructor.getInstanceArgs).to.throw(/0 instances/);
      });

      it('should throw an error if more than one instance has been created', function() {
        var instance1 = new StubConstructor('foo', 'bar');
        var instance2 = new StubConstructor('baz', 'bla');
        expect(StubConstructor.getInstanceArgs).to.throw(/2 instances/);
      });

      it('should return the arguments of an instance with a given index', function() {
        var instance1 = new StubConstructor('foo', 'bar');
        var instance2 = new StubConstructor('baz', 'bla');
        expect(StubConstructor.getInstanceArgs(1)).to.deep.equal(['baz', 'bla']);
      });

      it('should throw an error if not enough instances exist', function() {
        var instance = new StubConstructor('foo', 'bar');
        expect(function() {StubConstructor.getInstanceArgs(1)}).to.throw(/1 instances/);
      });
    });
  });
});
