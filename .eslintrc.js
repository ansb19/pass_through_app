module.exports = {
    root: true,
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react-native/all',
    ],
    plugins: ['react', 'react-native'],
    rules: {
        // Text 밖에 raw string 사용 금지
        'react-native/no-raw-text': ['error', {
            skip: ['CustomText', 'AppText']
        }]
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
};
