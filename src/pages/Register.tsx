import { Copy } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          After connecting: Fields You Need to Provide to get your employee ID
        </h2>
        <p className="text-gray-700 mb-4">
          Copy the template below to your wallet and fill in the values for each
          field:
        </p>
        <p className="text-gray-700 mb-4">
          Required attributes:{" "}
          <strong>full_name, dob, blood_group, address, email</strong>
        </p>
        <p className="text-gray-700 mb-4">
          Schema ID:{" "}
          <strong> VwJVVUv3Vqm8c8FhzTVeea:2:employeeId:30.04.2025</strong>
        </p>
        <button
          onClick={() =>
            navigator.clipboard.writeText(
              "full_name, dob, blood_group, address, email"
            )
          }
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
        >
          <Copy size={20} className="mr-2" />
          Copy Template
        </button>
        <p className="text-gray-600 mt-4">
          Once you have filled these fields, please provide them as requested.
        </p>
      </div>
    </div>
  );
}
