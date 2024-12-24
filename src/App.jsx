import { Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard, Auth } from '@/layouts';
import GTranslate from './components/GTranslate/GTranslate';

function App() {
  return (
    <div>
      <GTranslate />
      <Routes>
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/auth/*" element={<Auth />} />
        <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
      </Routes>
    </div>
  );
}

export default App;
