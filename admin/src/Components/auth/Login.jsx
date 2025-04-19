// import React, { useState } from 'react';
// import './Login.css'; // Make sure to create and import a CSS file for styling
// import { toast } from 'react-toastify';
// import { useNavigate } from 'react-router-dom';
// import { postData } from '../../services/FetchNodeServices';

// const Login = () => {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [step, setStep] = useState(1);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const response = await postData('api/admin/admin-login', { email, password });
//     // console.log("responseresponse:= ", response);
//     if (response?.status === true) {
//       toast.success(response?.message);
//       sessionStorage.setItem('login', true);
//       window.location.href = '/';
//       // navigate('/dashboard');
//     } else {
//       toast.error(response?.message);
//     }
//   };


//   return (
//     <>
//       <div className="main-login">
//         <div className="login-container">
//           <h2 className="login-title">{step === 1 ? 'Admin Login' : 'Enter Your Email'}</h2>
//           {step === 2 && <div className="login-divider">Please enter your email to get reset link</div>}
//           <form onSubmit={handleSubmit} className="login-form">
//             <div className="form-group">
//               <label>Email</label>
//               <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-control" required />
//             </div>
//             <div className="form-group">
//               <label>Password</label>
//               <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="form-control" required />
//               <div className="show-password">
//                 <div className="show-password">
//                   <input type="checkbox" checked={showPassword} onChange={() => setShowPassword(!showPassword)} id="show-password-checkbox" />
//                   <label htmlFor="show-password-checkbox">Show Password</label>
//                 </div>
//                 <div className="forgot-password">
//                   <p onClick={() => setStep(2)}>Forgot Password?</p>
//                 </div>
//               </div>
//             </div>
//             <button type="submit" className="login-button">Login</button>
//           </form>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Login;


import React, { useState } from 'react';
import './Login.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { postData } from '../../services/FetchNodeServices';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: login, 2: forgot password

  const handleLogin = async (e) => {
    e.preventDefault();
    const response = await postData('api/admin/admin-login', { email, password });
    
    if (response?.status === true) {
      toast.success(response?.message);
      sessionStorage.setItem('login', true);
      window.location.href = '/';
    } else {
      toast.error(response?.message);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email first');
      return;
    }

    // Simulate sending email logic here
    const response = await postData('api/admin/send-reset-password-email', { email });
    console.log("responseresponse:= ", response);
    if (response?.status) {
      toast.success('Reset link sent to your email');
      setStep(1);
    } else {
      toast.error(response?.message || 'Failed to send reset link');
    }
  };

  return (
    <div className="main-login">
      <div className="login-container">
        <h2 className="login-title">
          {step === 1 ? 'Admin Login' : 'Forgot Password'}
        </h2>

        {step === 2 && (
          <div className="login-divider">Enter your email to receive a reset link</div>
        )}

        <form onSubmit={step === 1 ? handleLogin : handleForgotPassword} className="login-form">
          <div className="form-group">
            {step === 1 && (<label>Email</label>)}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              required
            />
          </div>

          {step === 1 && (
            <div className="form-group">
              <label>Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                required
              />
              <div className="show-password">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  id="show-password-checkbox"
                />
                <label htmlFor="show-password-checkbox">Show Password</label>
              </div>
              <div className="forgot-password">
                <p onClick={() => setStep(2)}>Forgot Password?</p>
              </div>
            </div>
          )}

          <button type="submit" className="login-button">
            {step === 1 ? 'Login' : 'Send Reset Link'}
          </button>

          {step === 2 && (
            <div className="back-to-login">
              <p onClick={() => setStep(1)}>← Back to Login</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
