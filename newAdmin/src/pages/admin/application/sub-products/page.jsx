import { useState, useRef } from 'react';
import AdminLayout from '../../../../components/feature/AdminLayout';
import Card from '../../../../components/base/Card';
import Button from '../../../../components/base/Button';
import SubProductModel from './SubProductModel';
import ShowProductPrintModal from './ShowProductPrintModal';
import { useEffect } from 'react';
import { getData, postData } from '../../../../services/FetchNodeServices';
import { toast, ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';


export default function SubProductsManagement() {
  const [productList, setProductList] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sizeList, setSizeList] = useState([]);
  const [filters, setFilters] = useState({ category: '', status: '', search: '' });
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [subProducts, setSubProducts] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedForPrint, setSelectedForPrint] = useState([]);
  const [printQuantities, setPrintQuantities] = useState({});
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', color: '', productId: '', lotNumber: '', lotStock: '', pcsInSet: '', selectedSizes: [], singlePicPrice: '', description: '', stock: 'In Stock', images: [], barcode: '', dateOfOpening: '', });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const fetchProducts = async () => {
    try {
      const response = await getData(`api/product/get-all-products`);
      console.log("GG:=>", response)
      if (response.success) {
        setProductList(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      // toast.error("Failed to fetch products");
    }
  };

  const fetchSizes = async () => {
    try {
      const response = await getData(`api/size/get_all_sizes`);
      console.log("GGYYYY:=>lll", response)
      if (response?.success === true) {
        setSizeList(response?.data || []);
      }
    } catch (error) {
      console.error("Error fetching sizes:", error);
      // toast.error("Failed to fetch sizes");
    }
  };


  const fetchProductsWithPagination = async () => {
    try {
      const response = await getData(`api/subProduct/get-all-sub-products-with-pagination?page=${currentPage}&limit=12&search=${filters.search || filters.category || filters?.status}`);
      // console.log("XXXXXXXXXXX:=-=>", response)
      if (response.success) {
        setSubProducts(response.data || []);
        setTotalPages(response?.pagination?.totalPages || 1);
        setFilteredProducts(response.data || []);
      } else {
        toast.error(response.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };


  useEffect(() => {
    fetchProducts()
    fetchSizes();
  }, [])

  useEffect(() => {
    fetchProductsWithPagination();
  }, [currentPage, filters]);


  // EAN-13 check digit calculation
  const calculateEAN13CheckDigit = (digits) => {
    if (digits.length !== 12) return null;

    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(digits[i]);
      sum += (i % 2 === 0) ? digit : digit * 3;
    }

    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit.toString();
  };

  // Generate random 12-digit number
  const generateRandomBarcode = () => {
    let randomDigits = '';
    for (let i = 0; i < 12; i++) {
      randomDigits += Math.floor(Math.random() * 10).toString();
    }
    const checkDigit = calculateEAN13CheckDigit(randomDigits);
    return randomDigits + checkDigit;
  };

  // Generate EAN-13 SVG barcode
  const generateEAN13SVG = (barcode) => {
    if (!barcode || barcode.length !== 13) return '';

    // EAN-13 encoding patterns
    const leftPatterns = [
      '0001101', '0011001', '0010011', '0111101', '0100011',
      '0110001', '0101111', '0111011', '0110111', '0001011'
    ];

    const rightPatterns = [
      '1110010', '1100110', '1101100', '1000010', '1011100',
      '1001110', '1010000', '1000100', '1001000', '1110100'
    ];

    const firstDigitPatterns = [
      'LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG',
      'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'
    ];

    const guards = {
      start: '101',
      middle: '01010',
      end: '101'
    };

    const firstDigit = parseInt(barcode[0]);
    const leftDigits = barcode.substring(1, 7);
    const rightDigits = barcode.substring(7, 13);
    const pattern = firstDigitPatterns[firstDigit];

    let binaryString = guards.start;

    // Left side
    for (let i = 0; i < 6; i++) {
      const digit = parseInt(leftDigits[i]);
      if (pattern[i] === 'L') {
        binaryString += leftPatterns[digit];
      } else {
        // G pattern (inverted L)
        binaryString += leftPatterns[digit].split('').map(bit => bit === '0' ? '1' : '0').join('');
      }
    }

    binaryString += guards.middle;

    // Right side
    for (let i = 0; i < 6; i++) {
      const digit = parseInt(rightDigits[i]);
      binaryString += rightPatterns[digit];
    }

    binaryString += guards.end;

    // Generate SVG - Clean barcode with proper scaling
    const barWidth = 2;
    const barHeight = 50;
    const svgWidth = binaryString.length * barWidth;
    const svgHeight = barHeight + 30;

    let svgContent = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;

    // Draw bars
    for (let i = 0; i < binaryString.length; i++) {
      if (binaryString[i] === '1') {
        svgContent += `<rect x="${i * barWidth}" y="0" width="${barWidth}" height="${barHeight}" fill="black"/>`;
      }
    }

    // Add single set of digits below barcode - centered
    const fontSize = 12;
    const textY = barHeight + 20;
    svgContent += `<text x="${svgWidth / 2}" y="${textY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}" fill="black">${barcode}</text>`;

    svgContent += '</svg>';

    return `data:image/svg+xml;base64,${btoa(svgContent)}`;
  };

  const handleGenerateBarcode = () => {
    const newBarcode = generateRandomBarcode();
    setFormData(prev => ({
      ...prev,
      barcode: newBarcode
    }));
  };


  // Open print modal for single item
  const openPrintModal = (item) => {
    setSelectedForPrint([item]);
    setPrintQuantities({ [item?._id]: 1 });
    setShowPrintModal(true);
  };

  // Open bulk print modal
  const openBulkPrintModal = () => {
    const itemsWithBarcodes = subProducts.filter(item => item?.barcode);
    setSelectedForPrint(itemsWithBarcodes);
    const quantities = {};
    itemsWithBarcodes.forEach(item => {
      quantities[item?._id] = 1;
    });
    setPrintQuantities(quantities);
    setShowPrintModal(true);
  };

  // Update print quantity
  const updatePrintQuantity = (itemId, change) => {
    setPrintQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(1, Math.min(100, (prev[itemId] || 1) + change))
    }));
  };

  // Handle print execution with improved multi-label per page layout
  const handlePrint = () => {
    const totalLabels = Object.values(printQuantities).reduce((sum, qty) => sum + qty, 0);

    if (totalLabels === 0) {
      alert('Please select at least one label to print');
      return;
    }

    // Create print content optimized for thermal printers with multiple labels per page
    let printContent = `
      <html>
        <head>
          <title>Print Labels</title>
          <style>
            @media print {
              body { margin: 0; padding: 5mm; }
              .page-break { page-break-after: always; }
              .no-print { display: none; }
              * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0;
              padding: 5mm;
              background: white;
            }
            .labels-container {
              display: flex;
              flex-wrap: wrap;
              gap: 3mm;
              justify-content: flex-start;
              align-items: flex-start;
            }
            .label { 
              width: 101.6mm;
              height: 25.2mm;
              border: 0.5px solid #000;
              padding: 2mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              box-sizing: border-box;
              page-break-inside: avoid;
              background: white;
              margin-bottom: 3mm;
            }
            .barcode-section { 
              display: flex; 
              flex-direction: column; 
              align-items: center;
              justify-content: center;
              text-align: center;
              width: 100%;
              height: 100%;
            }
            .barcode-image { 
              height: 12mm;
              width: auto;
              margin-bottom: 1mm;
            }
            .price-text { 
              font-size: 10pt; 
              font-weight: bold;
              color: #000;
              margin-top: 1mm;
            }
            /* Auto-fit calculation for thermal printer optimization */
            @media print {
              .labels-container {
                width: 100%;
                max-width: 210mm; /* A4 width */
              }
              /* Force page break after every 8 labels (2 columns × 4 rows) */
              .label:nth-child(8n) {
                page-break-after: always;
              }
            }
          </style>
        </head>
        <body>
          <div class="labels-container">
    `;

    selectedForPrint.forEach(item => {
      const quantity = printQuantities[item.id] || 1;
      const svgBarcode = generateEAN13SVG(item.barcode);

      for (let i = 0; i < quantity; i++) {
        printContent += `
          <div class="label">
            <div class="barcode-section">
              <img src="${svgBarcode}" alt="Barcode" class="barcode-image" />
              <div class="price-text">₹${item.singlePicPrice}</div>
            </div>
          </div>
        `;
      }
    });

    printContent += `
          </div>
        </body>
      </html>
    `;

    // Create a hidden iframe for smooth in-app printing
    const printFrame = document.createElement('iframe');
    printFrame.style.display = 'none';
    printFrame.style.position = 'absolute';
    printFrame.style.left = '-9999px';
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow.document;
    doc.open();
    doc.write(printContent);
    doc.close();

    // Wait for content to load then print
    printFrame.onload = () => {
      setTimeout(() => {
        printFrame.contentWindow.focus();
        printFrame.contentWindow.print();

        setTimeout(() => {
          document.body.removeChild(printFrame);
          setShowPrintModal(false);
        }, 1000);
      }, 500);
    };
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.type.startsWith('image/'));

    if (validFiles.length > 0) {
      setUploadedFiles([...uploadedFiles, ...validFiles]);
      const newImages = validFiles.map(file => URL.createObjectURL(file));
      setFormData({
        ...formData,
        images: [...formData.images, ...newImages]
      });
    }
  };



  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ ...item, selectedSizes: JSON.parse(item.sizes), images: item?.subProductImages, productId: item.productId._id });
    setUploadedFiles([]);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ name: '', productId: '', lotNumber: '', lotStock: '', pcsInSet: '', selectedSizes: [], singlePicPrice: '', description: '', stock: 'In Stock', images: [], barcode: '', dateOfOpening: '' });
    setShowModal(true);
  };


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
        const data = await postData(`api/subProduct/delete-product/${productId}`);
        if (data.success === true) {
          fetchProductsWithPagination();
          toast.success("Product deleted successfully!");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product!");
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Stock':
        return 'bg-green-100 text-green-800';
      case 'Low Stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  console.log("GGGG:=>", formData);
  return (
    <AdminLayout>
      <ToastContainer />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sub-Products (Sets Management)</h1>
            <p className="text-gray-600 mt-1">Manage product sets with lot tracking, stock management, and EAN-13 barcode generation</p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={openBulkPrintModal}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={subProducts?.filter(item => item?.barcode)?.length === 0}
            >
              <i className="ri-printer-line mr-2"></i>
              Bulk Print Labels
            </Button>
            <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white">
              <i className="ri-add-line mr-2"></i>
              Add Sub-Product Set
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {subProducts?.map((item) => (
            <Card key={item?._id} className="overflow-hidden">
              <div className="relative">
                <img
                  src={item?.subProductImages && item?.subProductImages?.length > 0 ? item?.subProductImages[0] : 'https://readdy.ai/api/search-image?query=product%20set%20pieces%20fashion%20clean%20background&width=300&height=200&seq=placeholder&orientation=landscape'}
                  alt={item?.name}
                  className="w-full h-48 object-cover"
                />
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item?.stock)}`}>
                  {item?.stock}
                </div>
                <div className="absolute top-3 left-3 px-2 py-1 bg-blue-600 text-white rounded-full text-xs font-medium flex items-center">
                  <i className="ri-stack-line mr-1"></i>
                  Set
                </div>
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{item?.name}</h3>
                  <span className="text-xs text-gray-500">{item?.lotNumber}</span>
                </div>

                <div className="text-sm text-gray-600 mb-3">
                  <p>Parent: {item?.productId?.productName}</p>
                  <p>Pcs in Set: <span className="font-semibold text-blue-600">{item?.pcsInSet}</span></p>
                  <p>Final Lot Price: <span className="font-semibold text-green-600">₹{(item?.singlePicPrice * item?.pcsInSet).toLocaleString()}</span></p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                  <div>
                    <span className="text-gray-500">Lot Stock:</span>
                    <p className="font-semibold text-purple-600">{item?.lotStock} pcs</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Single Pic Price:</span>
                    <p className="font-semibold">₹{item?.singlePicPrice}</p>
                  </div>
                </div>

                {item?.dateOfOpening && (
                  <div className="mb-3 text-sm">
                    <span className="text-gray-500">Date of Opening:</span>
                    <p className="font-medium text-gray-700">{item?.dateOfOpening}</p>
                  </div>
                )}

                {/* Barcode Display - Clean single digits display */}
                {item?.barcode && (
                  <div className="mb-3 p-2 bg-white border border-gray-200 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">EAN-13 Barcode:</div>
                    <div className="mb-2">
                      <img
                        src={generateEAN13SVG(item?.barcode)}
                        alt="EAN-13 Barcode"
                        className="w-full max-w-32 h-auto mx-auto"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-mono">{item?.barcode}</div>
                      <Button
                        onClick={() => openPrintModal(item)}
                        className="bg-green-50 text-green-600 hover:bg-green-100 text-xs px-2 py-1"
                      >
                        <i className="ri-printer-line mr-1"></i>
                        Print
                      </Button>
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  <span className="text-xs text-gray-500">Available Sizes:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(() => {
                      let sizes = [];
                      try {
                        sizes = Array.isArray(item?.sizes) ? item?.sizes : JSON.parse(item?.sizes || "[]");
                      } catch (err) {
                        sizes = [];
                      }
                      console.log("sizes====>", sizes);
                      return sizes?.map((size, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {size}
                        </span>
                      ));
                    })()}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleEdit(item)}
                    className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm"
                  >
                    <i className="ri-edit-line mr-1"></i>
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(item?._id)}
                    className="bg-red-50 text-red-600 hover:bg-red-100 px-3"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </Button>
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
                className="px-4 py-2 bg-gray-100 text-gray-700 disabled:opacity-50"
              >
                Previous
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 ${currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'}`}
                >
                  {page}
                </Button>
              ))}

              <Button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-100 text-gray-700 disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          </div>
        )}
        {/* Print Modal */}
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

        {/* Modal */}
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
            productList={productList} setProductList={setProductList}
            setFormData={setFormData}
            sizeList={sizeList}
            setShowModal={setShowModal}
            selectedForPrint={selectedForPrint}
            setSelectedForPrint={setSelectedForPrint}
            setEditingItem={setEditingItem}
            editingItem={editingItem}
            fetchProducts={fetchProducts}
          />
        )}
      </div>
    </AdminLayout>
  );
}