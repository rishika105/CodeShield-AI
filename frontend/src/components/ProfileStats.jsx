const ProfileStats = ({ securityScore, scanCount, lastScanDate, streak }) => {
    return (
      <div className="bg-indigoDark-800 rounded-xl p-6 border border-indigoDark-600">
        <h2 className="text-xl font-bold text-white mb-6">Security Stats</h2>
        
        <div className="space-y-6">
          {/* Security Score */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-300">Security Score</span>
              <span className="text-white font-medium">{securityScore || 0}%</span>
            </div>
            <div className="w-full bg-indigoDark-600 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-neonPurple-500 to-neonBlue-500"
                style={{ width: `${securityScore || 0}%` }}
              ></div>
            </div>
          </div>
          
          {/* Scans */}
          <div className="flex justify-between">
            <div>
              <p className="text-gray-400">Code Scans</p>
              <p className="text-white text-2xl font-bold">{scanCount || 0}</p>
            </div>
            <div>
              <p className="text-gray-400">Last Scan</p>
              <p className="text-white">
                {lastScanDate ? new Date(lastScanDate).toLocaleDateString() : 'Never'}
              </p>
            </div>
          </div>
          
          {/* Streak */}
          <div className="bg-indigoDark-700/50 rounded-lg p-4 border border-indigoDark-600">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center text-white mr-3">
                {streak || 0}
              </div>
              <div>
                <p className="text-white font-medium">Day Streak</p>
                <p className="text-gray-400 text-sm">
                  {streak > 1 ? 'Keep it going!' : 'Complete a quest to start your streak'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default ProfileStats;