import React, { useEffect, useState } from "react";
import { BarChart, PieChart, LineChart, Download } from "lucide-react";
import { usePermissionsStore } from "../../store/permissions";
import { useAuthStore } from "../../store/auth";
import { requestPermissionProof } from "../../services/api";

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const { credentials, addCredential } = usePermissionsStore();
  const { employee } = useAuthStore();
  const [hasPermission, setHasPermission] = useState(false);
  const [hasWritePermission, setHasWritePermission] = useState(false);

  const reports = [
    {
      id: "RPT001",
      name: "Monthly Transaction Summary",
      type: "Financial",
      generated: "2024-03-12",
      status: "Ready",
      size: "2.5 MB",
    },
    // More mock data would be added here
  ];

  useEffect(() => {
    const found = credentials.some((cred) =>
      cred.permissions_map?.Reports?.includes("read")
    );
    setHasPermission(found);
    setHasWritePermission(
      credentials.some((cred) =>
        cred.permissions_map?.Reports?.includes("write")
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
      setHasPermission(credential.permissions_map?.Reports?.includes("read"));
      setHasWritePermission(
        credential.permissions_map?.Reports?.includes("write")
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
        <div>Access not given for Reports page.</div>
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
            Reports & Analytics
          </h1>
          <p className="text-gray-600">Generate and view bank reports</p>
        </div>
        <button
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-10"
          disabled={!hasWritePermission}
        >
          <BarChart size={20} />
          Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Transaction Volume
            </h3>
            <LineChart className="text-blue-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-blue-600">$1.2M</p>
          <p className="text-sm text-gray-500">+12% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Active Accounts
            </h3>
            <PieChart className="text-green-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-green-600">2,547</p>
          <p className="text-sm text-gray-500">+85 new this month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Revenue Growth
            </h3>
            <BarChart className="text-purple-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-purple-600">15.7%</p>
          <p className="text-sm text-gray-500">Year over year</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Available Reports</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Report ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Generated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {report.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {report.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {report.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {report.generated}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {report.size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                          <Download size={16} />
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Reports</h2>
          <div className="space-y-4">
            <button className="w-full flex items-center gap-3 bg-blue-50 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-100">
              <BarChart size={20} />
              Transaction Summary
            </button>
            <button className="w-full flex items-center gap-3 bg-green-50 text-green-700 px-4 py-3 rounded-lg hover:bg-green-100">
              <PieChart size={20} />
              Account Statistics
            </button>
            <button className="w-full flex items-center gap-3 bg-purple-50 text-purple-700 px-4 py-3 rounded-lg hover:bg-purple-100">
              <LineChart size={20} />
              Revenue Report
            </button>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-gray-700 mb-3">
              Schedule Reports
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Daily Summary</p>
                  <p className="text-xs text-gray-500">
                    Next: Tomorrow, 6:00 AM
                  </p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Weekly Analytics</p>
                  <p className="text-xs text-gray-500">Next: Monday, 8:00 AM</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
