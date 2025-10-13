import React, { useState } from 'react';
import { Download, Upload, X, FileText, Trash2 } from 'lucide-react';
import Button from '../../../components/base/Button';
import { toast } from 'react-toastify';
import { postData } from '../../../services/FetchNodeServices';

export default function BiltiSlipUploader({ challan, refreshChallans, permiton }) {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(challan?.biltiSlipUrl || '');
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        if (
            !selectedFile.type.startsWith('image/') &&
            selectedFile.type !== 'application/pdf'
        ) {
            toast.error('Only images or PDF files are allowed');
            return;
        }

        // preview for image
        if (selectedFile.type.startsWith('image/')) {
            setPreviewUrl(URL.createObjectURL(selectedFile));
        } else {
            setPreviewUrl('');
        }
        setFile(selectedFile);

        // upload to backend immediately
        await uploadSlip(selectedFile);
    };

    const uploadSlip = async (selectedFile) => {
        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('challanId', challan._id);
            formData.append('biltiSlip', selectedFile);

            const response = await postData('api/challan/upload-slip', formData, true);
            if (response?.success) {
                toast.success('Bilti slip uploaded successfully');
                setPreviewUrl(response?.url);
                setFile(null);
                if (refreshChallans) refreshChallans();
            } else {
                toast.error(response?.message || 'Failed to upload slip');
            }
        } catch (error) {
            console.error(error);
            toast.error('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    //   const handleDownload = () => {
    //     if (!previewUrl) return;
    //     const link = document.createElement('a');
    //     link.href = previewUrl;
    //     link.download = challan?.challanNumber || 'bilti-slip';
    //     link.target = '_blank';
    //     link.click();
    //   };

    const handleDownload = async () => {
        if (!previewUrl) return;

        try {
            const fileUrl = previewUrl;
            const fileName = `${challan?.challanNumber || 'bilti-slip'}.${fileUrl.includes('.pdf') ? 'pdf' : 'jpg' || 'png' || 'jpeg' || 'gif' || 'webp'}`;
            console.log('fileName:==>', fileName, previewUrl);
            // Fetch file as blob
            const response = await fetch(fileUrl);
            if (!response.ok) throw new Error('File download failed');

            const blob = await response.blob();

            // Create a temporary download link
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName;

            // Force download for PDFs too
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();

            // Cleanup
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download file. Please try again.');
        }
    };
    const removeFile = async () => {
        if (!challan?._id) return;
        try {
            const response = await postData('api/challan/remove-slip', { challanId: challan._id });
            if (response?.success) {
                toast.success('Bilti slip removed');
                setFile(null);
                setPreviewUrl('');
                if (refreshChallans) refreshChallans();
            } else {
                toast.error('Failed to remove slip');
            }
        } catch {
            toast.error('Server error while removing slip');
        }
    };

    return (
        <div className="flex flex-col items-start space-y-2">
            {/* If Bilti Slip Exists */}
            {previewUrl ? (
                <div className="flex items-center space-x-2">
                    {previewUrl.endsWith('.pdf') ? (
                        <div className="flex items-center space-x-2 text-sm text-gray-700">
                            <FileText className="text-red-500 w-5 h-5" />
                            <span>PDF Uploaded</span>
                        </div>
                    ) : (
                        <img
                            src={previewUrl}
                            alt="Bilti Slip Preview"
                            className="w-16 h-16 object-cover rounded border"
                        />
                    )}

                    <Button
                        onClick={handleDownload}
                        className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 text-xs flex items-center"
                    >
                        <Download className="w-4 h-4 mr-1" /> Download
                    </Button>

                    {permiton.delete && <Button
                        onClick={removeFile}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-xs flex items-center"
                    >
                        <X className="w-4 h-4 mr-1" /> <Trash2 className="w-4 h-4 mr-1" />
                    </Button>}
                </div>
            ) : (
                <div className="flex items-center space-x-2">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id={`bilti-upload-${challan._id}`}
                    />
                    <label
                        htmlFor={`bilti-upload-${challan._id}`}
                        className={`${isUploading
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                            } text-white px-3 py-2 rounded-md flex items-center text-xs`}
                    >
                        <Upload className="w-4 h-4 mr-1" />
                        {isUploading ? 'Uploading...' : 'Upload Slip'}
                    </label>
                </div>
            )}
        </div>
    );
}
