export type Screen = 'landing' | 'login' | 'register' | 'reset' | 'menu' | 'calling' | 'messenger' | 'chat' | 'profile';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  gender: string;
  age: string;
  school: string;
  occupation: string;
  avatar: string;
  status: 'online' | 'offline' | 'busy';
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isAi?: boolean;
}

export interface Contact {
  id: string;
  name: string;
  lastMessage?: string;
  time?: string;
  avatar: string;
  missedCall?: boolean;
}