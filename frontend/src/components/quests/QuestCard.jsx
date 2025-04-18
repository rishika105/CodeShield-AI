import { Link } from 'react-router-dom';

const difficultyColors = {
  1: 'from-green-400 to-emerald-500',
  2: 'from-yellow-400 to-amber-500',
  3: 'from-red-400 to-rose-500'
};

const QuestCard = ({ id, title, difficulty, category, points, completed, timeEstimate, description, tags = [] }) => {
  return (
    <div className="relative bg-indigoDark-800 rounded-xl overflow-hidden border border-indigoDark-600 hover:border-neonPurple-400 transition-all duration-300 hover:shadow-lg hover:shadow-neonPurple-500/10">
      {/* Difficulty indicator */}
      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-light text-white text-opacity-70 bg-gradient-to-r ${difficultyColors[difficulty]}`}>
        {difficulty === 1 ? 'Beginner' : difficulty === 2 ? 'Intermediate' : 'Advanced'}
      </div>
      
      {/* Completion badge */}
      {completed && (
        <div className="absolute top-4 left-4 px-2 py-1 rounded-full text-xs font-bold text-white bg-green-500 flex items-center">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Completed
        </div>
      )}
      
      {/* Card content */}
      <Link to={`/quests/${id}`} className="block">
        <div className="p-6 mt-8 h-80">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-neonPurple-500 to-neonBlue-500 flex items-center justify-center text-white font-bold">
              {id}
            </div>
            <h3 className="ml-4 text-xl font-bold text-white">{title}</h3>
          </div>
          
          <p className="text-gray-300 mb-6">{description || "Identify and fix vulnerabilities in this application."}</p>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {tags.map((tag, index) => (
              <span key={index} className={`px-2 py-1 bg-indigoDark-700 rounded-md text-xs ${
                index % 3 === 0 ? 'text-neonBlue-300' : 
                index % 3 === 1 ? 'text-neonPurple-300' : 'text-neonCyan-300'
              }`}>
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-bold text-white">{points} XP</span>
            </div>
            <div className="text-gray-400 text-sm">{timeEstimate}</div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default QuestCard;