import React from 'react';
import ChangeEmailForm from './ChangeEmailForm.jsx';
import ChangePhoneForm from './ChangePhoneForm.jsx';

export const ContactInformationCard = ({ profile }) => {
  return (
    <div className="space-y-6">
      <ChangeEmailForm currentEmail={profile?.email} />
      <ChangePhoneForm currentPhone={profile?.phone} />
    </div>
  );
};

export default ContactInformationCard;
