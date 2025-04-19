import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


const CreateVoucher = ({ onCreate }) => {
    const [isLoading, setIsLoading] = useState(false);
    return (
        <>

            <div className="bread">
                <div className="head">
                    <h4>Create Voucher</h4>
                </div>
                <div className="links">
                    <Link to="/all-voucher" className="add-new">Back <i className="fa-regular fa-circle-left"></i></Link>
                </div>
            </div>

            <div className="d-form">
                <form className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label">Coupon Code</label>
                        <input
                            type="text"
                            name="CouponeCode"
                            className="form-control"
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Discount Percentage</label>
                        <input
                            type="number"
                            name="HowMuchPercentageof"
                            className="form-control"
                        />
                    </div>
                    <div className="col-md-6 form-check">
                        <input
                            type="checkbox"
                            name="Active"
                            className="form-check-input"
                        />
                        <label className="form-check-label">Active</label>
                    </div>
                    <div className="col-12 text-center">
                        <button type="submit" disabled={isLoading} className={`${isLoading ? 'not-allowed':'allowed'}`}>
                            {isLoading ? "Please Wait..." : "Create Voucher"}
                        </button>
                    </div>
                    
                </form>

            </div>


        </>

    );
};

export default CreateVoucher;
