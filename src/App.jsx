import React, { useState, useEffect, useMemo } from 'react';
import OnboardingView from './views/OnboardingView';
import DashboardView from './views/DashboardView';
import CalendarView from './views/CalendarView';
import SettingsView from './views/SettingsView';
import BottomNav from './components/BottomNav';
import { getStoredData, getSelectedUser, setStoredData, setSelectedUser as saveSelectedUser, clearAllData, clearSelectedUser, getScheduleOverrides, saveScheduleOverrides } from './utils/storage';
import { processStaticData } from './utils/processStaticData';
import InstallPrompt from './components/InstallPrompt';
import { db } from './services/firebase';
import { doc, updateDoc, deleteField, collection, onSnapshot } from 'firebase/firestore';

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

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 p-6 text-white overflow-hidden">
      <div className="relative">
        <div className="w-20 h-20 bg-white/20 rounded-3xl backdrop-blur-md animate-pulse"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      </div>
      <p className="mt-8 text-blue-100/60 font-medium tracking-widest text-[10px] uppercase animate-pulse">
        Initializing Clinical Cal
      </p>
    </div>
  );
}

function App() {
  const [scheduleData, setScheduleData] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [overrides, setOverrides] = useState({});
  const [isStandalone, setIsStandalone] = useState(null); // Use null for initial state to avoid flash
  const [bypassInstall, setBypassInstall] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // 0. Check Standalone Mode
  useEffect(() => {
    const checkStandalone = () => {
      const isIOSStandalone = window.navigator.standalone === true;
      const isAndroidStandalone = window.matchMedia('(display-mode: standalone)').matches;
      setIsStandalone(isIOSStandalone || isAndroidStandalone);
    };

    checkStandalone();
    window.addEventListener('resize', checkStandalone);
    return () => window.removeEventListener('resize', checkStandalone);
  }, []);

  // 1. Data Loading Logic
  useEffect(() => {
    const storedOverrides = getScheduleOverrides();
    setOverrides(storedOverrides);

    const unsubscribe = onSnapshot(collection(db, "students"), (snapshot) => {
      const cloudStudents = [];
      snapshot.forEach((doc) => {
        cloudStudents.push(doc.data());
      });

      const data = processStaticData(cloudStudents, storedOverrides);
      setScheduleData(data);

      const savedUser = getSelectedUser();
      if (savedUser) {
        const foundUser = data.students.find(s => s.id === savedUser.id);
        if (foundUser) setUser(foundUser);
      }

      setIsInitialLoad(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      const localData = processStaticData(storedOverrides);
      setScheduleData(localData);
      setIsInitialLoad(false);
    });

    return () => unsubscribe();
  }, []);

  const handleApplyOverrides = (newOverrides) => {
    saveScheduleOverrides(newOverrides);
    setOverrides(newOverrides);
  };

  const handleUserSelect = (selectedUser) => {
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

  const handleUpdateShift = async (studentId, date, update) => {
    try {
      const studentRef = doc(db, 'students', studentId);
      await updateDoc(studentRef, {
        [`shifts.${date}`]: {
          shift: update.code,
          hospital: update.hospital
        }
      });

      const newOverrides = { ...overrides };
      if (!newOverrides[studentId]) newOverrides[studentId] = {};
      newOverrides[studentId][date] = { ...update };
      handleApplyOverrides(newOverrides);
    } catch (err) {
      console.error('Failed to update Firestore:', err);
    }
  };

  const handleMoveShift = async (studentId, oldDate, newDate, shiftDetails) => {
    try {
      const studentRef = doc(db, 'students', studentId);
      await updateDoc(studentRef, {
        [`shifts.${oldDate}`]: deleteField(),
        [`shifts.${newDate}`]: {
          shift: shiftDetails.code,
          hospital: shiftDetails.hospital
        }
      });

      const newOverrides = { ...overrides };
      if (!newOverrides[studentId]) newOverrides[studentId] = {};
      newOverrides[studentId][oldDate] = { code: '', hospital: '', color: 'transparent' };
      newOverrides[studentId][newDate] = { ...shiftDetails };
      handleApplyOverrides(newOverrides);
    } catch (err) {
      console.error('Failed to move shift in Firestore:', err);
    }
  };

  const handleDeleteShift = async (studentId, date) => {
    if (!confirm('Are you sure you want to delete this shift?')) return;
    try {
      const studentRef = doc(db, 'students', studentId);
      await updateDoc(studentRef, {
        [`shifts.${date}`]: deleteField()
      });

      const newOverrides = { ...overrides };
      if (!newOverrides[studentId]) newOverrides[studentId] = {};
      newOverrides[studentId][date] = { code: '', hospital: '', color: 'transparent' };
      handleApplyOverrides(newOverrides);
    } catch (err) {
      console.error('Failed to delete shift in Firestore:', err);
    }
  };

  const renderContent = () => {
    if (!user) {
      return (
        <OnboardingView
          students={scheduleData.students}
          onSelectUser={handleUserSelect}
          onBack={() => {
            setUser(null);
            clearAllData();
          }}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return <DashboardView user={user} onLogout={handleChangeUser} onNavigate={setActiveTab} />;
      case 'calendar':
        return (
          <CalendarView
            user={user}
            onUpdateShift={handleUpdateShift}
            onMoveShift={handleMoveShift}
            onDeleteShift={handleDeleteShift}
          />
        );
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

  // Wait for initial data and standalone detection
  if (isInitialLoad || isStandalone === null) {
    return <LoadingScreen />;
  }

  // Show installation prompt if not standalone and not bypassed
  if (!isStandalone && !bypassInstall) {
    return (
      <ErrorBoundary>
        <InstallPrompt onBypass={() => setBypassInstall(true)} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl overflow-hidden relative">
        {renderContent()}
        {user && scheduleData && (
          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;

