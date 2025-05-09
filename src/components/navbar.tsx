import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Left Section: Branding and Home Link */}
        <div className="flex space-x-4 items-center">
          <Link to="/" className="text-2xl font-bold hover:underline">
            Banking Portal
          </Link>
          <Link to="/" className="font-bold hover:underline">
            Home
          </Link>
        </div>

        {/* Right Section: Dynamic Links */}
        <div className="flex space-x-4 items-center">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="font-bold hover:underline">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="font-bold hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="font-bold hover:underline">
                Login
              </Link>
              <Link to="/register" className="font-bold hover:underline">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
