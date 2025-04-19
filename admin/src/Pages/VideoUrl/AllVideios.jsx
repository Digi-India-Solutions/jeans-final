import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getData, postData } from '../../services/FetchNodeServices';

const AllVideos = () => {
    const [videos, setVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await getData('api/video/get-all-url');
                if (response?.success) {
                    setVideos(response?.data);
                }
            } catch (error) {
                toast.error('Error fetching videos');
                console.error('Error fetching videos:', error);
            } finally {
                setIsLoading(false);
            }
        };

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
                    setVideos(videos?.filter(video => video?._id !== id));
                    Swal.fire('Deleted!', 'Video has been deleted.', 'success');
                }
            } catch (error) {
                Swal.fire('Error!', 'Error deleting the video.', 'error');
                console.error('Error deleting video:', error);
            }
        }
    };

    const handleCheckboxChange = async (e, videoId) => {
        const updatedStatus = e.target.checked;

        try {
            const response = await postData('api/video/change-status', { videoId: videoId, status: updatedStatus, });

            if (response.success) {
                const updatedVideos = videos.map(video => {
                    if (video._id === videoId) {
                        video.status = updatedStatus;
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

    if (isLoading) {
        return <p>Loading videos...</p>;
    }

    return (
        <>
            <ToastContainer />
            <div className="bread">
                <div className="head">
                    <h4>All Videos</h4>
                </div>
                <div className="links">
                    <Link to="/add-videos" className="add-new">
                        Add New <i className="fa-solid fa-plus"></i>
                    </Link>
                </div>
            </div>

            <section className="main-table">
                <table className="table table-bordered table-striped table-hover">
                    <thead>
                        <tr>
                            <th scope="col">Sr.No.</th>
                            <th scope="col">Video URL</th>
                            <th scope="col">Status</th>
                            <th scope="col">Edit</th>
                            <th scope="col">Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {videos.length > 0 ? (
                            videos.map((video, index) => (
                                <tr key={video._id}>
                                    <th scope="row">{index + 1}</th>
                                    <td>
                                        <a href={video.videoUrl} target="_blank" rel="noopener noreferrer">
                                            {video.videoUrl}
                                        </a>
                                    </td>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={video?.status}
                                            onChange={(e) => handleCheckboxChange(e, video._id)}
                                        />
                                    </td>
                                    <td>
                                        <Link to={`/edit-videos/${video?._id}`} className="bt edit">
                                            Edit <i className="fa-solid fa-pen-to-square"></i>
                                        </Link>
                                    </td>
                                    <td>
                                        <button className="bt delete" onClick={() => handleDelete(video?._id)}>
                                            Delete <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center">
                                    No videos found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </section>
        </>
    );
};

export default AllVideos;
