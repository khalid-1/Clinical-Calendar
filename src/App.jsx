import React, { useState, useEffect } from 'react';
import UploadView from './views/UploadView';
import OnboardingView from './views/OnboardingView';
import DashboardView from './views/DashboardView';
import CalendarView from './views/CalendarView';
import SettingsView from './views/SettingsView';
import BottomNav from './components/BottomNav';
import { getStoredData, getSelectedUser, setStoredData, setSelectedUser as saveSelectedUser, clearAllData, clearSelectedUser, getScheduleOverrides, saveScheduleOverrides } from './utils/storage';
import { processStaticData } from './utils/processStaticData';
import InstallPrompt from './components/InstallPrompt';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h1>
            <p className="text-gray-500 mb-4">The application encountered an error.</p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold"
            >
              Reset App Data
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [scheduleData, setScheduleData] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [overrides, setOverrides] = useState({});
  const [isStandalone, setIsStandalone] = useState(false);
  const [bypassInstall, setBypassInstall] = useState(false);

  // 0. Check Standalone Mode
  useEffect(() => {
    const checkStandalone = () => {
      const isIOSStandalone = window.navigator.standalone === true;
      const isAndroidStandalone = window.matchMedia('(display-mode: standalone)').matches;
      // Allow dev environment (localhost) to bypass potentially, or just use the bypass button
      // For now, stricly check standalone
      setIsStandalone(isIOSStandalone || isAndroidStandalone);
    };

    checkStandalone();
    window.addEventListener('resize', checkStandalone); // Sometimes mode changes on rotation/resize? Unlikely but safe.
    return () => window.removeEventListener('resize', checkStandalone);
  }, []);

  // 1. Load Data on Mount
  useEffect(() => {
    // Load overrides first
    const storedOverrides = getScheduleOverrides();
    setOverrides(storedOverrides);

    // Process data with overrides
    const data = processStaticData(storedOverrides);
    setScheduleData(data);

    // Check if a user was previously selected
    const storedUser = getSelectedUser();
    if (storedUser) {
      // Find the updated user object in the new static data
      const foundUser = data.students.find(s => s.id === storedUser.id);
      if (foundUser) {
        setUser(foundUser);
      }
    }
  }, []);

  // 2. Handle Override Updates
  const handleApplyOverrides = (newOverrides) => {
    // Save to storage
    saveScheduleOverrides(newOverrides);
    setOverrides(newOverrides);

    // Reprocess data immediately
    const newData = processStaticData(newOverrides);
    setScheduleData(newData);

    // Update current user if selected
    if (user) {
      const foundUser = newData.students.find(s => s.id === user.id);
      if (foundUser) setUser(foundUser);
      saveSelectedUser(foundUser); // Update stored user too
    }
  };

  const handleDataParsed = (data) => {
    setScheduleData(data);
  };

  const handleUserSelect = (selectedUser) => {
    console.log('App: handleUserSelect called with:', selectedUser);
    setUser(selectedUser);
    saveSelectedUser(selectedUser);
  };

  const handleReset = () => {
    clearAllData();
    window.location.reload();
  };

  const handleChangeUser = () => {
    clearSelectedUser();
    setUser(null);
    setActiveTab('home');
  };

  const handleUpdateShift = (studentId, date, update) => {
    // update: { hospital, code, color }
    const newOverrides = { ...overrides };
    if (!newOverrides[studentId]) newOverrides[studentId] = {};

    // Merge with existing daily override if any, or create new
    newOverrides[studentId][date] = {
      ...(newOverrides[studentId][date] || {}),
      ...update
    };

    handleApplyOverrides(newOverrides);
  };

  // Render logic
  const renderContent = () => {
    if (!scheduleData) {
      return <UploadView onDataParsed={handleDataParsed} />;
    }

    if (!user) {
      return (
        <OnboardingView
          students={scheduleData.students}
          onSelectUser={handleUserSelect}
          onBack={() => {
            setScheduleData(null);
            clearAllData();
          }}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return <DashboardView user={user} onLogout={handleChangeUser} onNavigate={setActiveTab} />;
      case 'calendar':
        return <CalendarView user={user} onUpdateShift={handleUpdateShift} />;
      case 'settings':
        return (
          <SettingsView
            user={user}
            onChangeUser={handleChangeUser}
            onReset={handleReset}
            showAdminTools={true}
            adminProps={{
              students: scheduleData.students,
              overrides: overrides,
              onApplyOverrides: handleApplyOverrides
            }}
          />
        );
      default:
        return <DashboardView user={user} onLogout={handleChangeUser} />;
    }
  };

  return (
    <ErrorBoundary>
      {(!isStandalone && !bypassInstall) ? (
        <InstallPrompt onBypass={() => setBypassInstall(true)} />
      ) : (
        <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl overflow-hidden relative">
          {renderContent()}

          {/* Show Bottom Nav only when user is logged in */}
          {user && scheduleData && (
            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
          )}
        </div>
      )}
    </ErrorBoundary>
  );
}

export default App;
