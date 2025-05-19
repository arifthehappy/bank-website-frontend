import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/auth";
import { usePermissionsStore } from "../../store/permissions";
import { fetchAllEmployees } from "../../services/api";
import { Shield } from "lucide-react";
import { delegatePermissions } from "../../services/api";

interface DelegateFormData {
  delegation_id: string;
  credential_type: string;
  delegated_by: string; // delegation Id of the credential of the delegator
  delegated_by_employee_number: string;
  delegation_allowed: boolean;
  delegation_proof: string;
  employee_number: string;
  permissions_map: Record<string, string[]>;
  valid_from: string;
  valid_until: string;
  //   source_delegation_id: string;
}

export default function Delegate() {
  const { employee } = useAuthStore();
  const { credentials } = usePermissionsStore();
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<
    Record<string, string[]>
  >({});
  const [loading, setLoading] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<any>(); // Store the selected credential

  // Get delegatable credentials (where delegation_allowed is true)
  const delegatableCredentials = credentials.filter(
    (cred) => cred.delegation_allowed
  );

  const initialFormData = {
    delegation_id: `${crypto.randomUUID()}-${Date.now()}`,
    credential_type: "delegatedPermission",
    delegated_by: "", // Will be set by selectedCredential
    delegated_by_employee_number: employee?.employee_number || "",
    delegation_allowed: false,
    delegation_proof: "", // Generated on submit
    employee_number: "",
    permissions_map: {},
    valid_from: new Date().toISOString().split("T")[0],
    valid_until: "",
  };

  const [formData, setFormData] = useState<DelegateFormData>(initialFormData);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const data = await fetchAllEmployees();
        setEmployees(data);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
      }
    };
    loadEmployees();
  }, []);

  const handleSourceCredentialChange = (delegationId: string) => {
    const selectedCred = delegatableCredentials.find(
      (cred) => cred.delegation_id === delegationId
    );
    if (selectedCred) {
      setFormData((prev) => ({
        ...prev,
        delegated_by: delegationId,
        // Reset related fields when source credential changes
        permissions_map: {},
        delegation_allowed: false,
        employee_number: "",
        valid_until: "",
      }));
      setSelectedPermissions(selectedCred.permissions_map);
      setSelectedCredential(selectedCred);
    } else {
      // If no credential selected (e.g., "Select a credential" option)
      setFormData((prev) => ({
        ...prev,
        delegated_by: "",
        permissions_map: {},
      }));
      setSelectedPermissions({});
      setSelectedCredential(undefined);
    }
  };

  const handlePermissionChange = (
    category: string,
    permission: string,
    checked: boolean
  ) => {
    setFormData((prev) => {
      const updatedMap = { ...prev.permissions_map };
      if (!updatedMap[category]) {
        updatedMap[category] = [];
      }
      if (checked) {
        updatedMap[category] = [
          ...new Set([...updatedMap[category], permission]),
        ];
      } else {
        updatedMap[category] = updatedMap[category].filter(
          (p) => p !== permission
        );
      }
      return {
        ...prev,
        permissions_map: updatedMap,
      };
    });
  };

  console.log("formData:", formData);
  //   console.log(employee?.prover_did, "prover did");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Generate delegation proof [TO DO AT BACKEND]
      //   const secretKey = "your-secret-key"; // This should be securely managed
      //   const proofInput = `${formData.delegation_id}${
      //     formData.employee_number
      //   }${JSON.stringify(formData.permissions_map)}${secretKey}`;
      //   const proofBuffer = await crypto.subtle.digest(
      //     "SHA-256",
      //     new TextEncoder().encode(proofInput)
      //   );
      //   const proofArray = Array.from(new Uint8Array(proofBuffer));
      //   const proof = proofArray
      //     .map((b) => b.toString(16).padStart(2, "0"))
      //     .join("");

      //   const finalFormData = {
      //     ...formData,
      //     delegation_proof: proof,
      //   };

      const finalFormData = {
        ...formData,
        permissions_map: JSON.stringify(formData.permissions_map),
      };
      //   console.log("finalFormData", finalFormData);
      // Send to backend
      //   const response = await fetch("your-api-endpoint", {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify(finalFormData),
      //   });
      console.log("delegation clicked with data", finalFormData);

      const response = await delegatePermissions(
        finalFormData,
        employee?.prover_did || ""
      );
      console.log("response data", response);
      if (response.status !== 200) {
        alert(
          response.data.message ||
            "Delegation failed with status: " + response.status
        );
        setLoading(false);
        return;
      }

      alert("Delegation successful!");
      // Reset form for a new delegation
      setFormData({
        ...initialFormData,
        delegation_id: `${crypto.randomUUID()}-${Date.now()}`, // New ID for next delegation
        delegated_by_employee_number: employee?.employee_number || "", // Keep delegator's employee number
      });
      setSelectedCredential(undefined);
      setSelectedPermissions({});
    } catch (error) {
      console.error("Delegation failed:", error);
      alert("Failed to delegate permissions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Delegate Permissions
          </h1>
          <p className="text-gray-600">
            Delegate your permissions to other employees
          </p>
        </div>
        <Shield className="h-8 w-8 text-blue-600" />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Source Credential
              </label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.delegated_by}
                onChange={(e) => handleSourceCredentialChange(e.target.value)}
                required
              >
                <option value="">Select a credential to delegate</option>
                {delegatableCredentials.map((cred) => (
                  <option key={cred.delegation_id} value={cred.delegation_id}>
                    ID: {cred.delegation_id} ({cred.credential_type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Employee to Delegate
              </label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.employee_number}
                onChange={(e) =>
                  setFormData({ ...formData, employee_number: e.target.value })
                }
                required
              >
                <option value="">Select an employee</option>
                {employees
                  .filter(
                    (emp) => emp.employee_number !== employee?.employee_number
                  )
                  .map((emp) => (
                    <option
                      key={emp.employee_number}
                      value={emp.employee_number}
                    >
                      {emp.full_name} ({emp.employee_number})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Valid From
              </label>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.valid_from}
                onChange={(e) =>
                  setFormData({ ...formData, valid_from: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Valid Until
              </label>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.valid_until}
                onChange={(e) =>
                  setFormData({ ...formData, valid_until: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Allow Further Delegation
              </label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.delegation_allowed.toString()}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    delegation_allowed: e.target.value === "true",
                  })
                }
                required
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Permissions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(selectedPermissions).map(
                ([category, permissions]) => (
                  <div key={category} className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-2 capitalize">
                      {category}
                    </h4>
                    {permissions.map((permission) => (
                      <label
                        key={`${category}-${permission}`}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={
                            formData.permissions_map[category]?.includes(
                              permission
                            ) || false
                          }
                          onChange={(e) =>
                            handlePermissionChange(
                              category,
                              permission,
                              e.target.checked
                            )
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600 capitalize">
                          {permission}
                        </span>
                      </label>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Delegating..." : "Delegate Permissions"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
