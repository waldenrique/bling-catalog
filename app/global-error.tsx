'use client';
 
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error('Global error occurred:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    digest: error.digest,
  });
 
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-red-600">
              Algo deu errado!
            </h2>
            <div className="text-gray-600">
              <p>Ocorreu um erro inesperado.</p>
              {process.env.NODE_ENV === 'development' && (
                <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-auto">
                  {error.message}
                </pre>
              )}
            </div>
            <button
              onClick={() => reset()}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
