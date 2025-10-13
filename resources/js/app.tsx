import { AuthProvider } from "./contexts/auth/Provider";
import { BreakpointProvider } from "./contexts/breakpoint/Provider";
import { LocaleProvider } from "./contexts/locale/Provider";
import { ThemeProvider } from "./contexts/theme/Provider";
import { ReactNode, StrictMode } from "react";
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import ErrorBoundary from './Components/shared/ErrorBoundary';

import "simplebar-react/dist/simplebar.min.css";
import "./styles/index.css";

import { SidebarProvider } from "./contexts/sidebar/Provider";
import { ConfirmProvider } from './Components/common/Confirm/ConfirmContext';
import { ToastProvider } from './Components/common/Toast/ToastContext';
import Tooltip from './Components/template/Tooltip';
declare global {
  interface Window {
    createInertiaApp: typeof createInertiaApp;
  }
}

// @ts-ignore
const pages = import.meta.glob('./Pages/**/*.{tsx,jsx}');

createInertiaApp({
  resolve: name => {
    // Try .tsx first, then .jsx
    const tsxPage = pages[`./Pages/${name}.tsx`];
    const jsxPage = pages[`./Pages/${name}.jsx`];
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
            <ConfirmProvider>
              <InertiaApp {...props} />
            </ConfirmProvider>
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
    <LocaleProvider>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <BreakpointProvider>
              <SidebarProvider>
                {children}
              </SidebarProvider>
            </BreakpointProvider>
          </AuthProvider>
          <Tooltip />
        </ToastProvider>
      </ThemeProvider>
    </LocaleProvider>
  );
}


export default App;