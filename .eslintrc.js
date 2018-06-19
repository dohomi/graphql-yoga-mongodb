module.exports = {
    env: {
        es6: true,
        node: true
    },
    plugins: ['node'],
    extends: ['eslint:recommended', 'plugin:node/recommended'],
    parserOptions: {
        ecmaVersion: 2018
    },
    rules: {
        'no-console': 0,
        'prefer-const': 2,
        'node/exports-style': ['error', 'module.exports']
    }
}
