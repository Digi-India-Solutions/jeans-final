import React from 'react'
import Button from '../../../components/base/Button';

function ViewCatlogueModal({ setShowViewModal, selectedCatalogue, setSelectedCatalogue, downloadCatalogue ,currentPage , setCurrentPage, totalPages}) {


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-xl font-semibold">View Catalogue</h2>
                            <p className="text-gray-600">{selectedCatalogue.originalName}</p>
                        </div>
                        <button
                            onClick={() => {
                                setShowViewModal(false);
                                setSelectedCatalogue(null);
                            }}
                            className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                        >
                            <i className="ri-close-line"></i>
                        </button>
                    </div>

                    {/* File Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-500">File Size</div>
                            <div className="font-semibold">{selectedCatalogue.fileSize}</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-500">Upload Date</div>
                            <div className="font-semibold">{selectedCatalogue.uploadDate}</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-500">Downloads</div>
                            <div className="font-semibold">{selectedCatalogue.downloadCount}</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-500">Status</div>
                            <div className="font-semibold text-green-600">Available</div>
                        </div>
                    </div>

                    {/* PDF Preview Placeholder */}
                    <div className="bg-gray-100 rounded-lg p-12 text-center mb-6">
                        <div className="w-24 h-24 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <i className="ri-file-pdf-line text-4xl text-red-600"></i>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF Preview</h3>
                        <p className="text-gray-600 mb-4">
                            PDF preview functionality would be available here in the full implementation
                        </p>
                        <div className="flex justify-center space-x-3">
                            <Button
                                onClick={() => downloadCatalogue(selectedCatalogue)}
                                className="bg-blue-600 text-white hover:bg-blue-700"
                            >
                                <i className="ri-download-line mr-2"></i>
                                Download PDF
                            </Button>
                            <Button
                                onClick={() => window.open(selectedCatalogue.fileUrl, '_blank')}
                                className="bg-green-600 text-white hover:bg-green-700"
                            >
                                <i className="ri-external-link-line mr-2"></i>
                                Open in New Tab
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            onClick={() => {
                                setShowViewModal(false);
                                setSelectedCatalogue(null);
                            }}
                            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                            Close
                        </Button>
                    </div>
                </div>
                {/* Pagination Controls */}
             
               
            </div>
        </div>
    )
}

export default ViewCatlogueModal
