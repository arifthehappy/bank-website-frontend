import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, employee, logout } = useAuthStore();

  console.log("Employee data in dashboard:", employee);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    // navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome to your dashboard</p>
        </div>

        {employee ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Employee Details
            </h2>
            <div className="bg-gray-100 p-4 rounded-lg shadow">
              <p>
                <strong>Full Name:</strong> {employee.full_name || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {employee.email || "N/A"}
              </p>
              <p>
                <strong>Address:</strong> {employee.address || "N/A"}
              </p>
              <p>
                <strong>Designation:</strong> {employee.designation || "N/A"}
              </p>
              <p>
                <strong>Branch Name:</strong> {employee.branch_name || "N/A"}
              </p>
              <p>
                <strong>Employee Number:</strong>{" "}
                {employee.employee_number || "N/A"}
              </p>
              <p>
                <strong>Status:</strong> {employee.status || "N/A"}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No employee details available.</p>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
