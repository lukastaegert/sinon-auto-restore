/* eslint-disable tree-shaking/no-side-effects-in-initialization */

import babel from 'rollup-plugin-babel'

export default {
  input: 'src/index.js',
  external: id => /ramda/.test(id),
  plugins: [
    babel({
      presets: [
        [
          'env',
          {
            modules: false,
            loose: true
          }
        ]
      ],
      plugins: ['ramda', 'external-helpers']
    })
  ],
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs'
    },
    {
      file: 'dist/index.mjs',
      format: 'es'
    }
  ]
}
