import { Task, TaskStatus, TaskPriority } from '../types';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from './storageService';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const taskService = {
  async getTasks(userId: string): Promise<Task[]> {
    await delay(400);
    const allTasks = getStorageItem<Task[]>(STORAGE_KEYS.TASKS, []);
    return allTasks.filter(t => t.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
  },

  async createTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    await delay(400);
    const allTasks = getStorageItem<Task[]>(STORAGE_KEYS.TASKS, []);
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    
    allTasks.push(newTask);
    setStorageItem(STORAGE_KEYS.TASKS, allTasks);
    return newTask;
  },

  async updateTask(task: Task): Promise<Task> {
    await delay(300);
    const allTasks = getStorageItem<Task[]>(STORAGE_KEYS.TASKS, []);
    const index = allTasks.findIndex(t => t.id === task.id);
    
    if (index !== -1) {
      allTasks[index] = task;
      setStorageItem(STORAGE_KEYS.TASKS, allTasks);
      return task;
    }
    throw new Error("Task not found");
  },

  async deleteTask(taskId: string): Promise<void> {
    await delay(300);
    const allTasks = getStorageItem<Task[]>(STORAGE_KEYS.TASKS, []);
    const filtered = allTasks.filter(t => t.id !== taskId);
    setStorageItem(STORAGE_KEYS.TASKS, filtered);
  }
};