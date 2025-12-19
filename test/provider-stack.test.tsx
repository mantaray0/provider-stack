import { render, screen, fireEvent } from '@testing-library/react';
import React, { ReactNode, createContext, useContext, useState, useCallback } from 'react';
import { describe, expect, it } from 'vitest';
import {
  ProviderDefinition,
  ProviderStack,
  combineProviders,
  createProviderStack,
  standalone,
} from '../src/index';

// ============================================================================
// 1. WRAPPING PROVIDER WITH PROPS - ThemeProvider
// ============================================================================

type Theme = 'light' | 'dark';
interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {},
});

const ThemeProvider = ({
  initialTheme = 'light',
  children,
}: {
  initialTheme?: Theme;
  children?: ReactNode;
}) => {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

// ============================================================================
// 2. WRAPPING PROVIDER WITHOUT PROPS - CounterProvider
// ============================================================================

interface CounterContextValue {
  count: number;
  increment: () => void;
  decrement: () => void;
}

const CounterContext = createContext<CounterContextValue>({
  count: 0,
  increment: () => {},
  decrement: () => {},
});

const CounterProvider = ({ children }: { children?: ReactNode }) => {
  const [count, setCount] = useState(0);
  const increment = useCallback(() => setCount((c) => c + 1), []);
  const decrement = useCallback(() => setCount((c) => c - 1), []);

  return (
    <CounterContext.Provider value={{ count, increment, decrement }}>
      {children}
    </CounterContext.Provider>
  );
};

// ============================================================================
// 3. STANDALONE PROVIDER WITH PROPS - NotificationBanner
// ============================================================================

const NotificationBanner = ({ message, type = 'info' }: { message: string; type?: string }) => (
  <div data-testid="notification-banner" data-type={type}>
    {message}
  </div>
);

// ============================================================================
// 4. STANDALONE PROVIDER WITHOUT PROPS - KeyboardHint
// ============================================================================

const KeyboardHint = () => <div data-testid="keyboard-hint">Press ? for help</div>;

// ============================================================================
// TEST CONSUMERS
// ============================================================================

const ThemeConsumer = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button data-testid="theme-toggle" onClick={toggleTheme}>
        Toggle
      </button>
    </div>
  );
};

const CounterConsumer = () => {
  const { count, increment, decrement } = useContext(CounterContext);
  return (
    <div>
      <span data-testid="counter-value">{count}</span>
      <button data-testid="counter-increment" onClick={increment}>
        +
      </button>
      <button data-testid="counter-decrement" onClick={decrement}>
        -
      </button>
    </div>
  );
};

const FullConsumer = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { count, increment } = useContext(CounterContext);
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <span data-testid="counter-value">{count}</span>
      <button data-testid="theme-toggle" onClick={toggleTheme}>
        Toggle Theme
      </button>
      <button data-testid="counter-increment" onClick={increment}>
        Increment
      </button>
    </div>
  );
};

// ============================================================================
// TESTS: WRAPPING PROVIDERS
// ============================================================================

describe('Wrapping Provider with Props', () => {
  it('passes initial props to provider', () => {
    const providers: ProviderDefinition[] = [
      [ThemeProvider, { initialTheme: 'dark' }] as ProviderDefinition,
    ];

    render(
      <ProviderStack providers={providers}>
        <ThemeConsumer />
      </ProviderStack>
    );

    expect(screen.getByTestId('theme-value').textContent).toBe('dark');
  });

  it('allows state changes via context', () => {
    const providers: ProviderDefinition[] = [
      [ThemeProvider, { initialTheme: 'light' }] as ProviderDefinition,
    ];

    render(
      <ProviderStack providers={providers}>
        <ThemeConsumer />
      </ProviderStack>
    );

    expect(screen.getByTestId('theme-value').textContent).toBe('light');

    fireEvent.click(screen.getByTestId('theme-toggle'));

    expect(screen.getByTestId('theme-value').textContent).toBe('dark');
  });
});

describe('Wrapping Provider without Props', () => {
  it('provides default state', () => {
    const providers: ProviderDefinition[] = [CounterProvider as ProviderDefinition];

    render(
      <ProviderStack providers={providers}>
        <CounterConsumer />
      </ProviderStack>
    );

    expect(screen.getByTestId('counter-value').textContent).toBe('0');
  });

  it('allows state changes via context', () => {
    const providers: ProviderDefinition[] = [CounterProvider as ProviderDefinition];

    render(
      <ProviderStack providers={providers}>
        <CounterConsumer />
      </ProviderStack>
    );

    fireEvent.click(screen.getByTestId('counter-increment'));
    fireEvent.click(screen.getByTestId('counter-increment'));

    expect(screen.getByTestId('counter-value').textContent).toBe('2');

    fireEvent.click(screen.getByTestId('counter-decrement'));

    expect(screen.getByTestId('counter-value').textContent).toBe('1');
  });
});

// ============================================================================
// TESTS: STANDALONE PROVIDERS
// ============================================================================

describe('Standalone Provider with Props', () => {
  it('renders with provided props', () => {
    const providers: ProviderDefinition[] = [
      standalone(NotificationBanner, { message: 'Hello World', type: 'success' }),
    ];

    render(
      <ProviderStack providers={providers}>
        <div data-testid="content">Content</div>
      </ProviderStack>
    );

    const banner = screen.getByTestId('notification-banner');
    expect(banner.textContent).toBe('Hello World');
    expect(banner.getAttribute('data-type')).toBe('success');
  });
});

describe('Standalone Provider without Props', () => {
  it('renders without props', () => {
    const providers: ProviderDefinition[] = [standalone(KeyboardHint)];

    render(
      <ProviderStack providers={providers}>
        <div data-testid="content">Content</div>
      </ProviderStack>
    );

    expect(screen.getByTestId('keyboard-hint').textContent).toBe('Press ? for help');
  });
});

// ============================================================================
// TESTS: COMBINED SCENARIOS
// ============================================================================

describe('All 4 Provider Types Combined', () => {
  it('renders all provider types together', () => {
    const providers: ProviderDefinition[] = [
      [ThemeProvider, { initialTheme: 'dark' }] as ProviderDefinition,
      CounterProvider as ProviderDefinition,
      standalone(NotificationBanner, { message: 'Welcome!', type: 'info' }),
      standalone(KeyboardHint),
    ];

    render(
      <ProviderStack providers={providers}>
        <FullConsumer />
      </ProviderStack>
    );

    // Wrapping with props works
    expect(screen.getByTestId('theme-value').textContent).toBe('dark');

    // Wrapping without props works
    expect(screen.getByTestId('counter-value').textContent).toBe('0');

    // Standalone with props works
    expect(screen.getByTestId('notification-banner').textContent).toBe('Welcome!');

    // Standalone without props works
    expect(screen.getByTestId('keyboard-hint')).toBeDefined();
  });

  it('all interactions work correctly', () => {
    const providers: ProviderDefinition[] = [
      [ThemeProvider, { initialTheme: 'light' }] as ProviderDefinition,
      CounterProvider as ProviderDefinition,
      standalone(NotificationBanner, { message: 'Test', type: 'warning' }),
    ];

    render(
      <ProviderStack providers={providers}>
        <FullConsumer />
      </ProviderStack>
    );

    // Toggle theme
    expect(screen.getByTestId('theme-value').textContent).toBe('light');
    fireEvent.click(screen.getByTestId('theme-toggle'));
    expect(screen.getByTestId('theme-value').textContent).toBe('dark');

    // Increment counter
    expect(screen.getByTestId('counter-value').textContent).toBe('0');
    fireEvent.click(screen.getByTestId('counter-increment'));
    fireEvent.click(screen.getByTestId('counter-increment'));
    fireEvent.click(screen.getByTestId('counter-increment'));
    expect(screen.getByTestId('counter-value').textContent).toBe('3');

    // Standalone still rendered
    expect(screen.getByTestId('notification-banner').getAttribute('data-type')).toBe('warning');
  });
});

// ============================================================================
// TESTS: PROVIDER ORDER
// ============================================================================

describe('Provider Order', () => {
  it('respects order: standalone between wrapping providers', () => {
    const providers: ProviderDefinition[] = [
      [ThemeProvider, { initialTheme: 'dark' }] as ProviderDefinition,
      standalone(NotificationBanner, { message: 'Middle', type: 'info' }),
      CounterProvider as ProviderDefinition,
    ];

    const { container } = render(
      <ProviderStack providers={providers}>
        <FullConsumer />
      </ProviderStack>
    );

    // All elements rendered
    expect(screen.getByTestId('theme-value').textContent).toBe('dark');
    expect(screen.getByTestId('counter-value').textContent).toBe('0');
    expect(screen.getByTestId('notification-banner').textContent).toBe('Middle');

    // Banner should come before consumer elements in DOM order
    const allElements = container.querySelectorAll('[data-testid]');
    const bannerIndex = Array.from(allElements).findIndex(
      (el) => el.getAttribute('data-testid') === 'notification-banner'
    );
    const themeIndex = Array.from(allElements).findIndex(
      (el) => el.getAttribute('data-testid') === 'theme-value'
    );
    expect(bannerIndex).toBeLessThan(themeIndex);
  });

  it('wrapping providers nest correctly', () => {
    const providers: ProviderDefinition[] = [
      [ThemeProvider, { initialTheme: 'dark' }] as ProviderDefinition,
      CounterProvider as ProviderDefinition,
    ];

    render(
      <ProviderStack providers={providers}>
        <FullConsumer />
      </ProviderStack>
    );

    // Both contexts available
    expect(screen.getByTestId('theme-value').textContent).toBe('dark');
    expect(screen.getByTestId('counter-value').textContent).toBe('0');

    // Both can be changed
    fireEvent.click(screen.getByTestId('theme-toggle'));
    fireEvent.click(screen.getByTestId('counter-increment'));

    expect(screen.getByTestId('theme-value').textContent).toBe('light');
    expect(screen.getByTestId('counter-value').textContent).toBe('1');
  });
});

// ============================================================================
// TESTS: UTILITY FUNCTIONS
// ============================================================================

describe('createProviderStack', () => {
  it('creates reusable provider component', () => {
    const AppProviders = createProviderStack([
      [ThemeProvider, { initialTheme: 'dark' }] as ProviderDefinition,
      CounterProvider as ProviderDefinition,
      standalone(KeyboardHint),
    ]);

    render(
      <AppProviders>
        <FullConsumer />
      </AppProviders>
    );

    expect(screen.getByTestId('theme-value').textContent).toBe('dark');
    expect(screen.getByTestId('counter-value').textContent).toBe('0');
    expect(screen.getByTestId('keyboard-hint')).toBeDefined();
  });
});

describe('combineProviders', () => {
  it('combines provider arrays in order', () => {
    const coreProviders: ProviderDefinition[] = [
      [ThemeProvider, { initialTheme: 'light' }] as ProviderDefinition,
    ];
    const stateProviders: ProviderDefinition[] = [CounterProvider as ProviderDefinition];
    const uiProviders: ProviderDefinition[] = [
      standalone(NotificationBanner, { message: 'Combined!', type: 'success' }),
    ];

    const allProviders = combineProviders(coreProviders, stateProviders, uiProviders);

    render(
      <ProviderStack providers={allProviders}>
        <FullConsumer />
      </ProviderStack>
    );

    expect(screen.getByTestId('theme-value').textContent).toBe('light');
    expect(screen.getByTestId('counter-value').textContent).toBe('0');
    expect(screen.getByTestId('notification-banner').textContent).toBe('Combined!');
  });
});

// ============================================================================
// TESTS: EDGE CASES
// ============================================================================

describe('Edge Cases', () => {
  it('renders children without any providers', () => {
    render(
      <ProviderStack providers={[]}>
        <div data-testid="child">No providers</div>
      </ProviderStack>
    );

    expect(screen.getByTestId('child').textContent).toBe('No providers');
  });

  it('renders only standalone providers', () => {
    const providers: ProviderDefinition[] = [
      standalone(NotificationBanner, { message: 'Only standalone', type: 'info' }),
      standalone(KeyboardHint),
    ];

    render(
      <ProviderStack providers={providers}>
        <div data-testid="child">Content</div>
      </ProviderStack>
    );

    expect(screen.getByTestId('notification-banner').textContent).toBe('Only standalone');
    expect(screen.getByTestId('keyboard-hint')).toBeDefined();
    expect(screen.getByTestId('child').textContent).toBe('Content');
  });

  it('renders only wrapping providers', () => {
    const providers: ProviderDefinition[] = [
      [ThemeProvider, { initialTheme: 'dark' }] as ProviderDefinition,
      CounterProvider as ProviderDefinition,
    ];

    render(
      <ProviderStack providers={providers}>
        <FullConsumer />
      </ProviderStack>
    );

    expect(screen.getByTestId('theme-value').textContent).toBe('dark');
    expect(screen.getByTestId('counter-value').textContent).toBe('0');
  });
});
