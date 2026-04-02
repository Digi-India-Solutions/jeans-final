// import React from 'react'
// import Button from '../../../../components/base/Button';

// function ShowProductPrintModal({ selectedForPrint, setShowPrintModal, generateEAN13SVG,
//     setSelectedForPrint, printQuantities, setPrintQuantities, handlePrint, updatePrintQuantity }) {

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//                 <div className="p-6">
//                     <div className="flex justify-between items-center mb-4">
//                         <h2 className="text-xl font-semibold">Print Barcode Labels</h2>
//                         <button
//                             onClick={() => setShowPrintModal(false)}
//                             className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
//                         >
//                             <i className="ri-close-line"></i>
//                         </button>
//                     </div>

//                     <div className="mb-6">
//                         <div className="bg-blue-50 p-4 rounded-lg mb-4">
//                             <h3 className="font-medium text-blue-800 mb-2">Print Settings</h3>
//                             <p className="text-sm text-blue-700">Label Size: 101.6mm × 25.2mm</p>
//                             <p className="text-sm text-blue-700">Content: EAN-13 barcode + Single Pic Price</p>
//                         </div>

//                         <div className="space-y-4">
//                             {selectedForPrint.map(item => (
//                                 <div key={item._id} className="border border-gray-200 rounded-lg p-4">
//                                     <div className="flex items-center justify-between mb-3">
//                                         <div className="flex items-center space-x-3">
//                                             <img
//                                                 src={item?.subProductImages && item.subProductImages?.length > 0 ? item.subProductImages[0] || item?.productId?.images[0] : item?.productId?.images[0] || ''}
//                                                 alt={item?.color}
//                                                 className="w-12 h-12 object-cover rounded"
//                                             />
//                                             <div>
//                                                 <h4 className="font-medium">{item?.color}</h4>
//                                                 <p className="text-sm text-gray-500">{item?.barcode}</p>
//                                             </div>
//                                         </div>
//                                         <div className="flex items-center space-x-2">
//                                             <span className="text-sm text-gray-600">Copies:</span>
//                                             <button
//                                                 onClick={() => updatePrintQuantity(item?._id, -1)}
//                                                 className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50"
//                                             >
//                                                 <i className="ri-subtract-line text-sm"></i>
//                                             </button>
//                                             <input
//                                                 type="test"
//                                                 min="1"
//                                                 max="100"
//                                                 value={printQuantities[item._id] || 1}
//                                                 onChange={(e) => {
//                                                     const value = Math.max(1, Math.min(100, parseInt(e.target.value) || 1));
//                                                     setPrintQuantities(prev => ({ ...prev, [item._id]: value }));
//                                                 }}
//                                                 className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
//                                             />
//                                             <button
//                                                 onClick={() => updatePrintQuantity(item._id, 1)}
//                                                 className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50"
//                                             >
//                                                 <i className="ri-add-line text-sm"></i>
//                                             </button>
//                                         </div>
//                                     </div>

//                                     {/* Label Preview - Updated Clean Layout */}
//                                     <div className="bg-gray-50 p-3 rounded-lg">
//                                         <div className="text-xs text-gray-500 mb-2">Label Preview (101.6mm × 25.2mm):</div>
//                                         <div
//                                             className="border border-gray-300 bg-white flex flex-col items-center justify-center p-2"
//                                             style={{
//                                                 width: '285px',
//                                                 height: '71px',
//                                                 transform: 'scale(0.8)',
//                                                 transformOrigin: 'left top'
//                                             }}
//                                         >
//                                             <div className="flex flex-col items-center justify-center h-full">
//                                                 <img
//                                                     src={generateEAN13SVG(item?.barcode)}
//                                                     alt="Barcode"
//                                                     className="h-8 w-auto mb-1"
//                                                 />
//                                                 <div className="font-bold text-black" style={{ fontSize: '10px' }}>
//                                                     ₹{item?.singlePicPrice}
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>

//                     <div className="flex justify-between items-center pt-4 border-t">
//                         <div className="text-sm text-gray-600">
//                             Total Labels: {Object.values(printQuantities).reduce((sum, qty) => sum + qty, 0)}
//                         </div>
//                         <div className="flex space-x-3">
//                             <Button
//                                 onClick={() => setShowPrintModal(false)}
//                                 className="bg-gray-100 text-gray-700 hover:bg-gray-200"
//                             >
//                                 Cancel
//                             </Button>
//                             <Button
//                                 onClick={handlePrint}
//                                 className="bg-green-600 text-white hover:bg-green-700"
//                             >
//                                 <i className="ri-printer-line mr-2"></i>
//                                 Print Labels
//                             </Button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default ShowProductPrintModal


import React, { useMemo, useCallback } from 'react';
import Button from '../../../../components/base/Button';

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

// ✅ FIXED: raw SVG string — no btoa/base64 crash
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

  const bw = 2, bh = 40, pad = 6;
  const W  = bits.length * bw + pad * 2;
  const H  = bh + 24;

  let rects = '';
  for (let i = 0; i < bits.length; i++) {
    if (bits[i] === '1')
      rects += `<rect x="${pad + i*bw}" y="2" width="${bw}" height="${bh}" fill="black"/>`;
  }

  const display = `${barcode[0]}  ${barcode.slice(1,7)}  ${barcode.slice(7)}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="white"/>
    ${rects}
    <text x="${W/2}" y="${H-3}" text-anchor="middle"
      font-family="monospace" font-size="10" fill="black" letter-spacing="1">${display}</text>
  </svg>`;
};

// ─── Fallback image ───────────────────────────────────────────────────────────

const FALLBACK_IMG = 'https://via.placeholder.com/48x48?text=No+Img';

const getItemImage = (item) => {
  if (item?.subProductImages?.length > 0) return item.subProductImages[0];
  if (item?.productId?.images?.length > 0) return item.productId.images[0];
  return FALLBACK_IMG;
};

// ─── Component ────────────────────────────────────────────────────────────────

function ShowProductPrintModal({
  selectedForPrint,
  setShowPrintModal,
  printQuantities,
  setPrintQuantities,
  handlePrint,
  updatePrintQuantity,
}) {
  // ✅ Total labels — memoized
  const totalLabels = useMemo(() =>
    Object.values(printQuantities).reduce((sum, qty) => sum + qty, 0),
    [printQuantities]
  );

  // ✅ Quantity input handler
  const handleQtyInput = useCallback((id, raw) => {
    const value = Math.max(1, Math.min(100, parseInt(raw) || 1));
    setPrintQuantities(prev => ({ ...prev, [id]: value }));
  }, [setPrintQuantities]);

  const handleClose = useCallback(() => setShowPrintModal(false), [setShowPrintModal]);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }} // ✅ close on backdrop click
    >
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">

        {/* ── Header ── */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Print Barcode Labels</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {selectedForPrint.length} product{selectedForPrint.length !== 1 ? 's' : ''} selected
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        {/* ── Body (scrollable) ── */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Print info banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-800 mb-1 flex items-center gap-2">
              <i className="ri-information-line"></i>Print Settings
            </h3>
            <div className="text-sm text-blue-700 space-y-0.5">
              <p>Label size: <strong>101.6mm × 25.2mm</strong></p>
              <p>Content: EAN-13 barcode + product price</p>
              <p>Total labels to print: <strong>{totalLabels}</strong></p>
            </div>
          </div>

          {/* ✅ Empty state */}
          {selectedForPrint.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <i className="ri-barcode-line text-5xl mb-3 block"></i>
              <p className="font-medium">No products selected for printing</p>
              <p className="text-sm mt-1">Products must have a barcode assigned</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedForPrint.map(item => {
                const qty      = printQuantities[item._id] || 1;
                const imgSrc   = getItemImage(item);
                const barcodeSVG = generateEAN13SVG(item?.barcode);
                const isValid  = validateEAN13(item?.barcode);

                return (
                  <div key={item._id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">

                    {/* Item header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={imgSrc}
                          alt={item?.color || 'Product'}
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                          onError={e => { e.currentTarget.src = FALLBACK_IMG; }}
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">{item?.color}</h4>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">{item?.barcode}</p>
                          {/* ✅ Barcode validity badge */}
                          <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 font-medium ${
                            isValid
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {isValid ? '✓ Valid EAN-13' : '✗ Invalid barcode'}
                          </span>
                        </div>
                      </div>

                      {/* ✅ FIXED: type="number" not type="test" */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 mr-1">Copies:</span>
                        <button
                          onClick={() => updatePrintQuantity(item._id, -1)}
                          disabled={qty <= 1}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <i className="ri-subtract-line text-sm"></i>
                        </button>
                        <input
                          type="number"   // ✅ FIXED: was type="test"
                          min="1"
                          max="100"
                          value={qty}
                          onChange={e => handleQtyInput(item._id, e.target.value)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => updatePrintQuantity(item._id, 1)}
                          disabled={qty >= 100}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <i className="ri-add-line text-sm"></i>
                        </button>
                      </div>
                    </div>

                    {/* ✅ FIXED: inline SVG preview — no broken base64 <img> */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-2">
                        Label preview <span className="text-gray-400">(101.6mm × 25.2mm)</span>:
                      </p>
                      <div
                        className="border border-gray-300 bg-white inline-flex flex-col items-center justify-center p-2 rounded"
                        style={{ width: 285, height: 71 }}
                      >
                        {barcodeSVG ? (
                          <>
                            <div
                              style={{ transform: 'scale(0.75)', transformOrigin: 'center' }}
                              dangerouslySetInnerHTML={{ __html: barcodeSVG }}
                            />
                            <p className="text-black font-bold mt-0.5" style={{ fontSize: 10 }}>
                              ₹{item?.singlePicPrice}
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-red-500 text-center">
                            Invalid barcode — cannot preview
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {qty} label{qty !== 1 ? 's' : ''} will be printed for this item
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 flex-shrink-0 bg-gray-50 rounded-b-lg">
          <div className="text-sm text-gray-600">
            Total labels: <strong className="text-gray-900">{totalLabels}</strong>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleClose}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePrint}
              disabled={totalLabels === 0}
              className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="ri-printer-line mr-2"></i>
              Print {totalLabels} Label{totalLabels !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShowProductPrintModal;