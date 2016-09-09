# sinon-auto-restore
[![npm](https://img.shields.io/npm/v/sinon-auto-restore.svg?maxAge=2592000)](https://www.npmjs.com/package/sinon-auto-restore)
[![Travis branch](https://img.shields.io/travis/lukastaegert/sinon-auto-restore/master.svg?maxAge=2592000)](https://travis-ci.org/lukastaegert/sinon-auto-restore)
[![codecov.io](https://img.shields.io/codecov/c/github/lukastaegert/sinon-auto-restore.svg?maxAge=2592000)](http://codecov.io/github/lukastaegert/sinon-auto-restore)
[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?maxAge=2592000)](http://standardjs.com/)
[![npm](https://img.shields.io/npm/dm/sinon-auto-restore.svg?maxAge=2592000)](https://www.npmjs.com/package/sinon-auto-restore)
[![David](https://img.shields.io/david/lukastaegert/sinon-auto-restore.svg?maxAge=2592000)](https://david-dm.org/lukastaegert/sinon-auto-restore)
[![David](https://img.shields.io/david/dev/lukastaegert/sinon-auto-restore.svg?maxAge=2592000)](https://david-dm.org/lukastaegert/sinon-auto-restore?type=dev)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?maxAge=2592000)](https://github.com/semantic-release/semantic-release)

A library that provides a streamlined interface for creating [`sinon`](https://github.com/sinonjs/sinon) stubs and spies
that will be automatically restored. Created to be used in a [`mocha`](https://github.com/mochajs/mocha) setup but can
be configured to work with other test frameworks.

## API

### `onObject(objectName)`

Provides an interface to stub and spy on methods of an object and to replace fields. By default, all stubs, spies and
replacements are automatically passed to any `afterEach` function in scope and are thus restored on teardown.

* `.stub()`   
    Replaces all own methods of an object by stubs.
* `.stub(n)`   
    Replaces all own and inherited methods of an object by stubs going up to `n` levels up the prototype chain.
* `.stub('method1' <,'method2' <...>>)`  
    Replaces only the given methods by stubs.
* `.stub('method', replacementFunction)`  
    Replaces a given method by a stub with the provided functionality.
* `.spy()`  
    Spies on all own methods of an object.
* `.spy(n)`   
    Spies on all own and inherited methods of an object going up to `n` levels up the prototype chain.
* `.spy('method1' <,'method2' <...>>)`  
    Spies on the given methods of an object.
* `.replace('field', replacementValue)`  
    Replaces a given field by another value.

All of the above methods can be chained. In case different method calls would modify the same field or method, only the
last method call is used, i.e.,
```javascript
onObject(myObject).spy().stub('stubbedMethod')
```
spies on all own methods of `myObject` except `.stubbedMethod`, which is replaced by a stub. This also works across
different calls to `onObject`, i.e.
```javascript
onObject(myObject).spy()
onObject(myObject).stub('stubbedMethod')
```
would have exactly the same effect.

### `restore()`

Restores all stubs, spies and replacements.

### `configure({autoRestore: true, afterEachHook: afterEach})`

Allows configuring the auto restore behavior.

* `autoRestore`:  
    When set to false, you should manually call `restore` after each test to remove all stubs. Otherwise, this is
    automatically done during teardown. Defaults to `true`.
* `afterEachHook`:  
    Allows for setting a different function to be called to register the `restore` hook. Otherwise, any function
    named `afterEach` which is in scope when `onObject` is called is used.
