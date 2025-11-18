import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/feature/AdminLayout';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';
import EnquiriesFilter from './EnquiriesFilter';
import EnquiriesTable from './EnquiriesTable';
import { getData } from '../../../services/FetchNodeServices';

export default function EnquiriesManagement() {
  const [enquiries, setEnquiries] = useState([
    // {
    //   id: 1,
    //   type: 'Franchise',
    //   name: 'Rajesh Enterprises',
    //   email: 'rajesh@rajenterprise.com',
    //   phone: '+91 98765 43210',
    //   location: 'Mumbai, Maharashtra',
    //   subject: 'Franchise Opportunity - Mumbai Region',
    //   message: 'Interested in starting a franchise in Mumbai. Please provide detailed information about investment requirements, territory rights, and support provided.',
    //   status: 'New',
    //   priority: 'High',
    //   submittedDate: '2024-01-15',
    //   lastUpdated: '2024-01-15',
    //   assignedTo: '',
    //   response: ''
    // },
    // {
    //   id: 2,
    //   type: 'Customer',
    //   name: 'Priya Sharma',
    //   email: 'priya.sharma@email.com',
    //   phone: '+91 87654 32109',
    //   location: 'Delhi, India',
    //   subject: 'Bulk Order Inquiry',
    //   message: 'Need 100+ units of formal shirts for corporate gifting. Please share bulk pricing and customization options.',
    //   status: 'In Progress',
    //   priority: 'Medium',
    //   submittedDate: '2024-01-14',
    //   lastUpdated: '2024-01-15',
    //   assignedTo: 'Sales Team',
    //   response: 'Initial pricing shared via email. Awaiting confirmation on sizes and customization requirements.'
    // },
    // {
    //   id: 3,
    //   type: 'General',
    //   name: 'Amit Patel',
    //   email: 'amit.patel@email.com',
    //   phone: '+91 76543 21098',
    //   location: 'Ahmedabad, Gujarat',
    //   subject: 'Product Quality Issue',
    //   message: 'Recently purchased jeans have quality issues. Stitching is not proper and fabric seems different from what was advertised.',
    //   status: 'Resolved',
    //   priority: 'High',
    //   submittedDate: '2024-01-12',
    //   lastUpdated: '2024-01-14',
    //   assignedTo: 'Customer Service',
    //   response: 'Issue resolved. Replacement product sent and quality team notified for investigation.'
    // },
    // {
    //   id: 4,
    //   type: 'Franchise',
    //   name: 'Fashion Hub Solutions',
    //   email: 'info@fashionhub.com',
    //   phone: '+91 65432 10987',
    //   location: 'Bangalore, Karnataka',
    //   subject: 'Master Franchise for South India',
    //   message: 'Looking for master franchise rights for South Indian states. Have experience in retail fashion business with 15+ outlets.',
    //   status: 'New',
    //   priority: 'High',
    //   submittedDate: '2024-01-13',
    //   lastUpdated: '2024-01-13',
    //   assignedTo: '',
    //   response: ''
    // },
    // {
    //   id: 5,
    //   type: 'Customer',
    //   name: 'Sneha Gupta',
    //   email: 'sneha.gupta@email.com',
    //   phone: '+91 54321 09876',
    //   location: 'Pune, Maharashtra',
    //   subject: 'Return and Exchange Policy',
    //   message: 'Need clarification on return policy for online orders. Also want to know about size exchange process.',
    //   status: 'Resolved',
    //   priority: 'Low',
    //   submittedDate: '2024-01-11',
    //   lastUpdated: '2024-01-12',
    //   assignedTo: 'Customer Service',
    //   response: 'Return policy details shared. Exchange process explained via phone call.'
    // }
  ]);

  const [filteredEnquiries, setFilteredEnquiries] = useState(enquiries);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [filters, setFilters] = useState({ type: '', status: '', priority: '', search: '' });
  const [responseForm, setResponseForm] = useState({ response: '', status: 'In Progress', assignedTo: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter enquiries

  const handleResponseSubmit = (e) => {
    e.preventDefault();
    setEnquiries(enquiries.map(enquiry =>
      enquiry.id === selectedEnquiry.id
        ? {
          ...enquiry,
          response: responseForm.response,
          status: responseForm.status,
          assignedTo: responseForm.assignedTo,
          lastUpdated: new Date().toISOString().split('T')[0]
        }
        : enquiry
    ));

    setShowEnquiryModal(false);
    setSelectedEnquiry(null);
    setResponseForm({
      response: '',
      status: 'In Progress',
      assignedTo: ''
    });
  };
  const fetchAllEnquiries = async () => {
    try {
      const fil = JSON.stringify(filters);
      const res = await getData(`api/enquiry/get-all-enquiries?pageNumber=${currentPage}&filters=${encodeURIComponent(fil)} `);
      console.log("DDDDD::=>", res)
      if (res.status === true) {
        setEnquiries(res.data);
        setFilteredEnquiries(res.data);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.log(err)
    }
  }
  useEffect(() => {
    fetchAllEnquiries();
  }, [currentPage])

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Enquiries Management</h1>
            <p className="text-gray-600 mt-1">Manage franchise and customer enquiries</p>
          </div>
          <div className="flex space-x-3">
            <div className="text-sm text-gray-600">
              <span className="font-medium">New: </span>
              <span className="text-blue-600">{enquiries.filter(e => e.status === 'New').length}</span>
              <span className="mx-2">•</span>
              <span className="font-medium">In Progress: </span>
              <span className="text-yellow-600">{enquiries.filter(e => e.status === 'In Progress').length}</span>
              <span className="mx-2">•</span>
              <span className="font-medium">Resolved: </span>
              <span className="text-green-600">{enquiries.filter(e => e.status === 'Resolved').length}</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <EnquiriesFilter
          setFilteredEnquiries={setFilteredEnquiries} setFilters={setFilters}
          enquiries={enquiries} filters={filters} currentPage={currentPage} setTotalPages={setTotalPages}
          fetchAllEnquiries={fetchAllEnquiries}
        />

        {/* Enquiries List */}
        <EnquiriesTable
          filteredEnquiries={filteredEnquiries} setEnquiries={setEnquiries}
          enquiries={enquiries} setSelectedEnquiry={setSelectedEnquiry}
          setResponseForm={setResponseForm} setShowEnquiryModal={setShowEnquiryModal}
          currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages}
        />

        {filteredEnquiries.length === 0 && (
          <div className="text-center py-12">
            <i className="ri-question-answer-line text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-500">No enquiries found matching your criteria</p>
          </div>
        )}

        {/* Response Modal */}
        {showEnquiryModal && selectedEnquiry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Respond to Enquiry</h2>
                  <button
                    onClick={() => {
                      setShowEnquiryModal(false);
                      setSelectedEnquiry(null);
                      setResponseForm({
                        response: '',
                        status: 'In Progress',
                        assignedTo: ''
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                {/* Enquiry Summary */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <span className="text-sm text-gray-500">From:</span>
                      <div className="font-medium">{selectedEnquiry.name}</div>
                      <div className="text-sm text-gray-600">{selectedEnquiry.email}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Type:</span>
                      <div className="font-medium">{selectedEnquiry.type}</div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <span className="text-sm text-gray-500">Subject:</span>
                    <div className="font-medium">{selectedEnquiry.subject}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Message:</span>
                    <div className="text-sm text-gray-700 mt-1">{selectedEnquiry.message}</div>
                  </div>
                </div>

                <form onSubmit={handleResponseSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Response</label>
                    <textarea
                      value={responseForm.response}
                      onChange={(e) => setResponseForm({ ...responseForm, response: e.target.value })}
                      rows="6"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Type your response here..."
                      maxLength="500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <div className="relative">
                        <select
                          value={responseForm.status}
                          onChange={(e) => setResponseForm({ ...responseForm, status: e.target.value })}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        >
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                        <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                      <div className="relative">
                        <select
                          value={responseForm.assignedTo}
                          onChange={(e) => setResponseForm({ ...responseForm, assignedTo: e.target.value })}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        >
                          <option value="">Unassigned</option>
                          <option value="Sales Team">Sales Team</option>
                          <option value="Customer Service">Customer Service</option>
                          <option value="Management">Management</option>
                          <option value="Technical Support">Technical Support</option>
                        </select>
                        <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      onClick={() => {
                        setShowEnquiryModal(false);
                        setSelectedEnquiry(null);
                        setResponseForm({
                          response: '',
                          status: 'In Progress',
                          assignedTo: ''
                        });
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Send Response
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
