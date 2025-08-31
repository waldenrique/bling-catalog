"use client";

import React, { useState, useEffect } from 'react';

export default function AdminIPI() {
  const [ncm, setNcm] = useState('');
  const [ipi, setIpi] = useState('');
  const [status, setStatus] = useState('');
  const [ipiData, setIpiData] = useState<Record<string, number>>({});
  
  // Carregar dados existentes de IPI
  useEffect(() => {
    async function loadIpiData() {
      try {
        const response = await fetch('/api/ipi');
        if (response.ok) {
          const data = await response.json();
          setIpiData(data);
        }
      } catch (error) {
        console.error('Erro ao carregar dados de IPI:', error);
      }
    }
    
    loadIpiData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validar NCM e IPI
    if (!ncm.trim()) {
      setStatus('❌ Código NCM não pode ser vazio');
      return;
    }
    
    const ipiValue = parseFloat(ipi);
    if (isNaN(ipiValue) || ipiValue < 0) {
      setStatus('❌ Alíquota de IPI deve ser um número positivo');
      return;
    }
    
    setStatus('Salvando...');
    
    // Atualizar dados locais
    const updatedData = { ...ipiData, [ncm]: ipiValue };
    
    // Enviar para a API
    const res = await fetch('/api/ipi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    
    if (res.ok) {
      setStatus('✅ Salvo com sucesso!');
      setIpiData(updatedData);
      setNcm('');
      setIpi('');
    } else {
      setStatus('❌ Erro ao salvar');
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow w-full max-w-md mb-8">
        <h1 className="text-2xl font-bold mb-4">Cadastro de Alíquotas de IPI por NCM</h1>
        <div className="mb-4">
          <label className="block mb-1">Código NCM</label>
          <input 
            value={ncm} 
            onChange={e => setNcm(e.target.value)} 
            className="border p-2 w-full" 
            placeholder="Ex: 8536.69.90"
            required 
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Alíquota de IPI (%)</label>
          <input 
            type="number" 
            step="0.01" 
            min="0" 
            max="100"
            value={ipi} 
            onChange={e => setIpi(e.target.value)} 
            className="border p-2 w-full" 
            placeholder="Ex: 1.5" 
            required 
          />
        </div>
        <button 
          type="submit" 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Salvar
        </button>
        <div className="mt-4 font-medium">{status}</div>
      </form>
      
      {/* Tabela de IPIs cadastrados */}
      {Object.keys(ipiData).length > 0 && (
        <div className="bg-white p-6 rounded shadow w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">Alíquotas de IPI Cadastradas</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-2">NCM</th>
                  <th className="text-right p-2">IPI (%)</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(ipiData)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([ncmCode, ipiRate]) => (
                    <tr key={ncmCode} className="border-t">
                      <td className="p-2">{ncmCode}</td>
                      <td className="text-right p-2">{ipiRate}%</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
