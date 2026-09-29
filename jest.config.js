module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  collectCoverageFrom: [
    'src/routes/**/*.js',
    'src/services/**/*.js',
    'src/app.js'
  ]
};