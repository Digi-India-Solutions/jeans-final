import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import AdminLayout from '../../../../components/feature/AdminLayout';
import Card from '../../../../components/base/Card';
import Button from '../../../../components/base/Button';
import SubProductModel from './SubProductModel';
import ShowProductPrintModal from './ShowProductPrintModal';
import { getData, postData } from '../../../../services/FetchNodeServices';
import { toast, ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';

// ─── EAN-13 Helpers (outside component — never recreated) ────────────────────

const LEFT_L = [
  '0001101', '0011001', '0010011', '0111101', '0100011',
  '0110001', '0101111', '0111011', '0110111', '0001011',
];
const LEFT_G = [
  '0100111', '0110011', '0011011', '0100001', '0011101',
  '0111001', '0000101', '0010001', '0001001', '0010111',
];
const RIGHT = [
  '1110010', '1100110', '1101100', '1000010', '1011100',
  '1001110', '1010000', '1000100', '1001000', '1110100',
];
const FIRST_DIGIT_PATTERN = [
  'LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG',
  'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL',
];

const calculateEAN13CheckDigit = (digits) => {
  if (digits.length !== 12) return null;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * (i % 2 === 0 ? 1 : 3);
  }
  return ((10 - (sum % 10)) % 10).toString();
};

const validateEAN13 = (code) => {
  if (!/^\d{13}$/.test(code)) return false;
  return code[12] === calculateEAN13CheckDigit(code.slice(0, 12));
};

const generateRandomBarcode = () => {
  let d = Math.floor(Math.random() * 9 + 1).toString();
  for (let i = 0; i < 11; i++) d += Math.floor(Math.random() * 10);
  return d + calculateEAN13CheckDigit(d);
};

const generateEAN13SVG = (barcode) => {
  if (!barcode || barcode.length !== 13) return null;

  const fd = parseInt(barcode[0]);
  const lft = barcode.slice(1, 7);
  const rgt = barcode.slice(7, 13);
  const ptn = FIRST_DIGIT_PATTERN[fd];

  let bits = '101';
  for (let i = 0; i < 6; i++) bits += (ptn[i] === 'L' ? LEFT_L : LEFT_G)[parseInt(lft[i])];
  bits += '01010';
  for (let i = 0; i < 6; i++) bits += RIGHT[parseInt(rgt[i])];
  bits += '101';

  const bw = 2, bh = 50, pad = 8;
  const W = bits.length * bw + pad * 2;
  const H = bh + 28;

  let rects = '';
  for (let i = 0; i < bits.length; i++) {
    if (bits[i] === '1')
      rects += `<rect x="${pad + i * bw}" y="2" width="${bw}" height="${bh}" fill="black"/>`;
  }

  const display = `${barcode[0]}  ${barcode.slice(1, 7)}  ${barcode.slice(7)}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="white"/>
    ${rects}
    <text x="${W / 2}" y="${H - 4}" text-anchor="middle"
      font-family="monospace" font-size="11" fill="black" letter-spacing="1">${display}</text>
  </svg>`;
};

// ─── Default form state ───────────────────────────────────────────────────────

const DEFAULT_FORM = {
  name: '', color: '', productId: '', lotNumber: '', lotStock: '',
  pcsInSet: '', selectedSizes: [], singlePicPrice: '', description: '',
  stock: 'In Stock', images: [], barcode: '', dateOfOpening: '',
};

// ─── Debounce hook ────────────────────────────────────────────────────────────

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Status color helper ──────────────────────────────────────────────────────

const getStatusColor = (status) => {
  switch (status) {
    case 'In Stock': return 'bg-green-500 text-white';
    case 'Low Stock': return 'bg-yellow-500 text-yellow-800';
    case 'Out of Stock': return 'bg-red-500 text-white';
    default: return 'bg-gray-500 text-gray-800';
  }
};

const parseSizes = (sizes) => {
  try { return Array.isArray(sizes) ? sizes : JSON.parse(sizes || '[]'); }
  catch { return []; }
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function SubProductsManagement() {
  // ── Lists ──────────────────────────────────────────────────────────────────
  const [productList, setProductList] = useState([]);
  const [sizeList, setSizeList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);   // ✅ FIX: was missing
  const [subCategoriesList, setSubCategoriesList] = useState([]);  // ✅ FIX: was missing
  const [subProducts, setSubProducts] = useState([]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // ── Filters (raw — user typing) ────────────────────────────────────────────
  const [filters, setFilters] = useState({ subCategory: '', category: '', status: '', search: '' });
  const debouncedSearch = useDebounce(filters.search, 400); // ✅ debounced search

  // ── Modals / editing ───────────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedForPrint, setSelectedForPrint] = useState([]);
  const [printQuantities, setPrintQuantities] = useState({});
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [permiton, setPermiton] = useState({});
  const [loadingProducts, setLoadingProducts] = useState(false);

  const fileInputRef = useRef(null);

  const [user] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('JeansUser')); }
    catch { return null; }
  });

  // ─── Fetch helpers ──────────────────────────────────────────────────────────

  // ✅ FIX: fetchCategories now correctly sets state that exists
  const fetchCategories = useCallback(async () => {
    try {
      const response = await getData('api/mainCategory/get-all-main-categorys-with-pagination');
      if (response?.success) {
        setCategoryList(response?.data || []);
      } else {
        toast.error(response?.message || 'Failed to fetch categories');
      }
    } catch (error) {
      console.error('fetchCategories:', error);
      toast.error('Failed to fetch categories');
    }
  }, []);

  // ✅ FIX: fetchSubCategories now correctly sets state that exists
  const fetchSubCategories = useCallback(async (categoryId) => {
    if (!categoryId) {
      setSubCategoriesList([]);
      return;
    }
    try {
      const response = await getData(`api/category/get_category_by_main_category/${categoryId}`);
      if (response?.success) {
        setSubCategoriesList(response?.data || []);
      } else {
        toast.error(response?.message || 'Failed to fetch subcategories');
      }
    } catch (error) {
      console.error('fetchSubCategories:', error);
      toast.error('Failed to fetch subcategories');
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await getData('api/product/get-all-products');
      if (res.success) setProductList(res.data || []);
    } catch (err) {
      console.error('fetchProducts:', err);
    }
  }, []);

  const fetchSizes = useCallback(async () => {
    try {
      const res = await getData('api/size/get_all_sizes');
      if (res?.success) setSizeList(res.data || []);
    } catch (err) {
      console.error('fetchSizes:', err);
    }
  }, []);

  // ✅ Improved: uses debouncedSearch + individual filter params
  const fetchProductsWithPagination = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(filters.category && { category: filters.category }),
        ...(filters.subCategory && { subCategory: filters.subCategory }),
        ...(filters.status && { status: filters.status }),
      });
      const res = await getData(`api/subProduct/get-all-sub-products-with-pagination?${params}`);
      console.log("AAAAAAXXXXXAAAA===>", res)
      if (res.success) {
        setSubProducts(res.data || []);
        setTotalPages(res?.pagination?.totalPages || 1);
      } else {
        toast.error(res.message || 'Failed to fetch products');
      }
    } catch (err) {
      console.error('fetchProductsWithPagination:', err);
      toast.error('Network error — could not load products');
    } finally {
      setLoadingProducts(false);
    }
  }, [currentPage, debouncedSearch, filters.category, filters.subCategory, filters.status]);

  const fetchRoles = useCallback(async () => {
    if (!user?.role) return;
    try {
      const res = await postData('api/adminRole/get-single-role-by-role', { role: user.role });
      setPermiton(res?.data?.[0]?.permissions?.products || {});
    } catch (err) {
      console.error('fetchRoles:', err);
    }
  }, [user?.role]);

  // ─── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchProducts();
    fetchSizes();
    fetchCategories(); // ✅ FIX: was never called
  }, [fetchProducts, fetchSizes, fetchCategories]);

  // ✅ FIX: fetch subcategories when category filter changes
  useEffect(() => {
    fetchSubCategories(filters.category);
  }, [filters.category, fetchSubCategories]);

  // ✅ Reset to page 1 when filters or debounced search change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filters.category, filters.status]);

  useEffect(() => {
    fetchProductsWithPagination();
  }, [fetchProductsWithPagination]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // ─── Barcode ────────────────────────────────────────────────────────────────

  const handleGenerateBarcode = useCallback(() => {
    setFormData(prev => ({ ...prev, barcode: generateRandomBarcode() }));
  }, []);

  // ─── Image upload ────────────────────────────────────────────────────────────

  const handleImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
    if (!files.length) return;
    setUploadedFiles(prev => [...prev, ...files]);
    const urls = files.map(f => URL.createObjectURL(f));
    setFormData(prev => ({ ...prev, images: [...prev.images, ...urls] }));
  }, []);

  // ─── Filter helpers ───────────────────────────────────────────────────────────

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ subCategory:'',category: '', status: '', search: '' });
  }, []);

  const hasActiveFilters = useMemo(
    () => filters.category || filters.status || filters.search,
    [filters]
  );

  // ─── Modal handlers ──────────────────────────────────────────────────────────

  const handleAdd = useCallback(() => {
    setEditingItem(null);
    setFormData(DEFAULT_FORM);
    setUploadedFiles([]);
    setShowModal(true);
  }, []);

  const handleEdit = useCallback((item) => {
    setEditingItem(item);
    let parsedSizes = [];
    try {
      parsedSizes = Array.isArray(item.sizes) ? item.sizes : JSON.parse(item.sizes || '[]');
    } catch { parsedSizes = []; }

    setFormData({
      ...item,
      selectedSizes: parsedSizes,
      images: item?.subProductImages || [],
      productId: item?.productId?._id || '',
    });
    setUploadedFiles(item?.subProductImages || []);
    setShowModal(true);
  }, []);

  // ─── Delete ──────────────────────────────────────────────────────────────────

  const handleDelete = useCallback(async (productId) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await postData(`api/subProduct/delete-product/${productId}`);
      if (res.success) {
        fetchProductsWithPagination();
        toast.success('Product deleted successfully!');
      } else {
        toast.error(res.message || 'Failed to delete product');
      }
    } catch {
      toast.error('Failed to delete product');
    }
  }, [fetchProductsWithPagination]);

  // ─── Print ───────────────────────────────────────────────────────────────────

  const openPrintModal = useCallback((item) => {
    setSelectedForPrint([item]);
    setPrintQuantities({ [item._id]: 1 });
    setShowPrintModal(true);
  }, []);

  const openBulkPrintModal = useCallback(() => {
    const withBarcodes = subProducts.filter(item => item?.barcode);
    setSelectedForPrint(withBarcodes);
    const qtys = {};
    withBarcodes.forEach(item => { qtys[item._id] = 1; });
    setPrintQuantities(qtys);
    setShowPrintModal(true);
  }, [subProducts]);

  const updatePrintQuantity = useCallback((itemId, change) => {
    setPrintQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(1, Math.min(100, (prev[itemId] || 1) + change)),
    }));
  }, []);

  const handlePrint = useCallback(() => {
    const totalLabels = Object.values(printQuantities).reduce((s, q) => s + q, 0);
    if (totalLabels === 0) {
      alert('Please select at least one label to print');
      return;
    }

    let labelsHTML = '';
    selectedForPrint.forEach(item => {
      const qty = printQuantities[item._id] || 1;
      const svg = generateEAN13SVG(item.barcode) || '';
      for (let i = 0; i < qty; i++) {
        labelsHTML += `
          <div class="label">
            <div class="barcode-section">${svg}</div>
          </div>`;
      }
    });

    const printContent = `
      <html>
        <head>
          <title>Print Labels</title>
          <style>
            @media print {
              body { margin: 0; padding: 5mm; }
              * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            }
            body { font-family: Arial, sans-serif; margin: 0; padding: 5mm; background: white; }
            .labels-container { display: flex; flex-wrap: wrap; gap: 3mm; }
            .label {
              width: 101.6mm; height: 25.2mm; border: 0.5px solid #000;
              padding: 2mm; display: flex; align-items: center; justify-content: center;
              box-sizing: border-box; page-break-inside: avoid; background: white;
            }
            .barcode-section { display: flex; align-items: center; justify-content: center; width: 100%; }
            .barcode-section svg { height: 18mm; width: auto; }
          </style>
        </head>
        <body>
          <div class="labels-container">${labelsHTML}</div>
        </body>
      </html>`;

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'display:none;position:absolute;left:-9999px;';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open(); doc.write(printContent); doc.close();

    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
          setShowPrintModal(false);
        }, 1000);
      }, 500);
    };
  }, [printQuantities, selectedForPrint]);

  // ─── Memos ────────────────────────────────────────────────────────────────────

  const productsWithBarcodes = useMemo(
    () => subProducts.filter(i => i?.barcode),
    [subProducts]
  );

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <AdminLayout>
      <ToastContainer />
      <div className="p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sub-Products (Sets Management)</h1>
            <p className="text-gray-600 mt-1">
              Manage product sets with lot tracking, stock management, and EAN-13 barcode generation
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={openBulkPrintModal}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={productsWithBarcodes.length === 0}
            >
              <i className="ri-printer-line mr-2"></i>
              Bulk Print Labels
              {productsWithBarcodes.length > 0 && (
                <span className="ml-1 bg-green-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {productsWithBarcodes.length}
                </span>
              )}
            </Button>
            {permiton?.write && (
              <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white">
                <i className="ri-add-line mr-2"></i>Add Sub-Product Set
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  {filters.search && (
                    <button
                      onClick={() => handleFilterChange('search', '')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <i className="ri-close-line"></i>
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <div className="relative">
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
                  >
                    <option value="">All Categories</option>
                    {/* ✅ FIX: categoryList is now properly declared and populated */}
                    {categoryList.map(cat => (
                      <option key={cat?._id} value={cat?._id}>{cat?.mainCategoryName}</option>
                    ))}
                  </select>
                  <i className="ri-arrow-down-s-line absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                </div>
              </div>

              {/* ✅ NEW: Sub-category filter (shown when a category is selected) */}
              {filters.category && subCategoriesList.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Category</label>
                  <div className="relative">
                    <select
                      value={filters.subCategory || ''}
                      onChange={(e) => handleFilterChange('subCategory', e.target.value)}
                      className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
                    >
                      <option value="">All Sub-Categories</option>
                      {subCategoriesList.map(sc => (
                        <option key={sc?._id} value={sc?._id}>{sc?.categoryName || sc?.name}</option>
                      ))}
                    </select>
                    <i className="ri-arrow-down-s-line absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                  </div>
                </div>
              )}

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="relative">
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
                  >
                    <option value="">All Status</option>
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                  <i className="ri-arrow-down-s-line absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                </div>
              </div> */}
            </div>

            {/* ✅ Clear filters row */}
            {hasActiveFilters && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-gray-500">Active filters:</span>
                {filters.search && (
                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                    Search: {filters.search}
                    <button onClick={() => handleFilterChange('search', '')}><i className="ri-close-line"></i></button>
                  </span>
                )}
                {filters.category && (
                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                    {categoryList.find(c => c._id === filters.category)?.mainCategoryName || 'Category'}
                    <button onClick={() => handleFilterChange('category', '')}><i className="ri-close-line"></i></button>
                  </span>
                )}
                {filters.subCategory && (
                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                    {subCategoriesList.find(c => c._id === filters.subCategory)?.name || 'subCategory'}
                    <button onClick={() => handleFilterChange('subCategory', '')}><i className="ri-close-line"></i></button>
                  </span>
                )}
                
                {filters.status && (
                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                    {filters.status}
                    <button onClick={() => handleFilterChange('status', '')}><i className="ri-close-line"></i></button>
                  </span>
                )}
                <button
                  onClick={handleClearFilters}
                  className="ml-auto text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                >
                  <i className="ri-filter-off-line"></i> Clear all
                </button>
              </div>
            )}
          </div>
        </Card>

        {/* Loading skeleton */}
        {loadingProducts ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-gray-200 overflow-hidden animate-pulse">
                <div className="bg-gray-200 h-48 w-full" />
                <div className="p-4 space-y-3">
                  <div className="bg-gray-200 h-4 rounded w-3/4" />
                  <div className="bg-gray-200 h-3 rounded w-1/2" />
                  <div className="bg-gray-200 h-3 rounded w-2/3" />
                  <div className="flex gap-2 mt-4">
                    <div className="bg-gray-200 h-8 rounded flex-1" />
                    <div className="bg-gray-200 h-8 rounded w-10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : subProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <i className="ri-box-3-line text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-500">
              {hasActiveFilters ? 'No products match your filters' : 'No sub-products found'}
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              {hasActiveFilters
                ? 'Try adjusting or clearing your filters.'
                : 'Add your first sub-product set to get started.'}
            </p>
            <div className="flex gap-2 mt-4">
              {hasActiveFilters && (
                <Button onClick={handleClearFilters} className="bg-gray-100 text-gray-700">
                  <i className="ri-filter-off-line mr-1"></i>Clear Filters
                </Button>
              )}
              {permiton?.write && !hasActiveFilters && (
                <Button onClick={handleAdd} className="bg-blue-600 text-white">
                  <i className="ri-add-line mr-1"></i>Add Sub-Product Set
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                Showing <span className="font-semibold text-gray-700">{subProducts.length}</span> product{subProducts.length !== 1 ? 's' : ''}
                {totalPages > 1 && ` — Page ${currentPage} of ${totalPages}`}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {subProducts.map((item) => (
                <Card key={item._id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                  <div className="relative">
                    <img
                      src={
                        item?.subProductImages?.length > 0
                          ? item.subProductImages[0]
                          : 'https://readdy.ai/api/search-image?query=product%20set%20pieces%20fashion%20clean%20background&width=300&height=200&seq=placeholder&orientation=landscape'
                      }
                      alt={item?.color || 'Product'}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/300x200?text=No+Image';
                      }}
                    />
                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item?.stock)}`}>
                      {item?.stock}
                    </div>
                    <div className="absolute top-3 left-3 px-2 py-1 bg-blue-600 text-white rounded-full text-xs font-medium flex items-center">
                      <i className="ri-stack-line mr-1"></i>Set
                    </div>
                    {/* ✅ Image count badge */}
                    {item?.subProductImages?.length > 1 && (
                      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/50 text-white rounded text-xs">
                        <i className="ri-image-line mr-1"></i>{item.subProductImages.length}
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 truncate flex-1">{item?.color}</h3>
                      <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">{item?.lotNumber}</span>
                    </div>

                    <div className="text-sm text-gray-600 mb-3 space-y-0.5">
                      <p className="truncate">Parent: <span className="font-medium">{item?.productId?.productName}</span></p>
                      <p>Pcs in Set: <span className="font-semibold text-blue-600">{item?.pcsInSet}</span></p>
                      <p>Final Lot Price: <span className="font-semibold text-green-600">
                        ₹{((item?.singlePicPrice || 0) * (item?.pcsInSet || 0)).toLocaleString('en-IN')}
                      </span></p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                      <div>
                        <span className="text-gray-500 text-xs">Lot Stock:</span>
                        <p className="font-semibold text-purple-600">{item?.lotStock} pcs</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs">Single Pic Price:</span>
                        <p className="font-semibold">₹{item?.singlePicPrice?.toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    {item?.dateOfOpening && (
                      <div className="mb-3 text-sm">
                        <span className="text-gray-500 text-xs">Date of Opening: </span>
                        <span className="font-medium text-gray-700">{item.dateOfOpening.split('T')[0]}</span>
                      </div>
                    )}

                    {/* Barcode — inline SVG */}
                    {item?.barcode && validateEAN13(item.barcode) ? (
                      <div className="mb-3 p-2 bg-white border border-gray-200 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">EAN-13 Barcode:</div>
                        <div
                          className="flex justify-center mb-1"
                          dangerouslySetInnerHTML={{ __html: generateEAN13SVG(item.barcode) }}
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-gray-600">{item.barcode}</span>
                          <Button
                            onClick={() => openPrintModal(item)}
                            className="bg-green-50 text-green-600 hover:bg-green-100 text-xs px-2 py-1"
                          >
                            <i className="ri-printer-line mr-1"></i>Print
                          </Button>
                        </div>
                      </div>
                    ) : item?.barcode ? (
                      // ✅ Show invalid barcode warning instead of silently hiding
                      <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-700 flex items-center gap-1">
                        <i className="ri-error-warning-line"></i> Invalid barcode stored
                      </div>
                    ) : null}

                    {/* Sizes */}
                    <div className="mb-3">
                      <span className="text-xs text-gray-500">Available Sizes:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {parseSizes(item?.sizes).length > 0
                          ? parseSizes(item?.sizes).map((size, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {size}
                            </span>
                          ))
                          : <span className="text-xs text-gray-400 italic">No sizes listed</span>
                        }
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-2 border-t border-gray-100">
                      {permiton?.update && (
                        <Button
                          onClick={() => handleEdit(item)}
                          className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm"
                        >
                          <i className="ri-edit-line mr-1"></i>Edit
                        </Button>
                      )}
                      {!item?.barcode && (
                        <Button
                          onClick={() => openPrintModal(item)}
                          disabled
                          className="bg-gray-50 text-gray-400 text-sm px-3 cursor-not-allowed"
                          title="No barcode — edit to generate one"
                        >
                          <i className="ri-printer-line"></i>
                        </Button>
                      )}
                      {permiton?.delete && (
                        <Button
                          onClick={() => handleDelete(item._id)}
                          className="bg-red-50 text-red-600 hover:bg-red-100 px-3"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-1">
              <Button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-gray-100 text-gray-700 disabled:opacity-40"
              >
                <i className="ri-arrow-left-s-line"></i>
              </Button>

              {/* Smart pagination — show ellipsis for large page counts */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page =>
                  page === 1 || page === totalPages ||
                  Math.abs(page - currentPage) <= 2
                )
                .reduce((acc, page, idx, arr) => {
                  if (idx > 0 && page - arr[idx - 1] > 1) acc.push('...');
                  acc.push(page);
                  return acc;
                }, [])
                .map((page, idx) =>
                  page === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 py-2 text-gray-400 text-sm">…</span>
                  ) : (
                    <Button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm ${currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {page}
                    </Button>
                  )
                )
              }

              <Button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-gray-100 text-gray-700 disabled:opacity-40"
              >
                <i className="ri-arrow-right-s-line"></i>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showPrintModal && (
        <ShowProductPrintModal
          handlePrint={handlePrint}
          updatePrintQuantity={updatePrintQuantity}
          printQuantities={printQuantities}
          setPrintQuantities={setPrintQuantities}
          selectedForPrint={selectedForPrint}
          setShowPrintModal={setShowPrintModal}
          generateEAN13SVG={generateEAN13SVG}
        />
      )}

      {showModal && (
        <SubProductModel
          generateEAN13SVG={generateEAN13SVG}
          showModal={showModal}
          setUploadedFiles={setUploadedFiles}
          uploadedFiles={uploadedFiles}
          handleImageUpload={handleImageUpload}
          fileInputRef={fileInputRef}
          handleGenerateBarcode={handleGenerateBarcode}
          formData={formData}
          productList={productList}
          setProductList={setProductList}
          setFormData={setFormData}
          sizeList={sizeList}
          setShowModal={setShowModal}
          selectedForPrint={selectedForPrint}
          setSelectedForPrint={setSelectedForPrint}
          setEditingItem={setEditingItem}
          editingItem={editingItem}
          fetchProductsWithPagination={fetchProductsWithPagination}
        />
      )}
    </AdminLayout>
  );
}