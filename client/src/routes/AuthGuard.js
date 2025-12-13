import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loading from './Loading';

const AuthGuard = ({ children, allowedRoles = [],}) => {
  const { user, loading, mustVerifyEmail } = useAuth();

  if (loading) return <Loading/>; // Wait for auth check
  if (!user) return <Navigate to="/login" replace />; // Not logged in

  if (!mustVerifyEmail) return <Navigate to="/verifyemail" replace />; // Email not verified

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.employeeRoal)) {
    return <Navigate to="/" replace />; // Not allowed by role
  }

  return children; // Everything OK → render page
};

export default AuthGuard;
