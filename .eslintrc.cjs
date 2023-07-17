module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: [
    '@whoj'
  ],
  rules: {
    'import/order': 'off',
    'no-console': process.env.NODE_ENV !== 'production' ? 'off' : 'warning'
  }
};
