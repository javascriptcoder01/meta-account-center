import React from 'react';
import { Link } from 'react-router-dom';
import ROUTES from '../../constants/routes.js';

export const SectionPlaceholder = ({ title = 'Accounts Center Section' }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <h1 className="text-xl font-bold text-slate-800 mb-2">{title}</h1>
        <p className="text-sm text-slate-500 mb-6">
          This section belongs to a future frontend batch and is protected by authentication.
        </p>
        <Link
          to={ROUTES.DASHBOARD}
          className="inline-block py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default SectionPlaceholder;
