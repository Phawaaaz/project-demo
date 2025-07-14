import { useState, useEffect, useCallback } from "react";
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
import { getStatusStyle } from "../../../utils";
import { QRCodeSVG } from "qrcode.react";

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
  const [selectedQRCodeData, setSelectedQRCodeData] = useState(null);

  // Add function to fetch visitor summary
  const fetchVisitorSummary = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Check token expiration before making request
      try {
        const tokenData = JSON.parse(atob(token.split(".")[1]));
        const expirationTime = tokenData.exp * 1000;
        if (Date.now() >= expirationTime) {
          localStorage.clear();
          toast.error("Session expired. Please log in again.");
          navigate("/login");
          return;
        }
      } catch (error) {
        localStorage.clear();
        toast.error("Invalid session. Please log in again.");
        navigate("/login");
        return;
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

      if (response.status === 401) {
        localStorage.clear();
        toast.error("Session expired. Please log in again.");
        navigate("/login");
        return;
      }

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
  }, [navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      // Only fetch data on initial load
      if (!isInitialLoad) return;

      try {
        setIsLoading(true);
        const token = localStorage.getItem("access_token");

        // Check if token exists and is valid
        if (!token) {
          console.log("No token found, redirecting to login");
          navigate("/login");
          return;
        }

        // Check if token is expired
        try {
          const tokenData = JSON.parse(atob(token.split(".")[1]));
          const expirationTime = tokenData.exp * 1000; // Convert to milliseconds
          if (Date.now() >= expirationTime) {
            console.log("Token expired, logging out");
            localStorage.clear();
            toast.error("Session expired. Please log in again.");
            navigate("/login");
            return;
          }
        } catch (error) {
          console.error("Error parsing token:", error);
          localStorage.clear();
          toast.error("Invalid session. Please log in again.");
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
          "https://phawaazvms.onrender.com/api/auth/profile",
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            mode: "cors",
          }
        );

        if (response.status === 401) {
          console.log("Unauthorized access, token may be expired");
          localStorage.clear();
          toast.error("Session expired. Please log in again.");
          navigate("/login");
          return;
        }

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
          toast.error("Failed to load user data. Please log in again.");
          localStorage.clear();
          navigate("/login");
        }
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    };

    fetchUserData();
  }, [navigate, isInitialLoad, fetchVisitorSummary]);

  // Add token expiration check on component mount and set up periodic checks
  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        const tokenData = JSON.parse(atob(token.split(".")[1]));
        const expirationTime = tokenData.exp * 1000;
        const currentTime = Date.now();
        const timeUntilExpiration = expirationTime - currentTime;

        // If token expires in less than 5 minutes, show warning
        if (timeUntilExpiration < 300000 && timeUntilExpiration > 0) {
          toast.error("Your session will expire soon. Please save your work.");
        }

        // If token is expired, logout immediately
        if (currentTime >= expirationTime) {
          localStorage.clear();
          toast.error("Session expired. Please log in again.");
          navigate("/login");
        }
      } catch (error) {
        console.error("Error checking token expiration:", error);
        localStorage.clear();
        toast.error("Invalid session. Please log in again.");
        navigate("/login");
      }
    };

    // Check immediately
    checkTokenExpiration();

    // Set up periodic checks every minute
    const interval = setInterval(checkTokenExpiration, 60000);

    return () => clearInterval(interval);
  }, [navigate]);

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
    <>
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

        {/* Quick Actions */}
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
            <Link to="/visitor/schedule-visit">
              <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-3 rounded-lg font-semibold transition-all duration-200 focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 flex items-center justify-center gap-2">
                <PlusCircle size={20} />
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
                        header: "QR Code",
                        accessor: "qr-code",
                        render: (row) => {
                          const qrData = JSON.stringify({
                            visitId: row._id,
                            company: row.company,
                            date: row.date,
                            time: row.time,
                            purpose: row.purpose,
                          });

                          return (
                            <div
                              onClick={() => setSelectedQRCodeData(qrData)}
                              title="Click to enlarge"
                              className="flex items-center flex-col gap-2"
                            >
                              <QRCodeSVG
                                value={qrData}
                                size={64} // smaller size for table
                                bgColor="#ffffff"
                                fgColor="#000000"
                                level="H"
                              />
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {row._id?.slice(-6)}
                              </span>
                            </div>
                          );
                        },
                      },
                      {
                        header: "Status",
                        render: (row) => (
                          <span
                            className={`w-fit flex items-center gap-1.5 ${getStatusStyle(
                              row.status
                            )}`}
                          >
                            {row.status}
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

      {selectedQRCodeData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl relative">
            <button
              onClick={() => setSelectedQRCodeData(null)}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-6 text-center text-gray-800 dark:text-gray-100">
              Visit QR Code
            </h2>

            <QRCodeSVG
              value={selectedQRCodeData}
              size={300}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
            />
          </div>
        </div>
      )}
    </>
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
