import React from "react";
import { useAuth } from "../contexts/auth-context";
import { Button } from "@/components/ui/button";
import bitPredictLogo from "../assets/bit-predict.png";
import { useLogout } from "../hooks/use-logout"; // Import the useLogout hook

const Navbar: React.FC = () => {
  const { isAuthenticated, username } = useAuth();
  const logout = useLogout();

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
            <Button variant="secondary" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
