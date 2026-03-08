import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function MyInvestments() {
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/loans/my/invested')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setInvestments(data);
        } else {
          setInvestments([]);
        }
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">My Investments</h2>
      <div className="bg-white dark:bg-slate-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
          {investments.map(inv => (
            <li key={inv.id}>
              <Link to={'/loans/' + inv.loan_id} className="block hover:bg-slate-50 dark:hover:bg-slate-700">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">{inv.purpose}</p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className={
                        'px-2 inline-flex text-xs leading-5 font-semibold rounded-full ' +
                        (inv.loan_status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400' :
                        inv.loan_status === 'funding' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400' :
                        'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300')
                      }>
                        {inv.loan_status}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                        Invested: ${inv.amount_invested.toLocaleString()}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-slate-500 dark:text-slate-400 sm:mt-0 sm:ml-6">
                        Rate: {inv.interest_rate}%
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-slate-500 dark:text-slate-400 sm:mt-0">
                      <p>Grade: {inv.risk_grade}</p>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
          {investments.length === 0 && (
            <li className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
              You haven't made any investments yet.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
