"use client";

import React, { useState } from 'react';

export default function AdminNCM() {
  const [sku, setSku] = useState('');
  const [ncm, setNcm] = useState('');
  const [status, setStatus] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('Salvando...');
    const res = await fetch('/api/ncm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sku, ncm })
    });
    if (res.ok) {
      setStatus('✅ Salvo com sucesso!');
      setSku('');
      setNcm('');
    } else {
      setStatus('❌ Erro ao salvar');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Cadastro de NCM por SKU</h1>
        <div className="mb-4">
          <label className="block mb-1">SKU do Produto</label>
          <input value={sku} onChange={e => setSku(e.target.value)} className="border p-2 w-full" required />
        </div>
        <div className="mb-4">
          <label className="block mb-1">NCM</label>
          <input value={ncm} onChange={e => setNcm(e.target.value)} className="border p-2 w-full" required />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Salvar</button>
        <div className="mt-4 text-green-600">{status}</div>
      </form>
    </div>
  );
}
