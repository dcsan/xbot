module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  "moduleFileExtensions": [
    "js",
    "json",
    "jsx",
    "ts",
    "tsx",
    "yaml"
  ],
  setupFilesAfterEnv: [
    "./src/test/setup.ts",
    // can have more setup files here
  ]
};
