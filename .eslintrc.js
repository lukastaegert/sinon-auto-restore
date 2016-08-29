module.exports = {
  "env": {
    "node": true
  },
  "extends": "eslint:recommended",
  "rules": {
    // ==============
    // Possible Errors
    // ==============

    // disallow or enforce trailing commas
    "comma-dangle": [2, "never"],
    // disallow assignment in conditional expressions
    "no-cond-assign": 2,
    // disallow use of console (off by default in the node environment)
    "no-console": 2,
    // disallow use of constant expressions in conditions
    "no-constant-condition": 2,
    // disallow control characters in regular expressions
    "no-control-regex": 2,
    // disallow use of debugger
    "no-debugger": 2,
    // disallow duplicate arguments in functions
    "no-dupe-args": 2,
    // disallow duplicate keys when creating object literals
    "no-dupe-keys": 2,
    // disallow a duplicate case label.
    "no-duplicate-case": 2,
    // disallow empty statements
    "no-empty": 2,
    // disallow the use of empty character classes in regular expressions
    "no-empty-character-class": 2,
    // disallow assigning to the exception in a catch block
    "no-ex-assign": 2,
    // disallow double-negation boolean casts in a boolean context
    "no-extra-boolean-cast": 2,
    // disallow unnecessary parentheses (off by default)
    "no-extra-parens": 2,
    // disallow unnecessary semicolons
    "no-extra-semi": 2,
    // disallow overwriting functions written as function declarations
    "no-func-assign": 2,
    // disallow function or variable declarations in nested blocks
    "no-inner-declarations": [2, "functions"],
    // disallow invalid regular expression strings in the RegExp constructor
    "no-invalid-regexp": 2,
    // disallow irregular whitespace outside of strings and comments
    "no-irregular-whitespace": 2,
    // disallow negation of the left operand of an in expression
    "no-negated-in-lhs": 2,
    // disallow the use of object properties of the global object (Math and JSON) as functions
    "no-obj-calls": 2,
    // disallow multiple spaces in a regular expression literal
    "no-regex-spaces": 2,
    // disallow sparse arrays
    "no-sparse-arrays": 2,
    // disallow unreachable statements after a return, throw, continue, or break statement
    "no-unreachable": 2,
    // Avoid code that looks like two expressions but is actually one
    "no-unexpected-multiline": 2,
    // disallow comparisons with the value NaN
    "use-isnan": 2,
    // Ensure JSDoc comments are valid (off by default)
    "valid-jsdoc": [2, {
      "requireReturn": false,
      "requireParamDescription": true,
      "requireReturnDescription": true
    }],
    // Ensure that the results of typeof are compared against a valid string
    "valid-typeof": 2,

    // ==============
    // Best Practices
    // ==============

    // Enforces getter/setter pairs in objects
    "accessor-pairs": 0,
    // treat var statements as if they were block scoped (off by default)
    "block-scoped-var": 2,
    // specify the maximum cyclomatic complexity allowed in a program (off by default)
    "complexity": [2, 8],
    // require return statements to either always or never specify values
    "consistent-return": 2,
    // specify curly brace conventions for all control statements
    "curly": [2, "all"],
    // require default case in switch statements (off by default)
    "default-case": 2,
    // enforces consistent newlines before or after dots
    "dot-location": [2, "property"],
    // encourages use of dot notation whenever possible
    "dot-notation": 0,
    // require the use of === and !==
    "eqeqeq": 2,
    // make sure for-in loops have an if statement (off by default)
    "guard-for-in": 0,
    // disallow the use of alert, confirm, and prompt
    "no-alert": 2,
    // disallow use of arguments.caller or arguments.callee
    "no-caller": 2,
    // disallow division operators explicitly at beginning of regular expression (off by default)
    "no-div-regex": 2,
    // disallow else after a return in an if (off by default)
    "no-else-return": 2,
    // disallow comparisons to null without a type-checking operator (off by default)
    "no-eq-null": 0,
    // disallow use of eval()
    "no-eval": 2,
    // disallow adding to native types
    "no-extend-native": 2,
    // disallow unnecessary function binding
    "no-extra-bind": 2,
    // disallow fallthrough of case statements
    "no-fallthrough": 2,
    // disallow the use of leading or trailing decimal points in numeric literals (off by default)
    "no-floating-decimal": 2,
    // disallow the type conversions with shorter notations
    "no-implicit-coercion": [0, {
      "boolean": false,
      "number": false,
      "string": false
    }],
    // disallow use of eval()-like methods
    "no-implied-eval": 2,
    // disallow this keywords outside of classes or class-like objects
    "no-invalid-this": 2,
    // disallow usage of __iterator__ property
    "no-iterator": 2,
    // disallow use of labeled statements
    "no-labels": 2,
    // disallow unnecessary nested blocks
    "no-lone-blocks": 2,
    // disallow creation of functions within loops
    "no-loop-func": 2,
    // disallow use of multiple spaces
    "no-multi-spaces": 2,
    // disallow use of multiline strings
    "no-multi-str": 2,
    // disallow reassignments of native objects
    "no-native-reassign": 2,
    // disallow use of new operator when not part of the assignment or comparison
    "no-new": 2,
    // disallow use of new operator for Function object
    "no-new-func": 2,
    // disallows creating new instances of String,Number, and Boolean
    "no-new-wrappers": 2,
    // disallow use of octal literals
    "no-octal": 2,
    // disallow use of octal escape sequences in string literals, such as var foo = "Copyright \251";
    "no-octal-escape": 2,
    // disallow reassignment of function parameters (off by default)
    "no-param-reassign": [2, {  // disallow reassignment of function parameters (off by default)
      "props": false
    }],
    // disallow use of process.env (off by default)
    "no-process-env": 2,
    // disallow usage of __proto__ property
    "no-proto": 2,
    // disallow declaring the same variable more then once
    "no-redeclare": 2,
    // disallow use of assignment in return statement
    "no-return-assign": [2,
      "always"
    ],
    // disallow use of javascript: urls.
    "no-script-url": 2,
    // disallow comparisons where both sides are exactly the same (off by default)
    "no-self-compare": 2,
    // disallow use of comma operator
    "no-sequences": 2,
    // restrict what can be thrown as an exception (off by default)
    "no-throw-literal": 2,
    // disallow unnecessary .call() and .apply()
    "no-useless-call": 2,
    "no-useless-concat": 2,
    // disallow usage of expressions in statement position
    "no-unused-expressions": 0,
    // disallow use of void operator (off by default)
    "no-void": 2,
    // disallow usage of configurable warning terms in comments- e.g. TODO or FIXME (off by default)
    "no-warning-comments": [2, {  // disallow usage of configurable warning terms in comments, e.g. TODO or FIXME (off by default)
      "terms": [
        "todo",
        "fixme"
      ],
      "location": "start"
    }],
    // disallow use of the with statement
    "no-with": 2,
    // require use of the second argument for parseInt() (off by default)
    "radix": 2,
    // requires to declare all vars on top of their containing scope (off by default)
    "vars-on-top": 2,
    // require immediate function invocation to be wrapped in parentheses (off by default)
    "wrap-iife": [2, "outside"],
    // require or disallow Yoda conditions
    "yoda": [2, "never"],

    // ==============
    // Strict Mode
    // ==============
    // This mode forbids any occurrence of a Use Strict Directive. The directive is inserted by babel automatically.
    "strict": [2, "never"],

    // ==============
    // Variables
    // ==============
    // enforce variable initializations at definition
    "init-declarations": 0,
    //disallow the catch clause parameter name being the same as a variable in the outer scope (off by default in the node environment)
    "no-catch-shadow": 2,
    //disallow deletion of variables
    "no-delete-var": 2,
    //disallow labels that share a name with a variable
    "no-label-var": 2,
    //disallow declaration of variables already declared in the outer scope
    "no-shadow": 2,
    //disallow shadowing of names such as arguments
    "no-shadow-restricted-names": 2,
    //disallow use of undeclared variables unless mentioned in a /*global */ block
    "no-undef": 2,
    //disallow use of undefined when initializing variables
    "no-undef-init": 2,
    //disallow use of undefined variable (off by default)
    "no-undefined": 2,
    //disallow declaration of variables that are not used in the code
    "no-unused-vars": [2, {
      "vars": "all",
      "args": "none"
    }],
    //disallow use of variables before they are defined
    "no-use-before-define": 0,

    // ==============
    // Node.js
    // ==============

    // enforce return after a callback
    "callback-return": [2, ["callback"]],
    // disallow require() outside of the top-level module scope
    "global-require": 2,
    // enforces error handling in callbacks (off by default) (on by default in the node environment)
    "handle-callback-err": 2,
    // disallow mixing regular variable and require declarations (off by default) (on by default in the node environment)
    "no-mixed-requires": 2,
    // disallow use of new operator with the require function (off by default) (on by default in the node environment)
    "no-new-require": 2,
    // disallow string concatenation with __dirname and __filename (off by default) (on by default in the node environment)
    "no-path-concat": 2,
    // disallow process.exit() (on by default in the node environment)
    "no-process-exit": 2,
    // restrict usage of specified node modules (off by default)
    "no-restricted-modules": 0,
    // disallow use of synchronous methods (off by default)
    "no-sync": 0,

    // ==============
    // Stylistic Issues
    // ==============

    // enforce spacing inside array brackets
    "array-bracket-spacing": [2, "never"],
    // disallow or enforce spaces inside of single line blocks
    "block-spacing": 0,
    // enforce one true brace style (off by default)
    "brace-style": [2,
      "1tbs", {
        "allowSingleLine": true
      }],
    // require camel case names
    "camelcase": [2, {
      "properties": "never"
    }],
    // enforce spacing before and after comma
    "comma-spacing": [2, {
      "before": false,
      "after": true
    }],
    // enforce one true comma style (off by default)
    "comma-style": [2, "last"],
    // require or disallow padding inside computed properties
    "computed-property-spacing": [2, "never"],
    // enforces consistent naming when capturing the current execution context (off by default)
    "consistent-this": [2, "_this"],
    // enforce newline at the end of file, with no multiple empty lines
    "eol-last": 2,
    // require function expressions to have a name (off by default)
    "func-names": 0,
    // enforces use of function declarations or expressions (off by default)
    "func-style": 0,
    // this option enforces minimum and maximum identifier lengths (variable names, property names etc.)
    "id-length": [0, {"max": 25}],
    // require identifiers to match the provided regular expression
    "id-match": 0,
    // this option sets a specific tab width for your code (off by default)
    "indent": [2, 2],
    // enforces spacing between keys and values in object literal properties
    "key-spacing": [2, {
      "beforeColon": false,
      "afterColon": true
    }],
    // disallow mixed 'LF' and 'CRLF' as linebreaks
    "linebreak-style": [2, "unix"],
    // enforce empty lines around comments
    "lines-around-comment": [2, {
      "beforeBlockComment": true,
      "beforeLineComment": true,
      "afterBlockComment": false,
      "afterLineComment": false,
      "allowBlockStart": true,
      "allowBlockEnd": false
    }],
    // specify the maximum depth callbacks can be nested (off by default)
    "max-nested-callbacks": [2, 6],
    // require a capital letter for constructors
    "new-cap": [2, {
      "properties": false
    }],
    // disallow the omission of parentheses when invoking a constructor with no arguments
    "new-parens": 2,
    // allow/disallow an empty newline after var statement (off by default)
    "newline-after-var": 2,
    // disallow use of the Array constructor
    "no-array-constructor": 2,
    // disallow use of the continue statement
    "no-continue": 2,
    // disallow comments inline after code (off by default)
    "no-inline-comments": 2,
    // disallow if as the only statement in an else block (off by default)
    "no-lonely-if": 2,
    // disallow mixed spaces and tabs for indentation
    "no-mixed-spaces-and-tabs": [2, false],
    // disallow multiple empty lines (off by default)
    "no-multiple-empty-lines": [2, {
      "max": 1
    }],
    // disallow nested ternary expressions (off by default)
    "no-nested-ternary": 2,
    // disallow use of the Object constructor
    "no-new-object": 2,
    // disallow use of certain syntax in code
    "no-restricted-syntax": 0,
    // disallow space between function identifier and application
    "no-spaced-func": 2,
    // disallow the use of ternary operators (off by default)
    "no-ternary": 0,
    // disallow trailing whitespace at the end of lines
    "no-trailing-spaces": 2,
    // disallow dangling underscores in identifiers
    "no-underscore-dangle": 0,
    // disallow the use of Boolean literals in conditional expressions
    "no-unneeded-ternary": 2,
    // disallow wrapping of non-IIFE statements in parens
    "no-wrap-func": 0,
    // require or disallow padding inside curly braces
    "object-curly-spacing": [2, "never"],
    // allow just one var statement per function (off by default)
    "one-var": 0,
    // require assignment operator shorthand where possible or prohibit it entirely (off by default)
    "operator-assignment": [0, "always"],
    // enforce operators to be placed before or after line breaks
    "operator-linebreak": [2, "after"],
    // enforce padding within blocks (off by default)
    "padded-blocks": [2, "never"],
    // require quotes around object literal property names (off by default)
    "quote-props": [2, "consistent-as-needed"],
    // specify whether double or single quotes should be used
    "quotes": [2, "single"],
    // Require JSDoc comment
    "require-jsdoc": 0,
    // require or disallow use of semicolons instead of ASI
    "semi": [2, "always"],
    // enforce spacing before and after semicolons
    "semi-spacing": [2, {
      "before": false,
      "after": true
    }],
    // sort variables within the same declaration block (off by default)
    "sort-vars": 0,
    // require a space after certain keywords (off by default)
    "keyword-spacing": [
      2,
      {
        "before": true,
        "after": true
      }
    ],
    // require a space before certain keywords
    "space-before-keywords": 0,
    // require or disallow space before blocks (off by default)
    "space-before-blocks": [2, "always"],
    // require or disallow space before function opening parenthesis (off by default)
    "space-before-function-paren": [2, "never"],
    // require or disallow spaces inside brackets (off by default)
    "space-in-brackets": 0,
    // require or disallow spaces inside parentheses (off by default)
    "space-in-parens": [2, "never"],
    // require spaces around operators
    "space-infix-ops": 2,
    // Require or disallow spaces before/after unary operators (words on by default, nonwords off by default)
    "space-unary-ops": [2, {
      "words": true,
      "nonwords": false
    }],
    // require or disallow a space immediately following the // or /* in a comment
    "spaced-comment": [2, "always"],
    // require regex literals to be wrapped in parentheses (off by default)
    "wrap-regex": 0
  }
};
