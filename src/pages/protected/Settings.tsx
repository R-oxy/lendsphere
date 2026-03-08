import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function Settings() {
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const toggleDarkMode = () => {
    const isDark = !darkMode;
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/users/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwords),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Password updated successfully');
        setPasswords({ current_password: '', new_password: '', confirm_password: '' });
      } else {
        toast.error(data.error || 'Failed to update password');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Settings</h2>
      
      <div className="bg-white dark:bg-slate-800 shadow sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-white">Preferences</h3>
          <div className="mt-5 flex items-center justify-between">
            <span className="flex-grow flex flex-col">
              <span className="text-sm font-medium text-slate-900 dark:text-white" id="availability-label">Dark Mode</span>
              <span className="text-sm text-slate-500 dark:text-slate-400" id="availability-description">Toggle dark mode theme for the dashboard.</span>
            </span>
            <button 
              type="button" 
              onClick={toggleDarkMode}
              className={`${darkMode ? 'bg-indigo-600' : 'bg-slate-200'} relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`} 
              role="switch" 
              aria-checked={darkMode} 
              aria-labelledby="availability-label" 
              aria-describedby="availability-description"
            >
              <span aria-hidden="true" className={`${darkMode ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}></span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 shadow sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-white">Change Password</h3>
          <form onSubmit={handleSubmit} className="mt-5 space-y-6">
            <div>
              <label htmlFor="current_password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Current Password</label>
              <input
                type="password"
                name="current_password"
                id="current_password"
                required
                value={passwords.current_password}
                onChange={handleChange}
                className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="new_password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
              <input
                type="password"
                name="new_password"
                id="new_password"
                required
                value={passwords.new_password}
                onChange={handleChange}
                className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm New Password</label>
              <input
                type="password"
                name="confirm_password"
                id="confirm_password"
                required
                value={passwords.confirm_password}
                onChange={handleChange}
                className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
