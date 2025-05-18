import { useEffect, useState } from "react";
import { fetchAllEmployees } from "../../services/api";
import { usePermissionsStore } from "../../store/permissions";
import { useAuthStore } from "../../store/auth";
import { requestPermissionProof } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { UserPlus, Search } from "lucide-react";
import { filter } from "rxjs/operators";

export default function AllEmployees() {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<any[]>([]);
  const { credentials, addCredential } = usePermissionsStore();
  const { employee } = useAuthStore();
  const [hasPermission, setHasPermission] = useState(false);
  const [hasWritePermission, setHasWritePermission] = useState(false);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  console.log(credentials, "credentials Permissions");

  // Check for permission on mount
  useEffect(() => {
    const found = credentials.some((cred) =>
      cred.permissions_map?.all_employees?.includes("read")
    );
    setHasPermission(found);
    setHasWritePermission(
      credentials.some((cred) =>
        cred.permissions_map?.all_employees?.includes("write")
      )
    );
    setLoading(false);
  }, [credentials]);

  // Fetch employees when permission is granted
  useEffect(() => {
    if (hasPermission) {
      setLoading(true);
      fetchAllEmployees()
        .then((data) => setEmployees(data))
        .catch((err) => {
          console.error("Failed to fetch employees:", err);
          setEmployees([]);
        })
        .finally(() => setLoading(false));
    }
  }, [hasPermission]);

  // Request permission proof
  console.log(employee, "employee");
  console.log(hasPermission, "hasPermission");
  const handlePresentPermission = async () => {
    setLoading(true);
    if (!employee?.connection_id) {
      console.error("Employee connection ID is missing.");
      setLoading(false);
      return;
    }
    const res = await requestPermissionProof(employee.connection_id);
    console.log(res, "res");
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
      setHasPermission(
        credential.permissions_map?.all_employees?.includes("read")
      );
      setHasWritePermission(
        credential.permissions_map?.all_employees?.includes("write")
      );
    }
    if (res.error) {
      console.error("Error requesting permission proof:", res.error);
      alert(res.error.reason);
    }
    setLoading(false);
  };

  const filteredEmployees = employees.filter((emp) => {
    const q = search.toLowerCase();
    return (
      emp.full_name?.toLowerCase().includes(q) ||
      emp.email?.toLowerCase().includes(q) ||
      emp.employee_number?.toLowerCase().includes(q) ||
      emp.designation?.toLowerCase().includes(q)
    );
  });

  if (loading) return <div>Checking permissions...</div>;

  if (!hasPermission)
    return (
      <div>
        <div>Access not given for Employees page.</div>
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
            Employee Directory
          </h1>
          <p className="text-gray-600">Manage and view all bank employees</p>
        </div>
        {/* <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <UserPlus size={20} />
          Add Employee
        </button> */}
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
              placeholder="Search employees..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th>Name</th>
                <th>Employee ID</th>
                <th>Email</th>
                <th>Role</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((emp) => (
                <tr key={emp._id}>
                  <td>{emp.full_name}</td>
                  <td>{emp.employee_number}</td>
                  <td>{emp.email}</td>
                  <td>{emp.designation}</td>
                  <td>{emp.branch_name}</td>
                  <td>
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {emp.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="text-blue-600 hover:text-blue-800 cursor-pointer"
                      disabled={!hasWritePermission}
                      onClick={() => navigate(`/employees/${emp._id}`)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-4">
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
