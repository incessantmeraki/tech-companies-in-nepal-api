module.exports = {
  root: true,
  plugins:[
    'node'
  ],
  extends: [
    'eslint:recommended',
    'plugin:node/recommended'
  ],
  env: {
    es6: true,
    node: true,
    mocha: true
  },
  rules: {
    'newline-before-return': 2,
    'node/no-unpublished-require': 0,
    'node/exports-style': ['error', 'module.exports']
  }
};
