
import { useState } from 'react';
import AdminLayout from '../../../components/feature/AdminLayout';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';

export default function CatalogueUpload() {
  const [catalogues, setCatalogues] = useState([
    {
      id: 1,
      fileName: 'Spring_Collection_2024.pdf',
      originalName: 'Spring Collection 2024 - Premium Jeans & Shirts.pdf',
      uploadDate: '2024-01-15',
      fileSize: '2.4 MB',
      downloadCount: 12,
      fileUrl: '#'
    },
    {
      id: 2,
      fileName: 'Winter_Formal_Collection.pdf',
      originalName: 'Winter Formal Collection - Business Wear.pdf',
      uploadDate: '2024-01-10',
      fileSize: '3.1 MB',
      downloadCount: 8,
      fileUrl: '#'
    },
    {
      id: 3,
      fileName: 'Casual_Weekend_Styles.pdf',
      originalName: 'Casual Weekend Styles - Comfort Wear Catalogue.pdf',
      uploadDate: '2024-01-08',
      fileSize: '1.8 MB',
      downloadCount: 15,
      fileUrl: '#'
    }
  ]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCatalogue, setSelectedCatalogue] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    dateFrom: '',
    dateTo: ''
  });

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setUploadFile(file);
        setUploadPreview(file.name);
      } else {
        alert('Please select a PDF file only');
        event.target.value = '';
      }
    }
  };

  const uploadCatalogue = () => {
    if (!uploadFile) {
      alert('Please select a PDF file to upload');
      return;
    }

    const newCatalogue = {
      id: Date.now(),
      fileName: uploadFile.name.replace(/[^a-zA-Z0-9.-]/g, '_'),
      originalName: uploadFile.name,
      uploadDate: new Date().toISOString().split('T')[0],
      fileSize: `${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB`,
      downloadCount: 0,
      fileUrl: URL.createObjectURL(uploadFile)
    };

    setCatalogues([newCatalogue, ...catalogues]);
    
    // Reset upload state
    setUploadFile(null);
    setUploadPreview('');
    setShowUploadModal(false);
    
    alert('Catalogue uploaded successfully!');
  };

  const deleteCatalogue = (id) => {
    if (confirm('Are you sure you want to delete this catalogue?')) {
      setCatalogues(catalogues.filter(cat => cat.id !== id));
      alert('Catalogue deleted successfully!');
    }
  };

  const viewCatalogue = (catalogue) => {
    setSelectedCatalogue(catalogue);
    setShowViewModal(true);
    
    // Increment download count
    setCatalogues(catalogues.map(cat => 
      cat.id === catalogue.id 
        ? { ...cat, downloadCount: cat.downloadCount + 1 }
        : cat
    ));
  };

  const downloadCatalogue = (catalogue) => {
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = catalogue.fileUrl;
    link.download = catalogue.originalName;
    link.click();
    
    // Increment download count
    setCatalogues(catalogues.map(cat => 
      cat.id === catalogue.id 
        ? { ...cat, downloadCount: cat.downloadCount + 1 }
        : cat
    ));
  };

  const getFilteredCatalogues = () => {
    let filtered = catalogues;

    if (filters.search) {
      filtered = filtered.filter(cat => 
        cat.originalName.toLowerCase().includes(filters.search.toLowerCase()) ||
        cat.fileName.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(cat => cat.uploadDate >= filters.dateFrom);
    }

    if (filters.dateTo) {
      filtered = filtered.filter(cat => cat.uploadDate <= filters.dateTo);
    }

    return filtered;
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Catalogue Upload</h1>
            <p className="text-gray-600 mt-1">Manage product catalogues and PDF documents</p>
          </div>
          <Button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
          >
            <i className="ri-upload-cloud-line"></i>
            <span>Upload Catalogue</span>
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="File name..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={clearFilters}
                  className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="p-4 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="ri-file-pdf-line text-xl text-blue-600"></i>
              </div>
              <div className="text-2xl font-bold text-blue-600">{catalogues.length}</div>
              <div className="text-sm text-gray-600">Total Catalogues</div>
            </div>
          </Card>
          <Card>
            <div className="p-4 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="ri-download-line text-xl text-green-600"></i>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {catalogues.reduce((sum, cat) => sum + cat.downloadCount, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Downloads</div>
            </div>
          </Card>
          <Card>
            <div className="p-4 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="ri-hard-drive-line text-xl text-purple-600"></i>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {catalogues.reduce((sum, cat) => sum + parseFloat(cat.fileSize), 0).toFixed(1)} MB
              </div>
              <div className="text-sm text-gray-600">Total Size</div>
            </div>
          </Card>
          <Card>
            <div className="p-4 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="ri-calendar-line text-xl text-orange-600"></i>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {catalogues.filter(cat => cat.uploadDate === new Date().toISOString().split('T')[0]).length}
              </div>
              <div className="text-sm text-gray-600">Today's Uploads</div>
            </div>
          </Card>
        </div>

        {/* Catalogues Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Upload Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Downloads
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getFilteredCatalogues().map(catalogue => (
                  <tr key={catalogue.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                          <i className="ri-file-pdf-line text-lg text-red-600"></i>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900" title={catalogue.originalName}>
                            {catalogue.originalName.length > 50 
                              ? catalogue.originalName.substring(0, 50) + '...' 
                              : catalogue.originalName}
                          </div>
                          <div className="text-sm text-gray-500">{catalogue.fileName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {catalogue.uploadDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {catalogue.fileSize}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <i className="ri-download-line text-gray-400 mr-1"></i>
                        <span className="text-sm text-gray-900">{catalogue.downloadCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => viewCatalogue(catalogue)}
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs px-2 py-1"
                        >
                          <i className="ri-eye-line mr-1"></i>
                          View
                        </Button>
                        <Button
                          onClick={() => downloadCatalogue(catalogue)}
                          className="bg-green-50 text-green-600 hover:bg-green-100 text-xs px-2 py-1"
                        >
                          <i className="ri-download-line mr-1"></i>
                          Download
                        </Button>
                        <Button
                          onClick={() => deleteCatalogue(catalogue.id)}
                          className="bg-red-50 text-red-600 hover:bg-red-100 text-xs px-2 py-1"
                        >
                          <i className="ri-delete-bin-line mr-1"></i>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {getFilteredCatalogues().length === 0 && (
          <div className="text-center py-12">
            <i className="ri-file-pdf-line text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-500">No catalogues found matching your criteria</p>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Upload New Catalogue</h2>
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadFile(null);
                      setUploadPreview('');
                    }}
                    className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select PDF File
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      {uploadPreview ? (
                        <div className="text-center">
                          <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <i className="ri-file-pdf-line text-2xl text-red-600"></i>
                          </div>
                          <div className="text-sm font-medium text-gray-900 mb-2">
                            {uploadPreview}
                          </div>
                          <div className="text-xs text-gray-500 mb-4">
                            {uploadFile && `${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB`}
                          </div>
                          <Button
                            onClick={() => {
                              setUploadFile(null);
                              setUploadPreview('');
                              document.getElementById('catalogue-upload').value = '';
                            }}
                            className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm"
                          >
                            <i className="ri-close-line mr-1"></i>
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
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
                            <i className="ri-file-pdf-line mr-2"></i>
                            Choose PDF File
                          </label>
                          <div className="text-xs text-gray-500 mt-2">
                            Maximum file size: 10MB
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <Button
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadFile(null);
                      setUploadPreview('');
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={uploadCatalogue}
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                    disabled={!uploadFile}
                  >
                    <i className="ri-upload-line mr-2"></i>
                    Upload Catalogue
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && selectedCatalogue && (
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
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
