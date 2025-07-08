import { useState, useEffect, useCallback } from "react";
import { Search, Filter, Download, UserCheck, User } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

// Put this at the top of your component file
const statusStyles = {
  scheduled: "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300",
  "checked-in":
    "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300",
  "checked-out":
    "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300",
  cancelled: "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300",
};

const VisitorsList = () => {
  const [visitors, setVisitors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    startDate: "",
    endDate: "",
  });

  const fetchVisitors = useCallback(async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        return;
      }

      const queryParams = new URLSearchParams({
        page: String(page),
        limit: "10",
        ...(filterStatus !== "all" && { status: filterStatus }),
        ...(appliedFilters.search && { search: appliedFilters.search }),
        ...(appliedFilters.startDate && {
          startDate: appliedFilters.startDate,
        }),
        ...(appliedFilters.endDate && { endDate: appliedFilters.endDate }),
      }).toString();

      const response = await fetch(
        `https://phawaazvms.onrender.com/api/admin/visitors?${queryParams}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          mode: "cors",
        }
      );

      const data = await response.json();
      setVisitors(data.data.visitors || []);
      setTotalPages(data.data.pagination?.pages || 1);
    } catch (error) {
      toast.error("Failed to load visitors");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, page, appliedFilters]);

  // Initial load and when filterStatus or page changes
  useEffect(() => {
    fetchVisitors();
  }, [filterStatus, page, fetchVisitors]);

  const handleApplyFilters = () => {
    setAppliedFilters({
      search: searchQuery,
      startDate,
      endDate,
    });
    setPage(1); // Reset to first page when applying new filters
  };

  // const handleCheckIn = (visitorId) => {
  //   const updatedVisitors = visitors.map((visitor) => {
  //     if (visitor.id === visitorId) {
  //       return {
  //         ...visitor,
  //         status: "checked-in",
  //         checkInTime: new Date().toLocaleTimeString([], {
  //           hour: "2-digit",
  //           minute: "2-digit",
  //         }),
  //       };
  //     }
  //     return visitor;
  //   });

  //   setVisitors(updatedVisitors);
  //   toast.success("Visitor checked in successfully");
  // };

  // const handleCheckOut = (visitorId) => {
  //   const updatedVisitors = visitors.map((visitor) => {
  //     if (visitor.id === visitorId) {
  //       return {
  //         ...visitor,
  //         status: "completed",
  //         checkOutTime: new Date().toLocaleTimeString([], {
  //           hour: "2-digit",
  //           minute: "2-digit",
  //         }),
  //       };
  //     }
  //     return visitor;
  //   });

  //   setVisitors(updatedVisitors);
  //   toast.success("Visitor checked out successfully");
  // };

  const exportToCsv = () => {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Purpose",
      "Company",
      "Date",
      "Status",
    ];
    const csvContent = [
      headers.join(","),
      ...visitors.map((v) =>
        [
          `${v.user.firstName} ${v.user.lastName}`,
          v.user.email,
          v.user.phone,
          v.purpose,
          v.company,
          format(v.visitDate, "yyyy-MM-dd HH:mm"),
          v.status,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `visitors_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800 dark:text-white">
          <UserCheck size={28} className="text-blue-500" /> Visitor Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage and track all visitors
        </p>
      </div>

      {/* filters */}
      <div className="flex flex-col lg:flex-row items-start justify-between gap-6 mb-4">
        {/* Left: Search & Date Filters */}
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Filter
              size={18}
              className="absolute left-3 top-2.5 text-gray-400"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="checked-in">Checked In</option>
              <option value="checked-out">Checked Out</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex gap-5">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border px-3 py-2 rounded-lg dark:bg-gray-700 dark:text-white"
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border px-3 py-2 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search visitors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
            />
            <Search
              size={18}
              className="absolute left-3 top-2.5 text-gray-400"
            />
          </div>

          <button
            onClick={handleApplyFilters}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Apply Filters
          </button>
        </div>

        {/* Right: Export */}
        <div className="flex flex-wrap gap-4 items-center">
          <button
            onClick={exportToCsv}
            className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-white"
          >
            <Download size={18} className="inline-block mr-2" /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 border rounded-xl">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Purpose
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Host
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
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

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center p-16 text-gray-500">
                  Loading visitors...
                </td>
              </tr>
            ) : visitors.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-16 text-gray-500">
                  No visitors found.
                </td>
              </tr>
            ) : (
              visitors.map((v) => (
                <tr
                  key={v._id}
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
                          {v.user?.firstName} {v.user?.lastName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {v.user?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {v.purpose}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {v.company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {format(v.visitDate, "yyyy-MM-dd HH:mm")}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        statusStyles[v.status] || statusStyles["checked-out"]
                      }`}
                    >
                      {v.status
                        .replace(/-/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-between">
                      {v.status === "pending" ? (
                        <button
                          // onClick={() => handleCheckIn(v._id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200 cursor-pointer whitespace-nowrap"
                        >
                          Check In
                        </button>
                      ) : v.status === "checked-in" ? (
                        <button
                          // onClick={() => handleCheckOut(v._id)}
                          className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200 cursor-pointer whitespace-nowrap"
                        >
                          Check Out
                        </button>
                      ) : (
                        <button
                          className="bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-3 py-1 rounded-md text-sm"
                          disabled
                        >
                          Completed
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mb-6 text-black dark:text-white">
        <button
          onClick={() => setPage((p) => p - 1)}
          disabled={page <= 1}
          className="px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
        >
          ← Prev
        </button>

        <span className="text-sm font-semibold">
          Page <span className="text-blue-600 dark:text-blue-400">{page}</span>{" "}
          of{" "}
          <span className="text-gray-600 dark:text-gray-300">{totalPages}</span>
        </span>

        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= totalPages}
          className="px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default VisitorsList;
