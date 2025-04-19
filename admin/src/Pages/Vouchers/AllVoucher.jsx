import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';


const AllVoucher = () => {
    return (
        <>
            <div className="bread">
                <div className="head">
                    <h4>All Voucher </h4>
                </div>
                <div className="links">
                    <Link to="/add-voucher" className="add-new">Add New <i class="fa-solid fa-plus"></i></Link>
                </div>
            </div>
            <section className=" mt-2 main-table table-responsive">
                <table class="table table-bordered table-striped table-hover">
                    <thead>
                        <tr>
                            <th scope="col">Coupon Code</th>
                            <th scope="col">Discount Percentage</th>
                            <th scope="col">Status</th>
                            <th scope="col">Mark Active</th>
                            <th scope="col">Mark In-Active</th>
                            <th scope="col">Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                            <tr>
                                <td>
                                    <button className="btn btn-success btn-sm">Active</button>
                                </td>
                                <td>
                                    <button className="btn btn-danger btn-sm">De-Active</button>
                                </td>
                                <td>
                                    <Link className="bt delete" >Delete <i class="fa-solid fa-trash"></i></Link>
                                </td>
                            </tr>
                    </tbody>
                </table>
            </section>


        </>

    );
}

export default AllVoucher;
