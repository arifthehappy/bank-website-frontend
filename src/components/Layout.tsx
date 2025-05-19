import React from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Building2,
  Users,
  Shield,
  LogOut,
  ChevronDown,
  DollarSign,
  Share2, // Import Share2 icon for delegations
} from "lucide-react";
import { useAuthStore } from "../store/auth";
import { usePermissionsStore } from "../store/permissions";

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { employee, logout } = useAuthStore();
  const { credentials } = usePermissionsStore();

  const handleLogout = () => {
    logout();
    // navigate("/login");
  };

  // Define the available pages and their required permissions
  const pages = [
    {
      name: "All Employees",
      path: "/employees",
      icon: <Users className="mr-3 h-5 w-5" />,
      permission: "view_employees",
    },
    {
      name: "Loans",
      path: "/loans",
      icon: <DollarSign className="mr-3 h-5 w-5" />,
      permission: "manage_loans",
    },
    {
      name: "Accounts",
      path: "/accounts",
      icon: <Building2 className="mr-3 h-5 w-5" />,
      permission: "manage_accounts",
    },
    {
      name: "Transactions",
      path: "/transactions",
      icon: <DollarSign className="mr-3 h-5 w-5" />,
      permission: "view_transactions",
    },
    {
      name: "Customer Support",
      path: "/customer-support",
      icon: <Shield className="mr-3 h-5 w-5" />,
      permission: "assist_customers",
    },
    {
      name: "Branch Management",
      path: "/branch-management",
      icon: <Building2 className="mr-3 h-5 w-5" />,
      permission: "manage_branches",
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <Shield className="mr-3 h-5 w-5" />,
      permission: "view_reports",
    },
  ];

  // Check if delegation is allowed in any credential
  const canDelegate = credentials.some(
    (cred) => cred.delegation_allowed === true
  );

  // Filter pages based on the user's permissions
  // const accessiblePages = pages.filter((page) =>
  //   employee?.permissions?.includes(page.permission)
  // );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Building2 className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  XYZ BANK
                </span>
              </div>
            </div>

            <div className="flex items-center">
              <div className="relative">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                  <span>{employee?.full_name || "User"}</span>
                  <ChevronDown size={16} />
                </button>
              </div>
              {canDelegate && (
                <div className="whitespace-nowrap ml-4">
                  <button
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                    onClick={() => {
                      // alert("Delegate action triggered");
                      navigate("/delegate");
                    }}
                  >
                    Delegate
                  </button>
                </div>
              )}
              {canDelegate && (
                <Link
                  to="/my-delegations"
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <Share2 className="mr-3 h-5 w-5" />
                  My Delegations
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="ml-4 p-2 text-gray-500 hover:text-gray-700"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="w-64 bg-white border-r min-h-screen p-4">
          <nav className="space-y-1">
            {pages.map((page) => (
              <Link
                key={page.name}
                to={page.path}
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                {page.icon}
                {page.name}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
