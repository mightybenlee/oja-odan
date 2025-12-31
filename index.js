import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import * as icons from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, doc, updateDoc, onSnapshot, serverTimestamp, query, orderBy } from "firebase/firestore";

// -------------------------
// Firebase Config
// -------------------------
const firebaseConfig = {
  apiKey: "AIzaSyAHkztGejStIi5rJFVJ7NO8IkVJJ2ByoE4",
  authDomain: "oja-odan-6fc94.firebaseapp.com",
  projectId: "oja-odan-6fc94",
  storageBucket: "oja-odan-6fc94.appspot.com",
  messagingSenderId: "1096739384978",
  appId: "1:1096739384978:web:4a79774605ace1e2cbc04b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

// -------------------------
// Oracle Simulation
// -------------------------
async function askOracle(prompt) {
  await new Promise(r => setTimeout(r, 1000));
  return `The Oracle whispers: "${prompt.split('').reverse().join('')}" 🌟`;
}

// -------------------------
// App Component
// -------------------------
function App() {
  const [screen, setScreen] = useState('landing');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [oracleMsgs, setOracleMsgs] = useState([]);
  const [oracleInput, setOracleInput] = useState("");
  const [oracleTyping, setOracleTyping] = useState(false);
  const oracleScrollRef = useRef(null);

  const [posts, setPosts] = useState([]);
  const [postText, setPostText] = useState("");
  const [postImg, setPostImg] = useState("");

  // -------------------------
  // Auth observer
  // -------------------------
  useEffect(() => {
    onAuthStateChanged(auth, u => {
      if (u) {
        setUser({
          name: u.displayName || "Member",
          email: u.email,
          avatar: u.photoURL || `https://i.pravatar.cc/150?u=${u.uid}`,
          uid: u.uid
        });
        setScreen('home');
      } else {
        setUser(null);
        setScreen('landing');
      }
      setLoading(false);
    });
  }, []);

  // Oracle scroll
  useEffect(() => {
    oracleScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [oracleMsgs]);

  // Firestore live posts
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // -------------------------
  // Handlers
  // -------------------------
  const handleSocial = async (platform) => {
    const provider = platform === 'google' ? googleProvider : platform === 'facebook' ? facebookProvider : appleProvider;
    try { await signInWithPopup(auth, provider); } catch (e) { alert(e.message); }
  };

  const handleEmailAuth = async (e, isReg) => {
    e.preventDefault();
    const form = e.target;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;
    try {
      if (isReg) await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
    } catch (e) { alert(e.message); }
  };

  const handleOracleAsk = async () => {
    if (!oracleInput.trim()) return;
    const t = oracleInput; setOracleInput(""); setOracleMsgs(prev => [...prev, { role: 'user', text: t }]); setOracleTyping(true);
    const res = await askOracle(t);
    setOracleMsgs(prev => [...prev, { role: 'oracle', text: res }]);
    setOracleTyping(false);
  };

  const handlePost = async () => {
    if (!postText.trim() && !postImg.trim()) return;
    await addDoc(collection(db, 'posts'), {
      userName: user.name,
      userAvatar: user.avatar,
      userId: user.uid,
      text: postText,
      img: postImg || null,
      timestamp: serverTimestamp(),
      likes: [],
      comments: []
    });
    setPostText(""); setPostImg("");
  };

  const toggleLike = async (post) => {
    const docRef = doc(db, 'posts', post.id);
    const hasLiked = post.likes.includes(user.uid);
    const updatedLikes = hasLiked ? post.likes.filter(uid => uid !== user.uid) : [...post.likes, user.uid];
    await updateDoc(docRef, { likes: updatedLikes });
  };

  const addComment = async (post, text) => {
    if (!text.trim()) return;
    const docRef = doc(db, 'posts', post.id);
    const newComment = { userName: user.name, userAvatar: user.avatar, text, timestamp: serverTimestamp() };
    await updateDoc(docRef, { comments: [...(post.comments || []), newComment] });
  };

  // -------------------------
  // Components
  // -------------------------
  const GlassCard = ({ children, className = "", onClick }) => (
    <div onClick={onClick} className={`glass-panel rounded-[2.5rem] p-5 transition-all ${onClick ? 'cursor-pointer active:scale-95' : ''} ${className}`}>{children}</div>
  );

  const BottomNav = () => (
    <div className="fixed bottom-6 left-6 right-6 h-16 glass-panel rounded-full flex items-center justify-between px-8 z-50 border-white/10 shadow-2xl">
      {[
        { id: 'home', icon: <icons.Home size={22} /> },
        { id: 'oracle', icon: <icons.Sparkles size={22} className="text-pink-400" /> },
        { id: 'profile', icon: <icons.User size={22} /> }
      ].map(item => (
        <button
          key={item.id}
          onClick={() => setScreen(item.id)}
          className={`p-2 rounded-full transition-all ${screen === item.id ? 'bg-white text-indigo-950 shadow-xl scale-110' : 'text-white/40'}`}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );

  if (loading) return <div className="h-full flex items-center justify-center text-white">Loading...</div>;

  // -------------------------
  // Screens
  // -------------------------
  const renderLanding = () => (
    <div className="flex flex-col h-full animate-in p-10 text-center">
      <h1 className="text-7xl font-black italic mb-4">Oja-odan</h1>
      <p className="text-white/60 mb-10">Digital Sanctuary for the Tribe</p>
      <button onClick={() => setScreen('register')} className="w-full bg-white text-indigo-950 py-6 rounded-full mb-3">JOIN</button>
      <button onClick={() => setScreen('login')} className="w-full glass-panel py-6 rounded-full text-white/60">SIGN IN</button>
    </div>
  );

  const renderAuth = (isReg) => (
    <div className="flex flex-col h-full p-8 animate-in overflow-y-auto no-scrollbar">
      <button onClick={() => setScreen('landing')} className="w-12 h-12 glass-panel rounded-full flex items-center justify-center mb-8"><icons.ArrowLeft size={20} /></button>
      <GlassCard className="p-8 border-white/20">
        <form onSubmit={e => handleEmailAuth(e, isReg)} className="space-y-6">
          <div className="relative">
            <icons.Mail className="absolute left-5 top-5 text-white/20" size={18} />
            <input type="email" placeholder="Email" className="w-full pl-14 glass-input p-5 rounded-3xl text-sm" required />
          </div>
          <div className="relative">
            <icons.Lock className="absolute left-5 top-5 text-white/20" size={18} />
            <input type={showPassword ? "text" : "password"} placeholder="Password" className="w-full pl-14 glass-input p-5 rounded-3xl text-sm" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-5 text-white/20">{showPassword ? <icons.EyeOff size={18} /> : <icons.Eye size={18} />}</button>
          </div>
          <button className="w-full bg-white text-purple-900 py-5 rounded-full">{isReg ? 'Register' : 'Login'}</button>
        </form>
        <div className="mt-6 flex justify-center gap-6">
          <button onClick={() => handleSocial('google')} className="p-4 glass-panel rounded-2xl"><icons.Chrome size={20} /></button>
          <button onClick={() => handleSocial('facebook')} className="p-4 glass-panel rounded-2xl"><icons.Facebook size={20} /></button>
          <button onClick={() => handleSocial('apple')} className="p-4 glass-panel rounded-2xl"><icons.Apple size={20} /></button>
        </div>
      </GlassCard>
    </div>
  );

  const renderOracle = () => (
    <div className="flex flex-col h-full animate-in overflow-hidden p-6">
      <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
        {oracleMsgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-[2rem] text-sm leading-relaxed ${m.role === 'user' ? 'bg-white text-indigo-950' : 'glass-panel text-pink-100'}`}>{m.text}</div>
          </div>
        ))}
        {oracleTyping && <div className="text-[10px] text-pink-400 animate-pulse text-center uppercase">Channelling...</div>}
        <div ref={oracleScrollRef} />
      </div>
      <div className="mt-4 flex gap-2">
        <input value={oracleInput} onChange={e => setOracleInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleOracleAsk(); }}
          placeholder="Ask for wisdom..." className="flex-1 glass-input p-3 rounded-full text-sm bg-transparent" />
        <button onClick={handleOracleAsk} className="bg-pink-500 rounded-full p-3 flex items-center justify-center">
          <icons.Send size={18} color="white" />
        </button>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="flex flex-col h-full p-8 text-center overflow-y-auto no-scrollbar space-y-4">
      <div className="mt-16 mb-12">
        <img src={user.avatar} className="w-40 h-40 mx-auto rounded-full mb-4" />
        <h2 className="text-2xl font-black">{user.name}</h2>
        <p className="text-white/40">{user.email}</p>
      </div>
      <h3 className="font-bold mb-2">Your Posts</h3>
      {posts.filter(p => p.userId === user.uid).map(p => <UserPost key={p.id} post={p} user={user} />)}
      <button onClick={() => signOut(auth)} className="mt-auto w-full py-5 rounded-full glass-panel text-red-400">Sign Out</button>
    </div>
  );

  const UserPost = ({ post, user }) => {
    const [editing, setEditing] = useState(false);
    const [editText, setEditText] = useState(post.text);
    const [editImg, setEditImg] = useState(post.img || '');
    const isOwner = post.userId === user.uid;

    const saveEdit = async () => {
      const docRef = doc(db, 'posts', post.id);
      await updateDoc(docRef, { text: editText, img: editImg });
      setEditing(false);
    };

    return (
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <img src={post.userAvatar} className="w-10 h-10 rounded-full" />
          <span className="font-bold">{post.userName}</span>
          {isOwner && !editing && <button onClick={() => setEditing(true)} className="ml-auto text-xs text-blue-400">Edit</button>}
        </div>
        {editing ? <>
          <textarea className="w-full p-2 mb-2 rounded bg-white/10 text-white" value={editText} onChange={e => setEditText(e.target.value)} />
          <input className="w-full p-2 mb-2 rounded bg-white/10 text-white" value={editImg} onChange={e => setEditImg(e.target.value)} placeholder="Image URL" />
          <div className="flex gap-2">
            <button onClick={saveEdit} className="bg-green-500 py-1 px-3 rounded text-white">Save</button>
            <button onClick={() => setEditing(false)} className="bg-red-500 py-1 px-3 rounded text-white">Cancel</button>
          </div>
        </> : <>
          <p className="mb-2">{post.text}</p>
          {post.img && <img src={post.img} className="w-full max-h-72 object-cover rounded-lg mb-2" />}
        </>}
        <div className="flex items-center gap-4 mb-2">
          <button onClick={() => toggleLike(post)} className={`flex items-center gap-1 ${post.likes.includes(user.uid) ? 'text-pink-500' : 'text-white/50'}`}><icons.Heart size={16} /> {post.likes.length}</button>
          <button className="flex items-center gap-1 text-white/50"><icons.MessageSquare size={16} /> {post.comments.length}</button>
        </div>
        <div className="space-y-1 mb-2">
          {(post.comments || []).slice(-3).map((c, i) => <div key={i} className="flex items-center gap-2 text-xs"><img src={c.userAvatar} className="w-5 h-5 rounded-full" /><span>{c.userName}:</span><span>{c.text}</span></div>)}
        </div>
        <div className="flex gap-2">
          <input placeholder="Comment..." onKeyDown={e => { if (e.key === 'Enter') { addComment(post, e.target.value); e.target.value = '' } }} className="flex-1 glass-input p-2 rounded-full text-sm bg-transparent" />
        </div>
      </GlassCard>
    );
  };

  const renderHome = () => (
    <div className="flex flex-col h-full animate-in overflow-y-auto p-6 no-scrollbar space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-black mb-4">Welcome, {user.name}</h1>
      </div>

      {/* New Post */}
      <GlassCard className="p-4">
        <textarea placeholder="What's on your mind?" value={postText} onChange={e => setPostText(e.target.value)}
          className="w-full bg-transparent outline-none text-white mb-2" />
        <input type="text" placeholder="Image URL (optional)" value={postImg} onChange={e => setPostImg(e.target.value)}
          className="w-full bg-transparent outline-none text-white mb-2" />
        <button onClick={handlePost} className="bg-pink-500 py-2 px-4 rounded-full text-white">Post</button>
      </GlassCard>

      {/* Posts Feed */}
      {posts.map(p => <UserPost key={p.id} post={p} user={user} />)}
    </div>
  );

  // -------------------------
  // Main return
  // -------------------------
  return (
    <div className="w-full h-full flex flex-col relative bg-sanctuary">
      {screen === 'landing' ? renderLanding()
        : screen === 'login' ? renderAuth(false)
          : screen === 'register' ? renderAuth(true)
            : screen === 'home' ? renderHome()
              : screen === 'oracle' ? renderOracle()
                : screen === 'profile' ? renderProfile()
                  : renderLanding()}
      {['home', 'oracle', 'profile'].includes(screen) && <BottomNav />}
    </div>
  );
}

// Render app
const root = createRoot(document.getElementById('root'));
root.render(<App />);
