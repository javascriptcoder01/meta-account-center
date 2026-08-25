import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateSecuritySettingsRequest } from '../../../redux/slices/securitySettingsSlice.js';
import TwoFactorToggle from './TwoFactorToggle.jsx';
import TwoFactorMethodSelect from './TwoFactorMethodSelect.jsx';
import SecurityWarning from './SecurityWarning.jsx';
import PasswordChangedInfo from './PasswordChangedInfo.jsx';
import LoadingSpinner from '../../common/LoadingSpinner.jsx';

export const SecuritySettingsCard = ({ initialSettings }) => {
  const dispatch = useDispatch();
  const isUpdating = useSelector((state) => state.securitySettings.isUpdating);

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    Boolean(initialSettings?.twoFactorEnabled)
  );
  const [twoFactorMethod, setTwoFactorMethod] = useState(
    initialSettings?.twoFactorMethod || (initialSettings?.twoFactorEnabled ? 'SMS' : null)
  );

  const [prevInitial, setPrevInitial] = useState(initialSettings);
  if (initialSettings !== prevInitial) {
    setPrevInitial(initialSettings);
    if (initialSettings) {
      setTwoFactorEnabled(Boolean(initialSettings.twoFactorEnabled));
      setTwoFactorMethod(
        initialSettings.twoFactorMethod || (initialSettings.twoFactorEnabled ? 'SMS' : null)
      );
    }
  }

  const handleToggle = (enabled) => {
    setTwoFactorEnabled(enabled);
    if (!enabled) {
      setTwoFactorMethod(null);
    } else if (!twoFactorMethod) {
      setTwoFactorMethod('SMS');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isUpdating) return;

    const safePayload = {
      twoFactorEnabled,
      twoFactorMethod: twoFactorEnabled ? twoFactorMethod || 'SMS' : null,
    };

    dispatch(updateSecuritySettingsRequest(safePayload));
  };

  return (
    <div className="space-y-6">

      <PasswordChangedInfo lastPasswordChangedAt={initialSettings?.lastPasswordChangedAt} />

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Two-Factor Authentication Configuration</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure mock 2FA preferences to simulate multi-factor security across your Meta accounts.
          </p>
        </div>

        <div className="space-y-4">
          <TwoFactorToggle
            checked={twoFactorEnabled}
            onChange={handleToggle}
            disabled={isUpdating}
          />

          {twoFactorEnabled && (
            <div className="pt-2 animate-in fade-in duration-200">
              <TwoFactorMethodSelect
                value={twoFactorMethod || 'SMS'}
                onChange={(method) => setTwoFactorMethod(method)}
                disabled={isUpdating}
              />
            </div>
          )}
        </div>

        <SecurityWarning />

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={isUpdating}
            className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isUpdating ? (
              <>
                <LoadingSpinner size="sm" color="text-white" />
                <span>Updating Security Settings...</span>
              </>
            ) : (
              'Save Security Settings'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SecuritySettingsCard;
