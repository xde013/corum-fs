import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Corum FS</h1>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<div>Welcome to Corum FS</div>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
