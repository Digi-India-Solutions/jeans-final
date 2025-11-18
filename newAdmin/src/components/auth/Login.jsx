
import React, { useState } from 'react';
import './Login.css';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { postData } from '../../services/FetchNodeServices';
import jwtDecode from "jwt-decode";


const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(1); // 1: login, 2: forgot password
    const [loading, setLoading] = useState(false);
    // const handleLogin = async (e) => {
    //     e.preventDefault();
    //     const response = await postData('api/admin/admin-login', { email, password });

    //     if (response?.status === true) {
    //         const token = response?.data?.token;
    //          const decoded = await jwtDecode(token);
    //          console.log("DecodedHHH Token:==>", decoded);
    //         toast.success(response?.message);
    //         sessionStorage.setItem('login', true);
    //         sessionStorage.setItem('JeansAdmin', response?.data?.token);
    //          try {
    //             const decoded = jwtDecode(token);
    //             console.log("Decoded Token:==>", decoded);
    //             sessionStorage.setItem('JeansUser', JSON.stringify(decoded));
    //         } catch (err) {
    //             console.warn("Invalid token decode:", err);
    //         }
    //         // window.location.href = '/admin/dashboard';
    //     } else {
    //         toast.error(response?.message);
    //     }
    // };


    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error("Please fill in both fields");
            return;
        }

        setLoading(true);

        try {
            const response = await postData("api/admin/admin-login", { email, password });
            console.log("SSSSSSS:=>", response)
            if (response?.status === true) {
                const token = response?.data?.token;
                let decodedToken;

                try {
                    decodedToken = jwtDecode(token);
                    console.log("Decoded Token:", decodedToken);
                    sessionStorage.setItem("JeansUser", JSON.stringify(decodedToken));
                } catch (err) {
                    console.warn("Invalid token decode:", err);
                }

                sessionStorage.setItem("login", true);
                sessionStorage.setItem("JeansAdmin", token);
                toast.success(response?.message || "Login successful!");

                // Small delay for smooth UX
                setTimeout(() => navigate("/admin/dashboard"), 800);
            } else {
                toast.error(response?.message || "Invalid email or password");
            }

        } catch (error) {
            console.error("Login error:", error);
            toast.error("Something went wrong during login.");
        } finally {
            setLoading(false);
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
        // console.log("responseresponse:= ", response);
        if (response?.status) {
            toast.success('Reset link sent to your email');
            setStep(1);
        } else {
            toast.error(response?.message || 'Failed to send reset link');
        }
    };

    return (
        <div className="main-login">
            <ToastContainer />
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
                        {step === 1 ? loading ? 'Loading...' : 'Login' : 'Send Reset Link'}
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
