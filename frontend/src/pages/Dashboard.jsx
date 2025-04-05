import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-indigoDark-900 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Your Security Dashboard
          </h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-indigoDark-700 hover:bg-indigoDark-600 rounded-md text-white"
          >
            Logout
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Security Score Card */}
          <div className="bg-indigoDark-800 rounded-xl p-6 border border-indigoDark-600">
            <h2 className="text-xl font-semibold text-white mb-4">
              Your Security Score
            </h2>
            <div className="flex items-center justify-center">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="text-indigoDark-600"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="text-neonBlue-500"
                    strokeWidth="8"
                    strokeDasharray={`${user.securityScore * 2.51}, 251`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <span className="text-4xl font-bold text-white">
                    {user.securityScore}
                  </span>
                  <span className="text-gray-400 block">out of 100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Badges Card */}
          <div className="bg-indigoDark-800 rounded-xl p-6 border border-indigoDark-600">
            <h2 className="text-xl font-semibold text-white mb-4">
              Your Badges
            </h2>
            {user.badges.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {user.badges.map((badge) => (
                  <div
                    key={badge}
                    className="bg-indigoDark-700 rounded-lg p-3 text-center"
                  >
                    <div className="text-neonBlue-400 font-medium capitalize">
                      {badge}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No badges yet</p>
            )}
          </div>

          {/* Stats Card */}
          <div className="bg-indigoDark-800 rounded-xl p-6 border border-indigoDark-600">
            <h2 className="text-xl font-semibold text-white mb-4">Your Stats</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400">Scans Completed</p>
                <p className="text-white text-2xl font-bold">
                  {user.scanCount}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Last Scan</p>
                <p className="text-white">
                  {user.lastScanDate
                    ? new Date(user.lastScanDate).toLocaleDateString()
                    : 'Never'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;