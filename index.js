module.exports.onObject = function(target, autoReset, afterEachHook) {
  var activeStubs = [];

  if (typeof autoReset === 'undefined') {
    autoReset = true;
  }
  if (typeof afterEachHook === 'undefined') {
    afterEachHook = afterEach;
  }

  function reset() {
    activeStubs.forEach(function(currentStub) {
      if (typeof currentStub.restore === 'function') {
        currentStub.restore();
      }
    });
    activeStubs = [];
  }

  if (autoReset) {
    afterEachHook(reset);
  }

  function stub(key, func) {
    activeStubs.push(sinon.stub(target, key, func));
    return this;
  }

  function spy(key) {
    activeStubs.push(sinon.spy(target, key));
    return this;
  }

  return {
    stub: stub,

    spy: spy,

    reset: function() {
      reset();
      return this;
    }
  };
};
