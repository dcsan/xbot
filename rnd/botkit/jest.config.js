module.exports = {
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
    },
  },
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$',
  moduleFileExtensions: [
    'js',
    'json',
    'ts',
    'tsx',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  preset: 'ts-jest',
  testMatch: null,
}
