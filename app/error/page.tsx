'use client';

import Link from 'next/link';

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Erro de Autenticação
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ocorreu um erro durante o processo de autenticação com o Bling
          </p>
        </div>
        <div>
          <Link
            href="/login"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Tentar Novamente
          </Link>
        </div>
      </div>
    </div>
  );
}
