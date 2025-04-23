import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';
import { postData } from '../../services/FetchNodeServices';

const CreateFaq = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ question: '', answer: '', isActive: true });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.question || !formData.answer) {
            toast.error("Please fill all required fields");
            return;
        }

        try {
            setIsLoading(true);
            const response = await postData('api/faq/create-faq', formData);
            if (response.success) {
                toast.success("FAQ created successfully");
                setTimeout(() => {
                    navigate('/all-faq');
                }, 1500);
            }

        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="bread">
                <div className="head">
                    <h4>Create FAQ</h4>
                </div>
                <div className="links">
                    <Link to="/all-faq" className="add-new">Back <i className="fa-regular fa-circle-left"></i></Link>
                </div>
            </div>

            <div className="d-form">
                <form className="row g-3" onSubmit={handleSubmit}>
                    <div className="col-md-6">
                        <label className="form-label">Question</label>
                        <input type="text" name="question" value={formData.question} onChange={handleChange} className="form-control" placeholder="Enter question" />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Answer</label>
                        <input type="text" name="answer" value={formData.answer} onChange={handleChange} className="form-control" placeholder="Enter answer" />
                    </div>
                    <div className="col-md-6 form-check">
                        <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="form-check-input" />
                        <label className="form-check-label">Active</label>
                    </div>
                    <div className="col-12 text-center">
                        <button type="submit" disabled={isLoading} className={`btn btn-primary ${isLoading ? 'not-allowed' : 'allowed'}`}>
                            {isLoading ? "Please Wait..." : "Create FAQ"}
                        </button>
                    </div>
                </form>
            </div>

            <ToastContainer position="top-right" autoClose={2000} />
        </>
    );
};

export default CreateFaq;
