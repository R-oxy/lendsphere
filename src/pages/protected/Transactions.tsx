import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function Transactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/transactions')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTransactions(data);
        } else {
          setTransactions([]);
        }
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Transactions</h2>
      <div className="bg-white dark:bg-slate-800 shadow overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
          {transactions.map(tx => (
            <li key={tx.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">{tx.description}</p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className={
                      'px-2 inline-flex text-xs leading-5 font-semibold rounded-full ' +
                      (tx.type === 'deposit' || tx.type === 'repayment' || tx.type === 'disbursement' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400' :
                      'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400')
                    }>
                      {(tx.type === 'deposit' || tx.type === 'repayment' || tx.type === 'disbursement' ? '+' : '-')}
                      ${tx.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                      Balance after: ${tx.balance_after.toLocaleString()}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-slate-500 dark:text-slate-400 sm:mt-0">
                    <p>{format(new Date(tx.created_at), 'MMM d, yyyy h:mm a')}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
          {transactions.length === 0 && (
            <li className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
              No transactions found.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
