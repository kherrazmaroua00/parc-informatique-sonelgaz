'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, LockKeyhole, UserRound, ArrowRight, Zap } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function LoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberLogin, setRememberLogin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const rememberedLogin = localStorage.getItem('rememberedLogin');
      if (rememberedLogin) {
        setLogin(rememberedLogin);
        setRememberLogin(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (rememberLogin) localStorage.setItem('rememberedLogin', login);
    else localStorage.removeItem('rememberedLogin');

    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ login, password }),
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center bg-[#f4f7fc] px-4 py-8 text-slate-900 sm:px-8">
      <header className="mb-6 w-full max-w-3xl text-center">
        <div className="mb-3 flex items-center justify-center gap-4">
          <Image src="/images/logo_sonelgaz.png" alt="Logo Sonelgaz" width={69} height={64} priority />
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold tracking-wide text-[#06284c] sm:text-3xl">SONELGAZ</span>
            <span className="hidden h-8 w-px bg-sky-200 sm:block" />
            <span lang="ar" dir="rtl" className="hidden text-xl font-semibold text-[#06284c] sm:block">سونلغاز</span>
          </div>
        </div>
        <p className="text-sm text-slate-700">Société algérienne de l&apos;électricité et du gaz - Distribution</p>
        <p lang="ar" dir="rtl" className="mt-1 text-sm text-slate-700">الشركة الجزائرية للكهرباء والغاز - التوزيع</p>
        <div className="mx-auto mt-4 inline-flex max-w-full items-center gap-2 rounded-full bg-sky-100 px-3 py-1.5 text-[11px] font-semibold text-[#07365e] sm:text-xs">
          <Zap size={14} className="shrink-0 text-sky-700" />
          <span>DIRECTION DE DISTRIBUTION DE SAÏDA — GESTION DU PARC INFORMATIQUE &amp; LOGISTIQUE IT</span>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[584px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_12px_28px_rgba(15,39,66,0.10)]"
      >
        <div className="h-1.5 bg-gradient-to-r from-[#06284c] via-sky-700 to-sky-300" />
        <div className="p-6 sm:p-7">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-[#06284c]">Portail d&apos;Accès Intranet</h1>
              <p className="mt-1 text-sm text-slate-600">Authentification des agents et administrateurs</p>
            </div>
            
          </div>

          {error && (
            <p role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
              {error}
            </p>
          )}

          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <label htmlFor="login" className="text-sm font-semibold text-slate-800">Identifiant / Login <span className="text-red-600">*</span></label>
              <span className="text-xs text-slate-600">Matricule ou UP</span>
            </div>
            <div className="flex h-12 items-center gap-3 rounded-md border border-slate-300 px-3 transition focus-within:border-sky-700 focus-within:ring-2 focus-within:ring-sky-700/20">
              <UserRound size={17} aria-hidden="true" className="shrink-0 text-slate-500" />
              <input
                id="login"
                type="text"
                autoComplete="username"
                placeholder="ex. AGT-2984 ou admin.saida"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="h-full min-w-0 flex-1 bg-transparent text-base font-medium text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-500"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-800">Mot de passe <span className="text-red-600">*</span></label>
            <div className="flex h-12 items-center gap-3 rounded-md border border-slate-300 px-3 transition focus-within:border-sky-700 focus-within:ring-2 focus-within:ring-sky-700/20">
              <LockKeyhole size={17} aria-hidden="true" className="shrink-0 text-slate-500" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-full min-w-0 flex-1 bg-transparent text-base font-medium text-slate-900 outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                className="rounded p-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-sky-700"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <label className="mb-5 flex w-fit cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={rememberLogin}
              onChange={(e) => setRememberLogin(e.target.checked)}
              className="size-4 accent-sky-800"
            />
            Mémoriser l&apos;identifiant sur ce poste
          </label>

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#06284c] text-sm font-semibold text-white shadow-sm transition hover:bg-[#0a3b68] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? 'Connexion...' : <>Se connecter <ArrowRight size={17} /></>}
          </button>
        </div>
        
      </form>

      <footer className="mt-auto w-full pt-10 text-center text-xs leading-5 text-slate-600">
        <p className="font-medium text-[#06284c]">Sonelgaz Distribution Saïda <span className="mx-1 text-slate-400">·</span> Réseau interne d&apos;administration</p>
        <p className="mt-1">Direction de Distribution de Saïda <span className="mx-1 text-slate-400">·</span> Support DSI : Poste interne 22-14 <span className="mx-1 text-slate-400">·</span> Production</p>
        <p>© Sonelgaz. Tous droits réservés.</p>
      </footer>
    </main>
  );
}