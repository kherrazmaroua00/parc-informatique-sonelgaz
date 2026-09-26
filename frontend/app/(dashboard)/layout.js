'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useStoredUser } from '@/lib/useStoredUser';

const adminOnlyPaths = ['/consommables', '/structures', '/utilisateurs', '/historique'];

function subscribeToAuth(callback) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getAuthSnapshot() {
  return Boolean(localStorage.getItem('token'));
}

function getServerAuthSnapshot() {
  return null;
}

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useStoredUser();
  const isAuthenticated = useSyncExternalStore(
    subscribeToAuth,
    getAuthSnapshot,
    getServerAuthSnapshot
  );

  useEffect(() => {
    if (isAuthenticated === false) router.replace('/login');
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (user && user.role !== 'admin' && adminOnlyPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
      router.replace('/dashboard');
    }
    if (user?.role === 'admin' && (pathname === '/demandes/nouveau' || pathname.startsWith('/demandes/nouveau/'))) {
      router.replace('/demandes');
    }
  }, [pathname, router, user]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#eef3fb]">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 bg-[#f5f7fb]">{children}</main>
      </div>
    </div>
  );
}