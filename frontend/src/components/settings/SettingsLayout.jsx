import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import ROUTES from '../../constants/routes.js';

export const SettingsLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
          <div className="flex items-start sm:items-center gap-4">
            <Link
              to={ROUTES.DASHBOARD}
              aria-label="Back to Dashboard"
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition shrink-0 mt-1 sm:mt-0"
              title="Back to Dashboard"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                Accounts Center Settings
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
                {title}
              </h1>
              {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex gap-2 mt-6 pt-6 border-t border-slate-100" aria-label="Settings navigation">
            <NavLink
              to={ROUTES.PRIVACY}
              className={({ isActive }) =>
                `px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`
              }
            >
              Privacy Settings
            </NavLink>
            <NavLink
              to={ROUTES.SECURITY}
              className={({ isActive }) =>
                `px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`
              }
            >
              Password & Security
            </NavLink>
          </nav>
        </header>

        {/* Content */}
        <main>{children}</main>
      </div>
    </div>
  );
};

export default SettingsLayout;
