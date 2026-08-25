import React from 'react';
import { Link } from 'react-router-dom';
import ROUTES from '../../constants/routes.js';

export const ProfileSummaryCard = ({ profile }) => {
  const firstName = profile?.firstName || '';
  const lastName = profile?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'Not specified';
  const email = profile?.email || 'Not specified';
  const phone = profile?.phone || 'Not provided';
  const profilePicture = profile?.profilePicture || null;
  const dateOfBirth = profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not provided';

  const initials = firstName && lastName
    ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    : firstName
    ? firstName.charAt(0).toUpperCase()
    : 'U';

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h2 className="text-base font-semibold text-slate-900">Personal Details</h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">Profile</span>
        </div>

        <div className="flex items-center gap-4 my-5">
          {profilePicture ? (
            <img
              src={profilePicture}
              alt={`${fullName}'s profile avatar`}
              className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
            />
          ) : (
            <div
              aria-label="User avatar initials"
              className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-xs"
            >
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-900 truncate">{fullName}</h3>
            <p className="text-xs text-slate-500 truncate">{email}</p>
          </div>
        </div>

        <dl className="space-y-2.5 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
          <div className="flex justify-between">
            <dt className="text-slate-400 font-medium">Phone</dt>
            <dd className="font-medium text-slate-800 truncate max-w-[60%]">{phone}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-400 font-medium">Date of Birth</dt>
            <dd className="font-medium text-slate-800">{dateOfBirth}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100">
        <Link
          to={ROUTES.PROFILE}
          className="w-full inline-flex items-center justify-center py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
};

export default ProfileSummaryCard;
