
"use client";

import React from 'react';
import { getAdminTokensStatus } from '../../lib/admin-tokens';

export default function AdminTokenStatus() {
  const [status, setStatus] = React.useState<any>(null);

  React.useEffect(() => {
    fetch('/api/debug-tokens')
      .then(res => res.json())
      .then(setStatus);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Status dos Tokens Bling</h1>
        {status ? (
          <pre className="text-sm bg-gray-50 p-4 rounded border overflow-x-auto">{JSON.stringify(status, null, 2)}</pre>
        ) : (
          <div>Carregando...</div>
        )}
      </div>
    </div>
  );
}
