import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getData, postData } from '../../services/FetchNodeServices';

export default function EditFaq() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ question: '', answer: '', isActive: true });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchFaq = async () => {
            try {
                const res = await getData(`api/faq/get-faq-by-id/${id}`);
                setFormData(res.faq);
            } catch (error) {
                toast.error("Failed to load FAQ details");
            }
        };
        fetchFaq();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await postData(`api/faq/update-faq/${id}`, formData);
            if (res.success) {
                toast.success("FAQ updated successfully");
                setTimeout(() => {
                    navigate('/all-faq');
                }, 1500);
            }

        } catch (error) {
            toast.error("Failed to update FAQ");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="bread">
                <div className="head">
                    <h4>Edit FAQ</h4>
                </div>
                <div className="links">
                    <Link to="/all-faq" className="add-new">Back <i className="fa-regular fa-circle-left"></i></Link>
                </div>
            </div>

            <div className="d-form">
                <form className="row g-3" onSubmit={handleSubmit}>
                    <div className="col-md-6">
                        <label className="form-label">Question</label>
                        <input type="text" name="question" className="form-control" value={formData.question} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Answer</label>
                        <input type="text" name="answer" className="form-control" value={formData.answer} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6 form-check">
                        <input type="checkbox" name="isActive" className="form-check-input" checked={formData.isActive} onChange={handleChange} />

                        <label className="form-check-label">Active</label>
                    </div>
                    <div className="col-12 text-center">
                        <button type="submit" disabled={isLoading} className={`${isLoading ? 'not-allowed' : 'allowed'}`}>
                            {isLoading ? "Updating..." : "Update FAQ"}
                        </button>
                    </div>
                </form>
            </div>

            <ToastContainer position="top-right" autoClose={2000} />
        </>
    );
}
