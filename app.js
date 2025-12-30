
import { GoogleGenAI } from "https://esm.run/@google/genai";

// --- CONFIGURATION ---
// Note: API_KEY is expected to be available via process.env.API_KEY as per the coding guidelines.

// --- STATE MANAGEMENT ---
const state = {
    screen: 'login', // login, register, menu, messenger, chat, calling, profile
    user: {
        name: 'John Doe',
        status: 'online',
        bio: 'Digital explorer in the glass city.',
        avatar: 'https://picsum.photos/200/200'
    },
    activeChatId: null,
    isProfileEditing: false,
    messages: {}, // Map of contactId -> Array of messages
    chats: [
        { id: 'ai', name: 'Gemini AI', avatar: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg', lastMessage: 'How can I help you today?', time: 'Now' },
        { id: '1', name: 'Jane', avatar: 'https://picsum.photos/100/100?random=10', lastMessage: 'See you at 8pm!', time: '22:07' },
        { id: '2', name: 'Berto', avatar: 'https://picsum.photos/100/100?random=11', lastMessage: 'Can you send the file?', time: '22:05' },
    ]
};

// --- DOM ELEMENTS ---
const root = document.getElementById('root');

// --- GEMINI SERVICE ---
// Fix: Use new GoogleGenAI({apiKey: process.env.API_KEY}) directly without checking for placeholders.
async function generateGeminiResponse(userMessage, history = []) {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const chat = ai.chats.create({
            model: 'gemini-3-flash-preview',
            config: {
                systemInstruction: "You are a helpful, friendly, and concise AI assistant integrated into a futuristic social media app called GlassSocial. Keep your responses short, casual, and engaging.",
            },
            history: history,
        });
        const result = await chat.sendMessage({ message: userMessage });
        // Fix: result.text is a property, not a function.
        return result.text;
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Sorry, I'm having trouble connecting to the network.";
    }
}

async function getSmartReplies(context) {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate 3 short, casual replies (max 4 words) to: "${context}". Return JSON array of strings.`,
            config: { responseMimeType: 'application/json' }
        });
        // Fix: response.text is a property.
        return JSON.parse(response.text) || [];
    } catch (e) { return []; }
}

// --- RENDERING FUNCTIONS ---

function render() {
    let html = '';
    
    // 1. Render Screen Content
    switch (state.screen) {
        case 'login': html = renderLogin(true); break;
        case 'register': html = renderLogin(false); break;
        case 'menu': html = renderMenu(); break;
        case 'messenger': html = renderMessenger(); break;
        case 'chat': html = renderChat(); break;
        case 'calling': html = renderCalling(); break;
        case 'profile': html = renderProfile(); break;
        default: html = renderMenu();
    }

    // 2. Render Bottom Nav (unless on auth or chat screens)
    if (!['login', 'register', 'chat'].includes(state.screen)) {
        html += renderBottomNav();
    }

    root.innerHTML = html;
    
    // 3. Initialize Icons
    // @ts-ignore
    lucide.createIcons();

    // 4. Scroll Chat to bottom if active
    if (state.screen === 'chat') {
        const container = document.getElementById('messages-container');
        if(container) container.scrollTop = container.scrollHeight;
    }
}

// --- COMPONENT TEMPLATES ---

function renderLogin(isLogin) {
    return `
    <div class="flex flex-col items-center justify-center min-h-screen p-6 relative z-10 w-full">
        <div class="mb-8 text-center">
            <div class="w-20 h-20 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <i data-lucide="zap" class="text-white w-10 h-10"></i>
            </div>
            <h1 class="text-4xl font-bold mb-2 tracking-tight">GlassSocial</h1>
            <p class="text-white/70">Connect seamlessly.</p>
        </div>

        <div class="glass-panel w-full max-w-sm rounded-2xl p-6 backdrop-blur-xl">
            <h2 class="text-2xl font-semibold mb-6 text-center">${isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            
            <form onsubmit="handleAuth(event, '${isLogin ? 'login' : 'register'}')" class="space-y-4">
                ${!isLogin ? `
                <div class="relative group">
                    <i data-lucide="user" class="absolute left-3 top-3.5 text-white/50 w-5 h-5"></i>
                    <input type="text" placeholder="Full Name" class="w-full pl-10 pr-4 py-3 rounded-xl glass-input outline-none focus:border-white/50 transition-all" required>
                </div>` : ''}
                
                <div class="relative group">
                    <i data-lucide="mail" class="absolute left-3 top-3.5 text-white/50 w-5 h-5"></i>
                    <input type="email" placeholder="Email Address" class="w-full pl-10 pr-4 py-3 rounded-xl glass-input outline-none focus:border-white/50 transition-all" required>
                </div>

                <div class="relative group">
                    <i data-lucide="lock" class="absolute left-3 top-3.5 text-white/50 w-5 h-5"></i>
                    <input type="password" placeholder="Password" class="w-full pl-10 pr-4 py-3 rounded-xl glass-input outline-none focus:border-white/50 transition-all" required>
                </div>

                <button type="submit" class="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-purple-900/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                    ${isLogin ? 'Sign In' : 'Sign Up'} <i data-lucide="arrow-right" class="w-5 h-5"></i>
                </button>
            </form>

            <div class="mt-6 text-center">
                <p class="text-sm text-white/80">
                    ${isLogin ? "Don't have an account?" : "Already have an account?"} 
                    <button onclick="navigate('${isLogin ? 'register' : 'login'}')" class="text-pink-400 font-semibold hover:underline">
                        ${isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </p>
            </div>
        </div>
    </div>`;
}

function renderMenu() {
    return `
    <div class="flex flex-col h-full pt-4 pb-24 px-4 overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
            <div class="flex items-center gap-3 cursor-pointer group" onclick="navigate('profile')">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 border-2 border-white/50 flex items-center justify-center font-bold text-lg">
                    <img src="${state.user.avatar}" class="w-full h-full rounded-full object-cover">
                </div>
                <div>
                    <h2 class="font-bold text-lg leading-tight group-hover:text-pink-300 transition-colors">MAIN MENU</h2>
                    <p class="text-xs text-white/60">Welcome back, ${state.user.name.split(' ')[0]}</p>
                </div>
            </div>
            <button class="p-2 rounded-full hover:bg-white/10 transition-colors"><i data-lucide="more-horizontal"></i></button>
        </div>

        <div class="relative mb-8">
            <i data-lucide="search" class="absolute left-4 top-3.5 text-white/60 w-5 h-5"></i>
            <input type="text" placeholder="Search..." class="w-full pl-12 pr-4 py-3 rounded-2xl glass-input outline-none focus:border-white/40 transition-all">
        </div>

        <div class="grid grid-cols-1 gap-4">
            ${[
                {icon: 'mic', color: 'text-pink-400', title: 'Voice Notes', sub: 'Record thoughts'},
                {icon: 'message-square', color: 'text-purple-400', title: 'Gemini Chat', sub: 'Ask AI anything'},
                {icon: 'image', color: 'text-blue-400', title: 'Gallery', sub: 'View photos'},
                {icon: 'megaphone', color: 'text-yellow-400', title: 'Announcements', sub: 'Latest updates'}
            ].map(item => `
                <div class="glass-panel rounded-2xl p-4 flex items-center gap-4 hover:bg-white/15 transition-colors cursor-pointer" onclick="navigate('messenger')">
                    <div class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shadow-inner">
                        <i data-lucide="${item.icon}" class="${item.color} w-6 h-6"></i>
                    </div>
                    <div class="flex-1">
                        <h3 class="font-semibold text-lg">${item.title}</h3>
                        <p class="text-sm text-white/50">${item.sub}</p>
                    </div>
                    <i data-lucide="chevron-right" class="text-white/30"></i>
                </div>
            `).join('')}
        </div>
    </div>`;
}

function renderMessenger() {
    return `
    <div class="flex flex-col h-full pt-4 pb-24 px-4 overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
            <div class="flex items-center gap-3">
                 <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><i data-lucide="message-circle"></i></div>
                 <div><h2 class="font-bold text-lg leading-tight">MESSENGER</h2><p class="text-xs text-white/60">Recent Chats</p></div>
            </div>
        </div>

        <div class="space-y-4">
            ${state.chats.map(chat => `
                <div onclick="openChat('${chat.id}')" class="glass-panel rounded-2xl p-4 flex items-center justify-between cursor-pointer relative overflow-hidden group">
                     ${chat.id === 'ai' ? '<div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>' : ''}
                    <div class="flex items-center gap-4 relative z-10 w-full">
                        <div class="relative shrink-0">
                            <img src="${chat.avatar}" class="w-14 h-14 rounded-full border-2 border-white/20 object-cover">
                            ${chat.id !== 'ai' ? '<div class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#1a1b4b] bg-green-500"></div>' : ''}
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex justify-between items-baseline mb-1">
                                <h3 class="font-bold text-lg truncate ${chat.id === 'ai' ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300' : ''}">${chat.name}</h3>
                                <span class="text-xs text-white/40">${chat.time}</span>
                            </div>
                            <p class="text-sm text-white/60 truncate">${chat.lastMessage}</p>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>`;
}

function renderChat() {
    const contact = state.chats.find(c => c.id === state.activeChatId);
    const msgs = state.messages[state.activeChatId] || [];
    const isAi = contact.id === 'ai';

    return `
    <div class="flex flex-col h-full bg-black/20 backdrop-blur-md">
        <!-- Header -->
        <div class="p-4 flex items-center justify-between glass-panel border-b border-white/10 z-20">
            <div class="flex items-center gap-3">
                <button onclick="navigate('messenger')" class="p-2 rounded-full hover:bg-white/10"><i data-lucide="arrow-left"></i></button>
                <div class="flex items-center gap-3">
                    <img src="${contact.avatar}" class="w-10 h-10 rounded-full border-2 border-white/20">
                    <div>
                        <h3 class="font-bold">${contact.name}</h3>
                        <p class="text-xs text-white/50 flex items-center gap-1">
                            ${isAi ? '<i data-lucide="sparkles" class="w-3 h-3 text-purple-400"></i> AI Assistant' : 'Online'}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Messages -->
        <div id="messages-container" class="flex-1 overflow-y-auto p-4 space-y-4">
            ${msgs.map(msg => `
                <div class="flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}">
                    <div class="max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.sender === 'me' ? 'bg-gradient-to-r from-pink-500 to-purple-600 rounded-tr-none text-white shadow-lg' : 'glass-panel rounded-tl-none text-white/90'}">
                        ${msg.text}
                    </div>
                </div>
            `).join('')}
        </div>

        <!-- Input -->
        <div class="p-4 glass-panel border-t border-white/10">
            <form onsubmit="sendMessage(event)" class="flex items-center gap-2">
                <button type="button" class="p-2.5 rounded-full bg-white/5 text-white/70"><i data-lucide="sparkles" class="w-5 h-5"></i></button>
                <input id="msg-input" type="text" placeholder="Type a message..." class="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 focus:outline-none focus:border-white/30 text-sm" autocomplete="off">
                <button type="submit" class="p-2.5 rounded-full bg-pink-500 text-white hover:bg-pink-600 shadow-lg"><i data-lucide="send" class="w-4 h-4"></i></button>
            </form>
        </div>
    </div>`;
}

function renderProfile() {
    const { name, status, bio, avatar } = state.user;
    const isEdit = state.isProfileEditing;

    return `
    <div class="flex flex-col h-full pt-4 pb-24 px-4 overflow-y-auto">
       <div class="flex justify-between items-center mb-6">
        <h2 class="font-bold text-xl tracking-wide">PROFILE</h2>
        <button onclick="toggleEditProfile()" class="text-sm font-semibold text-pink-400 hover:text-pink-300">
          ${isEdit ? 'Save' : 'Edit'}
        </button>
      </div>

      <div class="glass-panel rounded-2xl flex flex-col items-center p-6 mb-6 relative">
        <div class="relative mb-4 group">
            <div class="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-400 to-purple-600 p-1">
                <img src="${avatar}" class="w-full h-full rounded-full object-cover border-2 border-[#1a1b4b]">
            </div>
            ${isEdit ? '<button class="absolute bottom-0 right-0 p-2 bg-pink-500 rounded-full text-white shadow-lg"><i data-lucide="camera" class="w-4 h-4"></i></button>' : ''}
        </div>

        ${isEdit ? 
            `<input id="edit-name" value="${name}" class="text-2xl font-bold text-center bg-white/10 border border-white/20 rounded-lg px-2 py-1 mb-2 outline-none w-full">` : 
            `<h1 class="text-2xl font-bold mb-1">${name}</h1>`
        }

        <div class="flex items-center gap-2 mb-4">
            <div class="w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-gray-500'}"></div>
            ${isEdit ? 
                `<select id="edit-status" class="bg-white/10 border border-white/20 rounded px-2 py-0.5 text-xs text-white"><option value="online" class="text-black">Online</option><option value="busy" class="text-black">Busy</option></select>` : 
                `<span class="text-sm text-white/60 capitalize">${status}</span>`
            }
        </div>

         ${isEdit ? 
            `<textarea id="edit-bio" class="text-sm text-center bg-white/10 border border-white/20 rounded-lg px-2 py-2 outline-none w-full h-20">${bio}</textarea>` : 
            `<p class="text-sm text-center text-white/80 max-w-[200px]">${bio}</p>`
         }
      </div>

      <div class="space-y-3">
        ${['Personal Information', 'Notifications', 'Privacy & Security'].map((item, i) => `
            <div class="glass-panel rounded-2xl flex items-center justify-between p-4 cursor-pointer hover:bg-white/15">
                <div class="flex items-center gap-3">
                    <div class="p-2 rounded-lg bg-white/10"><i data-lucide="${['user', 'bell', 'shield'][i]}" class="w-4 h-4"></i></div>
                    <span>${item}</span>
                </div>
                <i data-lucide="chevron-right" class="text-white/30"></i>
            </div>
        `).join('')}
      </div>

      <button onclick="navigate('login')" class="mt-8 w-full py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 flex items-center justify-center gap-2 font-medium">
        <i data-lucide="log-out" class="w-4 h-4"></i> Sign Out
      </button>
    </div>`;
}

function renderCalling() {
    return `
    <div class="flex flex-col h-full pt-4 pb-24 px-4 overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
            <div class="flex items-center gap-3">
                 <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><i data-lucide="phone"></i></div>
                 <div><h2 class="font-bold text-lg leading-tight">CALLING</h2><p class="text-xs text-white/60">Recent History</p></div>
            </div>
        </div>
        <div class="glass-panel rounded-2xl p-6 text-center">
            <p class="text-white/50">Call history feature coming soon.</p>
        </div>
    </div>`;
}

function renderBottomNav() {
    const navItems = [
        { id: 'menu', icon: 'home' },
        { id: 'calling', icon: 'phone' },
        { id: 'messenger', icon: 'message-circle' },
        { id: 'profile', icon: 'user' },
    ];
    return `
    <div class="fixed bottom-6 left-4 right-4 h-16 glass-panel rounded-full flex items-center justify-between px-6 z-50 md:absolute md:bottom-6 md:w-[90%] md:left-[5%]">
        ${navItems.map(item => `
            <button onclick="navigate('${item.id}')" class="p-2 rounded-full transition-all duration-300 ${state.screen === item.id ? 'bg-white text-purple-600 shadow-lg scale-110' : 'text-white/70 hover:text-white'}">
                <i data-lucide="${item.icon}" class="w-6 h-6"></i>
            </button>
        `).join('')}
    </div>`;
}

// --- LOGIC FUNCTIONS ---

window.navigate = (screen) => {
    state.screen = screen;
    render();
};

window.handleAuth = (e, type) => {
    e.preventDefault();
    // Simulate loading
    const btn = e.target.querySelector('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>';
    
    setTimeout(() => {
        state.screen = 'menu';
        render();
    }, 1000);
};

window.openChat = (contactId) => {
    state.activeChatId = contactId;
    if (!state.messages[contactId]) {
        state.messages[contactId] = [
            { sender: 'other', text: contactId === 'ai' ? 'Hello! I am Gemini. How can I assist you today?' : 'Hey! How are you?' }
        ];
    }
    state.screen = 'chat';
    render();
};

window.sendMessage = async (e) => {
    e.preventDefault();
    const input = document.getElementById('msg-input');
    const text = input.value.trim();
    if (!text) return;

    // Add user message
    state.messages[state.activeChatId].push({ sender: 'me', text });
    input.value = '';
    render();

    // Handle AI response
    if (state.activeChatId === 'ai') {
        const history = state.messages['ai'].map(m => ({
            role: m.sender === 'me' ? 'user' : 'model',
            parts: [{ text: m.text }]
        }));
        
        // Show typing indicator
        const loadingId = Date.now();
        state.messages['ai'].push({ sender: 'other', text: '<span class="animate-pulse">Thinking...</span>', id: loadingId });
        render();

        const response = await generateGeminiResponse(text, history);
        
        // Replace typing indicator
        state.messages['ai'] = state.messages['ai'].filter(m => m.id !== loadingId);
        state.messages['ai'].push({ sender: 'other', text: response });
        render();
    }
};

window.toggleEditProfile = () => {
    if (state.isProfileEditing) {
        // Save logic
        const nameInput = document.getElementById('edit-name');
        const bioInput = document.getElementById('edit-bio');
        const statusInput = document.getElementById('edit-status');
        
        if(nameInput) state.user.name = nameInput.value;
        if(bioInput) state.user.bio = bioInput.value;
        if(statusInput) state.user.status = statusInput.value;
        
        state.isProfileEditing = false;
    } else {
        state.isProfileEditing = true;
    }
    render();
};

// Initial Render
render();
