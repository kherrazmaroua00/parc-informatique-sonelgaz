'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { LogOut, Wifi, Server } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  }

  return (
    <header className="h-16 bg-slate-900 text-white flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <Image
          src="/images/logo_sonelgaz.png"
          alt="Sonelgaz"
          width={36}
          height={36}
          className="rounded"
        />
        <div className="leading-tight">
          <p className="font-semibold text-sm">SONELGAZ</p>
          <p className="text-xs text-slate-400">Direction de Distribution de Saida</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden md:flex items-center gap-1.5 text-xs bg-slate-800 px-3 py-1.5 rounded-full text-emerald-400">
          <Wifi size={14} strokeWidth={2} />
          Reseau Interne
        </span>

        <span className="hidden lg:flex items-center gap-1.5 text-xs bg-slate-800 px-3 py-1.5 rounded-full text-slate-300">
          <Server size={14} strokeWidth={2} />
          SRV-PARC-SDA:01
        </span>

        {user && (
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{user.nom}</p>
            <p className="text-xs text-slate-400">
              {user.role === 'admin' ? 'Administrateur' : 'Consultation'}
            </p>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs bg-red-600/10 text-red-400 hover:bg-red-600/20 px-3 py-1.5 rounded-full transition-colors"
        >
          <LogOut size={14} strokeWidth={2} />
          Log out
        </button>
      </div>
    </header>
  );
}