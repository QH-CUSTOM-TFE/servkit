/**
 * @type {import('@lywzx/rollup-build-scripts').IRollupConfig}
 */
module.exports = {
  ts: true,
  dts: false,
  tsconfigOverride: {
    compilerOptions: {
      module: "ES2015"
    },
    include: ['src']
  },
  inputPrefix: 'src',
}
