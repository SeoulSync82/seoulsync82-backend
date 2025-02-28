module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'unused-imports', 'import', 'prettier'],
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: [
    '.eslintrc.js',
    'build',
    'dist',
    'coverage',
    '**/*.scss.d.ts',
    '**/*.html',
    '**/*.md',
    '**/*.txt',
    '**/*.xml',
    '**/*.graphql',
    '**/*.yaml',
    '**/*.yml',
    '**/*.json',
  ],
  rules: {
    'unused-imports/no-unused-imports': 'warn',
    'unused-imports/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'prettier/prettier': ['error'],
    'import/prefer-default-export': 'off',
    'import/no-unresolved': 'off',
    'no-console': 'warn',
    'object-curly-newline': ['error', { multiline: true, consistent: true }],
    'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
    'prefer-const': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        ts: 'never',
        jsx: 'never',
        tsx: 'never',
      },
    ],
    // DI를 위해 생성자가 비어 있어도 허용
    'no-useless-constructor': 'off',
    // DI 관련 빈 함수 사용 허용
    'no-empty-function': 'off',
    // 테스트 파일에서 devDependencies 사용 허용
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: ['**/*.spec.ts', '**/*.test.ts', '**/test/**'],
      },
    ],
    // 모듈 순환 의존성 검사 및 릴레이션 시 비활성화
    'import/no-cycle': 'off',
    // TS enum 관련 문제로 인해 JS no-shadow 규칙 비활성화, 대신 TS no-shadow 사용
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    // DI 로 인해 this를 사용하지 않아도 의도된 구현으로 허용하기 위함
    'class-methods-use-this': 'off',
  },
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
  },
};
