module.exports.onObject = function(target, autoReset, afterEachHook) {
  var activeStubs = [];
  var activeReplacements = [];

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
    activeReplacements.forEach(function(currentReplacement) {
      target[currentReplacement.key] = currentReplacement.value;
    });
    activeStubs = [];
    activeReplacements = [];
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

  function replace(key, replacement) {
    activeReplacements.push({key: key, value: target[key]});
    target[key] = replacement;
    return this;
  }

  return {
    stub: stub,

    spy: spy,

    replace: replace,

    reset: function() {
      reset();
      return this;
    }
  };
};
