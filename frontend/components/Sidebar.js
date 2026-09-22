'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Monitor,
  Package,
  ClipboardList,
  Building2,
  Users,
  History,
  LogOut,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/equipements', label: 'Equipements', icon: Monitor },
  { href: '/consommables', label: 'Consommables', icon: Package },
  { href: '/demandes', label: 'Demandes', icon: ClipboardList },
  { href: '/structures', label: 'Structures', icon: Building2 },
  { href: '/utilisateurs', label: 'Utilisateurs', icon: Users },
  { href: '/historique', label: 'Historique', icon: History },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-400 tracking-wide uppercase mb-3">
          Navigation systeme
        </p>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={18} strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} strokeWidth={1.75} />
          Deconnexion
        </button>
      </div>
    </aside>
  );
}