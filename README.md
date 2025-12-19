# @beluga-labs/react-provider-stack

A lightweight utility to compose React providers into a clean, configurable stack. Works with any React framework including Next.js, Remix, Gatsby, Vite, Create React App, and any other React-based application.

## Features

- 🚀 **Lightweight**: Minimal bundle size with zero runtime dependencies
- 🔧 **Flexible**: Support for wrapping and standalone providers
- 📦 **Type Safe**: Full TypeScript support
- ⚡ **Simple API**: Clean syntax for provider composition
- 🎯 **Order Control**: Maintain full control over provider nesting order
- 🧩 **Two Provider Types**: Wrapping providers (wrap children) and standalone providers (sibling to children)

## Installation

```bash
npm install @beluga-labs/react-provider-stack
# or
pnpm add @beluga-labs/react-provider-stack
# or
yarn add @beluga-labs/react-provider-stack
```

## What is this package?

When building React applications, you often need multiple context providers (Theme, Auth, i18n, etc.). Without this package, your code can become messy with deeply nested provider components:

```tsx
// Without ProviderStack - messy nesting
<ThemeProvider theme="dark">
  <AuthProvider session={session}>
    <QueryClientProvider client={queryClient}>
      <App />
      <ToastContainer position="top-right" />
      <ShortcutHint />
    </QueryClientProvider>
  </AuthProvider>
</ThemeProvider>
```

With `@beluga-labs/react-provider-stack`, you can compose all providers into a clean, declarative array:

```tsx
import { ProviderStack, standalone } from '@beluga-labs/react-provider-stack';

// With ProviderStack - clean and maintainable
const providers = [
  // Wrapping providers (wrap children)
  [ThemeProvider, { theme: 'dark' }],
  [AuthProvider, { session }],
  [QueryClientProvider, { client: queryClient }],

  // Standalone providers (rendered as siblings to children)
  standalone(ToastContainer, { position: 'top-right' }),
  standalone(ShortcutHint),
];

<ProviderStack providers={providers}>
  <App />
</ProviderStack>;
```

## Usage

### Basic Setup

Import `ProviderStack` and define your providers as an array:

```tsx
import { ProviderStack, standalone } from '@beluga-labs/react-provider-stack';
import { ThemeProvider } from './providers/ThemeProvider';
import { AuthProvider } from './providers/AuthProvider';
import { ToastContainer } from './providers/ToastContainer';

function App() {
  const providers = [
    // Wrapping providers
    [ThemeProvider, { theme: 'dark' }],
    [AuthProvider, { session }],

    // Standalone providers
    standalone(ToastContainer, { position: 'top-right' }),
  ];

  return (
    <ProviderStack providers={providers}>
      <YourApp />
    </ProviderStack>
  );
}
```

### Provider Types

There are two types of providers:

#### 1. Wrapping Providers

Wrapping providers wrap the children, like `<Provider>{children}</Provider>`. They can have props or not:

```tsx
const providers = [
  // With props
  [ThemeProvider, { theme: 'dark' }],
  [AuthProvider, { session, onSignOut: handleSignOut }],

  // Without props
  FeatureProvider,
  [FeatureProvider], // Also valid
];
```

#### 2. Standalone Providers

Standalone providers are rendered as siblings to the children, like `<Provider />`. Use the `standalone()` helper:

```tsx
import { standalone } from '@beluga-labs/react-provider-stack';

const providers = [
  // With props
  standalone(ToastContainer, { position: 'top-right' }),
  standalone(ModalPortal, { container: document.body }),

  // Without props
  standalone(ShortcutHint),
  standalone(DevTools),
];
```

### Syntax Reference

#### Wrapping Providers

When you need to pass configuration props to a provider, use the tuple syntax `[Component, props]`:

```tsx
const providers = [
  [ThemeProvider, { theme: 'dark', colorScheme: 'system' }],
  [AuthProvider, { session, onSignOut: handleSignOut }],
  [QueryClientProvider, { client: queryClient }],
];
```

**Syntax:**

- `[Component, { prop1: value1, prop2: value2 }]` - Component with props object

**Example:**

```tsx
// ThemeProvider accepts theme prop
const ThemeProvider = ({ theme, children }) => (
  <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
);

// Usage with props
const providers = [[ThemeProvider, { theme: 'dark' }]];

// Even if ThemeProvider has optional props, you can still use it without props:
const providers = [
  ThemeProvider, // Uses default/optional props
];
```

#### 2. Provider without Props

When a provider doesn't need props (or uses default/optional props), you can pass it directly:

```tsx
const providers = [FeatureProvider, ToastProvider, ModalProvider];
```

**Syntax:**

- `Component` - Component without props (uses default/optional props if any)
- `[Component]` - Also valid (tuple without props object)

**Important:** A provider passed without props can still accept props if they are optional. The difference is only in the syntax used:

```tsx
// FeatureProvider that accepts optional props
const FeatureProvider = ({ enabled = true, children }) => {
  return <FeatureContext.Provider value={{ enabled }}>{children}</FeatureContext.Provider>;
};

// Usage - all three are equivalent:
const providers = [
  FeatureProvider, // Uses default props (enabled = true)
  [FeatureProvider], // Same as above
  [FeatureProvider, { enabled: false }], // Explicitly passes props
];
```

#### 3. Provider with Empty Props Object

You can also explicitly pass an empty props object:

```tsx
const providers = [
  [FeatureProvider, {}], // Explicitly no props
];
```

This is equivalent to `FeatureProvider` or `[FeatureProvider]`.

### Complete Example

Here's a complete example showing all provider types:

```tsx
import { ProviderStack, standalone } from '@beluga-labs/react-provider-stack';
import { ThemeProvider } from './providers/ThemeProvider';
import { UserProvider } from './providers/UserProvider';
import { FeatureProvider } from './providers/FeatureProvider';
import { ToastContainer } from './components/ToastContainer';
import { ShortcutHint } from './components/ShortcutHint';

function App() {
  const providers = [
    // WRAPPING PROVIDERS - wrap the children
    [ThemeProvider, { theme: 'dark' }], // With props
    [UserProvider, { name: 'John Doe' }], // With props
    FeatureProvider, // Without props

    // STANDALONE PROVIDERS - rendered as siblings to children
    standalone(ToastContainer, { position: 'top-right' }), // With props
    standalone(ShortcutHint), // Without props
  ];

  return (
    <ProviderStack providers={providers}>
      <YourApp />
    </ProviderStack>
  );
}
```

This results in the following structure:

```tsx
<ThemeProvider theme="dark">
  <UserProvider name="John Doe">
    <FeatureProvider>
      <YourApp />
      <ToastContainer position="top-right" />
      <ShortcutHint />
    </FeatureProvider>
  </UserProvider>
</ThemeProvider>
```

**Key Points:**

- **Wrapping providers** use `[Component, props]` or just `Component`
- **Standalone providers** use `standalone(Component, props)` or `standalone(Component)`
- Wrapping providers wrap all content (including standalone providers)
- Standalone providers are rendered as siblings to your children

### Provider Order

The order in the array determines the nesting structure:

```tsx
// This configuration:
const providers = [A, B, C];

// Results in:
<A>
  <B>
    <C>{children}</C>
  </B>
</A>;
```

**Standalone providers respect their position in the array:**

```tsx
const providers = [
  [ThemeProvider, { theme: 'dark' }], // Wrapping
  standalone(ToastContainer), // Standalone - at this level
  [AuthProvider], // Wrapping
];

// Results in:
<ThemeProvider theme="dark">
  <ToastContainer />
  <AuthProvider>{children}</AuthProvider>
</ThemeProvider>;
```

The `ToastContainer` is rendered as a sibling to `AuthProvider` inside `ThemeProvider`, exactly where it's positioned in the array.

**Important:** Order matters! Providers listed first wrap providers listed later. Standalone providers become siblings at their position.

### Advanced Usage

#### Pre-configured Provider Stack

Use `createProviderStack` to create a reusable provider stack:

```tsx
// providers.tsx
import { createProviderStack, standalone } from '@beluga-labs/react-provider-stack';

export const AppProviders = createProviderStack([
  [ThemeProvider, { theme: 'dark' }],
  [QueryClientProvider, { client: queryClient }],
  FeatureProvider,
  standalone(ToastContainer),
]);

// layout.tsx or _app.tsx
import { AppProviders } from './providers';

export default function RootLayout({ children }) {
  return <AppProviders>{children}</AppProviders>;
}
```

#### Combining Provider Arrays

Use `combineProviders` to organize providers by concern:

```tsx
import { combineProviders, ProviderStack, standalone } from '@beluga-labs/react-provider-stack';

// Organize providers by concern
const coreProviders = [
  [ThemeProvider, { theme }],
  [I18nProvider, { locale }],
];

const dataProviders = [
  [QueryClientProvider, { client: queryClient }],
  [AuthProvider, { session }],
];

const uiProviders = [
  standalone(ToastContainer, { position: 'top-right' }),
  standalone(ModalPortal),
];

// Combine them
const allProviders = combineProviders(coreProviders, dataProviders, uiProviders);

<ProviderStack providers={allProviders}>
  <App />
</ProviderStack>;
```

## Framework Integration

This package works with any React framework. Here are examples for popular frameworks:

### Next.js

#### App Router (Next.js 13+)

```tsx
// app/layout.tsx
import { ProviderStack } from '@beluga-labs/react-provider-stack';

const providers = [
  [ThemeProvider, { theme: 'dark' }],
  [QueryClientProvider, { client: queryClient }],
  FeatureProvider,
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ProviderStack providers={providers}>{children}</ProviderStack>
      </body>
    </html>
  );
}
```

### Pages Router

```tsx
// pages/_app.tsx
import { ProviderStack } from '@beluga-labs/react-provider-stack';
import type { AppProps } from 'next/app';

const providers = [
  [ThemeProvider, { theme: 'dark' }],
  [QueryClientProvider, { client: queryClient }],
  FeatureProvider,
];

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ProviderStack providers={providers}>
      <Component {...pageProps} />
    </ProviderStack>
  );
}
```

### Remix

```tsx
// app/root.tsx
import { ProviderStack } from '@beluga-labs/react-provider-stack';

const providers = [
  [ThemeProvider, { theme: 'dark' }],
  [QueryClientProvider, { client: queryClient }],
  FeatureProvider,
];

export default function App() {
  return (
    <html>
      <body>
        <ProviderStack providers={providers}>
          <Outlet />
        </ProviderStack>
      </body>
    </html>
  );
}
```

### Vite / Create React App

```tsx
// src/main.tsx or src/index.tsx
import { ProviderStack } from '@beluga-labs/react-provider-stack';
import React from 'react';
import ReactDOM from 'react-dom/client';

const providers = [
  [ThemeProvider, { theme: 'dark' }],
  [QueryClientProvider, { client: queryClient }],
  FeatureProvider,
];

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ProviderStack providers={providers}>
      <App />
    </ProviderStack>
  </React.StrictMode>
);
```

### Gatsby

```tsx
// gatsby-browser.js or gatsby-ssr.js
import { ProviderStack } from '@beluga-labs/react-provider-stack';
import React from 'react';

const providers = [
  [ThemeProvider, { theme: 'dark' }],
  [QueryClientProvider, { client: queryClient }],
  FeatureProvider,
];

export const wrapRootElement = ({ element }) => (
  <ProviderStack providers={providers}>{element}</ProviderStack>
);
```

### Any React Application

Since this package is framework-agnostic, you can use it anywhere React components are used:

```tsx
import { ProviderStack } from '@beluga-labs/react-provider-stack';

const providers = [[ThemeProvider, { theme: 'dark' }], FeatureProvider];

function App() {
  return (
    <ProviderStack providers={providers}>
      <YourApp />
    </ProviderStack>
  );
}
```

## API Reference

### ProviderStack

The main component that wraps your application with multiple providers.

#### Props

| Prop      | Type                 | Required | Description                            |
| --------- | -------------------- | -------- | -------------------------------------- |
| providers | ProviderDefinition[] | ✅       | Array of providers (first = outermost) |
| children  | ReactNode            | ❌       | Your application components            |

### ProviderDefinition

A provider can be defined in several ways:

```tsx
// Wrapping providers (wrap children)
type WrapperDef =
  | ComponentType                    // Provider without props
  | [ComponentType]                  // Provider without props (tuple form)
  | [ComponentType, Props]           // Provider with props

// Standalone providers (sibling to children)
type StandaloneDef = standalone(Component) | standalone(Component, props)

type ProviderDefinition = WrapperDef | StandaloneDef
```

### standalone

Helper function to create a standalone provider definition:

```tsx
import { standalone } from '@beluga-labs/react-provider-stack';

// Without props
standalone(ToastContainer);

// With props
standalone(ToastContainer, { position: 'top-right' });
```

Standalone providers are rendered as siblings to the children, not wrapping them.

### createProviderStack

Factory function to create a pre-configured ProviderStack component.

```tsx
const AppProviders = createProviderStack([
  [ThemeProvider, { theme: 'dark' }],
  FeatureProvider,
  standalone(ToastContainer),
]);

<AppProviders>
  <App />
</AppProviders>;
```

### combineProviders

Utility to combine multiple provider arrays.

```tsx
const allProviders = combineProviders(coreProviders, dataProviders, standaloneProviders);
```

## TypeScript Support

Full TypeScript support is included:

```tsx
import { ProviderDefinition, standalone } from '@beluga-labs/react-provider-stack';

const providers: ProviderDefinition[] = [
  // Wrapping providers
  [ThemeProvider, { theme: 'dark' }],
  FeatureProvider,

  // Standalone providers
  standalone(ToastContainer, { position: 'top-right' }),
  standalone(ShortcutHint),
];
```

## Contributing

We welcome contributions! Please see our [contributing guidelines](CONTRIBUTING.md) for more details.

## License

MIT License - see [LICENSE](LICENSE) file for details.
