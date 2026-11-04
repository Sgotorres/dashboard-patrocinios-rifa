import { describe, it, expect, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import App from './App';

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
});

describe('App Smoke Test', () => {
  it('renders App without crashing', () => {
    expect(() => render(<App />)).not.toThrow();
  });
});
