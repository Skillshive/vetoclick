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

  const actualInitialPage = (initialPage as any)?.initialPage || initialPage;
  const initialProps = actualInitialPage?.props || (actualInitialPage && !actualInitialPage.component ? actualInitialPage : null);
  const [currentPageProps, setCurrentPageProps] = useState<any>(initialProps);
  
  let pageFromHook: any = null;
  try {
    const page = usePage();
    pageFromHook = (page as any).props || (page as any);
    if (pageFromHook && pageFromHook !== currentPageProps) {
      setCurrentPageProps(pageFromHook);
    }
  } catch (e) {
    if (initialProps && !currentPageProps) {
      setCurrentPageProps(initialProps);
    }
  }

  // Listen for Inertia page updates
  useEffect(() => {
    const handlePageUpdate = (event: any) => {
      const page = event.detail?.page;
      const pageProps = page?.props || (page && !page.component ? page : null);
      if (pageProps) {
        setCurrentPageProps(pageProps);
      }
    };

    window.addEventListener('inertia:load', handlePageUpdate);
    window.addEventListener('inertia:start', handlePageUpdate);

    return () => {
      window.removeEventListener('inertia:load', handlePageUpdate);
      window.removeEventListener('inertia:start', handlePageUpdate);
    };
  }, []);

  const pageProps = pageFromHook || currentPageProps;
  const actualProps = (pageProps as any)?.component ? (pageProps as any).props : pageProps;
  const inertiaAuth = actualProps?.auth;

  useEffect(() => {
    const init = async () => {
      let windowInertiaProps: any = null;
      try {
        if ((window as any).Inertia?.page?.props) {
          windowInertiaProps = (window as any).Inertia.page.props;
        } else if ((window as any).page?.props) {
          windowInertiaProps = (window as any).page.props;
        }
      } catch (e) {
      }

      const finalPageProps = actualProps || windowInertiaProps;
      const finalAuth = finalPageProps?.auth || inertiaAuth;
    
      try {
        let user = null;
        let isAuthenticated = false;

        if (finalAuth && finalAuth.user) {
          user = finalAuth.user;
          isAuthenticated = true;
        } else {
                    const authToken = window.localStorage.getItem("authToken");

          if (authToken && isTokenValid(authToken)) {
            setSession(authToken);
            
            try {
              const response = await axios.get<{ user: User }>("/api/user");
              user = response.data.user;
              isAuthenticated = true;
            } catch (apiError) {
            }
          } 
        }


        dispatch({
          type: "INITIALIZE",
          payload: {
            isAuthenticated,
            user,
          },
        });
      } catch (err) {
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
