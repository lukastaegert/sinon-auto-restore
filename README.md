# sinon-auto-restore
https://travis-ci.org/lukastaegert/sinon-auto-restore.svg?branch=master

A simple library to make creating Sinon spies and stubs in a Mocha setup easier. This library provides auto-restore functionality similar to what is built into Jasmine.

## Usage:

Consider an object with two methods and a field:
```javascript
onObject = require('sinon-auto-restore').onObject;

var myObject = {
  test1: function() {console.log('original function 1');},
  test2: function() {console.log('original function 2');},
  testField: 'test field'
}
```

Spy on or stub fields of an object with automatic restore:
```javascript
onObject(myObject).stub('test1');
onObject(myObject).spy('test2');
```

This is equivalent to
```javascript
sinon.stub(myObject, 'test1');
sinon.spy(myObject, 'test2');

afterEach(function() {
  myObject.test1.restore();
  myObject.test2.restore();
});
```

You can provide functionality to stubs:
```javascript
onObject(myObject).stub('test1', function() {console.log('replacement method');});
```

Method calls may be chained:
```javascript
onObject(myObject).stub('test1').spy('test2');
```

You can stub all methods of an object at once:
```javascript
onObject(myObject).stub();
```
and similarly
```javascript
onObject(myObject).spy();
```

By providing a list of method names, you can stub or spy on a selection of methods in one call. However, that way you cannot provide any functionalities to your stubs:
```javascript
onObject(myObject).stub('test1', 'test2');
```

If you want to provide additional sinon functionality like return values to your stubs, you need to set them after stubbing the methods as with any Sinon stubs:
```javascript
onObject(myObject).stub('test1');
myObject.test1.returns('return value');
// not supported: onObject(myObject).stub('test1').returns('return value')
```

The reason for this is that otherwise, this library would have to mirror the whole Sinon API.

Besides stubbing and spying on methods, you can also replace fields of an object:
```javascript
onObject(myObject).replace('testField', 'new test value');
```

This is equivalent to
```javascript
var originalField = myObject.testField;
myObject.testField = 'new test value';

afterEach(function() {
  myObject.testField = originalField;
});
```

## API

### `onObject(objectName, autoReset = true <, afterEachHook>)`

Provides an interface to stub and spy on methods of an object and to replace fields. If `autoReset = true` (the default), all stubs, spies
and replacements are automatically passed to `afterEachHook`. If no `afterEachHook` is provided, they are passed to `afterEach` and thus
restored on teardown.

* `.stub()`
Replaces all methods of an object with stubs.
* `.stub('method1' <,'method2' <...>>)`
Replaces the given methods with stubs.
* `.stub('method', replacementFunction)`
Replaces a given method with a stub with the provided functionality.
* `.spy()`
Spies on all methods of an object.
* `.spy('method1' <,'method2' <...>>)`
Spies on the given methods of an object.
* `.replace('field', replacementValue)`
Replaces a given field with another value.
* `.reset()`
Restores all stubs, spies and replacements. Note that this method has to be called on the return value of the same `onObject` invocation
which was used to create the stubs.

All of the above methods can be chained. In case different method calls would modify the same field or method, only the last method call is
used, i.e.,
```javascript
onObject(myObject).spy().stub('stubbedMethod')
```
spies on all methods of `myObject` except `.stubbedMethod`, which is replaced by a stub.


### `fromConstructur(ConstructorName)`
* `getStub()`
Returns a constructor mimicking the given constructor `ConstructorName`. This can be especially handy if you use something like
[rewire](https://github.com/jhnns/rewire) or [babel-plugin-rewire](https://github.com/speedskater/babel-plugin-rewire) for dependency
injection. When called with `new`, this constructor creates an object containing stubs for any methods of the prototype object of
`ConstructorName`. See also below for additional methods of the `StubConstructor`.
* `getSpy()` _not yet implemented_

### `fromMethodNames('methodName1' <,'methodName2' <...>>)`
_not yet implemented_


### `StubConstructor` API
A `StubConstructor` has the following methods:
  * `.stub('method1' <,'method2' <...>>)`
Instances should have the listed additional methods as stubs.
  * `.stub('method', replacementFunction)`
Instances should have the listed additional stub method with the provided functionality.
  * `.getInstances()`:
Returns an array of instances created with the stub constructor.
  * `.getInstance()`:
Throws an error if no or more than one instance has been created. Otherwise, returns the instance created.
  * `.getInstance(index)`:
Throws an error if not at least `index` instances have been created. Otherwise, returns the instance `index`.
  * `.getInstancesArgs()`:
Returns an array of arrays containing the arguments of each instance creation.
  * `.getInstanceArgs()`:
Throws an error if no or more than one instance has been created. Otherwise, returns the arguments with which the instance has been created.
  * `.getInstanceArgs(index)`:
Throws an error if not at least `index` instances have been created. Otherwise, returns the arguments with which instance `index` has been
created.
