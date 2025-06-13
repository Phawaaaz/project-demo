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

  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visitorStats, setVisitorStats] = useState({
    todayTotal: 0,
    checkedIn: 0,
    pending: 0,
    completed: 0,
  });
  const [recentVisitors, setRecentVisitors] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          console.log("No token found, redirecting to login");
          navigate("/login");
          return;
        }

        const response = await fetch("https://phawaazvms.onrender.com/api/auth/me", {
          method: "GET",
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          mode: 'cors',
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await response.json();
        console.log("Fetched admin data:", userData);

        // Update admin state with the fetched data
        const adminInfo = {
          fullName: userData.data?.firstName && userData.data?.lastName 
            ? `${userData.data.firstName} ${userData.data.lastName}`
            : localStorage.getItem("user_full_name") || "Admin User",
          role: userData.data?.role || localStorage.getItem("user_role") || "Admin",
          avatarUrl: userData.data?.photo || localStorage.getItem("user_photo") || "https://i.pravatar.cc/100?img=1",
        };
        console.log("Setting admin state:", adminInfo);
        setAdmin(adminInfo);

        // Update localStorage with fresh data
        localStorage.setItem("user_full_name", adminInfo.fullName);
        localStorage.setItem("user_role", adminInfo.role);
        if (userData.data?.photo) {
          localStorage.setItem("user_photo", userData.data.photo);
        }

        // Simulate fetching dashboard data
        const timer = setTimeout(() => {
          // Simulate visitor stats
          setVisitorStats({
            todayTotal: 24,
            checkedIn: 8,
            pending: 12,
            completed: 4,
          });

          // Simulate recent visitors
          setRecentVisitors([
            {
              id: "v1",
              name: "John Doe",
              purpose: "Interview",
              host: "HR Department",
              time: "10:30 AM",
              status: "checked-in",
              checkInTime: "10:28 AM",
            },
            {
              id: "v2",
              name: "Jane Smith",
              purpose: "Meeting",
              host: "Marketing Team",
              time: "11:00 AM",
              status: "pending",
            },
            {
              id: "v3",
              name: "Robert Johnson",
              purpose: "Delivery",
              host: "Receiving",
              time: "09:15 AM",
              status: "completed",
              checkInTime: "09:10 AM",
              checkOutTime: "09:45 AM",
            },
            {
              id: "v4",
              name: "Emily Davis",
              purpose: "Client Meeting",
              host: "Sales Team",
              time: "02:00 PM",
              status: "pending",
            },
            {
              id: "v5",
              name: "Michael Wilson",
              purpose: "Job Interview",
              host: "Engineering",
              time: "10:00 AM",
              status: "checked-in",
              checkInTime: "09:55 AM",
            },
          ]);

          setUnreadNotifications(3);
          setLoading(false);
        }, 1500);

        return () => {
          clearTimeout(timer);
        };
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load user data");
        navigate("/login");
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = useCallback(() => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate("/login");
  }, [navigate]);

  if (loading || !admin) {
    console.log("Loading state:", loading, "Admin state:", admin);
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  // Dashboard content to be rendered when on root path
  const DashboardContent = () => (
    <>
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800 dark:text-white">
          Welcome, {admin.fullName} 👋
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
      user={admin}
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
