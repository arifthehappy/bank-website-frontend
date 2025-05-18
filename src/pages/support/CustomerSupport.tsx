import React, { useEffect, useState } from "react";
import { MessageSquare, Phone, Mail, Clock } from "lucide-react";
import { usePermissionsStore } from "../../store/permissions";
import { useAuthStore } from "../../store/auth";
import { requestPermissionProof } from "../../services/api";

export default function CustomerSupport() {
  const [loading, setLoading] = useState(true);
  const { credentials, addCredential } = usePermissionsStore();
  const { employee } = useAuthStore();
  const [hasPermission, setHasPermission] = useState(false);
  const [hasWritePermission, setHasWritePermission] = useState(false);

  const tickets = [
    {
      id: "TKT001",
      customer: "Michael Brown",
      subject: "Account Access Issues",
      priority: "High",
      status: "Open",
      created: "2024-03-12 10:30",
      assignedTo: "John Smith",
    },
    // More mock data would be added here
  ];

  useEffect(() => {
    const found = credentials.some((cred) =>
      cred.permissions_map?.customer_support?.includes("read")
    );
    setHasPermission(found);
    setHasWritePermission(
      credentials.some((cred) =>
        cred.permissions_map?.customer_support?.includes("write")
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
        credential.permissions_map?.customer_support?.includes("read")
      );
      setHasWritePermission(
        credential.permissions_map?.customer_support?.includes("write")
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
        <div>Access not given for Customer Support page.</div>
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
          <h1 className="text-2xl font-bold text-gray-900">Customer Support</h1>
          <p className="text-gray-600">
            Manage customer inquiries and support tickets
          </p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <MessageSquare size={20} />
          New Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <MessageSquare className="text-blue-600" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-gray-700">
                Open Tickets
              </h3>
              <p className="text-2xl font-bold text-blue-600">23</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Clock className="text-orange-600" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Pending</h3>
              <p className="text-2xl font-bold text-orange-600">12</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Phone className="text-green-600" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-gray-700">
                Active Calls
              </h3>
              <p className="text-2xl font-bold text-green-600">5</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Mail className="text-purple-600" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-gray-700">
                Unread Messages
              </h3>
              <p className="text-2xl font-bold text-purple-600">8</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Tickets</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ticket ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {ticket.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {ticket.customer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {ticket.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          disabled={!hasWritePermission}
                        >
                          Handle
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
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <button className="w-full flex items-center gap-3 bg-blue-50 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-100">
              <Phone size={20} />
              Start New Call
            </button>
            <button className="w-full flex items-center gap-3 bg-green-50 text-green-700 px-4 py-3 rounded-lg hover:bg-green-100">
              <MessageSquare size={20} />
              Send Message
            </button>
            <button className="w-full flex items-center gap-3 bg-purple-50 text-purple-700 px-4 py-3 rounded-lg hover:bg-purple-100">
              <Mail size={20} />
              Compose Email
            </button>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-gray-700 mb-3">Online Agents</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-700 font-semibold">JS</span>
                </div>
                <div>
                  <p className="text-sm font-medium">John Smith</p>
                  <p className="text-xs text-gray-500">Available</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-700 font-semibold">AK</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Alice King</p>
                  <p className="text-xs text-gray-500">In Call</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
