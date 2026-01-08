import { Home, CalendarDays, Settings } from 'lucide-react';

/**
 * Bottom navigation bar component
 * @param {Object} props
 * @param {string} props.activeTab - Currently active tab ('home' | 'calendar' | 'settings')
 * @param {function} props.onTabChange - Callback when tab is changed
 */
const BottomNav = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'calendar', label: 'Calendar', icon: CalendarDays },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white nav-shadow z-50 pb-[env(safe-area-inset-bottom,20px)]">
            <div className="max-w-md mx-auto flex justify-around items-center h-16">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`flex flex-col items-center justify-center touch-button px-6 py-2 transition-smooth ${isActive
                                ? 'text-blue-600'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <Icon
                                size={24}
                                strokeWidth={isActive ? 2.5 : 2}
                                className={isActive ? 'mb-1' : 'mb-1'}
                            />
                            <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                                {tab.label}
                            </span>
                            {isActive && (
                                <div className="absolute top-1 w-1 h-1 bg-blue-600 rounded-full" />
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
