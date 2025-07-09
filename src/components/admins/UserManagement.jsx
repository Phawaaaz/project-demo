import { useState, useEffect, useCallback } from "react";
import { Search, UserCog, Shield } from "lucide-react";
import toast from "react-hot-toast";

const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // In a real app, this would be an API call
        const mockUsers = [
          {
            id: "u1",
            name: "John Smith",
            email: "john@example.com",
            role: "Visitor",
            lastLogin: "2023-10-15 09:23 AM",
            status: "Active",
          },
          {
            id: "u2",
            name: "Sarah Johnson",
            email: "sarah@example.com",
            role: "Admin",
            lastLogin: "2023-10-14 02:45 PM",
            status: "Active",
          },
          {
            id: "u3",
            name: "Mike Brown",
            email: "mike@example.com",
            role: "Visitor",
            lastLogin: "2023-10-10 11:30 AM",
            status: "Inactive",
          },
          {
            id: "u4",
            name: "Lisa Anderson",
            email: "lisa@example.com",
            role: "Visitor",
            lastLogin: "2023-10-12 03:15 PM",
            status: "Active",
          },
        ];

        // Load users immediately
        setUsers(mockUsers);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users");
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // User role management
  const handlePromoteToAdmin = useCallback((userId) => {
    setUsers((users) =>
      users.map((user) =>
        user.id === userId ? { ...user, role: "Admin" } : user
      )
    );
    toast.success("User promoted to Admin successfully");
    setShowUserModal(false);
  }, []);

  const handleDemoteToVisitor = useCallback((userId) => {
    setUsers((users) =>
      users.map((user) =>
        user.id === userId ? { ...user, role: "Visitor" } : user
      )
    );
    toast.success("Admin demoted to Visitor successfully");
    setShowUserModal(false);
  }, []);

  // User status management
  const handleToggleUserStatus = useCallback((userId) => {
    setUsers((users) =>
      users.map((user) =>
        user.id === userId
          ? {
              ...user,
              status: user.status === "Active" ? "Inactive" : "Active",
            }
          : user
      )
    );
    toast.success("User status updated successfully");
  }, []);

  // Modal management
  const handleOpenUserModal = useCallback((user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  }, []);

  const handleCloseUserModal = useCallback(() => {
    setShowUserModal(false);
  }, []);

  // Filter users based on search query
  const filteredUsers = searchQuery
    ? users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.role.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 bg-gray-50 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 dark:text-gray-300">Loading user data...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800 dark:text-white flex items-center gap-2">
          <UserCog size={28} className="text-blue-500" />
          User Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage user roles and permissions.
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 dark:border-gray-700 mb-8">
        {/* Search and title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            User List
          </h2>
          <div className="relative w-full md:w-auto">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full md:w-64 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white transition-all duration-200"
              aria-label="Search users"
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500"
              size={18}
            />
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Last Login</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-800 dark:text-white">
                        {user.name}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-600 dark:text-gray-300">
                      {user.email}
                    </td>
                    <td className="px-4 py-4 text-gray-600 dark:text-gray-300">
                      {user.role}
                      {user.role === "Admin" && (
                        <Shield
                          size={14}
                          className="ml-1 inline text-yellow-500"
                        />
                      )}
                    </td>
                    <td className="px-4 py-4 text-gray-600 dark:text-gray-300">
                      {user.lastLogin}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          user.status === "Active"
                            ? "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 flex gap-2">
                      <button
                        onClick={() => handleOpenUserModal(user)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200"
                        aria-label={`Manage ${user.name}`}
                      >
                        Manage
                      </button>
                      <button
                        onClick={() => handleToggleUserStatus(user.id)}
                        className={`${
                          user.status === "Active"
                            ? "bg-gray-200 hover:bg-gray-300 text-gray-800"
                            : "bg-green-500 hover:bg-green-600 text-white"
                        } px-3 py-1 rounded-md text-sm transition-colors duration-200`}
                        aria-label={`${
                          user.status === "Active" ? "Deactivate" : "Activate"
                        } ${user.name}`}
                      >
                        {user.status === "Active" ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Management Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
            role="dialog"
            aria-labelledby="user-modal-title"
            aria-modal="true"
          >
            <div className="flex justify-between items-center mb-4">
              <h3
                id="user-modal-title"
                className="text-lg font-semibold text-gray-800 dark:text-white"
              >
                Manage User: {selectedUser.name}
              </h3>
              <button
                onClick={handleCloseUserModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Email:
                </p>
                <p className="text-gray-800 dark:text-white">
                  {selectedUser.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Current Role:
                </p>
                <p className="text-gray-800 dark:text-white">
                  {selectedUser.role}
                  {selectedUser.role === "Admin" && (
                    <Shield size={14} className="ml-1 inline text-yellow-500" />
                  )}
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                {selectedUser.role === "Visitor" ? (
                  <button
                    onClick={() => handlePromoteToAdmin(selectedUser.id)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm transition-colors duration-200"
                  >
                    Promote to Admin
                  </button>
                ) : (
                  <button
                    onClick={() => handleDemoteToVisitor(selectedUser.id)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm transition-colors duration-200"
                  >
                    Demote to Visitor
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
