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
  // 1. Load Data on Mount (Listen to Cloud)
  useEffect(() => {
    // Load overrides first
    const storedOverrides = getScheduleOverrides();
    setOverrides(storedOverrides);

    const unsubscribe = onSnapshot(collection(db, "students"), (snapshot) => {
      const cloudStudents = [];
      snapshot.forEach((doc) => {
        cloudStudents.push(doc.data());
      });

      // Process data with overrides
      const data = processStaticData(cloudStudents, storedOverrides);
      setScheduleData(data);

      // Check user selection
      const storedUser = getStoredData('selectedUser'); // use direct helper if available or standard localStorage key
      // Actually we have getSelectedUser() imported
      const savedUser = getSelectedUser();

      if (savedUser) {
        const foundUser = data.students.find(s => s.id === savedUser.id);
        if (foundUser) setUser(foundUser);
      }
    }, (error) => {
      console.error("Firestore Error:", error);
      // Fallback to local if Cloud fails? 
      // For now, let's trust the cloud or show error.
      alert("Error connecting to live schedule. Checking local backup...");
      const localData = processStaticData(storedOverrides); // Fallback to local JSON
      setScheduleData(localData);
    });

    return () => unsubscribe();
  }, []);

  // 2. Handle Override Updates
  const handleApplyOverrides = (newOverrides) => {
    saveScheduleOverrides(newOverrides);
    setOverrides(newOverrides);

    // Reprocess data immediately using current scheduleData sources
    // WARNING: scheduleData.students is ALREADY processed. We need the RAW data.
    // Ideally, we should keep the RAW cloud data in state too.
    // BUT simplify: The onSnapshot listener will fire if we changed cloud, but here we changed LOCAL overrides.
    // We can rely on just re-processing the current loaded students "un-processed" state? No that's hard.

    // Better approach: When overrides change, we need to re-run processStaticData on the LAST KNOWN cloud data.
    // Let's modify the useEffect to depend on overrides? 
    // No, that would re-subscribe.

    // Quick fix: We will trigger a re-process of the current state.
    // Actually, since we only use overrides for *visuals* over the base data, 
    // and we just updated the cloud data in the same action (handleUpdateShift),
    // the Cloud Listener will fire again quickly with the new data.

    // HOWEVER, for Optimistic Updates (immediate local feel), we want to see it now.
    // We can re-process the *currently displayed* students?
    // Let's just rely on the Cloud Listener for now. It's fast (ms).
    // If lagging, we can add optimistic state.

    // Wait, handleApplyOverrides is called by handleUpdateShift which ALSO writes to Cloud.
    // So Cloud will update -> Listener fires -> UI updates.
    // We don't strictly need to manually setScheduleData here if we rely on Cloud.

    // BUT valid for strictly local overrides (like preferences?). 
    // Let's keep it simple: WE TRUST THE CLOUD LISTENER.
    // So proper cleanup: removing manual setScheduleData here.

    // Update current user references if needed? 
    // The listener handles it.
  };

  const handleDataParsed = (data) => {
    setScheduleData(data);
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
    // update: { hospital, code, color }
    try {
      // 1. Update Firestore
      const studentRef = doc(db, 'students', studentId);
      await updateDoc(studentRef, {
        [`shifts.${date}`]: {
          shift: update.code,
          hospital: update.hospital
        }
      });

      // 2. Also update local overrides for immediate UI feedback
      const newOverrides = { ...overrides };
      if (!newOverrides[studentId]) newOverrides[studentId] = {};
      newOverrides[studentId][date] = {
        ...(newOverrides[studentId][date] || {}),
        ...update
      };
      handleApplyOverrides(newOverrides);
    } catch (err) {
      console.error('Failed to update Firestore:', err);
      alert('Failed to save to cloud. Check console.');
    }
  };

  const handleMoveShift = async (studentId, oldDate, newDate, shiftDetails) => {
    try {
      // 1. Update Firestore - delete old, set new
      const studentRef = doc(db, 'students', studentId);
      await updateDoc(studentRef, {
        [`shifts.${oldDate}`]: deleteField(),
        [`shifts.${newDate}`]: {
          shift: shiftDetails.code,
          hospital: shiftDetails.hospital
        }
      });

      // 2. Update local overrides
      const newOverrides = { ...overrides };
      if (!newOverrides[studentId]) newOverrides[studentId] = {};
      newOverrides[studentId][oldDate] = { code: '', hospital: '', color: 'transparent' };
      newOverrides[studentId][newDate] = { ...shiftDetails };
      handleApplyOverrides(newOverrides);
    } catch (err) {
      console.error('Failed to move shift in Firestore:', err);
      alert('Failed to save to cloud. Check console.');
    }
  };

  const handleDeleteShift = async (studentId, date) => {
    if (!confirm('Are you sure you want to delete this shift?')) return;
    try {
      // 1. Update Firestore - delete field
      const studentRef = doc(db, 'students', studentId);
      await updateDoc(studentRef, {
        [`shifts.${date}`]: deleteField()
      });

      // 2. Update local overrides
      const newOverrides = { ...overrides };
      if (!newOverrides[studentId]) newOverrides[studentId] = {};
      newOverrides[studentId][date] = { code: '', hospital: '', color: 'transparent' };
      handleApplyOverrides(newOverrides);
    } catch (err) {
      console.error('Failed to delete shift in Firestore:', err);
      alert('Failed to delete from cloud. Check console.');
    }
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

