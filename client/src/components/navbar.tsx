import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/auth-context";
import { Button } from "@/components/ui/button";
import { fetchJson } from "../lib/fetch-config";
import bitPredictLogo from "../assets/bit-predict.png";

const Navbar: React.FC = () => {
  const { isAuthenticated, username, setIsAuthenticated, setUsername } =
    useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetchJson("/logout", { method: "POST" });
      setIsAuthenticated(false);
      setUsername(null);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="bg-primary text-primary-foreground shadow-md fixed top-0 left-0 right-0 z-10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img
            src={bitPredictLogo}
            alt="BitPredict Logo"
            className="h-8 w-auto"
          />
          <span className="text-xl font-bold">BitPredict</span>
        </div>
        {isAuthenticated && (
          <div className="flex items-center space-x-4">
            <span className="text-sm hidden sm:inline">
              Welcome, {username}
            </span>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
