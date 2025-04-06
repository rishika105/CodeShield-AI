import { quests } from '../data/questData';
import { Link } from 'react-router-dom';

const QuestHistory = ({ completedQuests, isCurrentUser }) => {
  const getQuestDetails = (questId) => {
    return quests.find(q => q.id === questId) || {
      title: `Quest ${questId}`,
      points: 0,
      difficulty: 1
    };
  };

  return (
    <div className="bg-indigoDark-800 rounded-xl p-6 border border-indigoDark-600">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Quest History</h2>
        {isCurrentUser && (
          <Link 
            to="/quests" 
            className="text-sm text-neonBlue-400 hover:text-neonBlue-300"
          >
            View All Quests
          </Link>
        )}
      </div>
      
      {completedQuests.length > 0 ? (
        <div className="space-y-4">
          {completedQuests.slice(0, 5).map((quest, index) => {
            const details = getQuestDetails(quest.questId);
            return (
              <div key={index} className="flex items-center justify-between p-3 bg-indigoDark-700/30 rounded-lg">
                <div>
                  <h3 className="text-white font-medium">{details.title}</h3>
                  <p className="text-gray-400 text-sm">
                    Completed on {new Date(quest.completedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-1">{quest.earnedXP}</span>
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
            );
          })}
          {completedQuests.length > 5 && (
            <div className="text-center text-gray-400 text-sm mt-4">
              +{completedQuests.length - 5} more quests completed
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400">
            {isCurrentUser ? "You haven't completed any quests yet." : "No quests completed yet."}
          </p>
          {isCurrentUser && (
            <Link 
              to="/quests" 
              className="mt-2 inline-block text-neonPurple-400 hover:text-neonPurple-300"
            >
              Start your first quest
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestHistory;