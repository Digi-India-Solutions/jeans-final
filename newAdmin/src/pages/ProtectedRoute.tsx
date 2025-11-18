import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const login = sessionStorage.getItem("login");

    if (!login) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
