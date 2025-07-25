import React from 'react';
import { useSupabase } from './SupabaseProvider';

const LoadingDebug: React.FC = () => {
  const { user, session, loading } = useSupabase();

  if (!loading) return null;

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg z-50 max-w-sm">
      <h3 className="font-bold mb-2">Debug Loading</h3>
      <div className="text-sm space-y-1">
        <div>Loading: {loading ? '✅ Sim' : '❌ Não'}</div>
        <div>Session: {session ? '✅ Existe' : '❌ Não existe'}</div>
        <div>User: {user ? '✅ Existe' : '❌ Não existe'}</div>
        {user && <div>Nome: {user.name}</div>}
        {session && <div>Email: {session.user.email}</div>}
      </div>
      <div className="mt-2 text-xs text-gray-300">
        Se isso não desaparecer em 10s, há um problema
      </div>
    </div>
  );
};

export default LoadingDebug;