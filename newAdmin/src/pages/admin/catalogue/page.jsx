import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/feature/AdminLayout';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';
import UploadCatlogueModal from './UploadCatlogueModal';
import ViewCatlogueModal from './ViewCatlogueModal';
import { getData } from '../../../services/FetchNodeServices';

export default function CatalogueUpload() {
  const [catalogues, setCatalogues] = useState([]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCatalogue, setSelectedCatalogue] = useState(null);
  const [filters, setFilters] = useState({ search: '', dateFrom: '', dateTo: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(0)
  const [totalDownloads, setTotalDownloads] = useState(0)
  const [totalSize, setTotalSize] = useState(0)
  const [totalToday, setTotalToday] = useState(0)

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
    // if (filters.search) {
    //   filtered = filtered.filter(cat =>
    //     cat.originalName.toLowerCase().includes(filters.search.toLowerCase()) ||
    //     cat.fileName.toLowerCase().includes(filters.search.toLowerCase())
    //   );
    // }

    // if (filters.dateFrom) {
    //   filtered = filtered.filter(cat => cat.uploadDate >= filters.dateFrom);
    // }

    // if (filters.dateTo) {
    //   filtered = filtered.filter(cat => cat.uploadDate <= filters.dateTo);
    // }

    return filtered;
  };

  const clearFilters = () => {
    setFilters({ search: '', dateFrom: '', dateTo: '' });
  };
  const fetchCatalogues = async () => {
    try {
      const response = await getData(`api/catalogues/get-all-catalogue-pdf-with-pagination?page=${currentPage}&limit=2&search=${filters?.search}&dateFrom=${filters?.dateFrom}&dateTo=${filters?.dateTo}`);

      console.log("datadatadata:=>", response);
      if (response.status === true) {
        setCatalogues(response?.data);
        setTotalPages(response?.pagination?.totalPages);
        setTotalDocuments(response?.pagination?.totalDocuments)
        setTotalDownloads(response?.pagination?.totalDownloadCount)
        setTotalSize(response?.pagination?.totalFileSize)
        setTotalToday(response?.pagination?.totalToday)
      }

    } catch (error) {
      console.error('Error fetching catalogues:', error);
    }
  };

  useEffect(() => {
    fetchCatalogues();
  }, [currentPage, filters?.search, filters?.dateFrom && filters?.dateTo]);

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
                <input type="text" placeholder="File name..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
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
              <div className="text-2xl font-bold text-blue-600">{totalDocuments}</div>
              <div className="text-sm text-gray-600">Total Catalogues</div>
            </div>
          </Card>
          <Card>
            <div className="p-4 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="ri-download-line text-xl text-green-600"></i>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {/* {catalogues.reduce((sum, cat) => sum + cat.downloadCount, 0)} */}
                {totalDownloads}
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
                {/* {catalogues.reduce((sum, cat) => sum + parseFloat(cat.fileSize), 0).toFixed(1)} MB */}
                {totalSize}
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
                {/* {catalogues.filter(cat => cat.uploadDate.split('T')[0] === new Date().toISOString().split('T')[0]).length} */}
                {totalToday}
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
            {/* pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-900 text-gray-700 "
                  >
                    Previous
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 ${currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-400 text-gray-700'}`}
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
          <UploadCatlogueModal setShowUploadModal={setShowUploadModal} setCatalogues={setCatalogues} catalogues={catalogues} />
        )}

        {/* View Modal */}
        {showViewModal && selectedCatalogue && (
          <ViewCatlogueModal downloadCatalogue={downloadCatalogue} setShowViewModal={setShowViewModal} selectedCatalogue={selectedCatalogue} setSelectedCatalogue={setSelectedCatalogue} />
        )}
      </div>
    </AdminLayout>
  );
}
