'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Monitor,
  Package,
  ClipboardList,
  Building2,
  Users,
  History,
  LogOut,
  MapPin,
} from 'lucide-react';
import { useStoredUser } from '@/lib/useStoredUser';

const navItems = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/equipements', label: 'Équipements', icon: Monitor },
  { href: '/consommables', label: 'Consommables', icon: Package },
  { href: '/demandes', label: 'Demandes', icon: ClipboardList },
  { href: '/structures', label: 'Structures', icon: Building2 },
  { href: '/utilisateurs', label: 'Utilisateurs', icon: Users },
  { href: '/historique', label: 'Historique', icon: History },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useStoredUser();

  const visibleItems = user?.role === 'admin'
    ? navItems.filter((item) => ['/dashboard', '/consommables', '/structures', '/utilisateurs', '/historique'].includes(item.href))
    : navItems
      .filter((item) => ['/dashboard', '/equipements', '/demandes'].includes(item.href))
      .map((item) => item.href === '/demandes' ? { ...item, label: 'Mes demandes' } : item);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  }

  return (
    <aside className="sticky top-16 flex h-[calc(100vh-4rem)] w-56 shrink-0 flex-col border-r border-slate-200 bg-[#f3f7ff]">
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        <p className="mb-2 px-2 pt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          {user?.role === 'admin' ? 'Administration' : 'Mon espace'}
        </p>
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[12px] font-semibold transition-colors ${
                isActive
                  ? 'bg-[#0f172a] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <Icon size={16} strokeWidth={1.8} />
              {item.label}
            </Link>
          );
        })}
        {user?.role === 'admin' && (
          <>
            <p className="mb-2 mt-6 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Suivi opérationnel</p>
            {navItems.filter((item) => ['/equipements', '/demandes'].includes(item.href)).map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={`operations-${item.href}`}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[12px] font-semibold transition-colors ${isActive ? 'bg-[#0f172a] text-white shadow-sm' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`}
                >
                  <Icon size={16} strokeWidth={1.8} />
                  {item.label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="m-3 rounded-md border border-sky-100 bg-[#eaf2ff] p-3">
        <p className="flex items-start gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-700">
          <MapPin size={12} className="mt-0.5 shrink-0 text-sky-800" />
          Périmètre
        </p>
        <p className="mt-1 pl-5 text-[10px] leading-relaxed text-slate-600">
          {user?.role === 'admin' ? 'Administration du parc informatique' : user?.nom_structure || 'Structure rattachée au compte'}
        </p>
      </div>

    
    </aside>
  );
}