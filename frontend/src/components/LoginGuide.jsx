import React from 'react';

const LoginGuide = () => {
  return (
    <div className="login-guide">
      <h3>Available Test Accounts</h3>
      <div className="account-info">
        <h4>Admin Account</h4>
        <p><strong>Email:</strong> admin@consultai.com</p>
        <p><strong>Password:</strong> admin123</p>
      </div>
      <div className="account-info">
        <h4>Doctor Account</h4>
        <p><strong>Email:</strong> doctor@consultai.com</p>
        <p><strong>Password:</strong> doctor123</p>
      </div>
      <div className="account-info">
        <h4>Patient Account</h4>
        <p><strong>Email:</strong> patient@consultai.com</p>
        <p><strong>Password:</strong> patient123</p>
      </div>
      <div className="account-info">
        <h4>Unverified Doctor Account</h4>
        <p><strong>Email:</strong> unverified@consultai.com</p>
        <p><strong>Password:</strong> unverified123</p>
      </div>
      <div className="account-info">
        <p className="guide-note">
          If you've registered a new account, please use those credentials to login.
        </p>
      </div>
    </div>
  );
};

export default LoginGuide;