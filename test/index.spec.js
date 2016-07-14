var onObject = require('../index').onObject;
var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
chai.use(require('sinon-chai'));

describe('The sinon auto rewire test helper', function() {
  var onAfterEach, oldSinon, oldSpy, oldStub;
  var afterEachHook = function(callback) {
    onAfterEach = callback;
  };
  var testObject;

  beforeEach(function() {
    oldSinon = global.sinon;
    global.sinon = sinon;
    testObject = {
      field1: function() {return 1},
      field2: function() {return 2},
      field3: 'my string'
    };
    onAfterEach = null;
    oldSpy = sinon.spy;
    oldStub = sinon.stub;
    sinon.spy = oldSpy(sinon.spy);
    sinon.stub = oldSpy(sinon.stub);
  });

  afterEach(function() {
    sinon.spy = oldSpy;
    sinon.stub = oldStub;
    global.sinon = oldSinon;
  });

  it('should stub a given field of an object on stub', function() {
    onObject(testObject).stub('field1');

    expect(sinon.stub).to.have.been.calledWith(testObject);
    expect(testObject.field1.restore).to.be.a('function');
  });

  it('should spy on a given field of an object on spy', function() {
    onObject(testObject).spy('field1');

    expect(sinon.spy).to.have.been.calledWith(testObject);
    expect(testObject.field1.restore).to.be.a('function');
  });

  it('should replace a given field of an object on replace', function() {
    onObject(testObject).replace('field1', 'replacement');

    expect(testObject.field1).to.equal('replacement');
  });

  it('should remove all stubs, spies and replacements on reset', function() {
    onObject(testObject).stub('field1').spy('field2').replace('field3', 'replacement').reset();

    expect(testObject.field1.restore).not.to.be.a('function');
    expect(testObject.field2.restore).not.to.be.a('function');
    expect(testObject.field3).to.equal('my string');
  });

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

    expect(testObject.field1.restore).not.to.be.a('function');
    expect(testObject.field2.restore).not.to.be.a('function');
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

    expect(testObject.field1.restore).not.to.be.a('function');
    expect(testObject.field2.restore).not.to.be.a('function');
    expect(testObject.field3).to.equal('my string');
    global.afterEach = oldAfterEach;
  });
});
