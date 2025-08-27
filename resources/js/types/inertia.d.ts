declare module '@inertiajs/react' {
    import { ReactNode } from 'react';

    export interface PageProps {
        component: React.ComponentType<any>;
        props: Record<string, any>;
    }

    export function usePage(): PageProps;
    export function Head(props: { title?: string; children?: ReactNode }): JSX.Element;
    export function Link(props: { href: string; children?: ReactNode;[key: string]: any }): JSX.Element;
    export function useForm<T = any>(data?: T): {
        data: T;
        setData: (key: keyof T, value: any) => void;
        post: (url: string, options?: any) => void;
        processing: boolean;
        errors: Record<string, string>;
        reset: (field?: keyof T) => void;
        resetAndClearErrors: () => void;
        put: (url: string, options?: any) => void;
        patch: (url: string, options?: any) => void;
        delete: (url: string, options?: any) => void;
    };
    export const router: {
        visit: (url: string, options?: any) => void;
        get: (url: string, options?: any) => void;
        post: (url: string, options?: any) => void;
        put: (url: string, options?: any) => void;
        patch: (url: string, options?: any) => void;
        delete: (url: string, options?: any) => void;
    };
    export function createInertiaApp(config: {
        resolve: (name: string) => any;
        setup: (params: { el: HTMLElement; App: any; props: any }) => void;
    }): void;
}

declare global {
    interface ImportMeta {
        glob: (pattern: string, options?: { eager?: boolean }) => Record<string, any>;
    }
}
