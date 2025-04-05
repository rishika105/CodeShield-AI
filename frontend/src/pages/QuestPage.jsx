import { useState, useEffect } from 'react';
import QuestCard from '../components/quests/QuestCard';
import BadgeDisplay from '../components/quests/BadgeDisplay';
import { questCategories, userBadges, quests } from '../data/questData';
import Navbar from '../components/Navbar';

const QuestsPage = () => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [userProgress, setUserProgress] = useState(null);
    const [filteredQuests, setFilteredQuests] = useState([]);

    // Load user progress
    useEffect(() => {
        const savedProgress = localStorage.getItem('questProgress');
        if (savedProgress) {
            setUserProgress(JSON.parse(savedProgress));
        } else {
            setUserProgress({
                completedQuests: [],
                totalXP: 0,
                currentStreak: 0,
                maxStreak: 0
            });
        }
    }, []);

    // Apply filters
    useEffect(() => {
        let results = [...quests];

        // Apply category filter
        if (activeCategory !== 'all') {
            results = results.filter(quest => quest.category === activeCategory);
        }

        // Apply search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            results = results.filter(quest =>
                quest.title.toLowerCase().includes(query) ||
                quest.description.toLowerCase().includes(query) ||
                quest.learningObjectives.some(lo => lo.toLowerCase().includes(query))
            );
        }

        setFilteredQuests(results);
    }, [activeCategory, searchQuery]);

    const getCompletedStatus = (questId) => {
        return userProgress?.completedQuests?.includes(questId) || false;
    };

    return (
        <>
      <div className='absolute top-8 left-10'>
      <Navbar />
      </div>
            <section className="relative bg-indigoDark-900 min-h-screen py-16 overflow-hidden">

                {/* Background elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-20">
                    <div className="absolute inset-0 bg-[url('/src/assets/grid-pattern.svg')] bg-[length:64px_64px]"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-6 lg:px-8 mt-6">
             

                    {/* User Progress & Badges */}
                    {userProgress && (
                        <BadgeDisplay
                            badges={userBadges}
                            userProgress={userProgress}
                        />
                    )}

                    {/* Quest Filtering */}
                    <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4 pt-10">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setActiveCategory('all')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === 'all'
                                        ? 'bg-gradient-to-r from-neonPurple-500 to-neonBlue-500 text-white'
                                        : 'bg-indigoDark-700 text-gray-300 hover:bg-indigoDark-600'
                                    }`}
                            >
                                All Quests
                            </button>
                            {questCategories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setActiveCategory(category.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === category.id
                                            ? 'bg-gradient-to-r from-neonPurple-500 to-neonBlue-500 text-white'
                                            : 'bg-indigoDark-700 text-gray-300 hover:bg-indigoDark-600'
                                        }`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full md:w-auto">
                            <input
                                type="text"
                                placeholder="Search quests..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-indigoDark-800 border border-indigoDark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neonPurple-500"
                            />
                            <svg
                                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Quests Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-5">
                        {filteredQuests.map((quest) => (
                            <QuestCard
                                key={quest.id}
                                id={quest.id}
                                title={quest.title}
                                difficulty={quest.difficulty}
                                category={quest.category}
                                points={quest.points}
                                completed={getCompletedStatus(quest.id)}
                                timeEstimate={quest.timeEstimate}
                                description={quest.description}
                            />
                        ))}
                    </div>
                </div>
            </section></>
    );
};

export default QuestsPage;