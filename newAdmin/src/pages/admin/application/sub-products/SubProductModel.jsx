// import React, { useState, useCallback, useEffect } from 'react';
// import Button from '../../../../components/base/Button';
// import { toast } from 'react-toastify';
// import { postData } from '../../../../services/FetchNodeServices';
// import Select from "react-select";

// function SubProductModel({
//   formData,
//   setFormData,
//   productList,
//   editingItem,
//   handleGenerateBarcode,
//   sizeList,
//   setShowModal,
//   uploadedFiles,
//   generateEAN13SVG,
//   fileInputRef,
//   handleImageUpload,
//   setEditingItem,
//   fetchProductsWithPagination,
//   setUploadedFiles
// }) {
//   const [isLoading, setIsLoading] = useState(false);
//   const [formErrors, setFormErrors] = useState({});

//   // Validate form fields
//   const validateForm = useCallback(() => {
//     const errors = {};

//     if (!formData.color?.trim()) {
//       errors.color = 'Color is required';
//     }

//     if (!formData.productId) {
//       errors.productId = 'Parent product is required';
//     }

//     if (!formData.pcsInSet || formData.pcsInSet < 1) {
//       errors.pcsInSet = 'Pieces in set must be at least 1';
//     }

//     if (!formData.lotStock || formData.lotStock < 0) {
//       errors.lotStock = 'Lot stock must be a positive number';
//     }

//     if (!formData.singlePicPrice || formData.singlePicPrice < 0) {
//       errors.singlePicPrice = 'Price must be a positive number';
//     }

//     if (!formData.barcode || formData.barcode.length !== 13) {
//       errors.barcode = 'Valid barcode is required';
//     }

//     const totalImages = formData.images.length;
//     if (totalImages < 3 || totalImages > 8) {
//       errors.images = 'Please select between 3 to 8 images';
//     }

//     if (formData.selectedSizes.length === 0) {
//       errors.selectedSizes = 'At least one size is required';
//     }

//     setFormErrors(errors);
//     return Object.keys(errors).length === 0;
//   }, [formData, uploadedFiles?.length]);

//   console.log("DDDDDD=>", uploadedFiles)

//   const removeImage = useCallback((index, isUploaded = false) => {
//     // if (isUploaded) {
//     // remove from uploadedFiles
//     setUploadedFiles(prev => prev.filter((_, i) => i !== index));

//     // } else {
//     // remove from formData.images
//     setFormData(prev => ({
//       ...prev,
//       images: prev.images.filter((_, i) => i !== index)
//     }));
//     // }
//   }, [setFormData, setUploadedFiles]);

//   // Handle parent product selection
//   const handleParentProductChange = useCallback((productId) => {
//     const parentProduct = productList.find(p => p._id === productId);
//     if (parentProduct) {
//       setFormData(prev => ({
//         ...prev,
//         productId,
//         singlePicPrice: parentProduct.price || '',
//         lotNumber: parentProduct.productName || ''
//       }));
//     }
//   }, [productList, setFormData]);

//   // Handle size selection with duplicate prevention
//   const handleSizeToggle = useCallback((size) => {
//     // if (!formData.selectedSizes.includes(size?.size)) {
//     setFormData(prev => ({
//       ...prev, selectedSizes: [...prev.selectedSizes, size.size]
//     }));
//     // }
//   }, [formData.selectedSizes, setFormData]);

//   // Remove size from selection
//   const removeSize = useCallback((indexToRemove) => {
//     setFormData(prev => ({
//       ...prev,
//       selectedSizes: prev.selectedSizes.filter((_, index) => index !== indexToRemove)
//     }));
//   }, [setFormData]);

//   // Submit form data
//   const handleSave = async (e) => {
//     e.preventDefault();

//     if (!validateForm()) {
//       toast.error('Please fix the form errors');
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const submitFormData = new FormData();

//       // Append all form fields
//       Object.entries(formData).forEach(([key, value]) => {
//         if (key === 'selectedSizes') {
//           submitFormData.append(key, JSON.stringify(value));
//         } else if (key !== 'images') {
//           submitFormData.append(key, value);
//         }
//       });

//       // Append uploaded files
//       uploadedFiles.forEach(file => {
//         submitFormData.append('subProductImages', file);
//       });

//       // Determine endpoint based on edit or create mode
//       const endpoint = editingItem
//         ? `api/subProduct/update-sub-product/${editingItem?._id}`
//         : "api/subProduct/create-sub-product";

//       const response = await postData(endpoint, submitFormData);
//       console.log("ZZZZZZ:==>", response)
//       if (response?.success === true) {
//         fetchProductsWithPagination();
//         toast.success(`Product ${editingItem ? 'updated' : 'created'} successfully!`);
//         setShowModal(false);
//         setEditingItem(null);
//       } else {
//         throw new Error(response?.message || `Failed to ${editingItem ? 'update' : 'create'} product`);
//       }
//     } catch (error) {
//       console.error('Save error:', error);
//       toast.error(error.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Calculate final price
//   const finalPrice = formData?.singlePicPrice && formData?.pcsInSet
//     ? (parseFloat(formData?.singlePicPrice) * parseInt(formData?.pcsInSet) || 0).toLocaleString()
//     : '0';

//   // Update final price when singlePicPrice or pcsInSet changes
//   useEffect(() => {
//     if (formData?.singlePicPrice && formData?.pcsInSet) {
//       setFormData(prev => ({
//         ...prev,
//         filnalLotPrice: (parseFloat(formData?.singlePicPrice) * parseInt(formData?.pcsInSet) || 0)
//       }));
//     }
//   }, [formData?.singlePicPrice, formData?.pcsInSet, setFormData]);

//   console.log("DDDDDD=>", formData)
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
//         <h2 className="text-lg font-semibold mb-4">
//           {editingItem ? 'Edit Sub-Product Set' : 'Add Sub-Product Set'}
//         </h2>

//         <form onSubmit={handleSave}>
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             {/* Left Column - Basic Info */}
//             <div className="space-y-4">
//               {/* <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.name || ''}
//                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                   className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.name ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                   required
//                 />
//                 {formErrors.name && (
//                   <p className="text-red-500 text-xs mt-1">{formErrors?.name}</p>
//                 )}
//               </div> */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Color
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.color || ''}
//                   onChange={(e) => setFormData({ ...formData, color: e.target.value })}
//                   className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.color ? 'border-red-500' : 'border-gray-300'
//                     }`} />
//                 {formErrors.color && (
//                   <p className="text-red-500 text-xs mt-1">{formErrors?.color}</p>
//                 )}
//               </div>

//               {/* <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Parent Product <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <select
//                     value={formData.productId || ''}
//                     onChange={(e) => handleParentProductChange(e.target.value)}
//                     className={`w-full px-3 py-2 pr-8 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${formErrors.productId ? 'border-red-500' : 'border-gray-300'
//                       }`}
//                     required
//                   >
//                     <option value="">Select Parent Product</option>
//                     {productList?.map(product => (
//                       <option key={product._id} value={product._id}>
//                         {product?.productName} ({product?.mainCategoryId?.mainCategoryName})
//                       </option>
//                     ))}
//                   </select>
//                   <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
//                 </div>
//                 {formErrors.productId && (
//                   <p className="text-red-500 text-xs mt-1">{formErrors.productId}</p>
//                 )}
//               </div> */}

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Parent Product <span className="text-red-500">*</span>
//                 </label>

//                 <Select
//                   options={productList?.map((product) => ({
//                     value: product._id,
//                     label: `${product.productName} (${product?.mainCategoryId?.mainCategoryName})`,
//                   }))}

//                   value={
//                     formData.productId
//                       ? {
//                         value: formData.productId,
//                         label:
//                           productList?.find((p) => p._id === formData.productId)?.productName +
//                           " (" +
//                           productList?.find((p) => p._id === formData.productId)?.mainCategoryId
//                             ?.mainCategoryName +
//                           ")",
//                       }
//                       : null
//                   }

//                   onChange={(e) => handleParentProductChange(e.value)}

//                   placeholder="Select Parent Product"
//                   className="text-sm"
//                   styles={{
//                     control: (base, state) => ({
//                       ...base,
//                       borderColor: formErrors.productId ? "red" : "#d1d5db",
//                       boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
//                       "&:hover": { borderColor: "#3b82f6" },
//                     }),
//                   }}
//                 />

//                 {formErrors.productId && (
//                   <p className="text-red-500 text-xs mt-1">{formErrors.productId}</p>
//                 )}
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Lot Number
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.lotNumber || ''}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
//                     disabled
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Pcs in Set <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.pcsInSet || ''}
//                     onChange={(e) => {
//                       // Allow ONLY digits 0–9
//                       const cleaned = e.target.value.replace(/[^0-9]/g, '');

//                       setFormData({
//                         ...formData,
//                         pcsInSet: cleaned
//                       });
//                     }}
//                     className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.pcsInSet ? 'border-red-500' : 'border-gray-300'
//                       }`}
//                     placeholder="How many pieces per set"
//                     required
//                   />
//                   {formErrors.pcsInSet && (
//                     <p className="text-red-500 text-xs mt-1">{formErrors.pcsInSet}</p>
//                   )}
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Lot Stock (pcs) <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.lotStock || ''}
//                     onChange={(e) => {
//                       const cleaned = e.target.value.replace(/[^0-9]/g, '');

//                       setFormData({ ...formData, lotStock: cleaned })
//                     }}
//                     className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.lotStock ? 'border-red-500' : 'border-gray-300'
//                       }`}
//                     placeholder="Total pieces in stock"
//                     required
//                     min="0"
//                   />
//                   {formErrors.lotStock && (
//                     <p className="text-red-500 text-xs mt-1">{formErrors.lotStock}</p>
//                   )}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Single Pic Price <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="number"
//                     value={formData.singlePicPrice || ''}
//                     onChange={(e) => setFormData({ ...formData, singlePicPrice: e.target.value })}
//                     className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50 ${formErrors.singlePicPrice ? 'border-red-500' : 'border-gray-300'
//                       }`}
//                     required
//                     disabled
//                     min="0"
//                     step="0.01"
//                   />
//                   {formErrors.singlePicPrice && (
//                     <p className="text-red-500 text-xs mt-1">{formErrors.singlePicPrice}</p>
//                   )}
//                 </div>
//               </div>

//               {/* <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Color
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.color || ''}
//                     onChange={(e) => setFormData({ ...formData, color: e.target.value })}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Date of Opening
//                   </label>
//                   <input
//                     type="date"
//                     value={formData.dateOfOpening || ''}
//                     onChange={(e) => setFormData({ ...formData, dateOfOpening: e.target.value })}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//               </div> */}

//               {formData.singlePicPrice && formData.pcsInSet && (
//                 <div className="p-3 bg-green-50 rounded-lg">
//                   <label className="block text-sm font-medium text-green-700 mb-1">
//                     Final Lot Price
//                   </label>
//                   <div className="text-lg font-bold text-green-600">
//                     ₹{finalPrice}
//                   </div>
//                   <div className="text-xs text-green-600">
//                     ₹{formData.singlePicPrice} × {formData.pcsInSet} pcs
//                   </div>
//                 </div>
//               )}

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Description
//                 </label>
//                 <textarea
//                   value={formData.description || ''}
//                   onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                   rows="4"
//                   placeholder="Product description..."
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
//                   maxLength="500"
//                 />
//                 <p className="text-xs text-gray-500 mt-1">
//                   {formData.description?.length || 0}/500 characters
//                 </p>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Stock
//                 </label>
//                 <div className="relative">
//                   <select
//                     value={formData.stock || 'In Stock'}
//                     onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
//                     className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
//                   >
//                     <option value="In Stock">In Stock</option>
//                     <option value="Out of Stock">Out of Stock</option>
//                   </select>
//                   <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
//                 </div>
//               </div>
//             </div>

//             {/* Middle Column - EAN-13 Barcode */}
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   EAN-13 Barcode Generation <span className="text-red-500">*</span>
//                 </label>
//                 <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-white">
//                   <div className="flex space-x-2">
//                     <Button
//                       type="button"
//                       onClick={handleGenerateBarcode}
//                       className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 text-sm whitespace-nowrap"
//                     >
//                       <i className="ri-barcode-line mr-1"></i>
//                       Generate Barcode
//                     </Button>
//                   </div>

//                   {formData.barcode && (
//                     <div>
//                       <label className="block text-xs font-medium text-gray-600 mb-1">
//                         Generated Barcode (Editable)
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.barcode}
//                         onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
//                         className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono ${formErrors.barcode ? 'border-red-500' : 'border-gray-300'
//                           }`}
//                         maxLength="13"
//                       />
//                       {formErrors.barcode && (
//                         <p className="text-red-500 text-xs mt-1">{formErrors.barcode}</p>
//                       )}
//                       <div className="bg-white p-3 rounded border mt-2">
//                         <img
//                           src={generateEAN13SVG(formData.barcode)}
//                           alt="EAN-13 Barcode"
//                           className="w-full max-w-48 h-auto mx-auto"
//                         />
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Size Selection */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Available Sizes <span className="text-red-500">*</span>
//                 </label>
//                 <div className="space-y-3">
//                   <div className="grid grid-cols-4 gap-2">
//                     {sizeList?.map(size => (
//                       <button
//                         key={size?._id}
//                         type="button"
//                         onClick={() => handleSizeToggle(size)}
//                         // disabled={formData.selectedSizes.includes(size.size)}
//                         className={`px-3 py-2 text-sm border rounded-lg transition-colors ${formData.selectedSizes.includes(size.size)
//                           ? 'bg-blue-100 border-blue-300 text-blue-800'
//                           : 'border-gray-300 hover:bg-blue-50 hover:border-blue-300'
//                           }`}
//                       >
//                         {formData.selectedSizes.includes(size?.size) ? '✓ ' : '+ '}
//                         {size?.size}
//                       </button>
//                     ))}
//                   </div>

//                   {formData.selectedSizes.length > 0 && (
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Selected Sizes:
//                       </label>
//                       <div className="flex flex-wrap gap-2">
//                         {formData.selectedSizes.map((size, index) => (
//                           <span
//                             key={index}
//                             className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
//                           >
//                             {size}
//                             <button
//                               type="button"
//                               onClick={() => removeSize(index)}
//                               className="ml-2 text-blue-600 hover:text-blue-800"
//                             >
//                               <i className="ri-close-line text-xs"></i>
//                             </button>
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                   {formErrors.selectedSizes && (
//                     <p className="text-red-500 text-xs mt-1">{formErrors.selectedSizes}</p>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Right Column - Images */}
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Product Images <span className="text-red-500">*</span>
//                 </label>
//                 <div className="space-y-3">
//                   <div className="flex items-center space-x-2">
//                     <input
//                       type="file"
//                       ref={fileInputRef}
//                       onChange={handleImageUpload}
//                       multiple
//                       accept="image/*"
//                       className="hidden"
//                     />
//                     <Button
//                       type="button"
//                       onClick={() => fileInputRef.current?.click()}
//                       className="bg-blue-600 text-white hover:bg-blue-700 flex items-center space-x-2"
//                     >
//                       <i className="ri-upload-2-line"></i>
//                       <span>Upload Images</span>
//                     </Button>
//                     <span className="text-sm text-gray-500">
//                       {formData?.images?.length} image
//                       {(formData?.images?.length) !== 1 ? 's' : ''} selected
//                     </span>
//                   </div>

//                   {(formData?.images?.length > 0) && (
//                     <div className="grid grid-cols-2 gap-3">

//                       {/* {formData?.images?.map((image, index) => (
//                         <div key={`existing-${index}`} className="relative">
//                           <img src={image} alt={`Product ${index + 1}`} className="w-full h-20 object-cover rounded-lg border border-gray-200" />
//                           <button
//                             type="button"
//                             onClick={() => removeImage(index, false)}
//                             className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
//                           >
//                             <i className="ri-close-line"></i>
//                           </button>
//                         </div>
//                       ))} */}


//                       {/* {uploadedFiles?.map((file, index) => (
//                         <div key={`new-${index}`} className="relative">
//                           <img
//                             src={typeof file === 'string' && file?.startsWith('https://res.cloudinary.com') ? file : URL.createObjectURL(file)}
//                             alt={`Upload ${index + 1}`}
//                             className="w-full h-20 object-cover rounded-lg border border-gray-200"
//                           />
//                           <button
//                             type="button"
//                             onClick={() => removeImage(index, true)}
//                             //  onClick={() => removeImage(index, false)}
//                             className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
//                           >
//                             <i className="ri-close-line"></i>
//                           </button>
//                         </div>
//                       ))} */}
//                       {uploadedFiles?.map((file, index) => {
//                         // Safely derive the preview URL
//                         const isCloudinaryUrl =
//                           typeof file === 'string' && file.startsWith('https://res.cloudinary.com');
//                         const isFileObject = file instanceof File || file instanceof Blob;

//                         const previewUrl = isCloudinaryUrl
//                           ? file
//                           : isFileObject
//                             ? URL.createObjectURL(file)
//                             : null;

//                         // Skip rendering if we can't resolve a valid URL
//                         if (!previewUrl) return null;

//                         return (
//                           <div key={`new-${index}`} className="relative">
//                             <img
//                               src={previewUrl}
//                               alt={`Upload ${index + 1}`}
//                               className="w-full h-20 object-cover rounded-lg border border-gray-200"
//                               onError={(e) => {
//                                 e.currentTarget.src = '/fallback-image.png'; // optional fallback
//                               }}
//                             />
//                             <button
//                               type="button"
//                               onClick={() => removeImage(index, true)}
//                               className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
//                             >
//                               <i className="ri-close-line"></i>
//                             </button>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )}
//                   {formErrors.images && (
//                     <p className="text-red-500 text-xs mt-1">{formErrors.images}</p>
//                   )}
//                 </div>
//               </div>
//             </div>

//           </div>

//           <div className="flex space-x-3 mt-6">
//             <Button
//               type="submit"
//               disabled={isLoading}
//               className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isLoading ? (
//                 <span className="flex items-center justify-center">
//                   <i className="ri-loader-4-line animate-spin mr-2"></i>
//                   {editingItem ? 'Updating...' : 'Creating...'}
//                 </span>
//               ) : editingItem ? 'Update' : 'Create'}
//             </Button>
//             <Button
//               type="button"
//               onClick={() => { setUploadedFiles([]), setShowModal(false) }}
//               className="flex-1 bg-gray-900 hover:bg-gray-400 text-gray-700"
//             >
//               Cancel
//             </Button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default SubProductModel;


import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import Button from '../../../../components/base/Button';
import { toast } from 'react-toastify';
import { postData } from '../../../../services/FetchNodeServices';
import Select from 'react-select';

// ─── EAN-13 Helpers (outside component) ──────────────────────────────────────

const LEFT_L = [
  '0001101','0011001','0010011','0111101','0100011',
  '0110001','0101111','0111011','0110111','0001011'
];
const LEFT_G = LEFT_L.map(p => p.split('').map(b => b==='0'?'1':'0').join(''));
const RIGHT  = [
  '1110010','1100110','1101100','1000010','1011100',
  '1001110','1010000','1000100','1001000','1110100'
];
const FIRST_DIGIT_PATTERN = [
  'LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG',
  'LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL'
];

// ✅ FIXED: odd-index × 3 (EAN-13 standard)
const calculateEAN13CheckDigit = (digits) => {
  if (digits.length !== 12) return null;
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseInt(digits[i]) * (i % 2 === 0 ? 1 : 3);
  return ((10 - (sum % 10)) % 10).toString();
};

const validateEAN13 = (code) => {
  if (!/^\d{13}$/.test(code)) return false;
  return code[12] === calculateEAN13CheckDigit(code.slice(0, 12));
};

// ✅ FIXED: raw SVG string — no btoa crash
const generateEAN13SVG = (barcode) => {
  if (!barcode || barcode.length !== 13) return null;
  const fd  = parseInt(barcode[0]);
  const lft = barcode.slice(1, 7);
  const rgt = barcode.slice(7, 13);
  const ptn = FIRST_DIGIT_PATTERN[fd];

  let bits = '101';
  for (let i = 0; i < 6; i++) bits += (ptn[i]==='L' ? LEFT_L : LEFT_G)[parseInt(lft[i])];
  bits += '01010';
  for (let i = 0; i < 6; i++) bits += RIGHT[parseInt(rgt[i])];
  bits += '101';

  const bw = 2, bh = 50, pad = 8;
  const W = bits.length * bw + pad * 2;
  const H = bh + 28;

  let rects = '';
  for (let i = 0; i < bits.length; i++) {
    if (bits[i] === '1')
      rects += `<rect x="${pad + i*bw}" y="2" width="${bw}" height="${bh}" fill="black"/>`;
  }

  const display = `${barcode[0]}  ${barcode.slice(1,7)}  ${barcode.slice(7)}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="white"/>
    ${rects}
    <text x="${W/2}" y="${H-4}" text-anchor="middle"
      font-family="monospace" font-size="11" fill="black" letter-spacing="1">${display}</text>
  </svg>`;
};

// ─── Image preview URL helper ─────────────────────────────────────────────────

const getPreviewUrl = (file) => {
  if (typeof file === 'string') return file; // cloudinary / existing URL
  if (file instanceof File || file instanceof Blob) return URL.createObjectURL(file);
  return null;
};

// ─── Field component (reduces JSX repetition) ────────────────────────────────

const Field = ({ label, required, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const inputClass = (hasError) =>
  `w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    hasError ? 'border-red-500' : 'border-gray-300'
  }`;

// ─── Component ────────────────────────────────────────────────────────────────

function SubProductModel({
  formData,
  setFormData,
  productList,
  editingItem,
  handleGenerateBarcode,
  sizeList,
  setShowModal,
  uploadedFiles,
  setUploadedFiles,
  fileInputRef,
  handleImageUpload,
  setEditingItem,
  fetchProductsWithPagination,
}) {
  const [isLoading, setIsLoading]   = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const objectUrlsRef = useRef([]); // ✅ track created object URLs for cleanup

  // ✅ Revoke stale object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  // ─── Derived values ──────────────────────────────────────────────────────────

  // ✅ useMemo — only recalculates when price/qty changes
  const finalPrice = useMemo(() => {
    const price = parseFloat(formData?.singlePicPrice);
    const qty   = parseInt(formData?.pcsInSet);
    if (!price || !qty || isNaN(price) || isNaN(qty)) return '0';
    return (price * qty).toLocaleString('en-IN');
  }, [formData?.singlePicPrice, formData?.pcsInSet]);

  // ✅ Sync finalLotPrice into formData without causing infinite loop
  useEffect(() => {
    const price = parseFloat(formData?.singlePicPrice);
    const qty   = parseInt(formData?.pcsInSet);
    if (!price || !qty || isNaN(price) || isNaN(qty)) return;
    const calculated = price * qty;
    if (calculated !== formData?.finalLotPrice) {
      setFormData(prev => ({ ...prev, finalLotPrice: calculated }));
    }
  }, [formData?.singlePicPrice, formData?.pcsInSet]);

  // ✅ react-select options — memoized
  const productOptions = useMemo(() =>
    productList?.map(p => ({
      value: p._id,
      label: `${p.productName} (${p?.mainCategoryId?.mainCategoryName || 'N/A'})`,
    })), [productList]);

  const selectedProductOption = useMemo(() =>
    productOptions?.find(o => o.value === formData.productId) || null,
    [productOptions, formData.productId]);

  // ─── Validation ──────────────────────────────────────────────────────────────

  const validateForm = useCallback(() => {
    const errors = {};

    if (!formData.color?.trim())
      errors.color = 'Color is required';

    if (!formData.productId)
      errors.productId = 'Parent product is required';

    if (!formData.pcsInSet || parseInt(formData.pcsInSet) < 1)
      errors.pcsInSet = 'Pieces in set must be at least 1';

    if (formData.lotStock === '' || formData.lotStock === undefined || parseInt(formData.lotStock) < 0)
      errors.lotStock = 'Lot stock must be 0 or more';

    if (!formData.singlePicPrice || parseFloat(formData.singlePicPrice) <= 0)
      errors.singlePicPrice = 'Price must be greater than 0';

    if (!validateEAN13(formData.barcode))
      errors.barcode = `Invalid EAN-13 barcode${formData.barcode?.length === 13
        ? ` — expected check digit: ${calculateEAN13CheckDigit(formData.barcode.slice(0,12))}`
        : ' — must be 13 digits'}`;

    if (uploadedFiles.length < 3 || uploadedFiles.length > 8)
      errors.images = `Select between 3 and 8 images (currently ${uploadedFiles.length})`;

    if (!formData.selectedSizes?.length)
      errors.selectedSizes = 'At least one size is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, uploadedFiles]);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  // ✅ Only digits, no negatives
  const handleNumberInput = useCallback((field) => (e) => {
    const cleaned = e.target.value.replace(/[^0-9]/g, '');
    setFormData(prev => ({ ...prev, [field]: cleaned }));
  }, [setFormData]);

  const handleParentProductChange = useCallback((option) => {
    if (!option) return;
    const parent = productList.find(p => p._id === option.value);
    setFormData(prev => ({
      ...prev,
      productId:      option.value,
      singlePicPrice: parent?.price || '',
      lotNumber:      parent?.productName || '',
    }));
  }, [productList, setFormData]);

  // ✅ Toggle — prevent duplicates
  const handleSizeToggle = useCallback((size) => {
    setFormData(prev => {
      const already = prev.selectedSizes.includes(size.size);
      return {
        ...prev,
        selectedSizes: already
          ? prev.selectedSizes.filter(s => s !== size.size) // deselect
          : [...prev.selectedSizes, size.size],             // select
      };
    });
  }, [setFormData]);

  const removeSize = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      selectedSizes: prev.selectedSizes.filter((_, i) => i !== index),
    }));
  }, [setFormData]);

  const removeImage = useCallback((index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }, [setFormData, setUploadedFiles]);

  const handleClose = useCallback(() => {
    setUploadedFiles([]);
    setShowModal(false);
  }, [setUploadedFiles, setShowModal]);

  // ─── Submit ──────────────────────────────────────────────────────────────────

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the form errors before saving');
      return;
    }

    setIsLoading(true);
    try {
      const fd = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'selectedSizes') {
          fd.append(key, JSON.stringify(value));
        } else if (key !== 'images') {
          fd.append(key, value ?? '');
        }
      });

      // ✅ Only append File/Blob — skip existing URL strings
      uploadedFiles.forEach(file => {
        if (file instanceof File || file instanceof Blob) {
          fd.append('subProductImages', file);
        }
      });

      const endpoint = editingItem
        ? `api/subProduct/update-sub-product/${editingItem._id}`
        : 'api/subProduct/create-sub-product';

      const res = await postData(endpoint, fd);

      if (res?.success) {
        fetchProductsWithPagination();
        toast.success(`Product ${editingItem ? 'updated' : 'created'} successfully!`);
        setEditingItem(null);
        handleClose();
      } else {
        throw new Error(res?.message || `Failed to ${editingItem ? 'update' : 'create'} product`);
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Barcode SVG ─────────────────────────────────────────────────────────────

  const barcodeSVG = useMemo(() =>
    formData.barcode?.length === 13 ? generateEAN13SVG(formData.barcode) : null,
    [formData.barcode]);

  const barcodeValid = useMemo(() => validateEAN13(formData.barcode), [formData.barcode]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingItem ? 'Edit Sub-Product Set' : 'Add Sub-Product Set'}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSave} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Left Column — Basic Info ─────────────────────────── */}
            <div className="space-y-4">

              <Field label="Color" required error={formErrors.color}>
                <input
                  type="text"
                  value={formData.color || ''}
                  onChange={e => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className={inputClass(formErrors.color)}
                  placeholder="e.g. Red, Navy Blue"
                />
              </Field>

              <Field label="Parent Product" required error={formErrors.productId}>
                <Select
                  options={productOptions}
                  value={selectedProductOption}
                  onChange={handleParentProductChange}
                  placeholder="Search and select..."
                  isClearable
                  className="text-sm"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      borderColor: formErrors.productId ? '#ef4444' : '#d1d5db',
                      boxShadow: state.isFocused ? '0 0 0 2px #3b82f6' : 'none',
                      '&:hover': { borderColor: '#3b82f6' },
                      fontSize: '14px',
                    }),
                  }}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Lot Number">
                  <input
                    type="text"
                    value={formData.lotNumber || ''}
                    className={`${inputClass(false)} bg-gray-100 cursor-not-allowed`}
                    disabled
                    title="Auto-filled from parent product"
                  />
                </Field>
                <Field label="Pcs in Set" required error={formErrors.pcsInSet}>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.pcsInSet || ''}
                    onChange={handleNumberInput('pcsInSet')}
                    className={inputClass(formErrors.pcsInSet)}
                    placeholder="e.g. 6"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Lot Stock (pcs)" required error={formErrors.lotStock}>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.lotStock || ''}
                    onChange={handleNumberInput('lotStock')}
                    className={inputClass(formErrors.lotStock)}
                    placeholder="e.g. 100"
                  />
                </Field>
                <Field label="Single Pic Price" required error={formErrors.singlePicPrice}>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                    <input
                      type="text"
                      value={formData.singlePicPrice || ''}
                      className={`${inputClass(false)} pl-7 bg-gray-100 cursor-not-allowed`}
                      disabled
                      title="Auto-filled from parent product price"
                    />
                  </div>
                </Field>
              </div>

              {/* ✅ Final price — only shown when both values available */}
              {formData.singlePicPrice && formData.pcsInSet && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs font-medium text-green-700 mb-1">Final Lot Price</p>
                  <p className="text-xl font-bold text-green-600">₹{finalPrice}</p>
                  <p className="text-xs text-green-500 mt-1">
                    ₹{formData.singlePicPrice} × {formData.pcsInSet} pcs
                  </p>
                </div>
              )}

              <Field label="Date of Opening">
                <input
                  type="date"
                  value={formData.dateOfOpening ? formData.dateOfOpening.split('T')[0] : ''}
                  onChange={e => setFormData(prev => ({ ...prev, dateOfOpening: e.target.value }))}
                  className={inputClass(false)}
                />
              </Field>

              <Field label="Description">
                <textarea
                  value={formData.description || ''}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  maxLength={500}
                  placeholder="Product description..."
                  className={`${inputClass(false)} resize-none`}
                />
                <p className="text-xs text-gray-400 text-right mt-1">
                  {formData.description?.length || 0}/500
                </p>
              </Field>

              <Field label="Stock Status">
                <div className="relative">
                  <select
                    value={formData.stock || 'In Stock'}
                    onChange={e => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                    className={`${inputClass(false)} appearance-none pr-8`}
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                  <i className="ri-arrow-down-s-line absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                </div>
              </Field>
            </div>

            {/* ── Middle Column — Barcode + Sizes ──────────────────── */}
            <div className="space-y-4">

              {/* Barcode */}
              <Field label="EAN-13 Barcode" required error={formErrors.barcode}>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3">
                  <Button
                    type="button"
                    onClick={handleGenerateBarcode}
                    className="w-full bg-blue-600 text-white hover:bg-blue-700 text-sm"
                  >
                    <i className="ri-barcode-line mr-2"></i>Generate New Barcode
                  </Button>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Barcode number
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formData.barcode || ''}
                      onChange={e => setFormData(prev => ({
                        ...prev,
                        barcode: e.target.value.replace(/\D/g, '').slice(0, 13),
                      }))}
                      className={`${inputClass(formErrors.barcode)} font-mono tracking-wider`}
                      maxLength={13}
                      placeholder="13-digit EAN-13"
                    />
                    {/* ✅ Live check digit hint */}
                    {formData.barcode?.length === 12 && (
                      <p className="text-xs text-blue-600 mt-1">
                        Add check digit: {calculateEAN13CheckDigit(formData.barcode)}
                      </p>
                    )}
                  </div>

                  {/* ✅ FIXED: inline SVG — no broken base64 */}
                  {barcodeSVG && (
                    <div className={`bg-white p-3 rounded border ${barcodeValid ? 'border-green-300' : 'border-red-300'}`}>
                      <div
                        className="flex justify-center"
                        dangerouslySetInnerHTML={{ __html: barcodeSVG }}
                      />
                      <p className={`text-center text-xs mt-1 font-medium ${barcodeValid ? 'text-green-600' : 'text-red-500'}`}>
                        {barcodeValid ? '✓ Valid EAN-13' : '✗ Invalid check digit'}
                      </p>
                    </div>
                  )}
                </div>
              </Field>

              {/* Sizes */}
              <Field label="Available Sizes" required error={formErrors.selectedSizes}>
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    {sizeList?.map(size => {
                      const selected = formData.selectedSizes?.includes(size.size);
                      return (
                        <button
                          key={size._id}
                          type="button"
                          onClick={() => handleSizeToggle(size)}
                          className={`px-2 py-2 text-xs border rounded-lg transition-all font-medium ${
                            selected
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                          }`}
                        >
                          {size.size}
                        </button>
                      );
                    })}
                  </div>

                  {formData.selectedSizes?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">
                        Selected ({formData.selectedSizes.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {formData.selectedSizes.map((size, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {size}
                            <button
                              type="button"
                              onClick={() => removeSize(idx)}
                              className="hover:text-blue-900 ml-1"
                            >
                              <i className="ri-close-line text-xs"></i>
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Field>
            </div>

            {/* ── Right Column — Images ─────────────────────────────── */}
            <div className="space-y-4">
              <Field
                label={`Product Images (${uploadedFiles.length}/8)`}
                required
                error={formErrors.images}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
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
                      disabled={uploadedFiles.length >= 8}
                      className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      <i className="ri-upload-2-line mr-2"></i>
                      Upload Images
                    </Button>
                    <span className="text-xs text-gray-500">3–8 images required</span>
                  </div>

                  {/* ✅ Image grid with safe URL resolution */}
                  {uploadedFiles.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {uploadedFiles.map((file, index) => {
                        const url = getPreviewUrl(file);
                        if (!url) return null;
                        return (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Image ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                              onError={e => { e.currentTarget.style.display = 'none'; }}
                            />
                            {/* ✅ Overlay on hover */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg" />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 shadow-sm"
                            >
                              <i className="ri-close-line"></i>
                            </button>
                            <span className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                              {index + 1}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ✅ Progress indicator */}
                  {uploadedFiles.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            uploadedFiles.length < 3 ? 'bg-red-400' :
                            uploadedFiles.length <= 8 ? 'bg-green-500' : 'bg-red-400'
                          }`}
                          style={{ width: `${Math.min((uploadedFiles.length / 8) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{uploadedFiles.length}/8</span>
                    </div>
                  )}
                </div>
              </Field>
            </div>
          </div>

          {/* ── Footer Buttons ──────────────────────────────────────── */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="ri-loader-4-line animate-spin"></i>
                  {editingItem ? 'Updating...' : 'Creating...'}
                </span>
              ) : editingItem ? (
                <><i className="ri-save-line mr-2"></i>Update</>
              ) : (
                <><i className="ri-add-line mr-2"></i>Create</>
              )}
            </Button>
            <Button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
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