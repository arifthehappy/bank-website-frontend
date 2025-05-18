import React, { useEffect, useState } from "react";
import { CreditCard, Search, Filter, ArrowUpDown } from "lucide-react";
import { usePermissionsStore } from "../../store/permissions";
import { useAuthStore } from "../../store/auth";
import { requestPermissionProof } from "../../services/api";

export default function Accounts() {
  const [loading, setLoading] = useState(true);
  const { credentials, addCredential } = usePermissionsStore();
  const { employee } = useAuthStore();
  const [hasPermission, setHasPermission] = useState(false);
  const [hasWritePermission, setHasWritePermission] = useState(false);

  const accounts = [
    {
      id: "ACC001",
      customerName: "Sarah Wilson",
      accountType: "Savings",
      balance: 25000,
      status: "Active",
      lastTransaction: "2024-03-10",
      branch: "Downtown",
    },
    // More mock data would be added here
  ];

  // Check for permission on mount
  useEffect(() => {
    const found = credentials.some((cred) =>
      cred.permissions_map?.accounts?.includes("read")
    );
    setHasPermission(found);
    setHasWritePermission(
      credentials.some((cred) =>
        cred.permissions_map?.accounts?.includes("write")
      )
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
      setHasPermission(credential.permissions_map?.accounts?.includes("read"));
      setHasWritePermission(
        credential.permissions_map?.accounts?.includes("write")
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
        <div>Access not given for Accounts page.</div>
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
          <h1 className="text-2xl font-bold text-gray-900">
            Account Management
          </h1>
          <p className="text-gray-600">View and manage customer accounts</p>
        </div>
        <button
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-10"
          disabled={!hasWritePermission}
        >
          <CreditCard size={20} />
          New Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">
            Total Accounts
          </h3>
          <p className="text-2xl font-bold text-blue-600">2,547</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">
            Total Deposits
          </h3>
          <p className="text-2xl font-bold text-green-600">$4.2M</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">
            New Accounts (This Month)
          </h3>
          <p className="text-2xl font-bold text-purple-600">45</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search accounts..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 text-gray-600 border rounded-lg px-4 py-2 hover:bg-gray-50">
            <Filter size={20} />
            Filter
          </button>
          <button className="flex items-center gap-2 text-gray-600 border rounded-lg px-4 py-2 hover:bg-gray-50">
            <ArrowUpDown size={20} />
            Sort
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accounts.map((account) => (
                <tr key={account.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{account.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {account.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {account.accountType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${account.balance}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {account.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {account.lastTransaction}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {account.branch}
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
