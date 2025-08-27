import { usePage } from '@inertiajs/react';

interface InertiaPageProps {
    auth: {
        user: any | null;
    };
}

export const useInertiaAuth = () => {
    try {
        const { props } = usePage();
        const authData = (props as any).auth;
        // Handle the case where user data is wrapped in a 'data' property
        const userData = authData?.user?.data || authData?.user;

        return {
            user: userData || null,
            isAuthenticated: !!userData,
        };
    } catch (error) {
        console.log('useInertiaAuth: Could not access Inertia page props:', error);
        return {
            user: null,
            isAuthenticated: false,
        };
    }
};
