// module.exports = {
//   displayName: 'keepamovie',
//   preset: '../../jest.preset.js',
//   setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
//   globals: {
//     'ts-jest': {
//       stringifyContentPathRegex: '\\.(html|svg)$',
//
//       tsconfig: '<rootDir>/tsconfig.spec.json'
//     }
//   },
//   transform: { '^.+\\.(ts|js|html)$': 'jest-preset-angular' },
//   coverageDirectory: '../../coverage/apps/keepamovie',
//   snapshotSerializers: [
//     'jest-preset-angular/build/serializers/no-ng-attributes',
//     'jest-preset-angular/build/serializers/ng-snapshot',
//     'jest-preset-angular/build/serializers/html-comment'
//   ]
// };

// jest.config.js
module.exports = {
  displayName: 'keepamovie',
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
    globals: {
    'ts-jest': {
      stringifyContentPathRegex: '\\.(html|svg)$',

      tsconfig: '<rootDir>/tsconfig.spec.json'
    }
  },
  transform: { '^.+\\.(ts|js|html)$': 'jest-preset-angular' },
  coverageDirectory: '../../coverage/apps/keepamovie',
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment'
  ]
};
