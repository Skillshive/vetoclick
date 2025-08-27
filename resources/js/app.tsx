import { AuthProvider } from "./contexts/auth/Provider";
import { BreakpointProvider } from "./contexts/breakpoint/Provider";
import { LocaleProvider } from "./contexts/locale/Provider";
import { ThemeProvider } from "./contexts/theme/Provider";
import { ReactNode, StrictMode } from "react";
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import ErrorBoundary from './components/shared/ErrorBoundary';

import "simplebar-react/dist/simplebar.min.css";
import "./styles/index.css";

import { SidebarProvider } from "./contexts/sidebar/Provider";
import { ConfirmProvider } from './components/common/Confirm/ConfirmContext';
import { ToastProvider } from './components/common/Toast/ToastContext';
import Tooltip from './components/template/Tooltip';
declare global {
  interface Window {
    createInertiaApp: typeof createInertiaApp;
  }
}

// @ts-ignore
const pages = import.meta.glob('./pages/**/*.{tsx,jsx}');

createInertiaApp({
  resolve: name => {
    // Try .tsx first, then .jsx
    const tsxPage = pages[`./pages/${name}.tsx`];
    const jsxPage = pages[`./pages/${name}.jsx`];
    const importPage = tsxPage || jsxPage;
    
    if (!importPage) {
      throw new Error(`Unknown Inertia page: ${name}`);
    }
    return importPage();
  },
  setup({ el, App: InertiaApp, props }) {
    createRoot(el).render(
      <StrictMode>
        <ErrorBoundary>
          <App>
            <InertiaApp {...props} />
          </App>
        </ErrorBoundary>
      </StrictMode>
    );
  },
});

interface AppProps {
  children: ReactNode;
}

function App({ children }: AppProps) {
  return (
    <ToastProvider>
      <ConfirmProvider>
        {/* <AuthProvider> */}
          <ThemeProvider>
            <LocaleProvider>
              <BreakpointProvider>
                <SidebarProvider>
                  {children}
                </SidebarProvider>
              </BreakpointProvider>
            </LocaleProvider>
          </ThemeProvider>
        {/* </AuthProvider> */}
      </ConfirmProvider>
      <Tooltip />
    </ToastProvider>
  );
}

export default App;
