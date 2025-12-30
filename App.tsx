
import React, { useState, useEffect } from 'react';
import Background from './screens/Background';
import BottomNav from './screens/components/BottomNav';
import LoginRegister from './screens/LoginRegister';
import Landing from './screens/components/Landing';
import ResetPassword from './screens/components/ResetPassword';
import MainMenu from './screens/components/MainMenu';
import Calling from './screens/Calling';
import Messenger from './screens/components/Messenger';
import ChatDetail from './screens/ChatDetail';
import UserProfile from './screens/components/UserProfile';
import { Screen, User } from './types';
import { auth, onAuthStateChanged, db, doc, getDoc } from './services/firebase';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUser({
              id: firebaseUser.uid,
              firstName: data.firstName || 'User',
              lastName: data.lastName || '',
              email: firebaseUser.email || '',
              phone: data.phone || '',
              address: data.address || '',
              gender: data.gender || '',
              age: data.age || '',
              school: data.school || '',
              occupation: data.occupation || '',
              avatar: data.avatar || firebaseUser.photoURL || 'https://picsum.photos/200/200',
              status: 'online'
            });
          } else {
            setUser({
              id: firebaseUser.uid,
              firstName: firebaseUser.displayName?.split(' ')[0] || 'User',
              lastName: firebaseUser.displayName?.split(' ')[1] || '',
              email: firebaseUser.email || '',
              phone: '',
              address: '',
              gender: '',
              age: '',
              school: '',
              occupation: '',
              avatar: firebaseUser.photoURL || 'https://picsum.photos/200/200',
              status: 'online'
            });
          }
          setCurrentScreen('menu');
        } catch (error) {
          console.error("Error fetching user data:", error);
          setCurrentScreen('menu');
        }
      } else {
        setUser(null);
        if (currentScreen !== 'landing') setCurrentScreen('login');
      }
      setInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  const handleChatSelect = (contactId: string) => {
    setActiveChatId(contactId);
    setCurrentScreen('chat');
  };

  const renderScreen = () => {
    if (initializing) return (
        <div className="flex h-full items-center justify-center bg-[#1a1b4b]">
            <div className="w-12 h-12 border-4 border-white/20 border-t-pink-500 rounded-full animate-spin"></div>
        </div>
    );

    switch (currentScreen) {
      case 'landing':
        return <Landing setScreen={setCurrentScreen} />;
      case 'login':
      case 'register':
        return <LoginRegister setScreen={setCurrentScreen} />;
      case 'reset':
        return <ResetPassword setScreen={setCurrentScreen} />;
      case 'menu':
        return <MainMenu setScreen={setCurrentScreen} />;
      case 'calling':
        return <Calling />;
      case 'messenger':
        return <Messenger onChatSelect={handleChatSelect} />;
      case 'chat':
        if (!activeChatId) return <Messenger onChatSelect={handleChatSelect} />;
        return <ChatDetail contactId={activeChatId} onBack={() => setCurrentScreen('messenger')} />;
      case 'profile':
        return <UserProfile setScreen={setCurrentScreen} />;
      default:
        return <Landing setScreen={setCurrentScreen} />;
    }
  };

  const showNav = !['landing', 'login', 'register', 'reset', 'chat'].includes(currentScreen);

  return (
    <div className="relative w-full h-screen text-white font-sans overflow-hidden bg-[#0f172a]">
      <Background />
      <div className="relative z-10 w-full h-full md:max-w-md md:mx-auto md:border-x md:border-white/10 bg-transparent flex flex-col">
        {renderScreen()}
      </div>
      {showNav && (
        <div className="relative z-50 md:max-w-md md:mx-auto">
             <BottomNav currentScreen={currentScreen} setScreen={setCurrentScreen} />
        </div>
      )}
    </div>
  );
};

export default App;
