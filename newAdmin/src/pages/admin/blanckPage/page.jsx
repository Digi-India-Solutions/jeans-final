import { useNavigate } from "react-router-dom";

export default function BlankPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center gap-4 max-w-md w-full text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                    <i className="ri-lock-2-line text-red-500 text-4xl"></i>
                </div>
                <h1 className="text-2xl font-bold text-gray-800">Access Restricted</h1>
                <p className="text-gray-500 text-sm">
                    You don't have permission to access any page. Please contact your administrator to get the required permissions.
                </p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
}