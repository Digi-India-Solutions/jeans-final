import React, { useState, useCallback, useEffect } from 'react';
import Button from '../../../../components/base/Button';
import { toast } from 'react-toastify';
import { postData } from '../../../../services/FetchNodeServices';
import Select from "react-select";

function SubProductModel({
  formData,
  setFormData,
  productList,
  editingItem,
  handleGenerateBarcode,
  sizeList,
  setShowModal,
  uploadedFiles,
  generateEAN13SVG,
  fileInputRef,
  handleImageUpload,
  setEditingItem,
  fetchProductsWithPagination,
  setUploadedFiles
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Validate form fields
  const validateForm = useCallback(() => {
    const errors = {};

    if (!formData.color?.trim()) {
      errors.color = 'Color is required';
    }

    if (!formData.productId) {
      errors.productId = 'Parent product is required';
    }

    if (!formData.pcsInSet || formData.pcsInSet < 1) {
      errors.pcsInSet = 'Pieces in set must be at least 1';
    }

    if (!formData.lotStock || formData.lotStock < 0) {
      errors.lotStock = 'Lot stock must be a positive number';
    }

    if (!formData.singlePicPrice || formData.singlePicPrice < 0) {
      errors.singlePicPrice = 'Price must be a positive number';
    }

    if (!formData.barcode || formData.barcode.length !== 13) {
      errors.barcode = 'Valid barcode is required';
    }

    const totalImages = formData.images.length;
    if (totalImages < 3 || totalImages > 8) {
      errors.images = 'Please select between 3 to 8 images';
    }

    if (formData.selectedSizes.length === 0) {
      errors.selectedSizes = 'At least one size is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, uploadedFiles?.length]);

  console.log("DDDDDD=>", uploadedFiles)

  const removeImage = useCallback((index, isUploaded = false) => {
    // if (isUploaded) {
    // remove from uploadedFiles
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));

    // } else {
    // remove from formData.images
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    // }
  }, [setFormData, setUploadedFiles]);

  // Handle parent product selection
  const handleParentProductChange = useCallback((productId) => {
    const parentProduct = productList.find(p => p._id === productId);
    if (parentProduct) {
      setFormData(prev => ({
        ...prev,
        productId,
        singlePicPrice: parentProduct.price || '',
        lotNumber: parentProduct.productName || ''
      }));
    }
  }, [productList, setFormData]);

  // Handle size selection with duplicate prevention
  const handleSizeToggle = useCallback((size) => {
    // if (!formData.selectedSizes.includes(size?.size)) {
    setFormData(prev => ({
      ...prev, selectedSizes: [...prev.selectedSizes, size.size]
    }));
    // }
  }, [formData.selectedSizes, setFormData]);

  // Remove size from selection
  const removeSize = useCallback((indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      selectedSizes: prev.selectedSizes.filter((_, index) => index !== indexToRemove)
    }));
  }, [setFormData]);

  // Submit form data
  const handleSave = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setIsLoading(true);

    try {
      const submitFormData = new FormData();

      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'selectedSizes') {
          submitFormData.append(key, JSON.stringify(value));
        } else if (key !== 'images') {
          submitFormData.append(key, value);
        }
      });

      // Append uploaded files
      uploadedFiles.forEach(file => {
        submitFormData.append('subProductImages', file);
      });

      // Determine endpoint based on edit or create mode
      const endpoint = editingItem
        ? `api/subProduct/update-sub-product/${editingItem?._id}`
        : "api/subProduct/create-sub-product";

      const response = await postData(endpoint, submitFormData);
      console.log("ZZZZZZ:==>", response)
      if (response?.success === true) {
        fetchProductsWithPagination();
        toast.success(`Product ${editingItem ? 'updated' : 'created'} successfully!`);
        setShowModal(false);
        setEditingItem(null);
      } else {
        throw new Error(response?.message || `Failed to ${editingItem ? 'update' : 'create'} product`);
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate final price
  const finalPrice = formData?.singlePicPrice && formData?.pcsInSet
    ? (parseFloat(formData?.singlePicPrice) * parseInt(formData?.pcsInSet) || 0).toLocaleString()
    : '0';

  // Update final price when singlePicPrice or pcsInSet changes
  useEffect(() => {
    if (formData?.singlePicPrice && formData?.pcsInSet) {
      setFormData(prev => ({
        ...prev,
        filnalLotPrice: (parseFloat(formData?.singlePicPrice) * parseInt(formData?.pcsInSet) || 0)
      }));
    }
  }, [formData?.singlePicPrice, formData?.pcsInSet, setFormData]);

  console.log("DDDDDD=>", formData)
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">
          {editingItem ? 'Edit Sub-Product Set' : 'Add Sub-Product Set'}
        </h2>

        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  required
                />
                {formErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors?.name}</p>
                )}
              </div> */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="text"
                  value={formData.color || ''}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.color ? 'border-red-500' : 'border-gray-300'
                    }`} />
                {formErrors.color && (
                  <p className="text-red-500 text-xs mt-1">{formErrors?.color}</p>
                )}
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Product <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.productId || ''}
                    onChange={(e) => handleParentProductChange(e.target.value)}
                    className={`w-full px-3 py-2 pr-8 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${formErrors.productId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    required
                  >
                    <option value="">Select Parent Product</option>
                    {productList?.map(product => (
                      <option key={product._id} value={product._id}>
                        {product?.productName} ({product?.mainCategoryId?.mainCategoryName})
                      </option>
                    ))}
                  </select>
                  <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
                {formErrors.productId && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.productId}</p>
                )}
              </div> */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Product <span className="text-red-500">*</span>
                </label>

                <Select
                  options={productList?.map((product) => ({
                    value: product._id,
                    label: `${product.productName} (${product?.mainCategoryId?.mainCategoryName})`,
                  }))}

                  value={
                    formData.productId
                      ? {
                        value: formData.productId,
                        label:
                          productList?.find((p) => p._id === formData.productId)?.productName +
                          " (" +
                          productList?.find((p) => p._id === formData.productId)?.mainCategoryId
                            ?.mainCategoryName +
                          ")",
                      }
                      : null
                  }

                  onChange={(e) => handleParentProductChange(e.value)}

                  placeholder="Select Parent Product"
                  className="text-sm"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      borderColor: formErrors.productId ? "red" : "#d1d5db",
                      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
                      "&:hover": { borderColor: "#3b82f6" },
                    }),
                  }}
                />

                {formErrors.productId && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.productId}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lot Number
                  </label>
                  <input
                    type="text"
                    value={formData.lotNumber || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pcs in Set <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.pcsInSet || ''}
                    onChange={(e) => {
                      // Allow ONLY digits 0–9
                      const cleaned = e.target.value.replace(/[^0-9]/g, '');

                      setFormData({
                        ...formData,
                        pcsInSet: cleaned
                      });
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.pcsInSet ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="How many pieces per set"
                    required
                  />
                  {formErrors.pcsInSet && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.pcsInSet}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lot Stock (pcs) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lotStock || ''}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^0-9]/g, '');

                      setFormData({ ...formData, lotStock: cleaned })
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.lotStock ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Total pieces in stock"
                    required
                    min="0"
                  />
                  {formErrors.lotStock && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.lotStock}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Single Pic Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.singlePicPrice || ''}
                    onChange={(e) => setFormData({ ...formData, singlePicPrice: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50 ${formErrors.singlePicPrice ? 'border-red-500' : 'border-gray-300'
                      }`}
                    required
                    disabled
                    min="0"
                    step="0.01"
                  />
                  {formErrors.singlePicPrice && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.singlePicPrice}</p>
                  )}
                </div>
              </div>

              {/* <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    value={formData.color || ''}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Opening
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfOpening || ''}
                    onChange={(e) => setFormData({ ...formData, dateOfOpening: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div> */}

              {formData.singlePicPrice && formData.pcsInSet && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <label className="block text-sm font-medium text-green-700 mb-1">
                    Final Lot Price
                  </label>
                  <div className="text-lg font-bold text-green-600">
                    ₹{finalPrice}
                  </div>
                  <div className="text-xs text-green-600">
                    ₹{formData.singlePicPrice} × {formData.pcsInSet} pcs
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  placeholder="Product description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  maxLength="500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description?.length || 0}/500 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock
                </label>
                <div className="relative">
                  <select
                    value={formData.stock || 'In Stock'}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                  <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
              </div>
            </div>

            {/* Middle Column - EAN-13 Barcode */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  EAN-13 Barcode Generation <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-white">
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      onClick={handleGenerateBarcode}
                      className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 text-sm whitespace-nowrap"
                    >
                      <i className="ri-barcode-line mr-1"></i>
                      Generate Barcode
                    </Button>
                  </div>

                  {formData.barcode && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Generated Barcode (Editable)
                      </label>
                      <input
                        type="text"
                        value={formData.barcode}
                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono ${formErrors.barcode ? 'border-red-500' : 'border-gray-300'
                          }`}
                        maxLength="13"
                      />
                      {formErrors.barcode && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.barcode}</p>
                      )}
                      <div className="bg-white p-3 rounded border mt-2">
                        <img
                          src={generateEAN13SVG(formData.barcode)}
                          alt="EAN-13 Barcode"
                          className="w-full max-w-48 h-auto mx-auto"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Sizes <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    {sizeList?.map(size => (
                      <button
                        key={size?._id}
                        type="button"
                        onClick={() => handleSizeToggle(size)}
                        // disabled={formData.selectedSizes.includes(size.size)}
                        className={`px-3 py-2 text-sm border rounded-lg transition-colors ${formData.selectedSizes.includes(size.size)
                          ? 'bg-blue-100 border-blue-300 text-blue-800'
                          : 'border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                          }`}
                      >
                        {formData.selectedSizes.includes(size?.size) ? '✓ ' : '+ '}
                        {size?.size}
                      </button>
                    ))}
                  </div>

                  {formData.selectedSizes.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Selected Sizes:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {formData.selectedSizes.map((size, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                          >
                            {size}
                            <button
                              type="button"
                              onClick={() => removeSize(index)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              <i className="ri-close-line text-xs"></i>
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {formErrors.selectedSizes && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.selectedSizes}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Images */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Images <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-600 text-white hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <i className="ri-upload-2-line"></i>
                      <span>Upload Images</span>
                    </Button>
                    <span className="text-sm text-gray-500">
                      {formData?.images?.length} image
                      {(formData?.images?.length) !== 1 ? 's' : ''} selected
                    </span>
                  </div>

                  {(formData?.images?.length > 0) && (
                    <div className="grid grid-cols-2 gap-3">

                      {/* {formData?.images?.map((image, index) => (
                        <div key={`existing-${index}`} className="relative">
                          <img src={image} alt={`Product ${index + 1}`} className="w-full h-20 object-cover rounded-lg border border-gray-200" />
                          <button
                            type="button"
                            onClick={() => removeImage(index, false)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            <i className="ri-close-line"></i>
                          </button>
                        </div>
                      ))} */}


                      {/* {uploadedFiles?.map((file, index) => (
                        <div key={`new-${index}`} className="relative">
                          <img
                            src={typeof file === 'string' && file?.startsWith('https://res.cloudinary.com') ? file : URL.createObjectURL(file)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index, true)}
                            //  onClick={() => removeImage(index, false)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            <i className="ri-close-line"></i>
                          </button>
                        </div>
                      ))} */}
                      {uploadedFiles?.map((file, index) => {
                        // Safely derive the preview URL
                        const isCloudinaryUrl =
                          typeof file === 'string' && file.startsWith('https://res.cloudinary.com');
                        const isFileObject = file instanceof File || file instanceof Blob;

                        const previewUrl = isCloudinaryUrl
                          ? file
                          : isFileObject
                            ? URL.createObjectURL(file)
                            : null;

                        // Skip rendering if we can't resolve a valid URL
                        if (!previewUrl) return null;

                        return (
                          <div key={`new-${index}`} className="relative">
                            <img
                              src={previewUrl}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                e.currentTarget.src = '/fallback-image.png'; // optional fallback
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index, true)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              <i className="ri-close-line"></i>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {formErrors.images && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.images}</p>
                  )}
                </div>
              </div>
            </div>

          </div>

          <div className="flex space-x-3 mt-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  {editingItem ? 'Updating...' : 'Creating...'}
                </span>
              ) : editingItem ? 'Update' : 'Create'}
            </Button>
            <Button
              type="button"
              onClick={() => { setUploadedFiles([]), setShowModal(false) }}
              className="flex-1 bg-gray-900 hover:bg-gray-400 text-gray-700"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SubProductModel;