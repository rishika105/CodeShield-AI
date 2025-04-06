import { useAuth } from '../context/AuthContext';
import ProfileStats from '../components/ProfileStats';
import QuestHistory from '../components/QuestHistory';
import BadgeDisplay from '../components/quests/BadgeDisplay';
import Navbar from '../components/Navbar';

const ProfilePage = () => {
    const { user: profileUser, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-indigoDark-900">
                <div className="text-white">Loading profile...</div>
            </div>
        );
    }

    if (!profileUser) {
        return (
            <div className="flex justify-center items-center h-screen bg-indigoDark-900">
                <div className="text-white">User not found</div>
            </div>
        );
    }

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

                <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
                    {/* Profile Header */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-neonPurple-500 to-neonBlue-500 flex items-center justify-center text-white text-2xl font-bold">
                                {profileUser.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                                <h1 className="text-2xl md:text-3xl font-bold text-white">
                                    {profileUser.username}
                                    <span className="ml-2 text-sm text-gray-400">(You)</span>
                                </h1>
                                <p className="text-gray-300">{profileUser.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">{profileUser.securityQuests?.completedQuests?.length || 0}</div>
                                <div className="text-sm text-gray-400">Quests</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">{profileUser.securityScore || 0}</div>
                                <div className="text-sm text-gray-400">Security Score</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">{profileUser.securityQuests?.totalXP || 0}</div>
                                <div className="text-sm text-gray-400">XP</div>
                            </div>
                        </div>
                    </div>

                    {/* Badges Display */}
                    <BadgeDisplay
                        badges={profileUser.badges || []}
                        userProgress={profileUser.securityQuests}
                        className="mb-8"
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Profile Stats */}
                        <ProfileStats
                            securityScore={profileUser.securityScore}
                            scanCount={profileUser.scanCount}
                            lastScanDate={profileUser.lastScanDate}
                            streak={profileUser.securityQuests?.currentStreak || 0}
                        />

                        {/* Quest History */}
                        <QuestHistory
                            completedQuests={profileUser.securityQuests?.completedQuests || []}
                            isCurrentUser={true}
                        />
                    </div>
                </div>
            </section></>
    );
};

export default ProfilePage;