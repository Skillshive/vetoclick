// Import Dependencies
import { useEffect, useReducer, ReactNode } from "react";

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

const getInertiaAuthData = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    if ((window as any).Inertia && (window as any).Inertia.page) {
      const page = (window as any).Inertia.page;
      if (page && page.props && page.props.auth) {
        return page.props.auth;
      }
    }
    
    if ((window as any).__INERTIA_PROPS__) {
      const props = (window as any).__INERTIA_PROPS__;
      if (props && props.auth) {
        return props.auth;
      }
    }
    
    const currentPath = window.location.pathname;
    if (currentPath === '/login') {
      return null;
    }
    
  } catch (error) {
  }
  
  return null;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const init = async () => {
      
      try {
        let user = null;
        let isAuthenticated = false;

        const inertiaAuth = getInertiaAuthData();
        if (inertiaAuth && inertiaAuth.user) {
          user = inertiaAuth.user;
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
  }, []);

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
