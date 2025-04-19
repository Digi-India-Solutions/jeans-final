import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postData } from '../../services/FetchNodeServices';
import { toast } from 'react-toastify';
import './Login.css'; // Reuse same styles

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const response = await postData('api/admin/reset-password', { token, new_password: password, });

    if (response?.status) {
      toast.success('Password reset successfully!');
      navigate('/login');
    } else {
      toast.error(response?.message || 'Failed to reset password');
    }
  };

  return (
    <div className="main-login">
      <div className="login-container">
        <h2 className="login-title">Reset Password</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">Reset Password</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
