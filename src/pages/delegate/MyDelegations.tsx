import React, { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "../../store/auth";
import { ShieldAlert, Trash2 } from "lucide-react";
// Assume these API functions exist or will be created in services/api.ts
import { fetchDelegationsByMe, revokeDelegation } from "../../services/api";

interface Delegation {
  delegation_id: string;
  employee_number: string; // Delegated to this employee number
  permissions_map: string | Record<string, string[]>; // Can be string or parsed object
  valid_from: string;
  valid_until: string;
  revoked: boolean;
  delegation_allowed: boolean;
  // Add other relevant fields from your Permissions model if needed
  // e.g., delegated_to_employee_name (if available from backend)
}

export default function MyDelegations() {
  const { employee } = useAuthStore();
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDelegations = useCallback(async () => {
    if (!employee?.employee_number) {
      setError("Employee details not found.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchDelegationsByMe(employee.employee_number);
      // Ensure permissions_map is parsed if it's a string
      const parsedDelegations = data.map((del: Delegation) => ({
        ...del,
        permissions_map:
          typeof del.permissions_map === "string"
            ? JSON.parse(del.permissions_map)
            : del.permissions_map,
      }));
      setDelegations(parsedDelegations);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch delegations:", err);
      setError("Failed to load delegations. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [employee?.employee_number]);

  useEffect(() => {
    loadDelegations();
  }, [loadDelegations]);

  const handleRevoke = async (delegationId: string) => {
    if (!window.confirm("Are you sure you want to revoke this delegation?")) {
      return;
    }
    if (!employee?.employee_number || !employee?.prover_did) {
      alert("User details not found. Cannot revoke.");
      return;
    }
    setLoading(true); // Or a specific loading state for the row
    try {
      await revokeDelegation(
        delegationId,
        employee.employee_number,
        employee.prover_did
      );
      alert("Delegation revoked successfully.");
      // Refresh the list of delegations
      loadDelegations();
    } catch (err) {
      console.error("Failed to revoke delegation:", err);
      alert("Failed to revoke delegation. Please try again.");
      setLoading(false);
    }
  };

  if (loading && delegations.length === 0) {
    return (
      <div className="p-6 text-center">
        <div>Loading your delegations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>{error}</p>
        <button
          onClick={loadDelegations}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Delegations</h1>
          <p className="text-gray-600">
            View and manage permissions you have delegated to others.
          </p>
        </div>
        <ShieldAlert className="h-8 w-8 text-blue-600" />
      </div>

      {delegations.length === 0 && !loading ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          You have not delegated any permissions.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delegation ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delegated To (Emp #)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valid From
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valid Until
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
                {delegations.map((delegation) => (
                  <tr key={delegation.delegation_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {delegation.delegation_id.substring(0, 15)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {delegation.employee_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {typeof delegation.permissions_map === "object"
                        ? Object.keys(delegation.permissions_map).join(", ")
                        : delegation.permissions_map}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(delegation.valid_from).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(delegation.valid_until).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          delegation.revoked
                            ? "bg-red-100 text-red-800"
                            : new Date(delegation.valid_until) < new Date()
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {delegation.revoked
                          ? "Revoked"
                          : new Date(delegation.valid_until) < new Date()
                          ? "Expired"
                          : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {!delegation.revoked &&
                      new Date(delegation.valid_until) >= new Date() ? (
                        <button
                          onClick={() => handleRevoke(delegation.delegation_id)}
                          className="text-red-600 hover:text-red-800 flex items-center disabled:opacity-50"
                          disabled={loading}
                        >
                          <Trash2 size={16} className="mr-1" /> Revoke
                        </button>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
