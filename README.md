# sinon-auto-restore
[![Build Status](https://travis-ci.org/lukastaegert/sinon-auto-restore.svg?branch=master)](https://travis-ci.org/lukastaegert/sinon-auto-restore)
[![codecov.io](https://img.shields.io/codecov/c/github/lukastaegert/sinon-auto-restore.svg)](http://codecov.io/github/lukastaegert/sinon-auto-restore)
[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

A library that provides a streamlined interface for creating [`sinon`](https://github.com/sinonjs/sinon) stubs and spies
that will be automatically restored. Created to be used in a [`mocha`](https://github.com/mochajs/mocha) setup but can
be configured to work with other test frameworks.

## API

### `onObject(objectName, autoReset = true <, afterEachHook>)`

Provides an interface to stub and spy on methods of an object and to replace fields. If `autoReset = true` (the
default), all stubs, spies and replacements are automatically passed to `afterEachHook` and thus restored on teardown.
If no `afterEachHook` is provided, they are passed to any `afterEach` function in scope.

* `.stub()`   
    Replaces all methods of an object with stubs.
* `.stub('method1' <,'method2' <...>>)`  
    Replaces only the given methods with stubs.
* `.stub('method', replacementFunction)`  
    Replaces a given method with a stub with the provided functionality.
* `.spy()`  
    Spies on all methods of an object.
* `.spy('method1' <,'method2' <...>>)`  
    Spies on the given methods of an object.
* `.replace('field', replacementValue)`  
    Replaces a given field with another value.
* `.reset()`  
    Restores all stubs, spies and replacements. Note that this method has to be called on the return value of the same
    `onObject` invocation which was used to create the stubs.

All of the above methods can be chained. In case different method calls would modify the same field or method, only the
last method call is used, i.e.,
```javascript
onObject(myObject).spy().stub('stubbedMethod')
```
spies on all methods of `myObject` except `.stubbedMethod`, which is replaced by a stub.


### `fromConstructur(ConstructorName)`
* `getStub()`  
    Returns a [`StubConstructor`](#stubconstructor-api) mimicking the given constructor `ConstructorName`.
    This can be especially handy if you use something like [`rewire`](https://github.com/jhnns/rewire) or
    [`babel-plugin-rewire`](https://github.com/speedskater/babel-plugin-rewire) for dependency injection. When called
    with `new`, this constructor creates an object containing stubs for any methods of the prototype object of
    `ConstructorName`. See also below for additional methods of the `StubConstructor`.
* `getSpy()`  
    Returns a [`SpyConstructor`](#spyconstructor-api) mimicking the given constructor `ConstructorName`.This
    is somewhat similar to `getStub` with the following differences:
    * The original constructor function will still be executed when creating a new object
    * Instead of stubbed, methods of any instance will be spied upon
    * The methods to be spied upon are not determined by looking at the prototype object but by looking at the result of
      creating an instance using the original constructor.

### `fromMethodNames('methodName1' <,'methodName2' <...>>)`
_not yet implemented_


### `StubConstructor` API
A `StubConstructor` has the following methods:
* `.stub('method1' <,'method2' <...>>)`  
    Instances should have the listed additional methods as stubs.
* `.stub('method', replacementFunction)`  
    Instances should have the listed additional stub method with the provided functionality.
* `.getInstances()`   
    Returns an array of instances created with the stub constructor.
* `.getInstance()`  
    Throws an error if no or more than one instance has been created. Otherwise, returns the instance created.
* `.getInstance(index)`  
    Throws an error if not at least `index` instances have been created. Otherwise, returns the instance `index`.
* `.getInstancesArgs()`  
    Returns an array of arrays containing the arguments of each instance creation.
* `.getInstanceArgs()`  
    Throws an error if no or more than one instance has been created. Otherwise, returns the arguments with which the
    instance has been created.
* `.getInstanceArgs(index)`  
    Throws an error if not at least `index` instances have been created. Otherwise, returns the arguments with which
    instance `index` has been created.

### `SpyConstructor` API
A `SpyConstructor` has the following methods:
* `.stub()`  
    Instead of spied upon, all instance methods should be stubbed.
* `.stub('method1' <,'method2' <...>>)`  
    Instances should have the listed additional methods as stubs; if already present, methods will be replaced by stubs.
* `.stub('method', replacementFunction)`  
    Instances should have this method as stub with the provided functionality.
* `.spy('method1' <,'method2' <...>>)`  
    Even if previously marked as stubs, these methods should still be spies; useful together with `stub().
* `.replace('field', replacementValue)`  
    After the constructor is run, this field should be replaced by the given value.
* `.getInstances()`  
    Returns an array of instances created with the stub constructor.
* `.getInstance()`  
    Throws an error if no or more than one instance has been created. Otherwise, returns the instance created.
* `.getInstance(index)`  
    Throws an error if not at least `index` instances have been created. Otherwise, returns the instance `index`.
* `.getInstancesArgs()`  
    Returns an array of arrays containing the arguments of each instance creation.
* `.getInstanceArgs()`  
    Throws an error if no or more than one instance has been created. Otherwise, returns the arguments with which the
    instance has been created.
* `.getInstanceArgs(index)`  
    Throws an error if not at least `index` instances have been created. Otherwise, returns the arguments with which
    instance `index` has been created.
