import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  UserCheck,
  User,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

const VisitorsList = () => {
  const [visitors, setVisitors] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showAddVisitorModal, setShowAddVisitorModal] = useState(false);
  const [visitorToEdit, setVisitorToEdit] = useState(null);

  useEffect(() => {
    // Load mock visitors data immediately
    const mockVisitors = [
      {
        id: "v1",
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1 (555) 123-4567",
        purpose: "Interview",
        host: "HR Department",
        time: "10:30 AM",
        date: "2025-05-06",
        status: "checked-in",
        checkInTime: "10:28 AM",
      },
      {
        id: "v2",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        phone: "+1 (555) 987-6543",
        purpose: "Meeting",
        host: "Marketing Team",
        time: "11:00 AM",
        date: "2025-05-06",
        status: "pending",
      },
      {
        id: "v3",
        name: "Robert Johnson",
        email: "robert.j@example.com",
        phone: "+1 (555) 456-7890",
        purpose: "Delivery",
        host: "Receiving",
        time: "09:15 AM",
        date: "2025-05-06",
        status: "completed",
        checkInTime: "09:10 AM",
        checkOutTime: "09:45 AM",
      },
      {
        id: "v4",
        name: "Emily Davis",
        email: "emily.davis@example.com",
        phone: "+1 (555) 234-5678",
        purpose: "Client Meeting",
        host: "Sales Team",
        time: "02:00 PM",
        date: "2025-05-06",
        status: "pending",
      },
      {
        id: "v5",
        name: "Michael Wilson",
        email: "michael.wilson@example.com",
        phone: "+1 (555) 345-6789",
        purpose: "Job Interview",
        host: "Engineering",
        time: "10:00 AM",
        date: "2025-05-06",
        status: "checked-in",
        checkInTime: "09:55 AM",
      },
      {
        id: "v6",
        name: "Jessica Brown",
        email: "jessica.b@example.com",
        phone: "+1 (555) 567-8901",
        purpose: "Site Tour",
        host: "Customer Success",
        time: "01:30 PM",
        date: "2025-05-07",
        status: "pending",
      },
      {
        id: "v7",
        name: "David Miller",
        email: "david.m@example.com",
        phone: "+1 (555) 678-9012",
        purpose: "Vendor Meeting",
        host: "Procurement",
        time: "11:30 AM",
        date: "2025-05-07",
        status: "pending",
      },
      {
        id: "v8",
        name: "Sarah Wilson",
        email: "sarah.w@example.com",
        phone: "+1 (555) 789-0123",
        purpose: "Interview",
        host: "Marketing Team",
        time: "09:30 AM",
        date: "2025-05-07",
        status: "pending",
      },
    ];

    setVisitors(mockVisitors);
    setFilteredVisitors(mockVisitors);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Apply filters
    let result = [...visitors];

    if (searchQuery) {
      result = result.filter(
        (visitor) =>
          visitor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          visitor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          visitor.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
          visitor.purpose.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      result = result.filter((visitor) => visitor.status === filterStatus);
    }

    setFilteredVisitors(result);
  }, [searchQuery, filterStatus, visitors]);

  const handleCheckIn = (visitorId) => {
    const updatedVisitors = visitors.map((visitor) => {
      if (visitor.id === visitorId) {
        return {
          ...visitor,
          status: "checked-in",
          checkInTime: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
      }
      return visitor;
    });

    setVisitors(updatedVisitors);
    toast.success("Visitor checked in successfully");
  };

  const handleCheckOut = (visitorId) => {
    const updatedVisitors = visitors.map((visitor) => {
      if (visitor.id === visitorId) {
        return {
          ...visitor,
          status: "completed",
          checkOutTime: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
      }
      return visitor;
    });

    setVisitors(updatedVisitors);
    toast.success("Visitor checked out successfully");
  };

  const handleAddVisitor = (newVisitor) => {
    const visitorWithId = {
      ...newVisitor,
      id: `v${visitors.length + 1}`,
      status: "pending",
    };

    setVisitors([...visitors, visitorWithId]);
    setShowAddVisitorModal(false);
  };

  const handleEditVisitor = (updatedVisitor) => {
    const updatedVisitors = visitors.map((visitor) => {
      if (visitor.id === updatedVisitor.id) {
        return updatedVisitor;
      }
      return visitor;
    });

    setVisitors(updatedVisitors);
    setVisitorToEdit(null);
  };

  const handleDeleteVisitor = (visitorId) => {
    if (window.confirm("Are you sure you want to delete this visitor?")) {
      const updatedVisitors = visitors.filter(
        (visitor) => visitor.id !== visitorId
      );
      setVisitors(updatedVisitors);
    }
  };

  const exportToCsv = () => {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Purpose",
      "Host",
      "Date",
      "Time",
      "Status",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredVisitors.map((visitor) =>
        [
          visitor.name,
          visitor.email,
          visitor.phone,
          visitor.purpose,
          visitor.host,
          visitor.date,
          visitor.time,
          visitor.status,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `visitors_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 dark:text-gray-300">
          Loading visitors list...
        </p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800 dark:text-white flex items-center gap-2">
          <UserCheck size={28} className="text-blue-500" />
          Visitor Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage and track all visitors to your premises
        </p>
      </header>

      {/* Filters and actions */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
        <div className="flex gap-4 flex-wrap">
          <div className="relative">
            <input
              type="text"
              placeholder="Search visitors..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              className="pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white transition-all duration-200 w-full md:w-64"
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500"
              size={18}
            />
          </div>

          <div className="relative flex items-center">
            <Filter
              size={18}
              className="absolute left-3 text-gray-400 dark:text-gray-500"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white appearance-none transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="checked-in">Checked In</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportToCsv}
            className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <Download size={18} />
            <span>Export</span>
          </button>

          <button
            onClick={() => setShowAddVisitorModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
          >
            <Plus size={18} />
            <span>Add Visitor</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Host
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredVisitors.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    No visitors found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredVisitors.map((visitor) => (
                  <tr
                    key={visitor.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <User
                            size={20}
                            className="text-gray-500 dark:text-gray-300"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {visitor.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {visitor.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {visitor.purpose}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {visitor.host}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      <div>{new Date(visitor.date).toLocaleDateString()}</div>
                      <div>{visitor.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          visitor.status === "checked-in"
                            ? "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300"
                            : visitor.status === "pending"
                            ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {visitor.status === "checked-in"
                          ? "Checked In"
                          : visitor.status === "pending"
                          ? "Pending"
                          : "Completed"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-between">
                        {visitor.status === "pending" ? (
                          <button
                            onClick={() => handleCheckIn(visitor.id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200"
                          >
                            Check In
                          </button>
                        ) : visitor.status === "checked-in" ? (
                          <button
                            onClick={() => handleCheckOut(visitor.id)}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200"
                          >
                            Check Out
                          </button>
                        ) : (
                          <button
                            className="bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-3 py-1 rounded-md text-sm cursor-default"
                            disabled
                          >
                            Completed
                          </button>
                        )}
                        <button
                          onClick={() => setVisitorToEdit(visitor)}
                          className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors duration-200"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteVisitor(visitor.id)}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors duration-200"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Visitor Modal */}
      {showAddVisitorModal && (
        <VisitorFormModal
          onClose={() => setShowAddVisitorModal(false)}
          onSubmit={handleAddVisitor}
          title="Add New Visitor"
        />
      )}

      {/* Edit Visitor Modal */}
      {visitorToEdit && (
        <VisitorFormModal
          visitor={visitorToEdit}
          onClose={() => setVisitorToEdit(null)}
          onSubmit={handleEditVisitor}
          title="Edit Visitor"
        />
      )}
    </div>
  );
};

// Visitor Form Modal Component with updated styling
const VisitorFormModal = ({ visitor, onClose, onSubmit, title }) => {
  const [formData, setFormData] = useState({
    name: visitor?.name || "",
    email: visitor?.email || "",
    phone: visitor?.phone || "",
    purpose: visitor?.purpose || "",
    host: visitor?.host || "",
    date: visitor?.date || new Date().toISOString().split("T")[0],
    time: visitor?.time || "09:00 AM",
    status: visitor?.status || "pending",
    id: visitor?.id || null,
    checkInTime: visitor?.checkInTime || null,
    checkOutTime: visitor?.checkOutTime || null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white transition-all duration-200"
              />
            </div>

            {/* Other form fields with similar styling */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white transition-all duration-200"
              />
            </div>

            {/* Add remaining fields with the same pattern */}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white transition-all duration-200"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg transition-all duration-200"
            >
              {visitor ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VisitorsList;
