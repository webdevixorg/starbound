import React from 'react';
import Switch from '../../Forms/Input/Switch';
import { ShieldIcon } from '../../UI/Icons/Sheald';
import SMSIcon from '../../UI/Icons/Sms';

interface Props {
  formData: {
    twoFactorSMS: boolean;
    twoFactorTOTP: boolean;
  };
  handleSwitchChange: (name: string, value: boolean) => void;
}

const AccountSecurityTab: React.FC<Props> = ({
  formData,
  handleSwitchChange,
}) => {
  return (
    <>
      <h3 className="text-xl font-semibold mb-4">
        Two-factor authentication (2FA)
      </h3>
      <div className="mb-4 p-4 border border-gray-200 rounded-md">
        <div className="block">
          <div>
            <Switch
              id="twoFactorSMS"
              name="twoFactorSMS"
              label="Text message SMS"
              icon={<SMSIcon />}
              checked={formData.twoFactorSMS}
              onChange={handleSwitchChange}
            />
          </div>
          <div>
            <p className="text-gray-500 text-sm">
              Receive a one-time passcode via SMS each time you log in.
            </p>
          </div>
        </div>
      </div>
      <div className="mb-4 p-4 border border-gray-200 rounded-md">
        <div className="block">
          <div>
            <Switch
              id="twoFactorTOTP"
              name="twoFactorTOTP"
              label="Authenticator app (TOTP)"
              icon={<ShieldIcon />}
              checked={formData.twoFactorTOTP}
              onChange={handleSwitchChange}
            />
          </div>
          <div>
            <p className="text-gray-500 text-sm">
              Use an app to receive a temporary one-time passcode each time you
              log in.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountSecurityTab;
