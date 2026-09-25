import { useSyncExternalStore } from 'react';

let cachedRawUser = null;
let cachedUser = null;

function subscribe(callback) {
  window.addEventListener('storage', callback);
  window.addEventListener('stored-user-change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('stored-user-change', callback);
  };
}

function getUser() {
  if (typeof window === 'undefined') return null;
  const rawUser = localStorage.getItem('user');
  if (rawUser === cachedRawUser) return cachedUser;
  cachedRawUser = rawUser;
  cachedUser = rawUser ? JSON.parse(rawUser) : null;
  return cachedUser;
}

function getServerUser() {
  return null;
}

export function useStoredUser() {
  return useSyncExternalStore(subscribe, getUser, getServerUser);
}