import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';

export default function BrowseLoans() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/loans')
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Marketplace</h2>
        <div className="flex space-x-2">
          <button className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loans.map(loan => (
          <div key={loan.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{loan.purpose}</p>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">${loan.amount.toLocaleString()}</h3>
                </div>
                <span className={
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ' +
                  (loan.risk_grade === 'A' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400' :
                  loan.risk_grade === 'B' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-400' :
                  loan.risk_grade === 'C' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400' :
                  loan.risk_grade === 'D' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-400' :
                  'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400')
                }>
                  Grade {loan.risk_grade}
                </span>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Interest Rate</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{loan.interest_rate}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Term</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{loan.term_months} mos</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>Funded</span>
                  <span>{Math.round((loan.funded_amount / loan.amount) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full"
                    style={{ width: (loan.funded_amount / loan.amount) * 100 + '%' }}
                  />
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to={'/loans/' + loan.id}
                  className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
