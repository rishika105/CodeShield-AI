import { Route, Routes } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/AuthPage';
import { AuthProvider } from './context/AuthContext';
import QuestsPage from './pages/QuestPage';
import QuestChallenge from './components/quests/QuestChallenge';

function App() {
  return (
    <AuthProvider>
      <div className="w-full min-h-screen flex flex-col items-center justify-center">
    
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/quests" element={<QuestsPage />} />
          <Route path="/quests/:id" element={<QuestChallenge />} />
          {/* 
          <Route path="/leaderboard" element={<Leaderboard />} /> 
          */}
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
