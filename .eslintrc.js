// module.exports = {
//   root: true,
//   extends: '@react-native-community',
// };

module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: ['eslint:recommended', 'plugin:react/recommended', 'prettier'],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', 'react-hooks', 'prettier'],
  rules: {
    'no-empty-function': ['warn', {allow: ['arrowFunctions']}], // 중괄호가 빈 함수 허용
    // '@typescript-eslint/no-empty-function': ['warn', { allow: ['arrowFunctions'] }], // 중괄호가 빈 함수 허용
    'react-hooks/exhaustive-deps': 'warn',
    'react/prop-types': 'off', // prop-types 사용하지 않음
    'react/react-in-jsx-scope': 'off', // React를 import하지 않아도 사용 가능
    camelcase: 'off', // camelcase 사용하지 않음
    'spaced-comment': 'warn', // 주석 앞에 공백을 넣지 않음
    quotes: ['error', 'single', {allowTemplateLiterals: true}], // 따옴표 사용
    'no-duplicate-imports': 'error', // 중복 import 에러로 잡음
    'no-unused-vars': 'warn',
    'no-irregular-whitespace': 'off',
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
};
