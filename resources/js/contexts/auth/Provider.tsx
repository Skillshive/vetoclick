// Import Dependencies
import { useEffect, useReducer, ReactNode, useState } from "react";
import { usePage, router } from '@inertiajs/react';

// Local Imports
import axios from "@/utils/axios";
import { isTokenValid, setSession } from "@/utils/jwt";
import { AuthProvider as AuthContext, AuthContextType } from "./context";
import { User } from "@/@types/user";

// ----------------------------------------------------------------------

interface AuthAction {
  type:
    | "INITIALIZE"
    | "LOGIN_REQUEST"
    | "LOGIN_SUCCESS"
    | "LOGIN_ERROR"
    | "LOGOUT";
  payload?: Partial<AuthContextType>;
}

// Initial state
const initialState: AuthContextType = {
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  errorMessage: null,
  user: null,
  login: async () => {},
  logout: async () => {},
};

// Reducer handlers
const reducerHandlers: Record<
  AuthAction["type"],
  (state: AuthContextType, action: AuthAction) => AuthContextType
> = {
  INITIALIZE: (state, action) => ({
    ...state,
    isAuthenticated: action.payload?.isAuthenticated ?? false,
    isInitialized: true,
    user: action.payload?.user ?? null,
  }),

  LOGIN_REQUEST: (state) => ({
    ...state,
    isLoading: true,
  }),

  LOGIN_SUCCESS: (state, action) => ({
    ...state,
    isAuthenticated: true,
    isLoading: false,
    user: action.payload?.user ?? null,
  }),

  LOGIN_ERROR: (state, action) => ({
    ...state,
    errorMessage: action.payload?.errorMessage ?? "An error occurred",
    isLoading: false,
  }),

  LOGOUT: (state) => ({
    ...state,
    isAuthenticated: false,
    user: null,
  }),
};

// Reducer function
const reducer = (
  state: AuthContextType,
  action: AuthAction,
): AuthContextType => {
  const handler = reducerHandlers[action.type];
  return handler ? handler(state, action) : state;
};

interface AuthProviderProps {
  children: ReactNode;
  initialPage?: any;
}

export function AuthProvider({ children, initialPage }: AuthProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  // initialPage from setup() is {initialPage: {...}, initialComponent: ..., ...}
  // The actual page object is in initialPage.initialPage
  // And the props are in initialPage.initialPage.props
  const actualInitialPage = (initialPage as any)?.initialPage || initialPage;
  const initialProps = actualInitialPage?.props || (actualInitialPage && !actualInitialPage.component ? actualInitialPage : null);
  const [currentPageProps, setCurrentPageProps] = useState<any>(initialProps);
  
  // Try to get Inertia page props from usePage hook (reactive)
  let pageFromHook: any = null;
  try {
    const page = usePage();
    // usePage() returns { component, props, url, version, ... }
    // We need page.props, not the whole page object
    pageFromHook = (page as any).props || (page as any);
    console.log('[AuthProvider] usePage() returned:', { 
      hasPage: !!page, 
      pageKeys: page ? Object.keys(page as any) : [],
      pageProps: (page as any).props,
      pageFromHook 
    });
    // Update state when page changes
    if (pageFromHook && pageFromHook !== currentPageProps) {
      setCurrentPageProps(pageFromHook);
    }
  } catch (e) {
    console.log('[AuthProvider] usePage() not available:', e);
    // usePage not available yet - use initialPage
    if (initialProps && !currentPageProps) {
      setCurrentPageProps(initialProps);
    }
  }

  // Listen for Inertia page updates
  useEffect(() => {
    const handlePageUpdate = (event: any) => {
      const page = event.detail?.page;
      // page is the full page object, extract props from it
      const pageProps = page?.props || (page && !page.component ? page : null);
      if (pageProps) {
        console.log('[AuthProvider] Page updated via event:', Object.keys(pageProps));
        setCurrentPageProps(pageProps);
      }
    };

    // Listen for Inertia's custom events
    window.addEventListener('inertia:load', handlePageUpdate);
    window.addEventListener('inertia:start', handlePageUpdate);

    return () => {
      window.removeEventListener('inertia:load', handlePageUpdate);
      window.removeEventListener('inertia:start', handlePageUpdate);
    };
  }, []);

  // Use page from hook (reactive) OR currentPageProps (from state/initial)
  const pageProps = pageFromHook || currentPageProps;
  // If pageProps is the full page object (has component property), extract props from it
  const actualProps = (pageProps as any)?.component ? (pageProps as any).props : pageProps;
  const inertiaAuth = actualProps?.auth;
  const inertiaPusher = actualProps?.pusher;

  useEffect(() => {
    const init = async () => {
      // Also try to get from window.Inertia directly as fallback
      let windowInertiaProps: any = null;
      try {
        // Try multiple ways to access Inertia page data
        if ((window as any).Inertia?.page?.props) {
          windowInertiaProps = (window as any).Inertia.page.props;
        } else if ((window as any).page?.props) {
          windowInertiaProps = (window as any).page.props;
        }
      } catch (e) {
        console.error('[AuthProvider] Error accessing window Inertia:', e);
      }

      // Use window Inertia props if available and actualProps is not
      const finalPageProps = actualProps || windowInertiaProps;
      const finalAuth = finalPageProps?.auth || inertiaAuth;
      
      // CRITICAL DEBUG: Check what window.page actually contains
      console.log('[AuthProvider] CRITICAL - window.page check:', {
        'window.page': (window as any).page,
        'window.page.props': (window as any).page?.props,
        'window.page.props.auth': (window as any).page?.props?.auth,
        'window.Inertia': (window as any).Inertia,
        'window.Inertia.page': (window as any).Inertia?.page,
        'window.Inertia.page.props': (window as any).Inertia?.page?.props,
        'window.Inertia.page.props.auth': (window as any).Inertia?.page?.props?.auth,
      });

      console.log('[AuthProvider] Initializing with Inertia props:', {
        hasInitialPage: !!initialPage,
        hasPageFromHook: !!pageFromHook,
        hasPageProps: !!pageProps,
        hasWindowInertia: !!windowInertiaProps,
        hasAuth: !!finalAuth,
        hasUser: !!finalAuth?.user,
        userId: finalAuth?.user?.id,
        userEmail: finalAuth?.user?.email,
        propKeys: finalPageProps ? Object.keys(finalPageProps) : [],
        authKeys: finalAuth ? Object.keys(finalAuth) : []
      });
      
      // DEBUG: Log the actual structure
      console.log('[AuthProvider] DEBUG - Full structure:', {
        initialPage,
        'initialPage keys': initialPage ? Object.keys(initialPage) : [],
        initialPageProps: initialPage?.props,
        'initialPage.component': initialPage?.component,
        'initialPage.url': initialPage?.url,
        pageFromHook,
        currentPageProps,
        'currentPageProps keys': currentPageProps ? Object.keys(currentPageProps) : [],
        pageProps,
        'pageProps keys': pageProps ? Object.keys(pageProps) : [],
        finalPageProps,
        'finalPageProps keys': finalPageProps ? Object.keys(finalPageProps) : [],
        finalAuth,
        'actualProps': actualProps,
        'actualProps.auth': actualProps?.auth,
        'pageProps.auth': pageProps?.auth,
        'finalPageProps.auth': finalPageProps?.auth,
        'windowInertiaProps.auth': windowInertiaProps?.auth,
        'currentPageProps.auth': currentPageProps?.auth
      });

      try {
        let user = null;
        let isAuthenticated = false;

        // Check Inertia auth first
        if (finalAuth && finalAuth.user) {
          user = finalAuth.user;
          isAuthenticated = true;
          console.log('[AuthProvider] ✓ User authenticated from Inertia:', { 
            id: user.id, 
            email: user.email,
            name: user.name 
          });
        } else {
          console.log('[AuthProvider] No user in Inertia props, trying localStorage');
          
          // Fallback to JWT token
          const authToken = window.localStorage.getItem("authToken");

          if (authToken && isTokenValid(authToken)) {
            setSession(authToken);
            
            try {
              const response = await axios.get<{ user: User }>("/api/user");
              user = response.data.user;
              isAuthenticated = true;
              console.log('[AuthProvider] ✓ User from API:', user);
            } catch (apiError) {
              console.warn('[AuthProvider] ✗ Failed to get user from API:', apiError);
            }
          } else {
            console.log('[AuthProvider] ✗ No valid auth token in localStorage');
          }
        }

        console.log('[AuthProvider] Final auth state:', { isAuthenticated, hasUser: !!user });

        dispatch({
          type: "INITIALIZE",
          payload: {
            isAuthenticated,
            user,
          },
        });
      } catch (err) {
        console.error('[AuthProvider] Error during initialization:', err);
        dispatch({
          type: "INITIALIZE",
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    };

    init();
  }, [inertiaAuth, pageProps, initialPage, pageFromHook, currentPageProps]);

  const login = async (credentials: { username: string; password: string }) => {
    dispatch({ type: "LOGIN_REQUEST" });

    try {
      const response = await axios.post<{ authToken: string; user: User }>(
        "/login",
        credentials,
      );
      const { authToken, user } = response.data;

      if (
        typeof authToken !== "string" ||
        typeof user !== "object" ||
        user === null
      ) {
        throw new Error("Response is not valid");
      }

      setSession(authToken);

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user },
      });
    } catch (err) {
      dispatch({
        type: "LOGIN_ERROR",
        payload: {
          errorMessage: err instanceof Error ? err.message : "Login failed",
        },
      });
    }
  };

  const logout = async () => {
    setSession(null);
    dispatch({ type: "LOGOUT" });
  };

  if (!children) {
    return null;
  }

  return (
    <AuthContext
      value={{
        ...state,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext>
  );
}
