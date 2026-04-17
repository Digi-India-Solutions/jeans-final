import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
    const login = sessionStorage.getItem("login");
    
    if (!login) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />; // ✅ renders nested admin routes
}
