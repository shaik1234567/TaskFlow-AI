import React, { useState } from 'react';
import { useAuth } from '../App';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { authService } from '../services/authService';
import { useToast } from '../contexts/ToastContext';

export const Profile: React.FC = () => {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ name: user?.name || '', email: user?.email || '' });
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const updatedUser = await authService.updateProfile({ ...user, name: formData.name });
      setUser(updatedUser);
      showToast('Profile updated successfully', 'success');
    } catch (err) {
      showToast('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Profile</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-indigo-600"></div>
        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-6">
             <img 
               src={user.avatar} 
               alt="Avatar" 
               className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-md object-cover"
             />
          </div>

          <form onSubmit={handleUpdate}>
            <div className="grid grid-cols-1 gap-6">
              <Input
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              <Input
                label="Email Address"
                value={formData.email}
                disabled
                className="bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <div className="pt-4 flex items-center justify-between">
                 <p className="text-sm text-gray-500">Member since {new Date().getFullYear()}</p>
                 <Button type="submit" isLoading={loading}>Save Changes</Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
