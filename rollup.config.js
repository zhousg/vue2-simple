// rollup.config.js
import terser from '@rollup/plugin-terser'
import serve from 'rollup-plugin-serve'

export default {
  input: 'src/index.js',
  watch: {
    include: 'src/**'
  },
  output: [
    {
      file: 'dist/vue.js',
      name: 'Vue',
      format: 'umd',
      sourcemap: true
    },
    {
      file: 'dist/vue.min.js',
      format: 'umd',
      name: 'Vue',
      plugins: [terser()],
      sourcemap: true
    }
  ],
  plugins: [
    serve({
      contentBase: ['dist', 'public']
    })
  ]
}
