import { useEffect, useState } from 'react';
import LeaderboardCard from '../components/LeaderBoardCard';
import { useAuth } from '../context/AuthContext';
import userAPI from '../api/usersAPI';
import Navbar from '../components/Navbar';

const LeaderboardPage = () => {
    const { user, token } = useAuth();
    const [leaderboard, setLeaderboard] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const data = await userAPI.getLeaderboard(token);
                setLeaderboard(data);
            } catch (err) {
                console.error('Failed to fetch leaderboard:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    return (
        <>
            <div className='absolute top-8 left-10'>
                <Navbar />
            </div>
            <section className="relative bg-indigoDark-900 min-h-screen py-16 overflow-hidden mt-10">
                {/* Background elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-20">
                    <div className="absolute inset-0 bg-[url('/src/assets/grid-pattern.svg')] bg-[length:64px_64px]"></div>
                </div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-neonPurple-500/30 to-transparent rounded-full filter blur-3xl opacity-20"></div>

                <div className="relative w-[1000px] mx-auto px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <p className="text-lg text-gray-300  max-w-3xl mx-auto">
                            Top performers based on security scores and quest completions
                        </p>
                    </div>

                    {/* Leaderboard Table */}
                    <div className="bg-indigoDark-800 rounded-xl p-6 border border-indigoDark-600">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-indigoDark-600">
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rank</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Security Score</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">XP</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Badges</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-indigoDark-600">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-4 text-center text-gray-300">
                                                Loading leaderboard...
                                            </td>
                                        </tr>
                                    ) : leaderboard.length > 0 ? (
                                        leaderboard.map((player, index) => (
                                            <LeaderboardCard
                                                key={player._id}
                                                rank={index + 1}
                                                player={player}
                                                isCurrentUser={user?.id === player._id}
                                            />
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-4 text-center text-gray-300">
                                                No players found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section></>
    );
};

export default LeaderboardPage;