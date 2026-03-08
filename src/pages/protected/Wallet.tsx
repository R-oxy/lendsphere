import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Wallet() {
  const { user, checkAuth } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    setLoading(true);

    try {
      const res = await fetch('/api/transactions/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount) }),
      });

      if (res.ok) {
        toast.success('Deposit successful!');
        setAmount('');
        checkAuth();
      } else {
        toast.error('Deposit failed');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    setLoading(true);

    try {
      const res = await fetch('/api/transactions/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount) }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Withdrawal successful!');
        setAmount('');
        checkAuth();
      } else {
        toast.error(data.error || 'Withdrawal failed');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Wallet</h2>
      
      <div className="bg-white dark:bg-slate-800 shadow rounded-lg overflow-hidden mb-8">
        <div className="px-6 py-8 text-center">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Available Balance</p>
          <p className="mt-2 text-5xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
            ${user?.wallet_balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Deposit Funds</h3>
          <form onSubmit={handleDeposit} className="space-y-4">
            <div>
              <label htmlFor="deposit-amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Amount ($)</label>
              <input
                type="number"
                id="deposit-amount"
                min="10"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              data-testid="wallet-deposit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Deposit via Bank Transfer
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Withdraw Funds</h3>
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label htmlFor="withdraw-amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Amount ($)</label>
              <input
                type="number"
                id="withdraw-amount"
                min="10"
                max={user?.wallet_balance}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              data-testid="wallet-withdraw"
              className="w-full flex justify-center py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Withdraw to Bank
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
