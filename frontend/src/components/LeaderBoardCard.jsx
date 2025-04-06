import { Link } from 'react-router-dom';

const rankColors = {
  1: 'from-yellow-400 to-amber-500',
  2: 'from-gray-300 to-gray-400',
  3: 'from-amber-600 to-amber-700'
};

const LeaderboardCard = ({ rank, player, isCurrentUser }) => {
  return (
    <tr className={`${isCurrentUser ? 'bg-indigoDark-700/50' : ''} hover:bg-indigoDark-700/30 transition-colors`}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {rank <= 3 ? (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r ${rankColors[rank]}`}>
              <span className="text-white font-bold">{rank}</span>
            </div>
          ) : (
            <span className="text-gray-300">{rank}</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Link to={`/profile/${player._id}`} className="flex items-center group">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigoDark-600 flex items-center justify-center text-neonPurple-400">
            {player.username.charAt(0).toUpperCase()}
          </div>
          <div className="ml-4">
            <div className={`text-sm font-medium ${isCurrentUser ? 'text-neonBlue-400' : 'text-white'} group-hover:text-neonPurple-300 transition-colors`}>
              {player.username}
              {isCurrentUser && <span className="ml-2 text-xs text-gray-400">(You)</span>}
            </div>
            <div className="text-xs text-gray-400">
              {player.securityQuests?.completedQuests?.length || 0} quests completed
            </div>
          </div>
        </Link>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-full max-w-xs">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Security</span>
              <span>{player.securityScore}%</span>
            </div>
            <div className="w-full bg-indigoDark-600 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-neonPurple-500 to-neonBlue-500"
                style={{ width: `${player.securityScore}%` }}
              ></div>
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-white font-medium">
            {player.securityQuests?.totalXP || 0}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-wrap gap-1">
          {player.badges?.slice(0, 3).map((badge, index) => (
            <span 
              key={index}
              className="px-2 py-1 text-xs rounded-full bg-indigoDark-700 text-neonPurple-300"
            >
              {badge}
            </span>
          ))}
          {player.badges?.length > 3 && (
            <span className="px-2 py-1 text-xs rounded-full bg-indigoDark-700 text-gray-400">
              +{player.badges.length - 3}
            </span>
          )}
        </div>
      </td>
    </tr>
  );
};

export default LeaderboardCard;