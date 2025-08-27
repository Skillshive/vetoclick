import { createContext, useContext } from 'react';

export function createSafeContext<ContextValue>(errorMessage: string) {
  // Create context with undefined instead of null for better React 19 compatibility
  const Context = createContext<ContextValue | undefined>(undefined);

  const useSafeContext = () => {
    const ctx = useContext(Context);

    if (ctx === undefined) {
      // Return a default value or throw error based on the context type
      // For auth context, we might want to return a default state instead of throwing
      console.warn('Context is undefined, this might be during initial render:', errorMessage);
      
      // For auth context, return a default state
      if (errorMessage.includes('useAuthContext')) {
        return {
          isAuthenticated: false,
          isLoading: true,
          isInitialized: false,
          errorMessage: null,
          user: null,
          login: async () => {},
          logout: async () => {},
        } as ContextValue;
      }
      
      throw new Error(errorMessage);
    }

    return ctx;
  };

  const Provider = ({ children, value }: { value: ContextValue; children: React.ReactNode }) => (
    <Context.Provider value={value}>{children}</Context.Provider>
  );

  return [Provider, useSafeContext] as const;
}