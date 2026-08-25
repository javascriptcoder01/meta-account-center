import React from 'react';
import { checkPasswordStrength } from '../../utils/passwordValidator.js';

export const PasswordStrengthIndicator = ({ password = '' }) => {
  const checks = checkPasswordStrength(password);
  const passedCount = Object.values(checks).filter(Boolean).length;

  const items = [
    { key: 'hasMinLength', label: '8 to 128 characters', valid: checks.hasMinLength },
    { key: 'hasUppercase', label: 'One uppercase letter (A-Z)', valid: checks.hasUppercase },
    { key: 'hasLowercase', label: 'One lowercase letter (a-z)', valid: checks.hasLowercase },
    { key: 'hasNumber', label: 'One number (0-9)', valid: checks.hasNumber },
    { key: 'hasSpecial', label: 'One special character (@$!%*?&)', valid: checks.hasSpecial },
  ];

  if (!password) return null;

  return (
    <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
      <div className="flex items-center justify-between text-slate-600 font-medium">
        <span>Password requirements:</span>
        <span className={passedCount === 5 ? 'text-emerald-600 font-semibold' : 'text-slate-500'}>
          {passedCount} / 5 met
        </span>
      </div>

      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${passedCount <= 2
              ? 'bg-red-500 w-1/3'
              : passedCount <= 4
                ? 'bg-amber-500 w-2/3'
                : 'bg-emerald-500 w-full'
            }`}
        />
      </div>

      <ul className="grid grid-cols-1 gap-1 text-slate-500">
        {items.map((item) => (
          <li key={item.key} className="flex items-center gap-1.5">
            {item.valid ? (
              <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 text-slate-300 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 102 0V7zm-1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            )}
            <span className={item.valid ? 'text-slate-700 font-medium' : 'text-slate-500'}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordStrengthIndicator;
