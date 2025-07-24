import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AnalyzePage from './pages/AnalyzePage';
import RepositoriesPage from './pages/RepositoriesPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/analyze" element={<AnalyzePage />} />
      <Route path="/repositories" element={<RepositoriesPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}

export default App;
