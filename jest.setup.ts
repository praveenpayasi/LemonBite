// Jest setup for React Native Testing Library.
// RNTL v13+ registers its Jest matchers and auto-cleanup automatically on import.
import '@testing-library/react-native';

// In-memory AsyncStorage for tests that touch profile/onboarding persistence.
// The official mock is CommonJS and must be required inside the hoisted factory.
jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
