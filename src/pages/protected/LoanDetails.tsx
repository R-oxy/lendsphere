import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoanDetails() {
  const { id } = useParams();
  const [loan, setLoan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [investAmount, setInvestAmount] = useState('');
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/loans/' + id)
      .then(res => res.json())
      .then(data => {
        setLoan(data);
        setLoading(false);
      });
  }, [id]);

  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!investAmount || isNaN(Number(investAmount))) return;

    try {
      const res = await fetch('/api/loans/' + id + '/invest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(investAmount) }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Investment successful!');
        checkAuth(); // refresh wallet balance
        navigate('/my-investments');
      } else {
        toast.error(data.error || 'Investment failed');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!loan) return <div>Loan not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-800 shadow rounded-lg overflow-hidden">
        <div className="px-6 py-8 border-b border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">${loan.amount.toLocaleString()}</h1>
              <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">{loan.purpose}</p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-400">
              Grade {loan.risk_grade}
            </span>
          </div>
          
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Interest Rate</p>
              <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">{loan.interest_rate}%</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Term</p>
              <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">{loan.term_months} months</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Monthly Payment</p>
              <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">${loan.monthly_payment.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
              <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white capitalize">{loan.status}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-8 bg-slate-50 dark:bg-slate-900/50">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Funding Progress</h3>
          <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mb-2">
            <span>${loan.funded_amount.toLocaleString()} funded</span>
            <span>${(loan.amount - loan.funded_amount).toLocaleString()} remaining</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4">
            <div
              className="bg-indigo-600 dark:bg-indigo-500 h-4 rounded-full"
              style={{ width: (loan.funded_amount / loan.amount) * 100 + '%' }}
            />
          </div>
        </div>

        {user?.role === 'lender' && loan.status === 'funding' && (
          <div className="px-6 py-8 border-t border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Invest in this Loan</h3>
            <form onSubmit={handleInvest} className="flex items-end space-x-4">
              <div className="flex-1">
                <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Amount to Invest ($)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    id="amount"
                    min="25"
                    max={loan.amount - loan.funded_amount}
                    required
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                data-testid="invest-submit"
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Confirm Investment
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
