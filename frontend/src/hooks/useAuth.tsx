"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/register', '/invite'];

export function useAuth(options: { requireAuth?: boolean } = { requireAuth: true }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, checkAuth, logout } = useAuthStore();

  useEffect(() => {
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith('/invite/'));
    
    // Check auth status
    const hasAuth = checkAuth();

    if (!isPublicRoute && !hasAuth && options.requireAuth) {
      router.push('/auth/login');
    }

    // Si ya está autenticado y está en página de auth, redirigir al dashboard
    if (hasAuth && (pathname === '/auth/login' || pathname === '/auth/register')) {
      router.push('/dashboard');
    }
  }, [pathname, checkAuth, router, options.requireAuth]);

  return {
    user,
    isAuthenticated,
    isLoading,
    logout: () => {
      logout();
      router.push('/');
    },
  };
}

// HOC para proteger páginas
export function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isLoading, isAuthenticated } = useAuth({ requireAuth: true });

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

