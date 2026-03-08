import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, TrendingUp, Users, Search } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-indigo-900 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://picsum.photos/seed/finance/1920/1080?blur=4"
            alt="Background"
            className="w-full h-full object-cover opacity-20"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-purple-900 mix-blend-multiply" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Invest in People.<br />Earn More. Borrow Smarter.
          </h1>
          <p className="mt-6 text-xl text-indigo-100 max-w-3xl">
            LendSphere connects borrowers with individual lenders, cutting out the middleman to offer lower rates for borrowers and better returns for investors.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              to="/register?role=lender"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-900 bg-white hover:bg-indigo-50 md:py-4 md:text-lg md:px-10 shadow-lg"
            >
              Start Lending
            </Link>
            <Link
              to="/register?role=borrower"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 shadow-lg"
            >
              Apply for a Loan
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-12 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <p className="text-4xl font-extrabold text-indigo-600 font-mono">$12.4M+</p>
              <p className="mt-2 text-sm font-medium text-slate-500 uppercase tracking-wide">Total Funded</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-extrabold text-indigo-600 font-mono">8.5%</p>
              <p className="mt-2 text-sm font-medium text-slate-500 uppercase tracking-wide">Avg Lender ROI</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-extrabold text-indigo-600 font-mono">4,200+</p>
              <p className="mt-2 text-sm font-medium text-slate-500 uppercase tracking-wide">Active Borrowers</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-extrabold text-indigo-600 font-mono">98.2%</p>
              <p className="mt-2 text-sm font-medium text-slate-500 uppercase tracking-wide">Repaid On Time</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Process</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              How LendSphere Works
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-sm h-full">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                        <ShieldCheck className="h-6 w-6 text-white" aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-slate-900 tracking-tight">1. Register & Verify</h3>
                    <p className="mt-5 text-base text-slate-500">
                      Create an account as a borrower or lender. We verify identity and assess credit risk to ensure a safe platform.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-sm h-full">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                        <Search className="h-6 w-6 text-white" aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-slate-900 tracking-tight">2. Browse or Apply</h3>
                    <p className="mt-5 text-base text-slate-500">
                      Borrowers apply for loans with competitive rates. Lenders browse listings and choose where to invest.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-sm h-full">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                        <TrendingUp className="h-6 w-6 text-white" aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-slate-900 tracking-tight">3. Fund & Receive</h3>
                    <p className="mt-5 text-base text-slate-500">
                      Loans are funded by multiple investors. Borrowers receive cash, and lenders earn monthly returns.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
