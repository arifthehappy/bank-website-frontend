import React, { useEffect, useState } from "react";
import { Building2, Users, DollarSign, Map } from "lucide-react";
import { usePermissionsStore } from "../../store/permissions";
import { useAuthStore } from "../../store/auth";
import { requestPermissionProof } from "../../services/api";

export default function BranchManagement() {
  const [loading, setLoading] = useState(true);
  const { credentials, addCredential } = usePermissionsStore();
  const { employee } = useAuthStore();
  const [hasPermission, setHasPermission] = useState(false);
  const [hasWritePermission, setHasWritePermission] = useState(false);

  const branches = [
    {
      id: "BR001",
      name: "Downtown Branch",
      manager: "Robert Wilson",
      employees: 25,
      accounts: 1200,
      status: "Active",
      address: "123 Main St, Downtown",
    },
    // More mock data would be added here
  ];

  useEffect(() => {
    const found = credentials.some((cred) =>
      cred.permissions_map?.Branch_management?.includes("read")
    );
    setHasPermission(found);
    setHasWritePermission(
      credentials.some((cred) =>
        cred.permissions_map?.Branch_management?.includes("write")
      )
    );
    setLoading(false);
  }, [credentials]);

  const handlePresentPermission = async () => {
    setLoading(true);
    if (!employee?.connection_id) {
      console.error("Employee connection ID is missing.");
      setLoading(false);
      return;
    }
    const res = await requestPermissionProof(employee.connection_id);
    if (res.success) {
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
      setHasPermission(
        credential.permissions_map?.Branch_management?.includes("read")
      );
      setHasWritePermission(
        credential.permissions_map?.Branch_management?.includes("write")
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
        <div>Access not given for Branch Management page.</div>
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
            Branch Management
          </h1>
          <p className="text-gray-600">Monitor and manage bank branches</p>
        </div>
        <button
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-10"
          disabled={!hasWritePermission}
        >
          <Building2 size={20} />
          Add Branch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Building2 className="text-blue-600" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-gray-700">
                Total Branches
              </h3>
              <p className="text-2xl font-bold text-blue-600">12</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Users className="text-green-600" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-gray-700">
                Total Staff
              </h3>
              <p className="text-2xl font-bold text-green-600">245</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <DollarSign className="text-purple-600" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-gray-700">
                Total Revenue
              </h3>
              <p className="text-2xl font-bold text-purple-600">$2.5M</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Map className="text-orange-600" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Regions</h3>
              <p className="text-2xl font-bold text-orange-600">5</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Branch Overview</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Manager
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accounts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {branches.map((branch) => (
                <tr key={branch.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{branch.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{branch.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {branch.manager}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {branch.employees}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {branch.accounts}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {branch.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {branch.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-blue-600 hover:text-blue-800">
                      Manage
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
