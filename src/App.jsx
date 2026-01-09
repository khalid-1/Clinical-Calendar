import React, { useState, useEffect, useMemo } from 'react';
import OnboardingView from './views/OnboardingView';
import DashboardView from './views/DashboardView';
import CalendarView from './views/CalendarView';
import SettingsView from './views/SettingsView';
import BottomNav from './components/BottomNav';
import { getStoredData, getSelectedUser, setStoredData, setSelectedUser as saveSelectedUser, clearAllData, clearSelectedUser, getScheduleOverrides, saveScheduleOverrides } from './utils/storage';
import { processStaticData } from './utils/processStaticData';
import InstallPrompt from './components/InstallPrompt';
import ConfirmDialog from './components/ConfirmDialog';
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

const App = () => {
  // 1. Synchronous Initialization for Instant Load
  const [overrides, setOverrides] = useState(() => getScheduleOverrides());

  const [scheduleData, setScheduleData] = useState(() => processStaticData(getScheduleOverrides()));

  const [user, setUser] = useState(() => {
    const savedUser = getSelectedUser();
    if (savedUser && scheduleData) {
      // We need to find the user in the *current* scheduleData (which is local at this point)
      const localData = processStaticData(getScheduleOverrides());
      return localData.students.find(s => s.id === savedUser.id) || null;
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState('home');

  // Initialize standalone check synchronously to avoid flash
  const [isStandalone, setIsStandalone] = useState(() => {
    if (typeof window !== 'undefined') {
      const isIOS = window.navigator.standalone === true;
      const isAndroid = window.matchMedia('(display-mode: standalone)').matches;
      return isIOS || isAndroid;
    }
    return false;
  });

  const [bypassInstall, setBypassInstall] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(false); // Start ready!
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, studentId: null, date: null });

  // 2. Background Data Updates
  useEffect(() => {
    // Listen for resize to update standalone status (rare case but good practice)
    const checkStandalone = () => {
      const isIOSStandalone = window.navigator.standalone === true;
      const isAndroidStandalone = window.matchMedia('(display-mode: standalone)').matches;
      setIsStandalone(isIOSStandalone || isAndroidStandalone);
    };
    window.addEventListener('resize', checkStandalone);

    // Live Firestore Updates
    const unsubscribe = onSnapshot(collection(db, "students"), (snapshot) => {
      const cloudStudents = [];
      snapshot.forEach((doc) => {
        cloudStudents.push(doc.data());
      });

      // Update with fresh cloud data
      // We use the *current* overrides ref or get them again to be safe
      const currentOverrides = getScheduleOverrides();
      const data = processStaticData(cloudStudents, currentOverrides);
      setScheduleData(data);

      // Update selected user object if it exists to reflect new shifts
      const savedUser = getSelectedUser();
      if (savedUser) {
        const foundUser = data.students.find(s => s.id === savedUser.id);
        if (foundUser) setUser(foundUser);
      }
    }, (error) => {
      console.warn("Using local data (Offline/Error):", error.message);
      // We already loaded local data, so no need to do anything drastic here
    });

    return () => {
      window.removeEventListener('resize', checkStandalone);
      unsubscribe();
    };
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
    // Show custom confirmation dialog
    setDeleteConfirm({ isOpen: true, studentId, date });
  };

  const confirmDeleteShift = async () => {
    const { studentId, date } = deleteConfirm;
    setDeleteConfirm({ isOpen: false, studentId: null, date: null });

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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Shift"
        message="Are you sure you want to delete this shift? This action cannot be undone."
        onConfirm={confirmDeleteShift}
        onCancel={() => setDeleteConfirm({ isOpen: false, studentId: null, date: null })}
        confirmText="Delete"
        danger={true}
      />
    </ErrorBoundary>
  );
}

export default App;

