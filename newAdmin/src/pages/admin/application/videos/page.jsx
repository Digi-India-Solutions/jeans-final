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
    videoUrl: "",
    status: true,
    type: "Both"
  });

  const [filters, setFilters] = useState({
    type: "",
    status: "",
    search: ""
  });

  /* --------------------------------------------------------
      UNIVERSAL YOUTUBE VIDEO ID EXTRACTOR
  -------------------------------------------------------- */
  const extractYouTubeId = (url) => {
    if (!url) return null;

    const patterns = [
      /youtu\.be\/([^?&]+)/,                      // short URL
      /youtube\.com\/shorts\/([^?&]+)/,           // shorts
      /youtube\.com\/embed\/([^?&]+)/,            // embed
      /youtube\.com\/watch\?v=([^?&]+)/,          // watch?v=
      /youtube\.com\/.*v=([^?&]+)/                // any other
    ];

    for (let regex of patterns) {
      const match = url.match(regex);
      if (match && match[1]) return match[1];
    }

    return null;
  };

  /* --------------------------------------------------------
      THUMBNAIL
  -------------------------------------------------------- */
  const getYouTubeThumbnail = (url) => {
    const id = extractYouTubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  };

  const getYouTubeTitle = (url) => {
    const id = extractYouTubeId(url);
    return id ? `YouTube Video (${id})` : "Unknown Video";
  };

  /* --------------------------------------------------------
      FETCH DATA
  -------------------------------------------------------- */
  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      const response = await getData("api/video/get-all-url");
      if (response?.success) {
        setVideos(response.data || []);
      } else {
        toast.error(response?.message || "Error fetching videos");
      }
    } catch (error) {
      toast.error("Error loading videos");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  /* --------------------------------------------------------
      ADD / EDIT HANDLERS
  -------------------------------------------------------- */
  const handleAdd = () => {
    setEditingVideo(null);
    setFormData({
      videoUrl: "",
      status: true,
      type: "Both"
    });
    setShowModal(true);
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setFormData({
      videoUrl: video.videoUrl,
      status: video.status,
      type: video.type
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.videoUrl) {
      toast.error("Video URL is required");
      setIsLoading(false);
      return;
    }

    try {
      const api = editingVideo
        ? `api/video/update-url/${editingVideo._id}`
        : "api/video/add";

      const response = await postData(api, formData);

      if (response?.success) {
        toast.success(editingVideo ? "Video updated" : "Video added");
        setShowModal(false);
        fetchVideos();
      } else {
        toast.error(response?.message || "Could not save video");
      }
    } catch (error) {
      toast.error("Error saving video");
    }

    setIsLoading(false);
  };

  /* --------------------------------------------------------
      DELETE
  -------------------------------------------------------- */
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete?",
      text: "Video will be deleted",
      icon: "warning",
      showCancelButton: true
    });

    if (!confirm.isConfirmed) return;

    try {
      const response = await getData(`api/video/delete-url/${id}`);
      if (response.success) {
        setVideos(videos.filter(v => v._id !== id));
        Swal.fire("Deleted!", "Video removed", "success");
      }
    } catch {
      Swal.fire("Error", "Could not delete video", "error");
    }
  };

  /* --------------------------------------------------------
      CHANGE STATUS
  -------------------------------------------------------- */
  const toggleStatus = async (id) => {
    const video = videos.find(v => v._id === id);
    const updated = !video.status;

    try {
      const response = await postData("api/video/change-status", {
        videoId: id,
        status: updated
      });

      if (response.success) {
        setVideos(videos.map(v => (v._id === id ? { ...v, status: updated } : v)));
        toast.success("Status updated");
      }
    } catch {
      toast.error("Error updating status");
    }
  };

  /* --------------------------------------------------------
      FILTERING
  -------------------------------------------------------- */
  const filteredVideos = videos.filter((video) => {
    const title = getYouTubeTitle(video.videoUrl).toLowerCase();

    return (
      (!filters.search || title.includes(filters.search.toLowerCase())) &&
      (!filters.type || video.type === filters.type) &&
      (!filters.status ||
        (filters.status === "Active" ? video.status === true : video.status === false))
    );
  });

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });

  /* --------------------------------------------------------
      UI RENDER
  -------------------------------------------------------- */
  return (
    <AdminLayout>
      <ToastContainer />
      <div className="p-6">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Video Management</h1>
            <p className="text-gray-600">Manage all uploaded videos</p>
          </div>

          <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white">
            <i className="ri-add-line mr-2" /> Add Video
          </Button>
        </div>

        {/* FILTERS */}
        <Card className="mb-6">
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div>
              <label className="text-sm">Search</label>
              <input
                className="w-full border p-2 rounded"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search videos..."
              />
            </div>

            <div>
              <label className="text-sm">Video Type</label>
              <select
                className="w-full border p-2 rounded"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="">All</option>
                <option value="Admin">Admin</option>
                <option value="Customer">Customer</option>
                <option value="Both">Both</option>
              </select>
            </div>

            <div>
              <label className="text-sm">Status</label>
              <select
                className="w-full border p-2 rounded"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

          </div>
        </Card>

        {/* LOADING */}
        {isLoading && (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* VIDEO LIST */}
        {!isLoading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => {
                const thumb = getYouTubeThumbnail(video.videoUrl);
                const title = getYouTubeTitle(video.videoUrl);

                return (
                  <Card key={video._id} className="overflow-hidden">
                    <div className="relative">
                      {thumb ? (
                        <img src={thumb} className="w-full h-48 object-cover" />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <i className="ri-video-line text-4xl text-gray-400"></i>
                        </div>
                      )}

                      <span
                        className={`absolute top-2 right-2 px-3 py-1 text-xs rounded-full font-bold ${
                          video.status ? "bg-green-600 text-white" : "bg-yellow-500 text-white"
                        }`}
                      >
                        {video.status ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold mb-2">{title}</h3>
                      <p className="text-xs text-gray-500">Added: {formatDate(video.createdAt)}</p>

                      <div className="flex space-x-2 mt-4">
                        <Button
                          onClick={() => window.open(video.videoUrl, "_blank")}
                          className="flex-1 bg-green-600 text-white"
                        >
                          Watch
                        </Button>

                        <Button onClick={() => handleEdit(video)} className="bg-blue-100 text-blue-600">
                          <i className="ri-edit-2-line"></i>
                        </Button>

                        <Button
                          onClick={() => toggleStatus(video._id)}
                          className={video.status ? "bg-yellow-500 text-white" : "bg-green-500 text-white"}
                        >
                          <i className={video.status ? "ri-pause-line" : "ri-play-line"}></i>
                        </Button>

                        <Button
                          onClick={() => handleDelete(video._id)}
                          className="bg-red-600 text-white"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {filteredVideos.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <i className="ri-video-line text-4xl mb-2"></i>
                <p>No videos found</p>
              </div>
            )}
          </>
        )}

        {/* MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg w-full max-w-lg p-6">
              <div className="flex justify-between">
                <h2 className="text-xl font-semibold">
                  {editingVideo ? "Edit Video" : "Add Video"}
                </h2>
                <button onClick={() => setShowModal(false)}>
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleSave} className="mt-4 space-y-4">
                
                <div>
                  <label>Video Type</label>
                  <select
                    className="w-full border p-2 rounded"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="Both">Both</option>
                    <option value="Customer">Customer Review</option>
                    <option value="Admin">Featured Video</option>
                  </select>
                </div>

                <div>
                  <label>Video URL *</label>
                  <input
                    className="w-full border p-2 rounded"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://youtube.com/..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-300"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 text-white"
                  >
                    {isLoading ? "Saving..." : editingVideo ? "Update" : "Add"}
                  </Button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
