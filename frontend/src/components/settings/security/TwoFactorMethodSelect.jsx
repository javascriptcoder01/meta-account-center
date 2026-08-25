import React from 'react';
import { TWO_FACTOR_METHODS } from '../../../constants/settingsConstants.js';

export const TwoFactorMethodSelect = ({
  value = TWO_FACTOR_METHODS.SMS,
  onChange,
  disabled = false,
}) => {
  const methods = [
    {
      id: TWO_FACTOR_METHODS.SMS,
      label: 'SMS Text Message',
      desc: 'Receive verification security codes on your registered phone number.',
    },
    {
      id: TWO_FACTOR_METHODS.AUTHENTICATOR_APP,
      label: 'Authenticator App',
      desc: 'Use supported authenticator apps like Google Authenticator or Duo.',
    },
    {
      id: TWO_FACTOR_METHODS.EMAIL,
      label: 'Email Security Code',
      desc: 'Receive secondary security verification codes at your verified email address.',
    },
  ];

  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend className="text-xs font-semibold text-slate-700 mb-2">
        Select Two-Factor Verification Method *
      </legend>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {methods.map((method) => {
          const isSelected = value === method.id;
          return (
            <label
              key={method.id}
              className={`flex flex-col justify-between p-4 rounded-2xl border cursor-pointer transition ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900">{method.label}</span>
                <input
                  type="radio"
                  name="twoFactorMethod"
                  value={method.id}
                  checked={isSelected}
                  onChange={() => onChange(method.id)}
                  disabled={disabled}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                />
              </div>
              <p className="text-xs text-slate-500 leading-normal">{method.desc}</p>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
};

export default TwoFactorMethodSelect;
