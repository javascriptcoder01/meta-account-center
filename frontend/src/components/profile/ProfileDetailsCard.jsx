import React from 'react';

export const ProfileDetailsCard = ({ profile }) => {
  const accountStatus = profile?.status || 'ACTIVE';
  const emailVerified = Boolean(profile?.emailVerified);
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    : 'Recently';
  const lastUpdated = profile?.updatedAt
    ? new Date(profile.updatedAt).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    : 'Recently';

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-base font-semibold text-slate-900">Account Metadata</h2>
        </div>
        <span className="text-xs text-slate-400 font-medium">Read-Only</span>
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <dt className="text-slate-400 font-medium">Account Status</dt>
          <dd className="mt-1">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${accountStatus === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                }`}
            >
              {accountStatus}
            </span>
          </dd>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <dt className="text-slate-400 font-medium">Email Verification</dt>
          <dd className="mt-1">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${emailVerified ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                }`}
            >
              {emailVerified ? 'Verified' : 'Pending Verification'}
            </span>
          </dd>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <dt className="text-slate-400 font-medium">Member Since</dt>
          <dd className="mt-1 font-semibold text-slate-800">{memberSince}</dd>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <dt className="text-slate-400 font-medium">Last Profile Update</dt>
          <dd className="mt-1 font-semibold text-slate-800">{lastUpdated}</dd>
        </div>
      </dl>
    </div>
  );
};

export default ProfileDetailsCard;
