import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Corum FS
          </h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route
            path="/"
            element={
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Welcome to Corum FS
                </h2>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
