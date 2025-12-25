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
import { NotificationProvider } from './Components/common/Notification/NotificationProvider';
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
    // Handle both lowercase and uppercase Pages folder
    const tsxPage = pages[`./Pages/${name}.tsx`] || pages[`./pages/${name}.tsx`];
    const jsxPage = pages[`./Pages/${name}.jsx`] || pages[`./pages/${name}.jsx`];
    // Also try index.tsx/jsx for folder-based components
    const indexTsxPage = pages[`./Pages/${name}/index.tsx`] || pages[`./pages/${name}/index.tsx`];
    const indexJsxPage = pages[`./Pages/${name}/index.jsx`] || pages[`./pages/${name}/index.jsx`];
    const importPage = tsxPage || jsxPage || indexTsxPage || indexJsxPage;
    
    if (!importPage) {
      throw new Error(`Unknown Inertia page: ${name}`);
    }
    return importPage();
  },
  setup({ el, App: InertiaApp, props }) {
    // props is the full Inertia page object with component, props, url, version, etc.
    // We need to pass the full page object so AuthProvider can access props.auth
    createRoot(el).render(
      <StrictMode>
        <ErrorBoundary>
          <App initialPage={props}>
            <InertiaApp {...props} />
          </App>
        </ErrorBoundary>
      </StrictMode>
    );
  },
});

interface AppProps {
  children: ReactNode;
  initialPage?: any;
}

function App({ children, initialPage }: AppProps) {
  return (
    <LocaleProvider>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider initialPage={initialPage}>
            <NotificationProvider>
              <BreakpointProvider>
                <SidebarProvider>
                  <ConfirmProvider>
                    {children}
                  </ConfirmProvider>
                </SidebarProvider>
              </BreakpointProvider>
            </NotificationProvider>
          </AuthProvider>
          <Tooltip />
        </ToastProvider>
      </ThemeProvider>
    </LocaleProvider>
  );
}


export default App;