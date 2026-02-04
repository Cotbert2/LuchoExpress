module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/e2e/**/*.e2e.spec.ts'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js', 'json'],
    collectCoverageFrom: [
        'src/**/*.{ts,js}',
        '!src/**/*.spec.ts',
    ],
    coverageDirectory: 'coverage',
    testTimeout: 45000,
    verbose: true,
};
