const { run } = require('./build');
const { entries } = require('./config');
const lodash = require('lodash');

run(
  'rollup.config.js',
  lodash.flatten(
      entries
        .map((entry) => {
          return `dist/${entry.file}`;
        })
  ));

