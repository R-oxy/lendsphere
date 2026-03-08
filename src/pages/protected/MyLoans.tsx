import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function MyLoans() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/loans/my/borrowed')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setLoans(data);
        } else {
          setLoans([]);
        }
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">My Loans</h2>
      <div className="bg-white dark:bg-slate-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
          {loans.map(loan => (
            <li key={loan.id}>
              <Link to={'/loans/' + loan.id} className="block hover:bg-slate-50 dark:hover:bg-slate-700">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">{loan.purpose}</p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className={
                        'px-2 inline-flex text-xs leading-5 font-semibold rounded-full ' +
                        (loan.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400' :
                        loan.status === 'funding' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400' :
                        loan.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400' :
                        'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300')
                      }>
                        {loan.status}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                        Amount: ${loan.amount.toLocaleString()}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-slate-500 dark:text-slate-400 sm:mt-0 sm:ml-6">
                        Rate: {loan.interest_rate}%
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-slate-500 dark:text-slate-400 sm:mt-0">
                      <p>Term: {loan.term_months} mos</p>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
          {loans.length === 0 && (
            <li className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
              You haven't applied for any loans yet.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
