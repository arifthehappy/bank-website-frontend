import React, { useEffect, useState } from "react";
import { DollarSign, Filter, ArrowUpDown } from "lucide-react";
import { usePermissionsStore } from "../../store/permissions";
import { useAuthStore } from "../../store/auth";
import { requestPermissionProof } from "../../services/api";

export default function Loans() {
  const [loading, setLoading] = useState(true);
  const { credentials, addCredential } = usePermissionsStore();
  const { employee } = useAuthStore();
  const [hasPermission, setHasPermission] = useState(false);
  const [hasWritePermission, setHasWritePermission] = useState(false);

  const loans = [
    {
      id: "L123",
      customerName: "Alice Johnson",
      amount: 50000,
      type: "Personal",
      status: "Active",
      interestRate: "8.5%",
      dueDate: "2025-03-15",
    },
    // Add more mock data as needed
  ];

  // Check for permission on mount
  useEffect(() => {
    const found = credentials.some((cred) =>
      cred.permissions_map?.loans?.includes("read")
    );
    setHasPermission(found);
    setHasWritePermission(
      credentials.some((cred) => cred.permissions_map?.loans?.includes("write"))
    );
    setLoading(false);
  }, [credentials]);

  // Request permission proof
  const handlePresentPermission = async () => {
    setLoading(true);
    if (!employee?.connection_id) {
      console.error("Employee connection ID is missing.");
      setLoading(false);
      return;
    }
    const res = await requestPermissionProof(employee.connection_id);
    if (res.success) {
      // Parse permissions_map string to object
      const credential = { ...res.credential };
      if (typeof credential.permissions_map === "string") {
        try {
          credential.permissions_map = JSON.parse(credential.permissions_map);
        } catch (e) {
          console.error("Failed to parse permissions_map:", e);
          credential.permissions_map = {};
        }
      }
      addCredential(credential);
      setHasPermission(credential.permissions_map?.loans?.includes("read"));
      setHasWritePermission(
        credential.permissions_map?.loans?.includes("write")
      );
    }
    if (res.error) {
      console.error("Error requesting permission proof:", res.error);
      alert(res.error.reason);
    }
    setLoading(false);
  };

  if (loading) return <div>Checking permissions...</div>;

  if (!hasPermission)
    return (
      <div>
        <div>Access not given for Loans page.</div>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={handlePresentPermission}
          disabled={loading}
        >
          Present Permission
        </button>
      </div>
    );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loan Management</h1>
          <p className="text-gray-600">Monitor and manage all bank loans</p>
        </div>
        <div className="flex gap-4">
          <button
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-10"
            disabled={!hasWritePermission}
            onClick={() => {
              // Handle new loan creation
              console.log("New Loan button clicked");
            }}
          >
            <DollarSign size={20} />
            New Loan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Loans</h3>
          <p className="text-2xl font-bold text-blue-600">$2.5M</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Active Loans</h3>
          <p className="text-2xl font-bold text-green-600">156</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">
            Pending Approval
          </h3>
          <p className="text-2xl font-bold text-orange-600">23</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Default Rate</h3>
          <p className="text-2xl font-bold text-red-600">2.3%</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search loans..."
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="flex items-center gap-2 text-gray-600 border rounded-lg px-4 py-2 hover:bg-gray-50">
              <Filter size={20} />
              Filter
            </button>
            <button className="flex items-center gap-2 text-gray-600 border rounded-lg px-4 py-2 hover:bg-gray-50">
              <ArrowUpDown size={20} />
              Sort
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loan ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Interest Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loans.map((loan) => (
                <tr key={loan.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{loan.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {loan.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${loan.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{loan.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {loan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {loan.interestRate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {loan.dueDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-blue-600 hover:text-blue-800">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
