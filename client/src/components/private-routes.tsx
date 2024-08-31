import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/auth-context";

const PrivateRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
