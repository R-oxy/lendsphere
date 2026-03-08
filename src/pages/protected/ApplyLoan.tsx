import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ApplyLoan() {
  const [amount, setAmount] = useState(5000);
  const [purpose, setPurpose] = useState('Debt Consolidation');
  const [term, setTerm] = useState(36);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/loans/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, purpose, term_months: term }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Loan application submitted!');
        navigate('/my-loans');
      } else {
        toast.error(data.error || 'Application failed');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-slate-800 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-white">Apply for a Loan</h3>
          <div className="mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
            <p>Fill out the details below to request a loan. Your application will be reviewed instantly.</p>
          </div>
          <form className="mt-5 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Loan Amount: ${amount.toLocaleString()}
              </label>
              <input
                type="range"
                id="amount"
                min="1000"
                max="50000"
                step="500"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full mt-2 accent-indigo-600 dark:accent-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Loan Purpose
              </label>
              <select
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-slate-700 dark:text-white"
              >
                <option>Debt Consolidation</option>
                <option>Home Improvement</option>
                <option>Business</option>
                <option>Education</option>
                <option>Medical</option>
                <option>Auto</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="term" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Loan Term (Months)
              </label>
              <select
                id="term"
                value={term}
                onChange={(e) => setTerm(Number(e.target.value))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-slate-700 dark:text-white"
              >
                <option value={12}>12 Months</option>
                <option value={24}>24 Months</option>
                <option value={36}>36 Months</option>
                <option value={48}>48 Months</option>
                <option value={60}>60 Months</option>
              </select>
            </div>

            <div className="pt-5">
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  data-testid="apply-loan-submit"
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
