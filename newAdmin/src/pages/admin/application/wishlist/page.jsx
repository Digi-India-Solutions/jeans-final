import { useEffect, useState } from 'react';
import AdminLayout from '../../../../components/feature/AdminLayout';
import Card from '../../../../components/base/Card';
import Button from '../../../../components/base/Button';
import { postData, getData } from '../../../../services/FetchNodeServices';

export default function WishlistManagement() {
  const [customers, setCustomers] = useState([]);

  const [products, setProducts] = useState([
    // {
    //   id: 1,
    //   name: 'Premium Skinny Jeans',
    //   price: 2499,
    //   image: 'https://readdy.ai/api/search-image?query=premium%20skinny%20jeans%20blue%20denim%20modern%20fashion%20clean%20background%20professional%20product%20photography&width=300&height=300&seq=wish1&orientation=squarish',
    //   stock: 150
    // },
    // {
    //   id: 2,
    //   name: 'Formal Cotton Shirt',
    //   price: 1899,
    //   image: 'https://readdy.ai/api/search-image?query=formal%20cotton%20shirt%20white%20business%20professional%20clean%20background%20product%20photography%20folded%20shirt&width=300&height=300&seq=wish2&orientation=squarish',
    //   stock: 200
    // },
    // {
    //   id: 3,
    //   name: 'Casual Denim Shirt',
    //   price: 1599,
    //   image: 'https://readdy.ai/api/search-image?query=casual%20denim%20shirt%20blue%20fashion%20modern%20clean%20background%20professional%20product%20photography%20hanging%20shirt&width=300&height=300&seq=wish3&orientation=squarish',
    //   stock: 80
    // },
    // {
    //   id: 4,
    //   name: 'Regular Fit Jeans',
    //   price: 2199,
    //   image: 'https://readdy.ai/api/search-image?query=regular%20fit%20jeans%20dark%20blue%20denim%20classic%20fashion%20clean%20background%20professional%20product%20photography&width=300&height=300&seq=wish4&orientation=squarish',
    //   stock: 0
    // },
    // {
    //   id: 5,
    //   name: 'Premium Polo Shirt',
    //   price: 1799,
    //   image: 'https://readdy.ai/api/search-image?query=premium%20polo%20shirt%20navy%20blue%20fashion%20modern%20clean%20background%20professional%20product%20photography&width=300&height=300&seq=wish5&orientation=squarish',
    //   stock: 120
    // }
  ]);

  const [wishlists, setWishlists] = useState([]);

  const [selectedWishlist, setSelectedWishlist] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingWishlist, setEditingWishlist] = useState(null);
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

  const fetchWishlists = async () => {
    try {
      const response = await getData(`api/wishlist/get-all-size-with-pagination?pageNumber=${currentPage}`);
      console.log("SSSSSSSS==>", response)
      if (response.success) {
        setWishlists(response.data);
        setTotalPages(response?.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching wishlists:", error);
    }
  }

  useEffect(() => {
    fetchCustomers();
    fetchProductsWithPagination()
    fetchWishlists()
  }, [])

  const handleViewDetails = (wishlist) => {
    setSelectedWishlist({
      ...wishlist,
      userId: wishlist.userId,
      productId: [wishlist?.productId],
      quantity: wishlist.quantity
    });
    setShowDetailsModal(true);
  };

  const handleCreateWishlist = () => {
    setCreateForm({
      customerId: '',
      selectedProducts: []
    });
    setShowCreateModal(true);
  };
  console.log(editingWishlist)
  const handleEditWishlist = (wishlist) => {
    setEditingWishlist({
      customerId: wishlist.userId._id || customers.find(c => c?.email === wishlist?.userId?.email)?._id || '',
      selectedProducts: [{
        productId: wishlist?.productId?._id,
        quantity: wishlist?.quantity || 1
      }]
    });

    setEditForm({
      wishlistId: wishlist._id,
      customerId: wishlist?.userId?._id || customers.find(c => c?.email === wishlist?.userId?.email)?._id || '',
      selectedProducts: [{
        productId: wishlist?.productId?._id,
        quantity: wishlist?.quantity || 1
      }]
    });
    setShowEditModal(true);
  };

  const addProductToForm = (form, setForm) => {
    setForm({
      ...form,
      selectedProducts: [...form?.selectedProducts, { productId: '', quantity: 1 }]
    });
  };

  const updateProductInForm = (form, setForm, index, field, value) => {
    const updatedProducts = form.selectedProducts.map((product, i) =>
      i === index ? { ...product, [field]: value } : product
    );
    setForm({ ...form, selectedProducts: updatedProducts });
  };

  const removeProductFromForm = (form, setForm, index) => {
    setForm({
      ...form,
      selectedProducts: form.selectedProducts.filter((_, i) => i !== index)
    });
  };

  const createWishlist = async () => {
    if (!createForm.customerId || createForm.selectedProducts.length === 0) return;

    try {
      // Loop through selectedProducts and post data
      const responses = await Promise.all(
        createForm.selectedProducts.map(item =>
          postData("api/wishlist/create-wishlist", {
            productId: item?.productId,
            userId: createForm?.customerId,
            status: true,
            quantity: item?.quantity || 1, // ✅ include quantity if needed
          })
        )
      );

      console.log("Wishlist API responses: ", responses);

      // Reset form and close modal
      setShowCreateModal(false);
      setCreateForm({ customerId: "", selectedProducts: [] });
      fetchWishlists()

    } catch (error) {
      console.error("Error creating wishlist: ", error);
    }
  };
  // console.log("editttt:=>", editForm)
  const updateWishlist = async () => {
    if (!editForm?.customerId || editForm?.selectedProducts?.length === 0) return;

    try {
      // Loop through selectedProducts and post data
      const responses = await Promise.all(
        editForm?.selectedProducts?.map(item =>
          postData(`api/wishlist/update-wishlist/${editForm?.wishlistId}`, {
            productId: item?.productId,
            userId: editForm?.customerId,
            status: true,
            quantity: item?.quantity || 1,
          })
        )
      );
      console.log("DDDDDDDD:=>", responses[0])
      if (responses[0].success === true) {
        setShowEditModal(false);
        setEditingWishlist(null);
        setEditForm({ customerId: '', selectedProducts: [] });
        fetchWishlists()
      }

    } catch (error) {
      console.error("Error creating wishlist: ", error);
    }
  };

  const removeFromWishlist = (wishlistId, itemId) => {
    setWishlists(prev => prev.map(wishlist =>
      wishlist._id === wishlistId
        ? {
          ...wishlist,
          items: wishlist.items.filter(item => item.id !== itemId),
          totalValue: wishlist.items
            .filter(item => item.id !== itemId)
            .reduce((sum, item) => sum + (item.price * item.quantity), 0)
        }
        : wishlist
    ));

    if (selectedWishlist && selectedWishlist.id === wishlistId) {
      setSelectedWishlist(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== itemId),
        totalValue: prev.items
          .filter(item => item.id !== itemId)
          .reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }));
    }
  };

  const clearWishlist = (wishlistId) => {
    if (confirm('Are you sure you want to clear this entire wishlist?')) {
      setWishlists(prev => prev.map(wishlist =>
        wishlist.id === wishlistId
          ? { ...wishlist, items: [], totalValue: 0 }
          : wishlist
      ));

      if (selectedWishlist && selectedWishlist.id === wishlistId) {
        setShowDetailsModal(false);
        setSelectedWishlist(null);
      }
    }
  };

  const deleteWishlist = async (wishlistId) => {
    if (confirm('Are you sure you want to delete this wishlist?')) {
      try {
        let respons = await getData(`api/wishlist/delete-wishlist/${wishlistId}`)
        if (respons.success === true) {
          fetchWishlists()
          setWishlists(prev => prev.filter(wishlist => wishlist._id !== wishlistId));

        }
      } catch (error) {
        console.log(error)
      }
      if (selectedWishlist && selectedWishlist._id === wishlistId) {
        setShowDetailsModal(false);
        setSelectedWishlist(null);
      }
    }
  };

  const sendWishlistReminder = (wishlist) => {
    alert(`Wishlist reminder sent to ${wishlist.customer.email}`);
  };

  const filteredWishlists = wishlists.filter(wishlist => {
    return (
      (!filters.customerType || wishlist.customer.type === filters.customerType) &&
      (!filters.search ||
        wishlist.customer.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        wishlist.customer.email.toLowerCase().includes(filters.search.toLowerCase())
      )
    );
  });

  console.log("GGGGGGG:==>", products)
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Wishlist Management</h1>
            <p className="text-gray-600 mt-1">View and manage customer wishlists</p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={handleCreateWishlist}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <i className="ri-add-line mr-2"></i>
              Create Wishlist
            </Button>
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
              <div>
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
              </div>
            </div>
          </div>
        </Card>

        {/* Wishlist Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredWishlists.map(wishlist => {
            console.log("FFFFFFFFFFFFF:=>", wishlist)
            const images = wishlist?.productId?.subProductImages?.[0]
              ? wishlist?.productId?.subProductImages[0].split(",")
              : [];
            console.log("FFFFFFFFFFFFF:=>", wishlist)
            return (
              <Card key={wishlist?._id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{wishlist?.userId?.name}</h3>
                    <p className="text-sm text-gray-600">{wishlist?.userId?.email}</p>
                    {/* <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${wishlist.customer.type === 'B2B'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
                    }`}>
                    {wishlist.customer.type}
                  </span> */}
                  </div>
                  <div className="text-right">
                    {/* <div className="text-lg font-bold text-green-600">₹{wishlist.totalValue.toLocaleString()}</div> */}
                    <div className="text-sm text-gray-500">{wishlist?.items?.length} items</div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {wishlist?.items?.length > 0 && wishlist?.items?.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <img
                        src={item?.productId?.subProductImages[0]}
                        alt={item?.productId?.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{`${item?.productId?.color} / ${item?.productId?.lotNumber}`}</p>
                        <p className="text-xs text-gray-500">₹{item?.productId?.singlePicPrice}</p>
                      </div>
                    </div>
                  ))}

                  {/* {wishlist.items.slice(0, 2).map(item => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">₹{item.price} x {item.quantity}</p>
                    </div>
                  </div>
                ))} */}
                  {wishlist?.productId?.length > 2 && (
                    <div className="text-xs text-gray-500 text-center py-2">
                      +{wishlist?.items?.length - 2} more items
                    </div>
                  )}
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  Last updated: {wishlist?.updatedAt?.split("T")[0]}
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleViewDetails(wishlist)}
                    className="flex-1 bg-blue-500 text-blue-600 hover:bg-blue-700 text-sm"
                  >
                    <i className="ri-eye-line mr-1"></i>
                    View
                  </Button>
                  {/* <Button
                    onClick={() => handleEditWishlist(wishlist)}
                    className="bg-green-500 text-green-600 hover:bg-green-800 px-3"
                  >
                    <i className="ri-edit-line"></i>
                  </Button>
                  <Button
                    onClick={() => sendWishlistReminder(wishlist)}
                    className="bg-purple-500 text-purple-600 hover:bg-purple-800 px-3"
                  >
                    <i className="ri-mail-line"></i>
                  </Button> */}
                  <Button
                    onClick={() => deleteWishlist(wishlist?._id)}
                    className="bg-red-500 text-red-600 hover:bg-red-800 px-3"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </Button>
                </div>
              </Card>)
          }
          )}
        </div>

        {filteredWishlists.length === 0 && (
          <div className="text-center py-12">
            <i className="ri-heart-line text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-500">No wishlists found matching your criteria</p>
          </div>
        )}

        {/* Create Wishlist Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Create New Wishlist</h2>
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
                                  onChange={(e) => updateProductInForm(createForm, setCreateForm, index, 'productId', e.target.value)}
                                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
                                >
                                  <option value="">Select Product</option>
                                  {products.map(product => (
                                    <option key={product?._id} value={product?._id}>
                                      {`${product?.color} / ${product?.productId?.productName}` || product?.productId?.productName} - ₹{product?.singlePicPrice || product?.price} (Stock: {product?.stock})
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
                    onClick={createWishlist}
                    className="flex-1 bg-blue-900 text-white-600 hover:bg-blue-500"
                    disabled={!createForm.customerId || createForm.selectedProducts.length === 0}
                  >
                    Create Wishlist
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Wishlist Modal */}
        {showEditModal && editingWishlist && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Edit Wishlist - {editingWishlist?.customer?.name}</h2>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingWishlist(null);
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
                      setEditingWishlist(null);
                      setEditForm({ customerId: '', selectedProducts: [] });
                    }}
                    className="flex-1 bg-gray-600 text-gray-700 hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={updateWishlist}
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                    disabled={!editForm?.customerId || editForm.selectedProducts.length === 0}
                  >
                    Update Wishlist
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wishlist Details Modal */}
        {showDetailsModal && selectedWishlist && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">

                {/* ---------- HEADER ---------- */}
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {selectedWishlist?.userId?.name}'s Wishlist
                    </h2>
                    <p className="text-gray-600">{selectedWishlist?.userId?.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedWishlist(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                {/* ---------- SUMMARY SECTION ---------- */}
                <div className="mb-6">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">

                    <div>
                      <span className="text-sm text-gray-600">Total Value:</span>

                      <span className="text-xl font-bold text-green-600 ml-2">
                        ₹
                        {selectedWishlist?.items
                          ?.reduce((acc, item) => acc + item?.quantity * item.productId?.singlePicPrice, 0)
                          .toLocaleString()}
                      </span>

                      <p className="text-xs text-gray-500 mt-1">
                        {selectedWishlist?.items?.length} total items
                      </p>
                    </div>

                    <div>
                      <span className="text-sm text-gray-600">Products:</span>
                      <span className="font-semibold ml-2">
                        {selectedWishlist?.items?.length}
                      </span>
                    </div>

                  </div>
                </div>

                {/* ---------- PRODUCT LIST ---------- */}
                <div className="space-y-4">

                  {selectedWishlist?.items?.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                    >
                      {/* PRODUCT IMAGE */}
                      <img
                        src={item?.productId?.subProductImages?.[0] || "/placeholder.png"}
                        alt={item?.productId?.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />

                      {/* PRODUCT DETAILS */}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {`${item?.productId?.color} / ${item?.productId?.lotNumber}` || item?.productId?.productName}
                        </h4>

                        <p className="text-sm text-gray-600">Lot: {item?.productId?.lotNumber}</p>
                        <p className="text-sm text-gray-600">Color: {item?.productId?.color}</p>

                        <p className="text-sm text-gray-600">
                          Sizes: {item?.productId?.sizes ? JSON.parse(item?.productId?.sizes).join(", ") : "N/A"}
                        </p>

                        <p className="text-sm text-gray-600">Quantity: {item?.quantity}</p>

                        <p className="text-lg font-semibold text-green-600">
                          ₹{(item?.quantity * item?.productId?.singlePicPrice).toLocaleString()}
                        </p>
                      </div>

                      {/* DELETE BUTTON */}
                      {/* 
              <button
                onClick={() => removeFromWishlist(selectedWishlist?._id, item?.productId?._id)}
                className="text-red-500 hover:text-red-700 p-2"
              >
                <i className="ri-delete-bin-line"></i>
              </button>
              */}
                    </div>
                  ))}

                </div>

                {/* ---------- FOOTER ---------- */}
                <div className="flex space-x-3 mt-6">
                  <Button
                    onClick={() => sendWishlistReminder(selectedWishlist)}
                    className="flex-1 bg-green-600 text-white hover:bg-green-700"
                  >
                    <i className="ri-mail-line mr-2"></i>
                    Send Reminder
                  </Button>

                  <Button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedWishlist(null);
                    }}
                    className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Close
                  </Button>
                </div>

              </div>
            </div>
          </div>
        )}


      </div>
    </AdminLayout>
  );
}
