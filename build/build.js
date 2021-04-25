const fs = require('fs');
const chalk = require('chalk');
const execa = require('execa');
const { gzipSync } = require('zlib');
const { compress } = require('brotli');

async function run(config, files) {
  await cleanDir(['./dist']);
  await build(config);
  checkAllSizes(files);
  await execa('node', ['node_modules/.bin/api-extractor', 'run', '--local']);
  await execa('rimraf', [
      'dist/common',
      'dist/load',
      'dist/message',
      'dist/sapp',
      'dist/service',
      'dist/servkit',
      'dist/session',
      'dist/terminal',
      'dist/window'
  ])
}

async function cleanDir(files) {
  await execa('rimraf', files);
}

async function build(config) {
  await execa('node', ['--max_old_space_size=8192', 'node_modules/rollup/dist/bin/rollup', '-c', 'build/' + config, ...process.argv.slice(2)], { stdio: 'inherit' })
}

function checkAllSizes(files) {
  console.log()
  files.map((f) => checkSize(f))
  console.log()
}

function checkSize(file) {
  const f = fs.readFileSync(file)
  const minSize = (f.length / 1024).toFixed(2) + 'kb'
  const gzipped = gzipSync(f)
  const gzippedSize = (gzipped.length / 1024).toFixed(2) + 'kb'
  const compressed = compress(f)
  const compressedSize = (compressed.length / 1024).toFixed(2) + 'kb'
  console.log(
    `${chalk.gray(
      chalk.bold(file)
    )} size:${minSize} / gzip:${gzippedSize} / brotli:${compressedSize}`
  )
}

module.exports = { run }
