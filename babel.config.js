module.exports = {
    presets: [
      '@babel/preset-typescript',
      ['@babel/preset-env', {targets: {node: 'current'}}],
    ],
    "plugins": [
      "@babel/plugin-proposal-export-default-from",
      ["@babel/plugin-transform-runtime", {
          "helpers": false,
          "regenerator": true
      }],

      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ["@babel/plugin-proposal-class-properties", { loose: true }],

  ]
  };