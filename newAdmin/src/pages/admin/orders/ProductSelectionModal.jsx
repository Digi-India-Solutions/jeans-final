import React from "react";
import Button from "../../../components/base/Button";

function ProductSelectionModal({
    setShowProductSelectionModal,
    filteredSubProducts,
    setFilteredSubProducts,
    productSearchQuery,
    setProductSearchQuery,
    newOrderForm,
    setNewOrderForm,
    setSelectedProductForOrder,
    selectedProductForOrder,
    subProducts,
    setProductQuantity,
    productQuantity,
    setTotalPagesSubProduct,
    totalPagesSubProduct,
    setCurrentPageSubProduct,
    currentPageSubProduct

}) {
    // ✅ Ensure items array exists
    const safeItems = Array.isArray(newOrderForm?.items)
        ? newOrderForm.items
        : [];

    const selectProductForOrder = (product) => {
        setSelectedProductForOrder(product);
        setProductQuantity(1);
    };

    const addItemToOrder = () => {
        if (selectedProductForOrder && productQuantity > 0) {
            const totalStock = Object.values(
                selectedProductForOrder?.stock || {}
            ).reduce((sum, qty) => sum + (qty || 0), 0);

            if (productQuantity > totalStock) {
                alert(`Only ${totalStock} sets available`);
                return;
            }

            const newItem = {
                productId: selectedProductForOrder?._id,
                name: selectedProductForOrder?.name,
                quantity: productQuantity,
                price: selectedProductForOrder?.price,
            };

            setNewOrderForm({
                ...newOrderForm,
                items: [...safeItems, newItem],
            });

            setSelectedProductForOrder(null);
            setProductQuantity(1);
            setShowProductSelectionModal(false);
        }
    };

    const updateProductQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            // ✅ Remove item if qty is 0
            setNewOrderForm({
                ...newOrderForm,
                items: safeItems.filter((item) => item?.productId !== productId),
            });
        } else {
            const product = subProducts?.find((p) => p?._id === productId);
            if (!product) return;

            const existingItemIndex = safeItems.findIndex(
                (item) => item?.productId === productId
            );

            if (existingItemIndex >= 0) {
                // ✅ Update existing item
                const updatedItems = [...safeItems];
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    quantity: newQuantity,
                };
                setNewOrderForm({ ...newOrderForm, items: updatedItems });
            } else {
                // ✅ Add new item
                const newItem = {
                    productId: product?._id,
                    name: product?.name,
                    quantity: newQuantity,
                    singlePicPrice: product?.singlePicPrice,
                    pcsInSet: product?.pcsInSet,
                    availableSizes: normalizeSizes(product?.sizes),
                };
                setNewOrderForm({
                    ...newOrderForm,
                    items: [...safeItems, newItem],
                });
            }
        }
    };

    const getProductQuantity = (productId) => {
        const item = safeItems.find((item) => item?.productId === productId);
        return item ? item.quantity : 0;
    };

    const isProductSelected = (productId) =>
        safeItems.some((item) => item?.productId === productId);

    // ✅ Utility: normalize sizes to array
    const normalizeSizes = (sizes) => {
        if (Array.isArray(sizes)) return sizes;
        if (typeof sizes === "string") {
            try {
                const parsed = JSON.parse(sizes);
                if (Array.isArray(parsed)) return parsed;
            } catch {
                return sizes.split(",").map((s) => s.trim());
            }
        }
        return [];
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Select Product Sets</h2>
                        <button
                            onClick={() => {
                                setShowProductSelectionModal(false);
                                setFilteredSubProducts(subProducts);
                                setProductSearchQuery("");
                            }}
                            className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                        >
                            <i className="ri-close-line"></i>
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-4 relative">
                        <input
                            type="text"
                            value={productSearchQuery}
                            onChange={(e) => setProductSearchQuery(e.target.value)}
                            placeholder="Search by product name, parent product, or price..."
                            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        {productSearchQuery && (
                            <button
                                onClick={() => setProductSearchQuery("")}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <i className="ri-close-line"></i>
                            </button>
                        )}
                    </div>

                    {productSearchQuery && (
                        <div className="mt-2 text-sm text-gray-600">
                            {filteredSubProducts?.length} results found for "
                            {productSearchQuery}"
                        </div>
                    )}

                    {/* Product Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        {filteredSubProducts?.map((product) => {
                            const isSelected = isProductSelected(product?._id);
                            const currentQuantity = getProductQuantity(product?._id);
                            const availableSets = Math.floor((product?.lotStock || 0) / (product?.pcsInSet || 1));

                            return (
                                <div
                                    key={product?._id}
                                    className={`border rounded-lg p-4 transition-all ${isSelected
                                        ? "bg-green-50 border-green-300"
                                        : "bg-white border-gray-200"
                                        }`}
                                >
                                    {/* Image */}
                                    <div className="relative">
                                        <img
                                            src={product?.subProductImages?.[0]}
                                            alt={product?.name}
                                            className="w-full h-32 object-cover rounded-lg mb-3"
                                        />
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                                                <i className="ri-check-line text-sm"></i>
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <h3 className="font-medium text-gray-900 mb-1">
                                        {product?.name}
                                    </h3>
                                    <p className="text-sm text-blue-600 mb-2">
                                        Parent: {product?.productId?.productName}
                                    </p>
                                    <p className="text-lg font-semibold text-green-600 mb-2">
                                        ₹{product?.singlePicPrice} per piece
                                    </p>

                                    {/* Pcs in Set */}
                                    <div className="mb-1">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {product?.pcsInSet} pcs per set
                                        </span>
                                    </div>

                                    {/* Sizes */}
                                    <div className="mb-3">
                                        <div className="text-sm text-gray-600 mb-1">
                                            Available Sizes:
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {normalizeSizes(product?.sizes).map((size, idx) => (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                >
                                                    {size}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Stock */}
                                    <div className="text-sm text-gray-500 mb-3">
                                        Stock: {product?.lotStock} pcs ({availableSets} sets
                                        available)
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateProductQuantity(
                                                        product?._id,
                                                        Math.max(0, currentQuantity - 1)
                                                    )
                                                }
                                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                                                disabled={currentQuantity <= 0}
                                            >
                                                <i className="ri-subtract-line text-sm"></i>
                                            </button>
                                            <input
                                                type="number"
                                                min="0"
                                                max={availableSets}
                                                value={currentQuantity}
                                                onChange={(e) =>
                                                    updateProductQuantity(
                                                        product?._id,
                                                        parseInt(e.target.value) || 0
                                                    )
                                                }
                                                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateProductQuantity(
                                                        product?._id,
                                                        Math.min(availableSets, currentQuantity + 1)
                                                    )
                                                }
                                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                                                disabled={currentQuantity >= availableSets}
                                            >
                                                <i className="ri-add-line text-sm"></i>
                                            </button>
                                        </div>

                                        {isSelected && (
                                            <div className="flex items-center space-x-2 text-sm text-green-600">
                                                <i className="ri-check-line"></i>
                                                <span>Selected</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Total */}
                                    {currentQuantity > 0 && (
                                        <div className="mt-2 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                            Total: {currentQuantity} sets × {product?.pcsInSet} pcs ={" "}
                                            {currentQuantity * (product?.pcsInSet || 0)} pieces
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div>
                        {totalPagesSubProduct > 1 && (
                            <div className="flex justify-center mt-6">
                                <div className="flex space-x-2">
                                    <Button
                                        onClick={() => setCurrentPageSubProduct(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPageSubProduct === 1}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 disabled:opacity-50"
                                    >
                                        Previous
                                    </Button>

                                    {Array.from({ length: totalPagesSubProduct }, (_, i) => i + 1).map(page => (
                                        <Button
                                            key={page}
                                            onClick={() => setCurrentPageSubProduct(page)}
                                            className={`px-4 py-2 ${currentPageSubProduct === page
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700'}`}
                                        >
                                            {page}
                                        </Button>
                                    ))}

                                    <Button
                                        onClick={() => setCurrentPageSubProduct(prev => Math.min(prev + 1, totalPagesSubProduct))}
                                        disabled={currentPageSubProduct === totalPagesSubProduct}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 disabled:opacity-50"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Empty State */}
                    {filteredSubProducts?.length === 0 && (
                        <div className="text-center py-12">
                            <i className="ri-search-line text-4xl text-gray-400 mb-4"></i>
                            <p className="text-gray-500">
                                No products found matching your search criteria
                            </p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={() => {
                                setShowProductSelectionModal(false);
                                setFilteredSubProducts(subProducts);
                                setProductSearchQuery("");
                            }}
                            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductSelectionModal;
