import { useState, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { Clipboard, Bell, User, Calendar, PlusCircle } from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../../../layout/DashboardLayout";
import StatsCard from "../../../components/reusable/StatsCard";
import FeedbackForm from "../../../components/visitors/FeedbackForm";
import { useVisit } from "../../../hooks/VisitContext";
import ResponsiveTable from "../../../components/common/ResponsiveTable";

const VisitorDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { unreadNotifications } = useVisit();

  const isDashboardRoot = location.pathname === "/visitor";
  const currentPath = location.pathname.split("/").filter(Boolean)[1] || "";

  const [visitStats, setVisitStats] = useState({
    upcoming: 0,
    completed: 0,
    total: 0,
  });
  const [topVisits, setTopVisits] = useState([]);
  const [completedVisits, setCompletedVisits] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Add function to fetch visitor summary
  const fetchVisitorSummary = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        "https://phawaazvms.onrender.com/api/visitors/my-visits",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          mode: "cors",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch visitor data");
      }

      const data = await response.json();
      console.log("Fetched visits data:", data);

      // Update stats with the visits data
      setVisitStats({
        upcoming: data.data.upcomingVisits?.length || 0,
        completed: data.data.completedVisits?.length || 0,
        total:
          (data.data.upcomingVisits?.length || 0) +
          (data.data.completedVisits?.length || 0),
      });

      // Update visits lists
      setTopVisits(data.data.upcomingVisits?.slice(0, 3) || []);
      setCompletedVisits(data.data.completedVisits || []);
    } catch (error) {
      console.error("Error fetching visitor data:", error);
      // Set default values if fetch fails
      setVisitStats({
        upcoming: 0,
        completed: 0,
        total: 0,
      });
      setTopVisits([]);
      setCompletedVisits([]);
      toast.error("Failed to load visitor data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      // Only fetch data on initial load
      if (!isInitialLoad) return;

      try {
        setIsLoading(true);
        const token = localStorage.getItem("access_token");
        if (!token) {
          console.log("No token found, redirecting to login");
          navigate("/login");
          return;
        }

        // Check if we already have user data in localStorage
        const cachedUserData = {
          fullName: localStorage.getItem("user_full_name"),
          role: localStorage.getItem("user_role"),
          avatarUrl: localStorage.getItem("user_photo"),
        };

        // If we have cached data, use it immediately
        if (cachedUserData.fullName) {
          setUser(cachedUserData);
        }

        // Then fetch fresh data in the background
        const response = await fetch(
          "https://phawaazvms.onrender.com/api/auth/me",
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            mode: "cors",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await response.json();

        // Update user state with the fetched data
        const userInfo = {
          fullName:
            userData.data?.firstName && userData.data?.lastName
              ? `${userData.data.firstName} ${userData.data.lastName}`
              : cachedUserData.fullName || "Visitor",
          role: userData.data?.role || cachedUserData.role || "Visitor",
          avatarUrl:
            userData.data?.photo ||
            cachedUserData.avatarUrl ||
            "https://i.pravatar.cc/100?img=2",
        };

        setUser(userInfo);

        // Update localStorage with fresh data
        localStorage.setItem("user_full_name", userInfo.fullName);
        localStorage.setItem("user_role", userInfo.role);
        if (userData.data?.photo) {
          localStorage.setItem("user_photo", userData.data.photo);
        }

        // Fetch visitor summary after user data is loaded
        await fetchVisitorSummary();
        setIsInitialLoad(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Only show error toast if we don't have cached data
        if (!localStorage.getItem("user_full_name")) {
          toast.error("Failed to load user data");
          navigate("/login");
        }
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    };

    fetchUserData();
  }, [navigate, isInitialLoad]);

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Dashboard content to be rendered when on root path
  const DashboardContent = () => (
    <div className="space-y-8">
      <header className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800 dark:text-white">
          Welcome, {user.fullName} 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Here's your dashboard overview.
        </p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatsCard
          title="UPCOMING VISITS"
          value={visitStats.upcoming}
          icon={<Calendar size={20} />}
          iconColor="blue"
          description="Scheduled visits"
        />

        <StatsCard
          title="COMPLETED VISITS"
          value={visitStats.completed}
          icon={<Clipboard size={20} />}
          iconColor="green"
          description="Previous visits"
        />

        <StatsCard
          title="TOTAL VISITS"
          value={visitStats.total}
          icon={<User size={20} />}
          iconColor="purple"
          description="All time"
        />
      </div>

      {/* Dashboard Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schedule Visit Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
            <PlusCircle size={20} className="mr-2 text-blue-500" />
            Schedule a New Visit
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Schedule your visit and get a QR code for easy check-in.
          </p>
          <Link to="/visitor/schedule-visit" className="block">
            <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-3 rounded-lg font-medium transition-all duration-200 focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 flex items-center justify-center">
              <PlusCircle size={20} className="mr-2" />
              Schedule Visit
            </button>
          </Link>
        </div>

        {/* Feedback */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
            <Bell size={20} className="mr-2 text-blue-500" />
            Feedback
          </h2>
          <FeedbackForm />
        </div>
      </div>

      {/* Visits Overview */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
          <Clipboard size={20} className="mr-2 text-blue-500" />
          Visits Overview
        </h2>

        {topVisits.length === 0 && completedVisits.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
              <svg
                className="w-full h-full"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500">No visits scheduled</p>
            <button
              onClick={() => navigate("/visitor/schedule-visit")}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Schedule a Visit
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Upcoming Visits Table */}
            {topVisits.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                  Upcoming Visits
                </h3>
                <ResponsiveTable
                  columns={[
                    {
                      header: "Visitor",
                      accessor: "visitorName",
                      render: (row) => (
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold mr-2">
                            {row.visitorName?.charAt(0) || "V"}
                          </div>
                          {row.visitorName || "Not specified"}
                        </div>
                      ),
                    },
                    {
                      header: "Visit Date",
                      accessor: "visitDate",
                      render: (row) =>
                        new Date(row.visitDate).toLocaleDateString(),
                    },
                    {
                      header: "Visit Time",
                      accessor: "visitDate",
                      render: (row) =>
                        new Date(row.visitDate).toLocaleTimeString(),
                    },
                    {
                      header: "Purpose",
                      accessor: "purpose",
                    },
                    {
                      header: "Host",
                      accessor: "hostName",
                    },
                    {
                      header: "Status",
                      render: () => (
                        <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                          Upcoming
                        </span>
                      ),
                    },
                  ]}
                  data={topVisits}
                  emptyMessage="No upcoming visits"
                />
              </div>
            )}

            {/* Completed Visits Table */}
            {completedVisits.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                  Completed Visits
                </h3>
                <ResponsiveTable
                  columns={[
                    {
                      header: "Visitor",
                      accessor: "visitorName",
                      render: (row) => (
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-semibold mr-2">
                            {row.visitorName?.charAt(0) || "V"}
                          </div>
                          {row.visitorName || "Not specified"}
                        </div>
                      ),
                    },
                    {
                      header: "Visit Date",
                      accessor: "visitDate",
                      render: (row) =>
                        new Date(row.visitDate).toLocaleDateString(),
                    },
                    {
                      header: "Visit Time",
                      accessor: "visitDate",
                      render: (row) =>
                        new Date(row.visitDate).toLocaleTimeString(),
                    },
                    {
                      header: "Purpose",
                      accessor: "purpose",
                    },
                    {
                      header: "Status",
                      render: () => (
                        <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                          Completed
                        </span>
                      ),
                    },
                  ]}
                  data={completedVisits}
                  mobileCardTitle={(row) =>
                    row.visitorName || "Completed Visit"
                  }
                  emptyMessage="No completed visits"
                  rowActions={(row) => (
                    <Link
                      to={`/visitor/visit-summary/${row.id}`}
                      className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      View Details
                    </Link>
                  )}
                />
              </div>
            )}

            <div className="mt-4">
              <Link to="/visitor/visit-summary" className="block">
                <button className="w-full text-center text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 cursor-pointer">
                  View all visits →
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <DashboardLayout
      user={user}
      currentPath={currentPath}
      unreadNotifications={unreadNotifications}
      handleLogout={handleLogout}
      title="Visitor Portal"
    >
      {isDashboardRoot ? <DashboardContent /> : <Outlet />}
    </DashboardLayout>
  );
};

export default VisitorDashboard;
