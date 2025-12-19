import { ComponentType, Fragment, ReactNode, createElement } from 'react';

type ProviderProps = Record<string, unknown>;

type ProviderComponent<P extends ProviderProps = ProviderProps> = ComponentType<
  P & { children?: ReactNode }
>;

// Wrapping provider definition
type WrapperDef =
  | ProviderComponent<any>
  | [ProviderComponent<any>]
  | [ProviderComponent<any>, ProviderProps];

// Standalone provider marker
interface StandaloneDef {
  __standalone: true;
  component: ProviderComponent<any>;
  props: ProviderProps;
}

export type ProviderDefinition = WrapperDef | StandaloneDef;

export interface ProviderStackProps {
  providers: ProviderDefinition[];
  children?: ReactNode;
}

// Helper to create standalone provider
export function standalone<P extends ProviderProps>(
  component: ProviderComponent<P>,
  props?: P
): StandaloneDef {
  return {
    __standalone: true,
    component,
    props: props ?? {},
  };
}

function isStandalone(def: ProviderDefinition): def is StandaloneDef {
  return typeof def === 'object' && def !== null && '__standalone' in def;
}

function normalizeWrapper(def: WrapperDef): [ProviderComponent<any>, ProviderProps] {
  if (Array.isArray(def)) {
    const [Component, props = {}] = def;
    return [Component, props];
  }
  return [def, {}];
}

export function ProviderStack({ providers, children }: ProviderStackProps): ReactNode {
  if (providers.length === 0) {
    return createElement(Fragment, null, children);
  }

  // Build nested structure from outside to inside, respecting order
  // Standalone providers become siblings at their position in the array
  return providers.reduceRight<ReactNode>((acc, providerDef, index) => {
    if (isStandalone(providerDef)) {
      // Standalone: render as sibling before the accumulated content
      const standaloneElement = createElement(providerDef.component, {
        ...providerDef.props,
        key: `standalone-${index}`,
      });
      return createElement(Fragment, null, standaloneElement, acc);
    } else {
      // Wrapping: wrap the accumulated content
      const [Provider, props] = normalizeWrapper(providerDef);
      return createElement(Provider, props, acc);
    }
  }, children);
}

export function createProviderStack(providers: ProviderDefinition[]) {
  return function ConfiguredProviderStack({ children }: { children?: ReactNode }) {
    return createElement(ProviderStack, { providers }, children);
  };
}

export function combineProviders(...providerArrays: ProviderDefinition[][]): ProviderDefinition[] {
  return providerArrays.flat();
}
