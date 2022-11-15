module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: [
    '@nuxtjs/eslint-config-typescript',
    '@whoj'
  ],
  rules: {
    'no-console': process.env.NODE_ENV !== 'production' ? 'off' : 'warning'
  }
};
