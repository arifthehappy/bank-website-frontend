import React, { useEffect, useState } from "react";
import axios from "axios";
import { loginWithDid } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { Download } from "lucide-react";

export default function Login() {
  const [activeConnection, setActiveConnection] = useState<any>(null);
  const navigate = useNavigate();
  const [disabled, setDisabled] = useState(false);
  const { setEmployee } = useAuthStore();

  useEffect(() => {
    // Retrieve any stored connection from sessionStorage
    const storedData = sessionStorage.getItem("activeConnection");
    setActiveConnection(storedData ? JSON.parse(storedData) : null);
  }, []);

  const handleLogin = async () => {
    if (!activeConnection) {
      alert("No active connection found.");
      return;
    }
    try {
      // login with the active connection did and navigate to dashboard for session token
      // alert("Proof request sent. Please verify in your wallet.");
      setDisabled(true);
      // Send the proof request to the wallet
      const response = await loginWithDid(
        activeConnection.their_did,
        activeConnection.connection_id
      );
      console.log("Login response:", response);
      // alert(response.message);
      if (response?.success) {
        console.log("Login successful Now got to dashboard:", response);
        setEmployee(response.userData);
        navigate("/dashboard");
      } else {
        alert("Login failed. Please try again. from login.tsx");
      }
      setDisabled(false);
    } catch (error) {
      console.error(error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Portal Login{" "}
          </h1>
          {/* <p className="text-gray-600">LOGIN</p> */}
        </div>

        {activeConnection ? (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Active Connection
            </h2>
            please store the active connection with you in a safe place for
            future
            <button
              title="Download active connection"
              className="inline-flex items-center ml-2 text-blue-600 hover:text-blue-800"
              onClick={() => {
                const dataStr =
                  "data:text/json;charset=utf-8," +
                  encodeURIComponent(JSON.stringify(activeConnection, null, 2));
                const downloadAnchorNode = document.createElement("a");
                downloadAnchorNode.setAttribute("href", dataStr);
                downloadAnchorNode.setAttribute(
                  "download",
                  "active_connection.json"
                );
                document.body.appendChild(downloadAnchorNode);
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
              }}
            >
              <Download className="h-5 w-5" />
            </button>
            <pre className="text-xs bg-white p-2 rounded shadow text-green-800 overflow-auto max-h-64">
              {JSON.stringify(activeConnection, null, 2)}
            </pre>
            <button
              onClick={handleLogin}
              disabled={disabled}
              className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Login with Active Connection
            </button>
          </div>
        ) : (
          <p className="text-gray-500 mt-8 text-center">
            No active connection found.
          </p>
        )}

        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-sm text-gray-500">
            Need an SSI wallet? Download our recommended wallet app to get
            started.
          </p>
        </div>
      </div>
    </div>
  );
}
