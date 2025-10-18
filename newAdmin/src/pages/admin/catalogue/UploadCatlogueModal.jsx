// import React from 'react'
// import Button from '../../../components/base/Button';

// function UploadCatlogueModal({setShowUploadModal ,setCatalogues ,catalogues}) {
//     const [uploadFile, setUploadFile] = useState(null);
//     const [uploadPreview, setUploadPreview] = useState('');

//     const uploadCatalogue = () => {
//         if (!uploadFile) {
//             alert('Please select a PDF file to upload');
//             return;
//         }

//         const newCatalogue = {
//             id: Date.now(),
//             fileName: uploadFile.name.replace(/[^a-zA-Z0-9.-]/g, '_'),
//             originalName: uploadFile.name,
//             uploadDate: new Date().toISOString().split('T')[0],
//             fileSize: `${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB`,
//             downloadCount: 0,
//             fileUrl: URL.createObjectURL(uploadFile)
//         };

//         setCatalogues([newCatalogue, ...catalogues]);

//         // Reset upload state
//         setUploadFile(null);
//         setUploadPreview('');
//         setShowUploadModal(false);

//         alert('Catalogue uploaded successfully!');
//     };

//     const handleFileUpload = (event) => {
//         const file = event.target.files[0];
//         if (file) {
//             if (file.type === 'application/pdf') {
//                 setUploadFile(file);
//                 setUploadPreview(file.name);
//             } else {
//                 alert('Please select a PDF file only');
//                 event.target.value = '';
//             }
//         }
//     };


//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-lg max-w-md w-full">
//                 <div className="p-6">
//                     <div className="flex justify-between items-center mb-4">
//                         <h2 className="text-xl font-semibold">Upload New Catalogue</h2>
//                         <button
//                             onClick={() => {
//                                 setShowUploadModal(false);
//                                 setUploadFile(null);
//                                 setUploadPreview('');
//                             }}
//                             className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
//                         >
//                             <i className="ri-close-line"></i>
//                         </button>
//                     </div>

//                     <div className="space-y-4">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Select PDF File
//                             </label>
//                             <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
//                                 {uploadPreview ? (
//                                     <div className="text-center">
//                                         <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
//                                             <i className="ri-file-pdf-line text-2xl text-red-600"></i>
//                                         </div>
//                                         <div className="text-sm font-medium text-gray-900 mb-2">
//                                             {uploadPreview}
//                                         </div>
//                                         <div className="text-xs text-gray-500 mb-4">
//                                             {uploadFile && `${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB`}
//                                         </div>
//                                         <Button
//                                             onClick={() => {
//                                                 setUploadFile(null);
//                                                 setUploadPreview('');
//                                                 document.getElementById('catalogue-upload').value = '';
//                                             }}
//                                             className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm"
//                                         >
//                                             <i className="ri-close-line mr-1"></i>
//                                             Remove
//                                         </Button>
//                                     </div>
//                                 ) : (
//                                     <div className="text-center">
//                                         <i className="ri-upload-cloud-line text-3xl text-gray-400 mb-4"></i>
//                                         <div className="text-sm text-gray-600 mb-4">
//                                             Drag and drop your PDF file here, or click to browse
//                                         </div>
//                                         <input
//                                             type="file"
//                                             accept=".pdf"
//                                             onChange={handleFileUpload}
//                                             className="hidden"
//                                             id="catalogue-upload"
//                                         />
//                                         <label
//                                             htmlFor="catalogue-upload"
//                                             className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg cursor-pointer"
//                                         >
//                                             <i className="ri-file-pdf-line mr-2"></i>
//                                             Choose PDF File
//                                         </label>
//                                         <div className="text-xs text-gray-500 mt-2">
//                                             Maximum file size: 10MB
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     </div>

//                     <div className="flex space-x-3 mt-6">
//                         <Button
//                             onClick={() => { setShowUploadModal(false); setUploadFile(null); setUploadPreview(''); }}
//                             className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
//                         >
//                             Cancel
//                         </Button>
//                         <Button
//                             onClick={uploadCatalogue}
//                             className="flex-1 bg-gray-700 text-white hover:bg-gray-900"
//                             disabled={!uploadFile}
//                         >
//                             <i className="ri-upload-line mr-2"></i>
//                             Upload Catalogue
//                         </Button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default UploadCatlogueModal


import React, { useState } from "react";
import Button from "../../../components/base/Button";
import axios from "axios";
import { postData } from "../../../services/FetchNodeServices";

function UploadCatalogueModal({ setShowUploadModal, setCatalogues, catalogues }) {
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please select a PDF file only");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit");
      event.target.value = "";
      return;
    }

    setUploadFile(file);
    setUploadPreview(file.name);
  };

  const uploadCatalogue = async () => {
    if (!uploadFile) {
      alert("Please select a PDF file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadFile);

    try {
      setIsUploading(true);

      const response = await postData("api/catalogues/uploadPdf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("response:==>", response);
      if (response.status === true) {
        const newCatalogue = response.data;
        setCatalogues([newCatalogue, ...catalogues]);
        alert("Catalogue uploaded successfully!");
        setShowUploadModal(false);
        setUploadFile(null);
        setUploadPreview("");
      }

    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload catalogue. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-lg">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Upload New Catalogue</h2>
            <button
              onClick={() => {
                setShowUploadModal(false);
                setUploadFile(null);
                setUploadPreview("");
              }}
              className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
            >
              <i className="ri-close-line"></i>
            </button>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            {uploadPreview ? (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="ri-file-pdf-line text-2xl text-red-600"></i>
                </div>
                <div className="text-sm font-medium text-gray-900 mb-2">{uploadPreview}</div>
                <div className="text-xs text-gray-500 mb-4">
                  {uploadFile && `${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB`}
                </div>
                <Button
                  onClick={() => {
                    setUploadFile(null);
                    setUploadPreview("");
                    document.getElementById("catalogue-upload").value = "";
                  }}
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm"
                >
                  <i className="ri-close-line mr-1"></i> Remove
                </Button>
              </>
            ) : (
              <>
                <i className="ri-upload-cloud-line text-3xl text-gray-400 mb-4"></i>
                <div className="text-sm text-gray-600 mb-4">
                  Drag and drop your PDF file here, or click to browse
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="catalogue-upload"
                />
                <label
                  htmlFor="catalogue-upload"
                  className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg cursor-pointer"
                >
                  <i className="ri-file-pdf-line mr-2"></i> Choose PDF File
                </label>
                <div className="text-xs text-gray-500 mt-2">Maximum file size: 10MB</div>
              </>
            )}
          </div>

          <div className="flex space-x-3 mt-6">
            <Button
              onClick={() => setShowUploadModal(false)}
              className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </Button>
            <Button
              onClick={uploadCatalogue}
              className={`flex-1 bg-gray-700 text-white hover:bg-gray-900 ${isUploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              disabled={!uploadFile || isUploading}
            >
              {isUploading ? (
                <>
                  <i className="ri-loader-4-line mr-2 animate-spin"></i> Uploading...
                </>
              ) : (
                <>
                  <i className="ri-upload-line mr-2"></i> Upload Catalogue
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadCatalogueModal;
