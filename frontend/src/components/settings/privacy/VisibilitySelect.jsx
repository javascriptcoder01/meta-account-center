import React from 'react';
import { VISIBILITY_OPTIONS } from '../../../constants/settingsConstants.js';

export const VisibilitySelect = ({
  id,
  label,
  description,
  value = VISIBILITY_OPTIONS.PUBLIC,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
      <div className="space-y-0.5">
        <label htmlFor={id} className="text-sm font-bold text-slate-900 block cursor-pointer">
          {label}
        </label>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>

      <select
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full sm:w-44 px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100 shrink-0 cursor-pointer"
      >
        <option value={VISIBILITY_OPTIONS.PUBLIC}>Public</option>
        <option value={VISIBILITY_OPTIONS.FRIENDS}>Friends</option>
        <option value={VISIBILITY_OPTIONS.PRIVATE}>Private</option>
      </select>
    </div>
  );
};

export default VisibilitySelect;
