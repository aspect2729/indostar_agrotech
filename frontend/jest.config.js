module.exports = {
  transformIgnorePatterns: [
    'node_modules/(?!(axios|fast-check)/)',
  ],
  moduleNameMapper: {
    '^axios$': require.resolve('axios'),
  },
};
