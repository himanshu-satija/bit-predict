import { useAuth } from "../contexts/auth-context";
import { useNavigate } from "react-router-dom";
import { fetchJson } from "../lib/fetch-config";

export const useLogout = () => {
  const { setIsAuthenticated } = useAuth();
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await fetchJson("/logout", {
        method: "POST",
      });

      localStorage.removeItem("token"); // Remove token from localStorage
      setIsAuthenticated(false);
      navigate("/login"); // Redirect to login page
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  return logout;
};
