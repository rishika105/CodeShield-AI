import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuestProgress from './QuestProgress';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { quests } from '../../data/questData';
import Confetti from 'react-confetti';
import useWindowSize from '../../hooks/useWindowSize';
import { useAuth } from '../../context/AuthContext';
import authAPI from '../../api/authAPI';
import Navbar from '../Navbar';

const QuestChallenge = () => {
  const { id } = useParams();
  const questId = parseInt(id);
  const currentQuest = quests.find(q => q.id === questId);
  const { width, height } = useWindowSize();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [code, setCode] = useState(currentQuest?.vulnerableCode || '');
  const [fixedCode, setFixedCode] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [userProgress, setUserProgress] = useState({
    completedQuests: [],
    totalXP: 0,
    currentStreak: 0,
    maxStreak: 0
  });

  // Load user progress from backend
  useEffect(() => {
    const loadUserProgress = async () => {
      try {
        const progress = await authAPI.getUserProgress(token);
        setUserProgress(progress.securityQuests);
      } catch (err) {
        console.error('Failed to load user progress:', err);
      }
    };

    if (token) {
      loadUserProgress();
    }
  }, [token]);

  // Add this at the beginning of the QuestChallenge component
  useEffect(() => {
    // Check if this quest is already completed
    if (userProgress?.completedQuests?.includes(questId)) {
      setIsCompleted(true);
      toast.info("You've already completed this quest!", {
        position: "top-center",
        duration: 3000
      });
    }
  }, [questId, userProgress]);

  // And add logic to disable replaying in the render:
  // In the textarea:




  const handleSubmit = async () => {
    if (!currentQuest || !token) return;

    // Validate the solution
    const isValid = new RegExp(currentQuest.validationRegex).test(fixedCode);

    if (isValid && !isCompleted) {
      try {
        // Calculate if streak continues (compare dates)
        const today = new Date().toDateString();
        const lastCompleted = new Date(userProgress.lastCompletedDate || 0).toDateString();
        const isNewDay = today !== lastCompleted;
        const isConsecutiveDay = isNewDay &&
          (new Date() - new Date(userProgress.lastCompletedDate || 0)) <= 86400000 * 1.5; // ~1.5 days

        // Prepare progress update
        const updatedProgress = {
          questId,
          points: currentQuest.points,
          isConsecutiveDay,
          currentStreak: isConsecutiveDay ? userProgress.currentStreak + 1 : 1
        };

        // Update progress in backend
        const response = await authAPI.updateQuestProgress(token, updatedProgress);

        // Update local state
        setUserProgress(response.securityQuests);
        setIsCompleted(true);

        // Show celebration
        showCompletionCelebration(currentQuest.points);

        // Check for badge unlocks
        checkForBadgeUnlocks(response.securityQuests);

        // Update security score based on quest completion
        updateSecurityScore();
      } catch (err) {
        toast.error('Failed to update progress. Please try again.');
        console.error('Error updating quest progress:', err);
      }
    } else if (!isValid) {
      toast.error('Solution not quite right. Check the hints if you need help!');
    }
  };

  const updateSecurityScore = async () => {
    try {
      // Calculate new security score based on completed quests
      const completedCount = userProgress.completedQuests.length + 1; // +1 for current quest
      const newScore = Math.min(100, Math.floor((completedCount / quests.length) * 100));

      // Update score in backend
      await authAPI.updateSecurityScore(token, newScore);
    } catch (err) {
      console.error('Error updating security score:', err);
    }
  };

  const showCompletionCelebration = (xpEarned) => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);

    toast.success(
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <div className="text-2xl font-bold mb-2">Quest Complete!</div>
        <div className="flex justify-center items-center">
          <span className="text-yellow-400 mr-1">+{xpEarned} XP</span>
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      </motion.div>,
      {
        duration: 4000,
        position: 'top-center',
        style: {
          background: 'rgba(39, 39, 42, 0.9)',
          color: '#fff',
          border: '1px solid #4f46e5'
        }
      }
    );
  };

  const checkForBadgeUnlocks = (progress) => {
    const completedCount = progress.completedQuests.length;

    // Example badge unlock logic
    if (completedCount === 1 && !progress.earnedBadges?.some(b => b.badgeId === 1)) {
      toast.success(
        <div className="flex items-center">
          <span className="mr-2">🛡️</span>
          <span>Unlocked: Rookie Securer Badge!</span>
        </div>,
        { duration: 5000 }
      );

      // In a real app, you would call an API to update badges
      authAPI.unlockBadge(token, 1);
    }

    // More badge checks...
  };

  const goToNextQuest = () => {
    const nextQuestId = questId + 1;
    if (quests.some(q => q.id === nextQuestId)) {
      navigate(`/quests/${nextQuestId}`);
    } else {
      navigate('/quests');
    }
  };

  if (!currentQuest) {
    return <div className="text-white text-center py-16">Quest not found</div>;
  }

  return (
    <>
      <div className='absolute top-8 left-10'>
        <Navbar />
      </div>
      <section className="relative bg-indigoDark-900 min-h-screen py-8 overflow-hidden">
        {/* Confetti celebration */}
        {showConfetti && (
          <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={500}
            gravity={0.2}
          />
        )}

        {/* Background elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute inset-0 bg-[url('/src/assets/grid-pattern.svg')] bg-[length:64px_64px]"></div>
        </div>

        <h1 className="flex text-2xl font-bold text-white text-center p-8 items-center justify-center">Play Quest</h1>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <QuestProgress
            questId={questId}
            isCompleted={isCompleted}
            userProgress={userProgress}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Challenge Section */}
            <div className="bg-indigoDark-800 rounded-xl p-6 border border-indigoDark-600">
              <h2 className="text-2xl font-bold text-white mb-4">{currentQuest.title}</h2>

              <div className="mb-6 p-4 bg-indigoDark-900 rounded-lg">
                <h3 className="text-lg font-semibold text-neonPurple-300 mb-2">Scenario</h3>
                <p className="text-gray-300">{currentQuest.scenario}</p>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-white">Vulnerable Code</h3>
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="text-sm text-neonBlue-400 hover:text-neonBlue-300"
                  >
                    {showHint ? 'Hide Hint' : 'Need Help?'}
                  </button>
                </div>

                {showHint && (
                  <div className="mb-4 p-3 bg-indigoDark-700 rounded-lg border-l-4 border-neonBlue-500">
                    <h4 className="font-medium text-white mb-1">Hints:</h4>
                    <ul className="list-disc pl-5 text-gray-300 text-sm space-y-1">
                      {currentQuest.solutionHints.map((hint, i) => (
                        <li key={i}>{hint}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <pre className="bg-indigoDark-900 p-4 rounded-lg overflow-x-auto text-sm font-mono text-gray-300">
                  {code}
                </pre>
              </div>
            </div>

            {/* Solution Section */}
            <div className="bg-indigoDark-800 rounded-xl p-6 border border-indigoDark-600">
              <h2 className="text-2xl font-bold text-white mb-4">Your Solution</h2>

              <div className="mb-4">
                <label htmlFor="fixedCode" className="block text-sm font-medium text-gray-300 mb-2">
                  Rewrite the secure version below:
                </label>
                <textarea
                  id="fixedCode"
                  rows="10"
                  className="w-full px-4 py-3 bg-indigoDark-900 border border-indigoDark-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-neonPurple-500"
                  value={fixedCode}
                  onChange={(e) => setFixedCode(e.target.value)}
                  placeholder="// Your secure code here..."
                  disabled={isCompleted}
                  
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setFixedCode('')}
                  className="px-4 py-2 bg-indigoDark-700 hover:bg-indigoDark-600 rounded-md text-white transition-colors"
                  disabled={isCompleted}
                >
                  Reset
                </button>

                <button
                  onClick={isCompleted ? goToNextQuest : handleSubmit}
                  className="px-6 py-2 bg-gradient-to-r from-neonPurple-500 to-neonBlue-500 hover:opacity-90 rounded-md text-white font-medium transition-opacity"
                  disabled={isCompleted && userProgress?.completedQuests?.includes(questId)}
                >
                  {isCompleted ? 'Next Challenge' : 'Submit Solution'}
                </button>
              </div>

              {isCompleted && (
                <div className="mt-6 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-lg font-bold text-white">Quest Completed!</h3>
                  </div>
                  <p className="text-gray-300 mt-2">
                    Great job! You've successfully fixed the vulnerability.
                    You've earned <span className="font-bold text-yellow-400">{currentQuest.points} XP</span>.
                  </p>
                  {userProgress.currentStreak > 1 && (
                    <p className="text-gray-300 mt-1">
                      Current streak: <span className="font-bold text-neonPurple-300">{userProgress.currentStreak} days</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default QuestChallenge;