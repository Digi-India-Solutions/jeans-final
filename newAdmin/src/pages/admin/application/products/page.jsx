import { useState, useRef, useEffect } from 'react';
import AdminLayout from '../../../../components/feature/AdminLayout';
import Card from '../../../../components/base/Card';
import Button from '../../../../components/base/Button';
import { getData, postData } from '../../../../services/FetchNodeServices';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ProductsManagement() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filters, setFilters] = useState({ category: '', status: '', search: '' });
  const [categoryList, setCategoryList] = useState([]);
  const [subCategoriesList, setSubCategoriesList] = useState([]);
  const [formData, setFormData] = useState({ name: '', sku: '', categoryId: '', subcategoryId: '', type: 'New Arrival', price: '', images: [], status: true });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem("JeansUser")));
  const [permiton, setPermiton] = useState('');

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await getData("api/mainCategory/get-all-main-categorys-with-pagination");
      if (response?.success) {
        setCategoryList(response?.data || []);
      } else {
        toast.error(response?.message || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    }
  };

  // Fetch subcategories based on selected category
  const fetchSubCategories = async (categoryId) => {
    if (!categoryId) {
      setSubCategoriesList([]);
      return;
    }

    try {
      const response = await getData(`api/category/get_category_by_main_category/${categoryId}`);
      if (response?.success) {
        setSubCategoriesList(response?.data || []);
      } else {
        toast.error(response?.message || "Failed to fetch subcategories");
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      toast.error("Failed to fetch subcategories");
    }
  };

  // Fetch products with pagination
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await getData(`api/product/get-all-products-with-pagination?page=${currentPage}&limit=12&search=${filters.search || filters?.category || filters?.status}`);
      if (response.success) {
        setProducts(response.data || []);
        setTotalPages(response?.pagination?.totalPages || 1);
        setFilteredProducts(response.data || []);
      } else {
        toast.error(response.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter products based on filters
  // const applyFilters = () => {
  //   let filtered = products;

  //   // if (filters.category) {
  //   //   filtered = filtered.filter(p => p.mainCategoryId?._id === filters.category);
  //   // }

  //   // if (filters.status !== '') {
  //   //   const statusBool = filters.status === 'true';
  //   //   filtered = filtered.filter(p => p.status === statusBool);
  //   // }

  //   // if (filters.search) {
  //   //   filtered = filtered.filter(p =>
  //   //     p.productName.toLowerCase().includes(filters.search.toLowerCase()) ||
  //   //     p.sku.toLowerCase().includes(filters.search.toLowerCase())
  //   //   );
  //   // }

  //   setFilteredProducts(filtered);
  // };

  // Handle file upload for product images
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.type.startsWith('image/'));

    if (validFiles.length > 0) {
      setUploadedFiles([...uploadedFiles, ...validFiles]);

      const newPreviews = validFiles.map(file => URL.createObjectURL(file));
      setFormData({
        ...formData,
        images: [...formData.images, ...newPreviews]
      });
    }
  };

  // Remove image from product
  const removeImage = (index) => {
    // If it's a newly uploaded file, remove from uploadedFiles
    if (index >= formData.images.length - uploadedFiles.length) {
      const fileIndex = index - (formData.images.length - uploadedFiles.length);
      setUploadedFiles(uploadedFiles.filter((_, i) => i !== fileIndex));
    }

    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  // Handle form submission for create/update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const totalImages = formData.images.length;
    if (totalImages < 3 || totalImages > 8) {
      toast.error("Please select between 3 to 8 images");
      setIsLoading(false);
      return;
    }

    const submitFormData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'images') {
        if (key === 'subcategoryId') {
          formData?.subcategoryId.forEach(subcategory => {
            submitFormData.append('subcategoryId', subcategory);
          })
        } else {
          submitFormData.append(key, value);
        }
      }
    });

    // Append new images (files)
    uploadedFiles.forEach(file => {
      submitFormData.append('productImages', file);
    });

    try {
      let response;
      if (editingProduct) {
        response = await postData(`api/product/update-product/${editingProduct._id}`, submitFormData);
      } else {
        response = await postData('api/product/create-product', submitFormData);
      }

      if (response?.success) {
        toast.success(`Product ${editingProduct ? 'updated' : 'created'} successfully!`);
        fetchProducts();
        resetForm();
      } else {
        toast.error(response?.message || `Failed to ${editingProduct ? 'update' : 'create'} product`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      categoryId: '',
      subcategoryId: '',
      type: 'New Arrival',
      price: '',
      images: [],
      status: true
    });
    setUploadedFiles([]);
    setShowAddModal(false);
    setEditingProduct(null);
  };

  // Handle product edit
  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product?.productName || '',
      sku: product.sku || '',
      categoryId: product.mainCategoryId?._id || '',
      subcategoryId: product?.categoryId.map(cat => cat?._id) || product?.subcategoryId?._id || '',
      type: product.type || 'New Arrival',
      price: product?.price?.toString() || '',
      images: product?.images || [],
      status: product?.status || true
    });
    setShowAddModal(true);

    // Fetch subcategories for the product's category
    if (product.mainCategoryId?._id) {
      fetchSubCategories(product.mainCategoryId._id);
    }
  };

  // Handle product deletion
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

  // Toggle product status
  const toggleStatus = async (product) => {
    try {
      const newStatus = !product.status;
      const response = await postData(`api/product/change-status`, {
        productId: product._id,
        status: newStatus
      });

      if (response.success) {
        toast.success(`Product status updated to ${newStatus ? 'Active' : 'Inactive'}`);
        fetchProducts();
      } else {
        toast.error(response.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [currentPage, filters?.search, filters?.category, filters?.status]);


  useEffect(() => {
    if (formData.categoryId) {
      fetchSubCategories(formData.categoryId);
    } else {
      setSubCategoriesList([]);
      setFormData(prev => ({ ...prev, subcategoryId: '' }));
    }
  }, [formData.categoryId]);


  const fetchRoles = async () => {
    try {
      const response = await postData('api/adminRole/get-single-role-by-role', { role: user?.role });
      console.log("response.data:==>response.data:==>", response?.data[0]?.permissions)
      setPermiton(response?.data[0]?.permissions?.products)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [user?.role])


  console.log("GGGGGG:==>", filteredProducts);

  return (
    <AdminLayout>
      <div className="p-6">
        <ToastContainer />

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
            <p className="text-gray-600 mt-1">Manage your product catalog - Stock is managed at sub-product level</p>
          </div>
          {permiton?.write && <Button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
          >
            <i className="ri-add-line"></i>
            <span>Add Product</span>
          </Button>}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <div className="relative">
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
                  >
                    <option value="">All Categories</option>
                    {categoryList?.map(cat => (
                      <option key={cat?._id} value={cat?._id}>{cat?.mainCategoryName}</option>
                    ))}
                  </select>
                  <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="relative">
                  <select
                    value={filters?.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
                  >
                    <option value="">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                  <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
              </div>
              {/* <div className="flex items-end">
                <Button
                  onClick={applyFilters}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700"
                >
                  Apply Filters
                </Button>
              </div> */}
            </div>
          </div>
        </Card>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <Card key={product._id} className="overflow-hidden">
                  <div className="relative">
                    <img
                      src={product.images && product.images.length > 0 ? product.images[0] : 'https://readdy.ai/api/search-image?query=placeholder%20product%20image%20clean%20background&width=300&height=300&seq=placeholder&orientation=squarish'}
                      alt={product.productName}
                      className="w-full h-48 object-cover"
                    />
                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${product.status ? 'bg-green-700 text-white' : 'bg-gray-700 text-white'}`}>
                      {product.status ? "Active" : "Inactive"}
                    </div>
                    {product.images && product.images.length > 1 && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-black bg-opacity-50 rounded-full text-xs text-white">
                        +{product.images.length - 1} more
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{product?.productName}</h3>
                      <span className="text-sm text-gray-500">{product?.sku}</span>
                    </div>

                    <div className="text-sm text-gray-600 mb-3">
                      <p>{product?.mainCategoryId?.mainCategoryName} &gt; {`${product?.categoryId.map(cat => cat?.name).join(', ')}`}</p>

                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-500">Price:</span>
                        <p className="font-semibold text-green-600">₹{product?.price}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <p className="font-semibold text-blue-600">{product?.type || 'New Arrival'}</p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {permiton.update && <Button
                        onClick={() => handleEdit(product)}
                        className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm"
                      >
                        <i className="ri-edit-line mr-1"></i>
                        Edit
                      </Button>}
                     {permiton.update && <Button
                        onClick={() => toggleStatus(product)}
                        className={`flex-1 text-sm ${product?.status ? 'bg-red-500 text-red-900 hover:bg-red-900' : 'bg-green-500 text-green-600 hover:bg-green-900'}`}
                      >
                        <i className={`ri-${product.status ? 'close' : 'check'}-line mr-1`}></i>
                        {product.status ? 'Deactivate' : 'Activate'}
                      </Button>} 
                      {permiton.delete && <Button
                        onClick={() => handleDelete(product?._id)}
                        className="bg-red-500 text-red-600 hover:bg-red-900 px-3"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </Button>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-900 text-gray-700 disabled:opacity-90"
                  >
                    Previous
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 ${currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-600 text-gray-700'}`}
                    >
                      {page}
                    </Button>
                  ))}

                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-900 text-gray-700 disabled:opacity-50"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {/* All Products Table View */}
            <Card className="mt-8">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">All Products Overview</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          SKU
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProducts.map(product => (
                        <tr key={product._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img
                                  className="h-10 w-10 rounded object-cover"
                                  src={product?.images && product?.images.length > 0 ? product?.images[0] : 'https://readdy.ai/api/search-image?query=placeholder%20product&width=100&height=100&seq=placeholder&orientation=squarish'}
                                  alt={product?.productName}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{product?.productName}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.sku}
                          </td>
                          {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product?.mainCategoryId?.mainCategoryName} &gt; {`${product?.categoryId.map(cat => cat?.name).join(', ')}`}
                          </td> */}
                          {/* <div>
                            {product?.categoryId.map(cat => cat?.name).join(', ')}
                          </div> */}

                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-700">
                                {product?.mainCategoryId?.mainCategoryName}
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {product?.categoryId?.map((cat) => (
                                  <span
                                    key={cat?._id}
                                    className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700"
                                  >
                                    {cat?.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{product.price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.type || 'Regular'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.status ? 'bg-green-700 text-white' : 'bg-gray-700 text-white'}`}>
                              {product.status ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-900" >
                                Edit
                              </button>
                              <button onClick={() => toggleStatus(product)} className="text-yellow-600 hover:text-yellow-900">
                                {product.status ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => handleDelete(product._id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </>
        )}

        {filteredProducts.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <i className="ri-shopping-bag-line text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-500">No products found matching your criteria</p>
          </div>
        )}

        {/* Add/Edit Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name
                      </label>
                      <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                      <input type="text" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <div className="relative">
                        <select
                          value={formData.categoryId}
                          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, subcategoryId: '' })}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                          required
                        >
                          <option value="">Select Category</option>
                          {categoryList.map(cat => (
                            <option key={cat?._id} value={cat._id}>{cat?.mainCategoryName}</option>
                          ))}
                        </select>
                        <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      </div>
                    </div>
                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Category</label>
                      <div className="relative">
                        <select
                          value={formData.subcategoryId}
                          onChange={(e) => setFormData({ ...formData, subcategoryId: e.target.value })}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                          required
                          disabled={!formData.categoryId || subCategoriesList.length === 0}
                        >
                          <option value="">Select Sub-Category</option>
                          {subCategoriesList.map(subCat => (
                            <option key={subCat?._id} value={subCat?._id}>{subCat?.name}</option>
                          ))}
                        </select>
                        <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      </div>
                    </div> */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sub-Category
                      </label>
                      <div className="relative">
                        <select
                          value=""
                          onChange={(e) => {
                            const selected = e.target.value;
                            if (selected && !formData.subcategoryId.includes(selected)) {
                              setFormData({
                                ...formData,
                                subcategoryId: [...formData.subcategoryId, selected],
                              });
                            }
                          }}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                          disabled={!formData.categoryId || subCategoriesList.length === 0}
                        >
                          <option value="">Select Sub-Category</option>
                          {subCategoriesList.map((subCat) => (
                            <option key={subCat?._id} value={subCat?._id}>
                              {subCat?.name}
                            </option>
                          ))}
                        </select>
                        <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      </div>

                      {/* 🔹 Show selected subcategories below */}
                      {formData.subcategoryId?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {formData.subcategoryId.map((id) => {
                            const subCat = subCategoriesList.find((s) => s._id === id);
                            return (
                              <span
                                key={id}
                                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
                              >
                                {subCat?.name || "Unknown"}
                                <button
                                  type="button"
                                  className="ml-1 text-red-500 hover:text-red-700"
                                  onClick={() =>
                                    setFormData({
                                      ...formData,
                                      subcategoryId: formData?.subcategoryId.filter((subId) => subId !== id),
                                    })
                                  }
                                >
                                  ✕
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>

                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <div className="relative">
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                          required
                        >
                          <option value="New Arrival">New Arrival</option>
                          <option value="Featured Product">Featured Product</option>
                          <option value="Best Seller">Best Seller</option>
                          <option value="Regular">Regular</option>
                        </select>
                        <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                      <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required min="0" step="0.01" />
                    </div>
                  </div>

                  {/* Image Upload Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Images (3-8 images required)
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple accept="image/*" className="hidden" />
                        <Button type="button" onClick={() => fileInputRef.current?.click()} className="bg-blue-600 text-white hover:bg-blue-700 flex items-center space-x-2"                        >
                          <i className="ri-upload-2-line"></i>
                          <span>Upload Images</span>
                        </Button>
                        <span className="text-sm text-gray-500">
                          {formData.images.length} image{formData.images.length !== 1 ? 's' : ''} selected
                        </span>
                      </div>

                      {formData.images.length > 0 && (
                        <div className="grid grid-cols-3 gap-3">
                          {formData.images.map((image, index) => (
                            <div key={index} className="relative">
                              <img src={image} alt={`Product ${index + 1}`} className="w-full h-20 object-cover rounded-lg border border-gray-200" />
                              <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"                              >
                                <i className="ri-close-line"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div className="relative">
                      <select
                        value={formData.status.toString()}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value === 'true' })}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                      <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button type="button" onClick={resetForm} className="flex-1 bg-gray-900 text-gray-700 hover:bg-gray-600"                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Processing...' : editingProduct ? 'Update Product' : 'Add Product'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}