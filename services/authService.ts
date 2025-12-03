import { User, LoginResponse, ApiError } from '../types';
import { STORAGE_KEYS, getStorageItem, setStorageItem, clearStorageItem } from './storageService';

// Mimic network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    await delay(800); // Simulate API call

    const users = getStorageItem<any[]>(STORAGE_KEYS.USERS, []);
    // Simple mock password check (in production, use bcrypt on backend)
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Mock JWT token
    const token = btoa(JSON.stringify({ id: user.id, email: user.email, exp: Date.now() + 3600000 }));
    
    // Store session
    setStorageItem(STORAGE_KEYS.CURRENT_USER, user);
    setStorageItem(STORAGE_KEYS.TOKEN, token);

    return { user, token };
  },

  async register(name: string, email: string, password: string): Promise<LoginResponse> {
    await delay(800);

    const users = getStorageItem<any[]>(STORAGE_KEYS.USERS, []);
    if (users.find(u => u.email === email)) {
      throw new Error('User already exists');
    }

    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      password, // In real app, hash this!
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    };

    users.push(newUser);
    setStorageItem(STORAGE_KEYS.USERS, users);

    // Auto login after register
    const token = btoa(JSON.stringify({ id: newUser.id, email: newUser.email, exp: Date.now() + 3600000 }));
    setStorageItem(STORAGE_KEYS.CURRENT_USER, newUser);
    setStorageItem(STORAGE_KEYS.TOKEN, token);

    return { user: newUser, token };
  },

  async logout(): Promise<void> {
    await delay(200);
    clearStorageItem(STORAGE_KEYS.CURRENT_USER);
    clearStorageItem(STORAGE_KEYS.TOKEN);
  },

  async updateProfile(user: User): Promise<User> {
    await delay(500);
    const users = getStorageItem<any[]>(STORAGE_KEYS.USERS, []);
    const index = users.findIndex(u => u.id === user.id);
    
    if (index !== -1) {
      users[index] = { ...users[index], ...user };
      setStorageItem(STORAGE_KEYS.USERS, users);
      setStorageItem(STORAGE_KEYS.CURRENT_USER, users[index]);
      return users[index];
    }
    throw new Error("User not found");
  },

  getCurrentSession(): { user: User | null, token: string | null } {
    const user = getStorageItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    const token = getStorageItem<string | null>(STORAGE_KEYS.TOKEN, null);
    return { user, token };
  }
};