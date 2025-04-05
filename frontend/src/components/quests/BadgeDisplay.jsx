const BadgeDisplay = ({ badges, userProgress }) => {
    const earnedBadges = badges.filter(b => 
      userProgress?.completedQuests?.length >= b.id * 2 || b.earned
    );
  
    return (
      <div className="bg-indigoDark-800 rounded-xl p-6 border border-indigoDark-600 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Your Security Journey</h2>
            <p className="text-gray-300">Complete quests to earn XP and unlock achievements</p>
          </div>
          
          <div className="flex items-center mt-4 md:mt-0">
            <div className="mr-6 text-center">
              <div className="text-3xl font-bold text-neonBlue-400">
                {userProgress?.totalXP || 0}
              </div>
              <div className="text-sm text-gray-400">Total XP</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-neonPurple-400">
                {earnedBadges.length}
              </div>
              <div className="text-sm text-gray-400">Badges</div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Badges</h3>
          <div className="flex flex-wrap gap-4">
            {earnedBadges.slice(0, 4).map((badge) => (
              <div key={badge.id} className="relative group">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigoDark-700 to-indigoDark-800 border-2 border-neonPurple-500 flex items-center justify-center text-2xl">
                  {badge.icon}
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-indigoDark-900 text-white text-sm px-2 py-1 rounded whitespace-nowrap">
                  {badge.name}
                  <div className="absolute top-full left-1/2 w-2 h-2 bg-indigoDark-900 transform -translate-x-1/2 rotate-45"></div>
                </div>
              </div>
            ))}
            {earnedBadges.length > 4 && (
              <div className="w-16 h-16 rounded-full bg-indigoDark-700 border-2 border-dashed border-indigoDark-500 flex items-center justify-center text-gray-400">
                +{earnedBadges.length - 4}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  export default BadgeDisplay;