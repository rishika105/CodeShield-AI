import AnimatedProgress from './AnimatedProgress';

const QuestProgress = ({ questId, isCompleted }) => {
  // This would normally come from user data/backend
  const userStats = {
    totalQuests: 24,
    completedQuests: 8,
    currentStreak: 5,
    maxStreak: 12,
    xpEarned: 1250,
    nextLevelXp: 2000,
  };

  return (
    <div className="bg-indigoDark-800 rounded-xl p-6 border border-indigoDark-600 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Quest Info */}
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <h2 className="text-2xl font-bold text-white">SQL Injection Mastery</h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-green-400 to-emerald-500">
              Beginner
            </span>
          </div>
          <p className="text-gray-300">Identify and fix vulnerabilities in this e-commerce application's checkout system.</p>
        </div>
        
        {/* Progress Indicators */}
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-neonPurple-400">
              {isCompleted ? '150' : '0'}/150
            </div>
            <div className="text-sm text-gray-400">XP Earned</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-neonBlue-400">
              {userStats.completedQuests}/{userStats.totalQuests}
            </div>
            <div className="text-sm text-gray-400">Quests Completed</div>
          </div>
        </div>
      </div>
      
      {/* XP Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-neonCyan-400">Level 2 Security Engineer</span>
          <span className="text-sm font-medium text-gray-400">{userStats.xpEarned}/{userStats.nextLevelXp} XP</span>
        </div>
        <AnimatedProgress 
          value={(userStats.xpEarned / userStats.nextLevelXp) * 100} 
          colorFrom="from-neonPurple-500" 
          colorTo="to-neonBlue-500" 
        />
      </div>
      
      {/* Streak Info */}
      {userStats.currentStreak > 0 && (
        <div className="mt-4 flex items-center">
          <div className="mr-3 px-2 py-1 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-md text-xs font-bold text-white">
            {userStats.currentStreak} day streak
          </div>
          <p className="text-sm text-gray-400">
            {userStats.currentStreak === userStats.maxStreak 
              ? "🔥 Max streak achieved!" 
              : `Keep it up! Your best is ${userStats.maxStreak} days`}
          </p>
        </div>
      )}
    </div>
  );
};

export default QuestProgress;