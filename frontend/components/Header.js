'use client';

import Image from 'next/image';
import { LogOut, Wifi, Server } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStoredUser } from '@/lib/useStoredUser';

export default function Header() {
  const user = useStoredUser();
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-800 bg-[#0f172a] px-5 text-white shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/5 p-1.5">
          <Image
            src="/images/logo_sonelgaz.png"
            alt="Sonelgaz"
            width={32}
            height={32}
            className="rounded"
          />
        </div>
        <div className="leading-tight">
          <p className="text-base font-bold tracking-[0.08em] text-white">SONELGAZ</p>
          <p className="text-[11px] text-slate-400">Direction de Distribution de Saida</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1.5 text-[11px] font-medium text-emerald-400 md:flex">
          <Wifi size={13} strokeWidth={2} />
          Réseau Interne
        </span>

        <span className="hidden items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1.5 text-[11px] font-medium text-slate-300 lg:flex">
          <Server size={13} strokeWidth={2} />
          SRV-PARC-SDA:01
        </span>

        {user && (
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-white">{user.nom}</p>
            <p className="text-[11px] text-slate-400">
              {user.role === 'admin' ? 'Administrateur' : user.role === 'operateur' ? 'Opérateur' : user.role === 'chef_structure' ? 'Chef de structure' : 'Consultation'}
            </p>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-[11px] font-medium text-red-300 transition-colors hover:bg-red-500/20"
        >
          <LogOut size={13} strokeWidth={2} />
          Déconnexion
        </button>
      </div>
    </header>
  );
}