import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../App';
import { taskService } from '../services/taskService';
import { geminiService } from '../services/geminiService';
import { Task, TaskPriority, TaskStatus } from '../types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useToast } from '../contexts/ToastContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'ALL' | TaskStatus>('ALL');
  
  // Task Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', priority: TaskPriority.MEDIUM });
  const [isSaving, setIsSaving] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // AI State
  const [aiGoal, setAiGoal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiInput, setShowAiInput] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    try {
      const data = await taskService.getTasks(user.id);
      setTasks(data);
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      if (editingTask) {
        await taskService.updateTask({ ...editingTask, ...formData, priority: formData.priority as TaskPriority });
        showToast('Task updated', 'success');
      } else {
        await taskService.createTask({
          userId: user.id,
          ...formData,
          status: TaskStatus.TODO,
          priority: formData.priority as TaskPriority
        });
        showToast('New task created', 'success');
      }
      setIsModalOpen(false);
      setEditingTask(null);
      setFormData({ title: '', description: '', priority: TaskPriority.MEDIUM });
      fetchTasks();
    } catch (err) {
      console.error(err);
      showToast('Failed to save task', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    // Replaced window.confirm with a simpler immediate action for this demo, 
    // but in prod a custom modal is better.
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(id);
        showToast('Task deleted', 'success');
        fetchTasks();
      } catch (err) {
        showToast('Failed to delete task', 'error');
      }
    }
  };

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    try {
      await taskService.updateTask({ ...task, status: newStatus });
      fetchTasks();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleGenerateTasks = async () => {
    if (!aiGoal.trim() || !user) return;
    setIsGenerating(true);
    try {
      const suggestions = await geminiService.generateSubtasks(aiGoal);
      if (suggestions.length === 0) {
        showToast("AI couldn't generate tasks. Try a clearer goal.", 'error');
        return;
      }
      for (const t of suggestions) {
        await taskService.createTask({
          userId: user.id,
          title: t.title,
          description: t.description,
          status: TaskStatus.TODO,
          priority: t.priority
        });
      }
      setAiGoal('');
      setShowAiInput(false);
      fetchTasks();
      showToast(`Generated ${suggestions.length} tasks successfully!`, 'success');
    } catch (err) {
      showToast("Failed to generate tasks. Check API key.", 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptimizeTask = async () => {
    if (!formData.description) {
      showToast("Please enter a description first.", "info");
      return;
    }
    setIsOptimizing(true);
    try {
      const result = await geminiService.analyzeTask(formData.description);
      setFormData(prev => ({
        ...prev,
        description: result.refinedDescription,
        priority: result.priority
      }));
      showToast("Task optimized by AI!", "success");
    } catch (err) {
      showToast("AI Optimization failed", "error");
    } finally {
      setIsOptimizing(false);
    }
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormData({ title: task.title, description: task.description, priority: task.priority });
    setIsModalOpen(true);
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'ALL' || t.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case TaskPriority.HIGH: return 'bg-red-100 text-red-800';
      case TaskPriority.MEDIUM: return 'bg-yellow-100 text-yellow-800';
      case TaskPriority.LOW: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your tasks efficiently.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowAiInput(!showAiInput)}>
            <span className="mr-2">✨</span> AI Assist
          </Button>
          <Button onClick={() => {
            setEditingTask(null);
            setFormData({ title: '', description: '', priority: TaskPriority.MEDIUM });
            setIsModalOpen(true);
          }}>
            + New Task
          </Button>
        </div>
      </div>

      {/* AI Assistant Panel */}
      {showAiInput && (
        <div className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 animate-fade-in">
          <h3 className="text-lg font-semibold text-indigo-900 mb-2">AI Task Generator</h3>
          <p className="text-sm text-indigo-700 mb-4">Describe a project or goal (e.g., "Plan a marketing campaign for Q4"), and AI will generate actionable tasks for you.</p>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="What's your goal?"
              className="flex-1 px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={aiGoal}
              onChange={(e) => setAiGoal(e.target.value)}
            />
            <Button onClick={handleGenerateTasks} isLoading={isGenerating}>
              Generate
            </Button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Total Tasks</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{tasks.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">In Progress</p>
          <p className="text-3xl font-bold text-indigo-600 mt-2">
            {tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Completed</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {tasks.filter(t => t.status === TaskStatus.COMPLETED).length}
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center sticky top-0 z-10">
        <div className="relative w-full sm:w-96">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          {([
            'ALL',
            TaskStatus.TODO,
            TaskStatus.IN_PROGRESS,
            TaskStatus.COMPLETED
          ] as const).map((s) => (
            <button
              key={s as string}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === s 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {(s as string).replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">No tasks found.</p>
          <p className="text-gray-400 text-sm mt-1">Create one or use AI to generate some!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <div key={task.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col group relative">
               <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                 <button onClick={() => openEditModal(task)} className="p-1 hover:bg-gray-100 rounded text-gray-500 transition-colors">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                 </button>
                 <button onClick={() => handleDelete(task.id)} className="p-1 hover:bg-red-50 rounded text-red-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                 </button>
               </div>

              <div className="flex items-center justify-between mb-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                <span className="text-xs text-gray-400">{new Date(task.createdAt).toLocaleDateString()}</span>
              </div>
              
              <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{task.title}</h3>
              <p className="text-gray-500 text-sm mb-6 flex-1 line-clamp-4">{task.description}</p>
              
              <div className="mt-auto border-t border-gray-50 pt-4 flex items-center justify-between">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                  className={`text-sm font-medium rounded-lg px-2 py-1 border-0 ring-1 ring-inset focus:ring-2 focus:ring-indigo-600 cursor-pointer outline-none transition-colors
                    ${task.status === 'COMPLETED' ? 'text-green-700 ring-green-600/20 bg-green-50' : 
                      task.status === 'IN_PROGRESS' ? 'text-indigo-700 ring-indigo-600/20 bg-indigo-50' : 
                      'text-gray-600 ring-gray-500/10 bg-gray-50'}`}
                >
                  <option value={TaskStatus.TODO}>To Do</option>
                  <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                  <option value={TaskStatus.COMPLETED}>Completed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-fade-in-up">
            <h2 className="text-xl font-bold mb-6">{editingTask ? 'Edit Task' : 'New Task'}</h2>
            <form onSubmit={handleSaveTask}>
              <Input
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g. Review Q3 Report"
              />
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <button 
                    type="button" 
                    onClick={handleOptimizeTask}
                    disabled={isOptimizing}
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 disabled:opacity-50"
                  >
                    {isOptimizing ? 'Optimizing...' : '✨ Optimize with AI'}
                  </button>
                </div>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 h-32 resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details about the task..."
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value={TaskPriority.LOW}>Low</option>
                  <option value={TaskPriority.MEDIUM}>Medium</option>
                  <option value={TaskPriority.HIGH}>High</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" isLoading={isSaving}>{editingTask ? 'Save Changes' : 'Create Task'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};