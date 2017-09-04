const rollup = require('rollup')
const babel = require('rollup-plugin-babel')

rollup
  .rollup({
    input: 'src/index.js',
    external: [
      'ramda/src/__',
      'ramda/src/apply',
      'ramda/src/compose',
      'ramda/src/concat',
      'ramda/src/curry',
      'ramda/src/filter',
      'ramda/src/forEach',
      'ramda/src/keys',
      'ramda/src/last',
      'ramda/src/propIs',
      'ramda/src/reduce'
    ],
    plugins: [
      babel({
        presets: [
          [
            'env',
            {
              modules: false,
              loose: true,
              targets: { node: 4 }
            }
          ]
        ],
        plugins: ['ramda', 'external-helpers']
      })
    ]
  })
  .then(bundle => {
    bundle.write({
      file: 'dist/index.js',
      format: 'cjs'
    })
    bundle.write({
      file: 'dist/index.mjs',
      format: 'es'
    })
  })
