
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const login = sessionStorage.getItem("login");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <i className="ri-shirt-line text-white text-2xl"></i>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: '"Pacifico", serif' }}>
          Garments Admin
        </h1>

        <p className="text-gray-600 mb-8">
          B2B & Offline Management Platform for Jeans and Shirts
        </p>

        <button
          onClick={() => login ? navigate('/admin/dashboard') : navigate('/login')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <i className="ri-dashboard-line"></i>
          <span>Access Admin Panel</span>
        </button>

        <div className="mt-6 text-sm text-gray-500">
          <p>Welcome to your comprehensive garments management system</p>
        </div>
      </div>
    </div>
  );
}
