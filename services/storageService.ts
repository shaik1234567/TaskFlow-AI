const STORAGE_KEYS = {
  USERS: 'taskflow_users',
  TASKS: 'taskflow_tasks',
  CURRENT_USER: 'taskflow_current_user',
  TOKEN: 'taskflow_token'
};

export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from storage`, error);
    return defaultValue;
  }
};

export const setStorageItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to storage`, error);
  }
};

export const clearStorageItem = (key: string): void => {
  localStorage.removeItem(key);
};

export { STORAGE_KEYS };