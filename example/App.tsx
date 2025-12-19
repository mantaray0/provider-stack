import { ReactNode, createContext, useContext, useState, useCallback } from 'react';
import { ProviderDefinition, ProviderStack, standalone } from '../src/index';
import './styles.css';

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

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`theme-wrapper ${theme}`}>{children}</div>
    </ThemeContext.Provider>
  );
};

const useTheme = () => useContext(ThemeContext);

// ============================================================================
// 2. WRAPPING PROVIDER WITHOUT PROPS - CounterProvider
// ============================================================================

interface CounterContextValue {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

const CounterContext = createContext<CounterContextValue>({
  count: 0,
  increment: () => {},
  decrement: () => {},
  reset: () => {},
});

const CounterProvider = ({ children }: { children?: ReactNode }) => {
  const [count, setCount] = useState(0);
  const increment = useCallback(() => setCount((c) => c + 1), []);
  const decrement = useCallback(() => setCount((c) => c - 1), []);
  const reset = useCallback(() => setCount(0), []);

  return (
    <CounterContext.Provider value={{ count, increment, decrement, reset }}>
      {children}
    </CounterContext.Provider>
  );
};

const useCounter = () => useContext(CounterContext);

// ============================================================================
// 3. STANDALONE PROVIDER WITH PROPS - CounterBanner
// Uses CounterContext - only works if placed AFTER CounterProvider!
// ============================================================================

interface CounterBannerProps {
  label?: string;
}

const CounterBanner = ({ label = 'Current count' }: CounterBannerProps) => {
  const { count } = useCounter();

  return (
    <div
      className={`notification-banner ${count > 0 ? 'success' : count < 0 ? 'warning' : 'info'}`}>
      <span className="notification-banner__title">Notification Banner</span>
      <span className="notification-banner__divider"> – </span>
      {count > 0 && '[+] '}
      {count < 0 && '[-] '}
      {count === 0 && '[/] '}
      {label}: <strong>{count}</strong>
    </div>
  );
};

// ============================================================================
// 4. STANDALONE PROVIDER WITHOUT PROPS - KeyboardHint
// ============================================================================

const KeyboardHint = () => (
  <div className="keyboard-hint">
    <span>
      <kbd>+</kbd> Increment
    </span>
    <span>
      <kbd>−</kbd> Decrement
    </span>
    <span>
      <kbd>T</kbd> Theme
    </span>
  </div>
);

// ============================================================================
// DEMO CONTENT
// ============================================================================

const DemoContent = () => {
  const { theme, toggleTheme } = useTheme();
  const { count, increment, decrement, reset } = useCounter();

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <h1 className="header__title">ProviderStack Example</h1>
        <span className="header__package">@beluga-labs/react-provider-stack</span>
      </header>

      {/* Theme Section */}
      <section className="section">
        <h2 className="section__title">Wrapping Provider with Props</h2>
        <p className="section__label">ThemeProvider with initialTheme="dark"</p>
        <div style={{ marginTop: '12px' }}>
          <button className="btn btn--primary" onClick={toggleTheme}>
            Toggle Theme ({theme})
          </button>
        </div>
      </section>

      {/* Counter Section */}
      <section className="section">
        <h2 className="section__title">Wrapping Provider without Props</h2>
        <p className="section__label">CounterProvider (manages state internally)</p>
        <div className="counter-display">{count}</div>
        <div className="btn-group">
          <button className="btn btn--secondary" onClick={decrement}>
            − Decrement
          </button>
          <button className="btn btn--primary" onClick={increment}>
            + Increment
          </button>
          <button className="btn btn--secondary" onClick={reset}>
            Reset
          </button>
        </div>
      </section>

      {/* Standalone Info */}
      <section className="section">
        <h2 className="section__title">Provider Order Matters!</h2>
        <p className="section__label">
          CounterBanner uses useCounter() — must come after CounterProvider
        </p>
        <div className="order-explanation">
          <p>
            The <strong>Notification Banner</strong> at the top shows the current count value. This
            only works because <code>CounterBanner</code> is defined <em>after</em>{' '}
            <code>CounterProvider</code>.
          </p>
          <p style={{ marginTop: '12px' }}>
            <strong>Try it:</strong> Move the banner before CounterProvider to see it break:
          </p>
          <pre className="code-block code-block--small">{`// [X] Wrong order - banner shows 0 always
[ThemeProvider, { initialTheme: 'dark' }],
standalone(CounterBanner, { label: 'Count' }),  // before Counter!
CounterProvider,

// [OK] Correct order - banner shows live count
[ThemeProvider, { initialTheme: 'dark' }],
CounterProvider,
standalone(CounterBanner, { label: 'Count' }),  // after Counter`}</pre>
        </div>
      </section>

      {/* Code Block */}
      <section className="section">
        <h2 className="section__title">Configuration</h2>
        <pre className="code-block">{`const providers = [
  // 1. Theme wraps everything
  [ThemeProvider, { initialTheme: 'dark' }],

  // 2. Counter provides state
  CounterProvider,

  // 3. CounterBanner uses useCounter()
  //    → works because it's AFTER CounterProvider
  standalone(CounterBanner, { label: 'Count' }),

  // 4. KeyboardHint (no context needed)
  standalone(KeyboardHint),
];`}</pre>
      </section>
    </div>
  );
};

// ============================================================================
// APP
// ============================================================================

function App() {
  const providers: ProviderDefinition[] = [
    // 1. Wrapping provider WITH props
    [ThemeProvider, { initialTheme: 'dark' }] as ProviderDefinition,

    // 2. Wrapping provider WITHOUT props
    CounterProvider as ProviderDefinition,

    // 3. Standalone WITH props - uses CounterContext!
    // This MUST come after CounterProvider to access the count value
    standalone(CounterBanner, { label: 'Count' }),

    // 4. Standalone WITHOUT props
    standalone(KeyboardHint),
  ];

  return (
    <ProviderStack providers={providers}>
      <DemoContent />
    </ProviderStack>
  );
}

export default App;
