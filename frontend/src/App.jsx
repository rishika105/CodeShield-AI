import { Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/AuthPage';
import SecurityScanner from './pages/SecurityScanner';
import AIPlayground from './pages/AIPlayground';
import { AuthProvider } from './context/AuthContext';
import QuestsPage from './pages/QuestPage';
import QuestChallenge from './components/quests/QuestChallenge';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderBoardPage';

function App() {
  const location = useLocation();
  const showNavbar = !location.pathname.includes('/security-scanner');
  const token = localStorage.getItem('token'); // Check if token exists in local storage

  return (
    <AuthProvider>
      <div className="w-full min-h-screen flex flex-col items-center justify-center">

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          {token && (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/quests" element={<QuestsPage />} />
              <Route path="/quests/:id" element={<QuestChallenge />} />
              <Route path="/security-scanner" element={<SecurityScanner />} />
              <Route path="/ai-playground" element={<AIPlayground />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
            </>
          )}

          {/* 
          <Route path="/leaderboard" element={<Leaderboard />} /> 
          */}
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
