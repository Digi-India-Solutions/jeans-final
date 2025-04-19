import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getData, postData, serverURL } from '../../services/FetchNodeServices';
import { Parser } from 'html-to-react';

const AllProduct = () => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage] = useState(1);

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const response = await getData(`api/product/get-all-products-with-pagination?pageNumber=${currentPage}`);
                if (response.success) {
                    setProducts(response.data || []);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
                toast.error("Failed to fetch products!");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [currentPage]);

    const handleDelete = async (productId) => {
        const confirm = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
        });

        if (confirm.isConfirmed) {
            try {
                const data = await postData(`api/product/delete-product/${productId}`);
                if (data.success) {
                    setProducts(products.filter(product => product._id !== productId));
                    toast.success("Product deleted successfully!");
                }
            } catch (error) {
                console.error("Error deleting product:", error);
                toast.error("Failed to delete product!");
            }
        }
    };

    const handleTypeChange = async (e, productId) => {
        const Type = e.target.value;

        try {
            const response = await postData('api/product/change-type', {
                productId,
                type: Type,
            });

            if (response.success) {
                const updatedProducts = products.map(product =>
                    product._id === productId ? { ...product, type: Type } : product
                );
                setProducts(updatedProducts);
                toast.success('Product Type status updated successfully');
            }
        } catch (error) {
            console.error("Error updating category status:", error);
            toast.error("Error updating category status");
        }
    };

    const handleCheckboxChange = async (e, productId) => {
        const updatedStatus = e.target.checked;

        try {
            const response = await postData('api/product/change-status', {
                productId,
                status: updatedStatus
            });

            if (response.success) {
                const updatedProducts = products.map(product =>
                    product._id === productId ? { ...product, status: updatedStatus } : product
                );
                setProducts(updatedProducts);
                toast.success('Product status updated successfully');
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Error updating product status");
        }
    };
    const handleCheckboxActiveChange = async (e, productId) => {
        const updatedStatus = e.target.checked;

        try {
            const response = await postData('api/product/change-Stock-status', {
                productId,
                isActive: updatedStatus
            });

            if (response.success) {
                const updatedProducts = products.map(product =>
                    product._id === productId ? { ...product, isActive: updatedStatus } : product
                );
                setProducts(updatedProducts);
                toast.success('Product Stock updated successfully');
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Error updating product status");
        }
    };

    const filteredProducts = products.filter(product =>
        product.productName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const typeOptions = [
        { _id: 'new', type: 'New Arrival' },
        { _id: 'featured', type: 'Featured Product' },
        { _id: 'best', type: 'Best Seller' }
    ];

    return (
        <>
            <ToastContainer />

            <div className="bread">
                <div className="head">
                    <h4>All Product List</h4>
                </div>
                <div className="links">
                    <Link to="/add-product" className="add-new">
                        Add New <i className="fa-solid fa-plus"></i>
                    </Link>
                </div>
            </div>

            <section className="main-table">
                <table className="table table-bordered table-striped table-hover">
                    <thead>
                        <tr>
                            <th>S No.</th>
                            <th>Product Name</th>
                            <th>Category Name</th>
                            <th>Product Image</th>
                            <th>Product Description</th>
                            <th>Show on HomePage</th>
                            <th>In Stock</th>
                            <th>Type</th>
                            <th>Color</th>
                            <th>Size</th>
                            <th>Price</th>
                            <th>Discount</th>
                            <th>Final Price</th>
                            <th>Tax</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="11" className="text-center">Loading...</td>
                            </tr>
                        ) : filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan="11" className="text-center">No products found.</td>
                            </tr>
                        ) : (
                            filteredProducts.map((product, index) => (
                                <tr key={product._id}>
                                    <td>{index + 1}</td>
                                    <td>{product.productName}</td>
                                    <td>{product?.categoryId?.map((n) => <div>{n?.name}</div>)}</td>
                                    <td>
                                        {product.images?.slice(0, 4).map((img, i) => (
                                            <img
                                                key={i}
                                                src={`${img}`}
                                                alt="Prod."
                                                style={{ width: "50px", height: "50px", objectFit: "cover", marginRight: "5px" }}
                                            />
                                        ))}
                                    </td>
                                    <td>{Parser().parse(product?.productDescription)}</td>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={product?.status}
                                            onChange={(e) => handleCheckboxChange(e, product._id)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={product?.isActive}
                                            onChange={(e) => handleCheckboxActiveChange(e, product?._id)}
                                        />
                                    </td>
                                    <td>
                                        {/* <select value={product.type} onChange={(e) => handleTypeChange(e, product._id)}>
                                            {typeOptions.map(option => (
                                                <option key={option.type} value={option.type}>{option.type}</option>
                                            ))}
                                        </select> */}
                                        {product?.type?.map((t) => <div>{t} ,</div>)}
                                    </td>
                                    <td>{product?.Variant?.map((v, i) => <div key={i}>{v?.color?.colorName} <div className="circle-color" style={{ backgroundColor: v.color.color }}></div></div>)}</td>
                                    <td>{product?.Variant?.map((v, i) => <div style={{ display: 'flex' }} key={i}>{v?.sizes?.map(s => <div >{s.size + " ,"}</div>)}</div>)}</td>
                                    <td>{product?.Variant?.map((v, i) => <div key={i}>{v?.price}</div>)}</td>
                                    <td>{product?.Variant?.map((v, i) => <div key={i}>{v?.discountPrice}</div>)}</td>
                                    <td>{product?.Variant?.map((v, i) => <div key={i}>{v?.finalPrice}</div>)}</td>
                                    <td>{product?.Variant?.map((v, i) => <div key={i}>{v?.tax}</div>)}</td>
                                    <td>
                                        <Link to={`/edit-product/${product._id}`} className="bt edit">
                                            Edit <i className="fa-solid fa-pen-to-square"></i>
                                        </Link>
                                        &nbsp;
                                        <button onClick={() => handleDelete(product._id)} className="bt delete">
                                            Delete <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </section>
        </>
    );
};

export default AllProduct;