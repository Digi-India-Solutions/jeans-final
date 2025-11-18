import { useEffect, useState } from 'react';
import AdminLayout from '../../../../components/feature/AdminLayout';
import Card from '../../../../components/base/Card';
import Button from '../../../../components/base/Button';
import { postData, getData } from '../../../../services/FetchNodeServices';
import Swal from "sweetalert2";

export default function CartManagement() {
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [carts, setCarts] = useState([]);

    const [selectedCart, setSelectedCart] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCart, setEditingCart] = useState(null);
    const [filters, setFilters] = useState({ customerType: '', search: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [createForm, setCreateForm] = useState({ customerId: '', selectedProducts: [] });

    const [editForm, setEditForm] = useState({ customerId: '', selectedProducts: [] });


    const fetchCustomers = async () => {
        try {
            const response = await getData("api/user/get-all-user");
            if (response.success) {
                setCustomers(response.data);
            }
        } catch (error) {
            console.error("Fetch users error:", error);
        }
    }

    const fetchProductsWithPagination = async () => {
        try {
            const response = await getData(`api/subProduct/get-all-sub-products`);
            if (response.success) {
                setProducts(response.data || []);
                // setTotalPagesSubProduct(response?.pagination?.totalPages || 1);
                // setFilteredSubProducts(response?.data || []);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const fetchCarts = async () => {
        try {
            const response = await getData(`api/card/get-all-card-with-pagination?pageNumber=${currentPage}`);
            console.log("SSSSSSSS==>SSSSSSS::=>", response)
            if (response?.success) {
                setCarts(response?.cards);
                setTotalPages(response?.totalPages || 1);
            }
        } catch (error) {
            console.error("Error fetching Carts:", error);
        }
    }
    useEffect(() => {
        fetchCustomers();
        fetchProductsWithPagination()
        fetchCarts()
    }, [])

    const handleViewDetails = (cart) => {
        console.log("SSSSSSS CART:=>", cart)
        setSelectedCart({
            ...cart,
            userId: cart.user,
            productId: [cart?.items],
            quantity: cart.quantity
        });
        setShowDetailsModal(true);
    };

    const handleCreateCart = () => {
        setCreateForm({
            customerId: '',
            selectedProducts: []
        });
        setShowCreateModal(true);
    };
    console.log(editingCart)
    const handleEditCart = (cart) => {
        setEditingCart({
            customerId: cart.userId._id || customers.find(c => c?.email === cart?.userId?.email)?._id || '',
            selectedProducts: [{
                productId: cart?.productId?._id,
                quantity: cart?.quantity || 1
            }]
        });

        setEditForm({
            cartId: cart._id,
            customerId: cart?.userId?._id || customers.find(c => c?.email === cart?.userId?.email)?._id || '',
            selectedProducts: [{
                productId: cart?.productId?._id,
                quantity: cart?.quantity || 1
            }]
        });
        setShowEditModal(true);
    };

    // const addProductToForm = (form, setForm) => {
    //     setForm({
    //         ...form,
    //         selectedProducts: [...form?.selectedProducts, { productId: '', quantity: 1 }]
    //     });
    // };

    const addProductToForm = (form, setForm) => {
        setForm({
            ...form,
            selectedProducts: [
                ...form.selectedProducts,
                { subProduct: "", quantity: 1, price: 0, status: "pending" }
            ]
        });
    };

    const updateProductInForm = (form, setForm, index, field, value, products = []) => {
        const updatedProducts = [...form.selectedProducts];

        // If productId / subProduct changes
        if (field === "productId" || field === "subProduct") {
            const selectedProduct = products.find((p) => p?._id === value);

            if (!selectedProduct) return;

            updatedProducts[index] = {
                ...updatedProducts[index],
                subProduct: value,
                price: Number(
                    selectedProduct?.filnalLotPrice ||
                    selectedProduct?.singlePicPrice ||
                    0
                ),
            };
        } else {
            // Update non-product fields (quantity, status, etc.)
            updatedProducts[index] = {
                ...updatedProducts[index],
                [field]: value,
            };
        }

        setForm({ ...form, selectedProducts: updatedProducts });
    };

    const removeProductFromForm = (form, setForm, index) => {
        setForm({
            ...form,
            selectedProducts: form.selectedProducts.filter((_, i) => i !== index)
        });
    };

    const createCart = async () => {
        const data = {
            user: createForm.customerId,
            items: createForm.selectedProducts.map(p => ({
                subProduct: p.subProduct,
                quantity: p.quantity,
                price: Number(p.price),
                status: "pending"
            })),
            totalAmount: createForm.selectedProducts.reduce(
                (sum, p) => sum + (Number(p.price) * Number(p.quantity)),
                0
            )
        }
        console.log("data===>", data)

        if (!createForm.customerId || createForm.selectedProducts.length === 0) return;

        try {
            // Loop through selectedProducts and post data
            const responses = await Promise.all(
                createForm.selectedProducts.map(item =>
                    postData("api/cart/create-cart", {
                        productId: item?.productId,
                        userId: createForm?.customerId,
                        status: true,
                        quantity: item?.quantity || 1, // ✅ include quantity if needed
                    })
                )
            );

            // console.log("Cart API responses: ", responses);

            // Reset form and close modal
            setShowCreateModal(false);
            setCreateForm({ customerId: "", selectedProducts: [] });
            fetchCarts()

        } catch (error) {
            console.error("Error creating cart: ", error);
        }
    };
    // console.log("editttt:=>", editForm)
    const updateCart = async () => {
        if (!editForm?.customerId || editForm?.selectedProducts?.length === 0) return;

        try {
            // Loop through selectedProducts and post data
            const responses = await Promise.all(
                editForm?.selectedProducts?.map(item =>
                    postData(`api/cart/update-cart/${editForm?.cart}`, {
                        productId: item?.productId,
                        userId: editForm?.customerId,
                        status: true,
                        quantity: item?.quantity || 1,
                    })
                )
            );
            // console.log("DDDDDDDD:=>", responses[0])
            if (responses[0].success === true) {
                setShowEditModal(false);
                setEditingCart(null);
                setEditForm({ customerId: '', selectedProducts: [] });
                fetchCarts()
            }

        } catch (error) {
            console.error("Error creating Cart: ", error);
        }
    };

    const removeFromCart = (cartId, itemId) => {
        setCarts(prev => prev.map(cart =>
            cart._id === cartId
                ? {
                    ...cart,
                    items: cart.items.filter(item => item.id !== itemId),
                    totalValue: cart.items
                        .filter(item => item.id !== itemId)
                        .reduce((sum, item) => sum + (item.price * item.quantity), 0)
                }
                : cart
        ));

        if (selectedCart && selectedCart.id === cartId) {
            setSelectedCart(prev => ({
                ...prev,
                items: prev.items.filter(item => item.id !== itemId),
                totalValue: prev.items
                    .filter(item => item.id !== itemId)
                    .reduce((sum, item) => sum + (item.price * item.quantity), 0)
            }));
        }
    };

    const clearCart = (cartId) => {
        if (confirm('Are you sure you want to clear this entire carts?')) {
            setCarts(prev => prev.map(cart =>
                cart.id === cartId
                    ? { ...cart, items: [], totalValue: 0 }
                    : cart
            ));

            if (selectedCart && selectedCart.id === cartId) {
                setShowDetailsModal(false);
                setSelectedCart(null);
            }
        }
    };

    const deleteCart = async (cartId) => {
        // if (confirm('Are you sure you want to delete this Cart ?')) {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You will not be able to deleted permanently this cart!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            try {
                let respons = await getData(`api/card/delete-card/${cartId}`)
                if (respons.success === true) {
                    fetchCarts()
                    setCarts(prev => prev.filter(cart => cart?._id !== cartId));

                }
            } catch (error) {
                console.log(error)
            }
            if (selectedCart && selectedCart._id === cartId) {
                setShowDetailsModal(false);
                setSelectedCart(null);
            }
        }
    };

    const sendCartReminder = (cart) => {
        alert(`Cart reminder sent to ${cart.customer.email}`);
    };

    const filteredCarts = carts.filter(cart => {
        return (
            (!filters.customerType || cart.customer.type === filters.customerType) &&
            (!filters.search ||
                cart.user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                cart.user.email.toLowerCase().includes(filters.search.toLowerCase())
            )
        );
    });

    // console.log("GGGGGGG:==>", selectedCart)
    return (
        <AdminLayout>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Cart Management</h1>
                        <p className="text-gray-600 mt-1">View and manage customer carts</p>
                    </div>
                    <div className="flex space-x-3">
                        {/* <Button
                            onClick={handleCreateCart}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <i className="ri-add-line mr-2"></i>
                            Create Cart
                        </Button> */}

                        {/* <Button variant="outline" size="md">
                            <i className="ri-mail-line mr-2"></i>
                            Send Bulk Reminders
                        </Button>
                        <Button variant="primary" size="md">
                            <i className="ri-download-line mr-2"></i>
                            Export Data
                        </Button> */}
                    </div>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                                <input
                                    type="text"
                                    placeholder="Search customers..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                            </div>
                            {/* <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
                                <div className="relative">
                                    <select
                                        value={filters.customerType}
                                        onChange={(e) => setFilters({ ...filters, customerType: e.target.value })}
                                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
                                    >
                                        <option value="">All Types</option>
                                        <option value="B2B">B2B</option>
                                        <option value="Retail">Retail</option>
                                    </select>
                                    <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                </div>
                            </div> */}
                        </div>
                    </div>
                </Card>

                {/* Cart Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCarts.map((cart) => {
                        const firstItem = cart.items?.[0];
                        const firstImage = firstItem?.subProduct?.subProductImages?.[0];

                        return (
                            <Card key={cart?._id} className="p-6">
                                {/* USER DETAILS */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{cart?.user?.name}</h3>
                                        <p className="text-sm text-gray-600">{cart?.user?.email}</p>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-sm text-gray-500">{cart?.items?.length} items</div>
                                    </div>
                                </div>

                                {/* ITEMS LIST PREVIEW */}
                                <div className="space-y-2 mb-4">
                                    {cart.items.slice(0, 2).map((item) => (
                                        <div key={item?._id} className="flex items-center space-x-3">
                                            <img
                                                src={item?.subProduct?.subProductImages?.[0]}
                                                alt={item?.subProduct?.name}
                                                className="w-10 h-10 object-cover rounded"
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {item?.subProduct?.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    ₹{item?.price} x {item?.quantity}
                                                </p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* MORE ITEMS COUNT */}
                                    {cart.items.length > 2 && (
                                        <div className="text-xs text-gray-500 text-center py-2">
                                            +{cart.items.length - 2} more items
                                        </div>
                                    )}
                                </div>

                                {/* LAST UPDATED */}
                                <div className="text-xs text-gray-500 mb-4">
                                    Last updated: {cart?.updatedAt?.split("T")[0]}
                                </div>

                                {/* ACTION BUTTONS */}
                                <div className="flex space-x-2">
                                    <Button
                                        onClick={() => handleViewDetails(cart)}
                                        className="flex-1 bg-blue-500 text-black hover:bg-blue-700 text-sm"
                                    >
                                        <i className="ri-eye-line mr-1"></i>
                                        View
                                    </Button>

                                    {/* <Button
                                        onClick={() => handleEditCart(cart)}
                                        className="bg-green-500 text-black hover:bg-green-800 px-3"
                                    >
                                        <i className="ri-edit-line"></i>
                                    </Button>

                                    <Button
                                        onClick={() => sendCartReminder(cart)}
                                        className="bg-purple-500 text-black hover:bg-purple-800 px-3"
                                    >
                                        <i className="ri-mail-line"></i>
                                    </Button> */}

                                    <Button
                                        onClick={() => deleteCart(cart?._id)}
                                        className="bg-red-500 text-black hover:bg-red-800 px-3"
                                    >
                                        <i className="ri-delete-bin-line"></i>
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {filteredCarts.length === 0 && (
                    <div className="text-center py-12">
                        <i className="ri-heart-line text-4xl text-gray-400 mb-4"></i>
                        <p className="text-gray-500">No Carts found matching your criteria</p>
                    </div>
                )}

                {/* Create cart Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">Create New Cart</h2>
                                    <button
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            setCreateForm({ customerId: '', selectedProducts: [] });
                                        }}
                                        className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                                    >
                                        <i className="ri-close-line"></i>
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Customer</label>
                                        <div className="relative">
                                            <select
                                                value={createForm.customerId}
                                                onChange={(e) => setCreateForm({ ...createForm, customerId: e.target.value })}
                                                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                                                required
                                            >
                                                <option value="">Choose a customer</option>
                                                {customers.map(customer => (
                                                    <option key={customer?._id} value={customer?._id}>
                                                        {customer?.name} - {customer?.email}
                                                    </option>
                                                ))}
                                            </select>
                                            <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <label className="block text-sm font-medium text-gray-700">Products</label>
                                            <Button
                                                onClick={() => addProductToForm(createForm, setCreateForm)}
                                                className="bg-blue-600 text-white hover:bg-blue-700 text-sm"
                                            >
                                                <i className="ri-add-line mr-1"></i>
                                                Add Product
                                            </Button>
                                        </div>

                                        <div className="space-y-3">
                                            {createForm.selectedProducts.map((selectedProduct, index) => {
                                                const product = products.find(product => product?._id === selectedProduct.productId);
                                                return (
                                                    <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                                                        <div className="flex-1">
                                                            <div className="relative">
                                                                <select
                                                                    value={selectedProduct.productId}
                                                                    onChange={(e) => {
                                                                        const productId = e.target.value;
                                                                        const product = products?.find(p => p?._id === productId);
                                                                        setCreateForm({ ...createForm, selectedProducts: [...createForm.selectedProducts[index], { productId: product._id, quantity: 1, price: product?.filnalLotPrice || product?.singlePicPrice || 0 }] });
                                                                    }}
                                                                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
                                                                >
                                                                    <option value="">Select Product</option>
                                                                    {products.map(product => (
                                                                        <option key={product?._id} value={product?._id}>
                                                                            {product?.name || product?.productId?.productName} - ₹{product?.singlePicPrice || product?.price} (Stock: {product?.stock})
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                                            </div>
                                                        </div>

                                                        {/* Product Image Preview */}
                                                        {selectedProduct.productId && (
                                                            <div className="w-12 h-12">
                                                                <img
                                                                    src={product?.productId?.images[0] || ''}
                                                                    alt="Product"
                                                                    className="w-full h-full object-cover rounded-lg"
                                                                />
                                                            </div>
                                                        )}

                                                        <div className="w-24">
                                                            <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                                                            <input
                                                                type="number"
                                                                value={selectedProduct.quantity}
                                                                onChange={(e) => updateProductInForm(createForm, setCreateForm, index, 'quantity', parseInt(e.target.value) || 1)}
                                                                min="1"
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-center"
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={() => removeProductFromForm(createForm, setCreateForm, index)}
                                                            className="text-red-500 hover:text-red-700 w-8 h-8 flex items-center justify-center"
                                                        >
                                                            <i className="ri-delete-bin-line"></i>
                                                        </button>
                                                    </div>
                                                )
                                            })}

                                            {createForm.selectedProducts.length === 0 && (
                                                <p className="text-gray-500 text-center py-4">No products added yet</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex space-x-3 mt-6">
                                    <Button
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            setCreateForm({ customerId: '', selectedProducts: [] });
                                        }}
                                        className="flex-1 bg-gray-900 text-gray-700 hover:bg-gray-600"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={createCart}
                                        className="flex-1 bg-blue-900 text-white-600 hover:bg-blue-500"
                                        disabled={!createForm.customerId || createForm.selectedProducts.length === 0}
                                    >
                                        Create Cart
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Cart Modal */}
                {showEditModal && editingCart && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">Edit Cart - {editingCart?.customer?.name}</h2>
                                    <button
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setEditingCart(null);
                                            setEditForm({ customerId: '', selectedProducts: [] });
                                        }}
                                        className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                                    >
                                        <i className="ri-close-line"></i>
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                                        <div className="relative">
                                            <select
                                                value={editForm?.customerId}
                                                onChange={(e) => setEditForm({ ...editForm, customerId: e.target.value })}
                                                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                                                required
                                            >
                                                <option value="">Choose a customer</option>
                                                {customers.map(customer => (
                                                    <option key={customer?._id} value={customer?._id}>
                                                        {customer?.name}  - {customer?.email}
                                                    </option>
                                                ))}
                                            </select>
                                            <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <label className="block text-sm font-medium text-gray-700">Products</label>
                                            <Button
                                                onClick={() => addProductToForm(editForm, setEditForm)}
                                                className="bg-blue-600 text-white hover:bg-blue-700 text-sm"
                                            >
                                                <i className="ri-add-line mr-1"></i>
                                                Add Product
                                            </Button>
                                        </div>

                                        <div className="space-y-3">
                                            {editForm?.selectedProducts?.map((selectedProduct, index) => {
                                                const product = products.find(product => product?._id === selectedProduct.productId);
                                                return (
                                                    <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                                                        <div className="flex-1">
                                                            <div className="relative">
                                                                <select
                                                                    value={selectedProduct?.productId}
                                                                    onChange={(e) => updateProductInForm(editForm, setEditForm, index, 'productId', e.target.value)}
                                                                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
                                                                >
                                                                    <option value="">Select Product</option>
                                                                    {products?.map(product => (
                                                                        <option key={product?._id} value={product?._id}>
                                                                            {product?.name || product?.productId?.productName} - ₹{product?.singlePicPrice || product?.price} (Stock: {product?.stock})
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                                            </div>
                                                        </div>

                                                        {/* Product Image Preview */}
                                                        {selectedProduct.productId && (
                                                            <div className="w-12 h-12">
                                                                <img
                                                                    src={product?.productId?.images[0] || ''}
                                                                    alt="Product"
                                                                    className="w-full h-full object-cover rounded-lg"
                                                                />
                                                            </div>
                                                        )}

                                                        <div className="w-24">
                                                            <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                                                            <input
                                                                type="number"
                                                                value={selectedProduct?.quantity}
                                                                onChange={(e) => updateProductInForm(editForm, setEditForm, index, 'quantity', parseInt(e.target.value) || 1)}
                                                                min="1"
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-center"
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={() => removeProductFromForm(editForm, setEditForm, index)}
                                                            className="text-red-500 hover:text-red-700 w-8 h-8 flex items-center justify-center"
                                                        >
                                                            <i className="ri-delete-bin-line"></i>
                                                        </button>
                                                    </div>)
                                            }
                                            )}

                                            {editForm.selectedProducts.length === 0 && (
                                                <p className="text-gray-500 text-center py-4">No products added yet</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex space-x-3 mt-6">
                                    <Button
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setEditingCart(null);
                                            setEditForm({ customerId: '', selectedProducts: [] });
                                        }}
                                        className="flex-1 bg-gray-600 text-gray-700 hover:bg-gray-800"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={updateCart}
                                        className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                                        disabled={!editForm?.customerId || editForm.selectedProducts.length === 0}
                                    >
                                        Update Cart
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Cart Details Modal */}
                {showDetailsModal && selectedCart && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">

                                {/* ------- HEADER ------- */}
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h2 className="text-xl font-semibold">{selectedCart?.user?.name}'s Cart</h2>
                                        <p className="text-gray-600">{selectedCart?.user?.email}</p>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setShowDetailsModal(false);
                                            setSelectedCart(null);
                                        }}
                                        className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                                    >
                                        <i className="ri-close-line"></i>
                                    </button>
                                </div>

                                {/* ------- SUMMARY ------- */}
                                <div className="mb-6">
                                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <span className="text-sm text-gray-600">Total Value:</span>
                                            <span className="text-xl font-bold text-green-600 ml-2">
                                                ₹{Number(selectedCart?.totalAmount).toLocaleString()}
                                            </span>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {selectedCart?.items?.length} items
                                            </p>
                                        </div>

                                        <div>
                                            <span className="text-sm text-gray-600">Items:</span>
                                            <span className="font-semibold ml-2">{selectedCart?.items?.length}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* ------- ITEMS LIST ------- */}
                                <div className="space-y-4">
                                    {selectedCart?.items?.map((item) => {
                                        const p = item?.subProduct;

                                        return (
                                            <div
                                                key={item?._id}
                                                className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                                            >
                                                <img
                                                    src={p?.subProductImages?.[0] || "/placeholder.png"}
                                                    alt={p?.name}
                                                    className="w-20 h-20 object-cover rounded-lg"
                                                />

                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900">
                                                        {p?.productId?.productName}
                                                    </h4>

                                                    <p className="text-sm text-gray-600">Lot: {p?.lotNumber}</p>
                                                    <p className="text-sm text-gray-600">Color: {p?.color}</p>

                                                    <p className="text-sm text-gray-600">
                                                        Sizes: {p?.sizes ? JSON.parse(p?.sizes).join(", ") : "N/A"}
                                                    </p>

                                                    <p className="text-sm text-gray-600">
                                                        Quantity: {item?.quantity}
                                                    </p>

                                                    <p className="text-lg font-semibold text-green-600">
                                                        ₹{Number(item?.price).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* ------- FOOTER BUTTONS ------- */}
                                {/* <div className="flex space-x-3 mt-6">
                                    <Button
                                        onClick={() => sendCartReminder(selectedCart)}
                                        className="flex-1 bg-green-600 text-white hover:bg-green-700"
                                    >
                                        <i className="ri-mail-line mr-2"></i>
                                        Send Reminder
                                    </Button>

                                    <Button
                                        onClick={() => {
                                            setShowDetailsModal(false);
                                            setSelectedCart(null);
                                        }}
                                        className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    >
                                        Close
                                    </Button>
                                </div> */}

                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
