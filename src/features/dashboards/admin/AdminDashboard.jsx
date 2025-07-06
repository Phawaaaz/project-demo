import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  Users,
  CheckCircle,
  BarChart3,
  CalendarClock,
  QrCode,
  UserCheck,
  Home,
  QrCodeIcon,
  Calendar,
  Settings,
  UserCog,
} from "lucide-react";
import toast from "react-hot-toast";

// Import shared components
import DashboardLayout from "../../../layout/DashboardLayout";
import StatsCard from "../../../components/reusable/StatsCard";
import LoadingSpinner from "../../../components/reusable/LoadingSpinner";
import TodayVisitorsCard from "../../../components/admins/TodayVisitorsCard";

// Define navigation items for admin dashboard
const navItems = [
  {
    to: "",
    label: "Dashboard",
    icon: <Home size={20} />,
  },
  {
    to: "visitors-list",
    label: "Visitors",
    icon: <Users size={20} />,
  },
  {
    to: "scan",
    label: "Scan QR",
    icon: <QrCodeIcon size={20} />,
  },
  {
    to: "schedule",
    label: "Schedule",
    icon: <Calendar size={20} />,
  },
  {
    to: "analytics",
    label: "Analytics",
    icon: <BarChart3 size={20} />,
  },
  {
    to: "user-management",
    label: "User Management",
    icon: <UserCog size={24} />,
    requiredRole: "Super Admin", // Only visible to Super Admins
  },
  {
    to: "settings",
    label: "Settings",
    icon: <Settings size={20} />,
  },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboardRoot = location.pathname === "/admin";
  const currentPath = location.pathname.split("/").filter(Boolean)[1] || "";

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visitorStats, setVisitorStats] = useState({
    todayTotal: 0,
    checkedIn: 0,
    pending: 0,
    completed: 0,
  });
  const [recentVisitors, setRecentVisitors] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Function to fetch visitor statistics
  const fetchVisitorStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        // Set default stats if no token
        setVisitorStats({
          todayTotal: 0,
          checkedIn: 0,
          pending: 0,
          completed: 0,
        });
        return;
      }

      const response = await fetch("https://phawaazvms.onrender.com/api/admin/stats", {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        mode: "cors",
      });

      if (response.ok) {
        const data = await response.json();
        setVisitorStats({
          todayTotal: data.data?.todayTotal || 0,
          checkedIn: data.data?.checkedIn || 0,
          pending: data.data?.pending || 0,
          completed: data.data?.completed || 0,
        });
      } else {
        // Set default stats if API fails
        console.warn("Failed to fetch visitor stats, using defaults");
        setVisitorStats({
          todayTotal: 0,
          checkedIn: 0,
          pending: 0,
          completed: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching visitor stats:", error);
      // Set default stats on error
      setVisitorStats({
        todayTotal: 0,
        checkedIn: 0,
        pending: 0,
        completed: 0,
      });
    }
  }, []);

  // Function to fetch recent visitors
  const fetchRecentVisitors = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        // Set empty array if no token
        setRecentVisitors([]);
        return;
      }

      const response = await fetch("https://phawaazvms.onrender.com/api/admin/recent-visitors", {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        mode: "cors",
      });

      if (response.ok) {
        const data = await response.json();
        setRecentVisitors(data.data || []);
      } else {
        // Set empty array if API fails
        console.warn("Failed to fetch recent visitors, using empty array");
        setRecentVisitors([]);
      }
    } catch (error) {
      console.error("Error fetching recent visitors:", error);
      // Set empty array on error
      setRecentVisitors([]);
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("access_token");
        
        // Check if token exists and is valid
        if (!token) {
          console.log("No token found, redirecting to login");
          navigate("/login");
          return;
        }

        // Check if token is expired
        try {
          const tokenData = JSON.parse(atob(token.split('.')[1]));
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
              : cachedUserData.fullName || "Admin",
          role: userData.data?.role || cachedUserData.role || "Admin",
          avatarUrl:
            userData.data?.photo ||
            cachedUserData.avatarUrl ||
            "https://i.pravatar.cc/100?img=1",
        };

        setUser(userInfo);

        // Update localStorage with fresh data
        localStorage.setItem("user_full_name", userInfo.fullName);
        localStorage.setItem("user_role", userInfo.role);
        if (userData.data?.photo) {
          localStorage.setItem("user_photo", userData.data.photo);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Only show error toast if we don't have cached data
        if (!localStorage.getItem("user_full_name")) {
          toast.error("Failed to load user data. Please log in again.");
          localStorage.clear();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Fetch visitor stats and recent visitors when user is loaded
  useEffect(() => {
    if (user) {
      fetchVisitorStats();
      fetchRecentVisitors();
    }
  }, [user, fetchVisitorStats, fetchRecentVisitors]);

  // Add token expiration check on component mount and set up periodic checks
  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
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

  const handleLogout = useCallback(() => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate("/login");
  }, [navigate]);

  if (loading) {
    console.log("Loading state:", loading, "User state:", user);
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  // If no user data after loading is complete, redirect to login
  if (!user) {
    console.log("No user data, redirecting to login");
    navigate("/login");
    return null;
  }

  // Dashboard content to be rendered when on root path
  const DashboardContent = () => (
    <>
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800 dark:text-white">
          Welcome, {user?.fullName} 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Here's what's happening today.
        </p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="TODAY'S VISITORS"
          value={visitorStats.todayTotal}
          icon={<Users size={20} />}
          iconColor="blue"
          description="Total expected today"
        />

        <StatsCard
          title="CHECKED IN"
          value={visitorStats.checkedIn}
          icon={<UserCheck size={20} />}
          iconColor="green"
          description="Currently in the building"
        />

        <StatsCard
          title="PENDING"
          value={visitorStats.pending}
          icon={<CalendarClock size={20} />}
          iconColor="yellow"
          description="Expected later today"
        />

        <StatsCard
          title="COMPLETED"
          value={visitorStats.completed}
          icon={<CheckCircle size={20} />}
          iconColor="purple"
          description="Checked out today"
        />
      </div>

      {/* Today's Visitors - Now with self-contained search functionality */}
      <TodayVisitorsCard visitors={recentVisitors || []} />

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Link to="/admin/scan" className="w-full">
            <button className="w-full flex items-center gap-2 justify-center bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-3 rounded-lg text-sm font-medium transition-all duration-200 focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50">
              <QrCode size={18} />
              Scan QR Code
            </button>
          </Link>
          <Link to="visitors-list" className="w-full">
            <button className="w-full flex items-center gap-2 justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white p-3 rounded-lg text-sm font-medium transition-all duration-200">
              <Users size={18} />
              Manage Visitors
            </button>
          </Link>
          <Link to="schedule" className="w-full">
            <button className="w-full flex items-center gap-2 justify-center bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-3 rounded-lg text-sm font-medium transition-all duration-200 focus:ring-4 focus:ring-green-300 focus:ring-opacity-50">
              <CalendarClock size={18} />
              View Schedule
            </button>
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <DashboardLayout
      user={user}
      navItems={navItems}
      currentPath={currentPath}
      unreadNotifications={unreadNotifications}
      handleLogout={handleLogout}
      title="Admin Portal"
    >
      {isDashboardRoot ? <DashboardContent /> : <Outlet />}
    </DashboardLayout>
  );
};

export default AdminDashboard;
