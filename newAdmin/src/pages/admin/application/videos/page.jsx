import { useState, useEffect } from 'react';
import AdminLayout from '../../../../components/feature/AdminLayout';
import Card from '../../../../components/base/Card';
import Button from '../../../../components/base/Button';
import { getData, postData } from '../../../../services/FetchNodeServices';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from 'sweetalert2';

export default function VideosManagement() {
  const [videos, setVideos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    videoUrl: '',
    status: true,
    type: 'Both'
  });
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    search: ''
  });

  const handleAdd = () => {
    setEditingVideo(null);
    setFormData({
      videoUrl: '',
      status: true
    });
    setShowModal(true);
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setFormData({
      videoUrl: video?.videoUrl || '',
      status: video?.status || true,
      type: video?.type || 'Both'

    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.videoUrl) {
      toast.error("Please enter a video URL");
      setIsLoading(false);
      return;
    }
    if (!formData.type) {
      toast.error("Please select a video type");
      setIsLoading(false);
      return;
    }

    try {
      let response;
      if (editingVideo) {
        // Update existing video
        response = await postData(`api/video/update-url/${editingVideo._id}`, formData);
      } else {
        // Create new video
        response = await postData("api/video/add", formData);
      }

      if (response?.success) {
        toast.success(response?.message || (editingVideo ? "Video updated successfully" : "Video added successfully"));
        setShowModal(false);
        fetchVideos(); // Refresh the list
      } else {
        toast.error(response?.message || (editingVideo ? "Error updating video" : "Error adding video"));
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || (editingVideo ? "Error updating video" : "Error adding video"));
      console.error("Error saving video:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      const response = await getData('api/video/get-all-url');
      if (response?.success) {
        setVideos(response?.data || []);
      } else {
        toast.error(response?.message || "Failed to fetch videos");
      }
    } catch (error) {
      toast.error('Error fetching videos');
      console.error('Error fetching videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = await Swal.fire({
      title: 'Are you sure?',
      text: "This video URL will be deleted!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (confirmDelete.isConfirmed) {
      try {
        const response = await getData(`api/video/delete-url/${id}`);
        if (response.success === true) {
          setVideos(videos.filter(video => video._id !== id));
          Swal.fire('Deleted!', 'Video has been deleted.', 'success');
        }
      } catch (error) {
        Swal.fire('Error!', 'Error deleting the video.', 'error');
        console.error('Error deleting video:', error);
      }
    }
  };

  const toggleStatus = async (id) => {
    const video = videos.find(v => v._id === id);
    if (!video) return;

    const updatedStatus = !video.status;

    try {
      const response = await postData('api/video/change-status', {
        videoId: id,
        status: updatedStatus
      });

      if (response.success) {
        const updatedVideos = videos.map(video => {
          if (video._id === id) {
            return { ...video, status: updatedStatus };
          }
          return video;
        });
        setVideos(updatedVideos);
        toast.success('Video status updated');
      }
    } catch (error) {
      toast.error("Error updating video status");
      console.error("Error updating video status:", error);
    }
  };

  const getStatusColor = (status) => {
    return status
      ? 'bg-green-100 text-white'
      : 'bg-yellow-100 text-white';
  };

  const extractYouTubeVideoId = (url) => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getYouTubeThumbnail = (url) => {
    const videoId = extractYouTubeVideoId(url);
    console.log('DD>->',videoId)
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
  };
// console.log('DD>->',)
  const getYouTubeTitleFromUrl = (url) => {
    if (!url) return 'Untitled Video';
    const videoId = extractYouTubeVideoId(url);
    return videoId ? `YouTube Video (${videoId})` : 'External Video';
  };

  const filteredVideos = videos.filter(video => {
    const videoTitle = getYouTubeTitleFromUrl(video.videoUrl);
    return (
      (!filters.search || videoTitle.toLowerCase().includes(filters.search.toLowerCase())) &&
      (!filters.status || (filters.status === 'Active' ? video.status : !video.status))
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <AdminLayout>
      <ToastContainer />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Video Management</h1>
            <p className="text-gray-600 mt-1">Manage promotional and product demo videos</p>
          </div>
          <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white">
            <i className="ri-add-line mr-2"></i>
            Add Video
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="relative">
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
                  >
                    <option value="">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Videos Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map(video => {
                const thumbnailUrl = getYouTubeThumbnail(video.videoUrl);
                const videoTitle = getYouTubeTitleFromUrl(video.videoUrl);

                return (
                  <Card key={video._id} className="overflow-hidden">
                    <div className="relative">
                      {thumbnailUrl ? (
                        <img
                          src={thumbnailUrl}
                          alt={videoTitle}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <i className="ri-video-line text-4xl text-gray-400"></i>
                        </div>
                      )}

                      <div className="absolute top-2 right-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(video.status)}`}>
                          {video.status ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{videoTitle}</h3>

                      <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                        <span>{formatDate(video.createdAt)}</span>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          onClick={() => window.open(video.videoUrl, '_blank')}
                          className="flex-1 bg-green-500 text-green-600 hover:bg-green-800 text-sm"
                        >
                          <i className="ri-play-line mr-1"></i>
                          Watch
                        </Button>
                        <Button
                          onClick={() => handleEdit(video)}
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3"
                        >
                          <i className="ri-edit-line"></i>
                        </Button>
                        <Button
                          onClick={() => toggleStatus(video._id)}
                          className={`px-3 ${video.status ? 'bg-yellow-400 text-white hover:bg-yellow-900' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                        >
                          <i className={video.status ? 'ri-pause-line' : 'ri-play-line'}></i>
                        </Button>
                        <Button
                          onClick={() => handleDelete(video._id)}
                          className="bg-red-500 text-red-600 hover:bg-red-900 px-3"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {filteredVideos.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <i className="ri-video-line text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-500">No videos found matching your criteria</p>
              </div>
            )}
          </>
        )}

        {/* Add/Edit Video Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {editingVideo ? 'Edit Video' : 'Add New Video'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                <form onSubmit={handleSave}>
                  <div className="space-y-4">
                    <div>
                      <select
                        value={formData?.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Both">Both</option>
                        <option value="Customer">COUSTUMER REVIEW</option>
                        <option value="Admin">FEATURED VIDEOS</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Video URL *</label>
                      <input
                        type="url"
                        value={formData.videoUrl}
                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://youtube.com/watch?v=..."
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Supported: YouTube URLs</p>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <Button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="flex-1 bg-gray-600 text-gray-700 hover:bg-gray-800"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Saving...' : (editingVideo ? 'Update Video' : 'Add Video')}
                      </Button>
                    </div>
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