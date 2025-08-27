export interface PageProps<T = Record<string, unknown>> extends Record<string, unknown> {
    auth: {
        user: {
            id: string;
            name: string;
            email: string;
        };
    };
    flash: {
        message?: string;
        error?: string;
    };
}

export interface InertiaSharedProps {
    errors: Record<string, string>;
    flash: {
        message?: string;
        error?: string;
    };
}
