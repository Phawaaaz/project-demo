import { useEffect, useState } from "react";

import Sidebar from "../components/reusable/Sidebar";
import VisitorHeader from "../components/common/VisitorHeader";
import { Clipboard, Bell, Home, Settings, PlusCircle } from "lucide-react";
import { useCallback } from "react";

// Default navigation items for visitor dashboard
const defaultNavItems = [
  {
    to: "",
    label: "Dashboard",
    icon: <Home size={20} />,
  },
  {
    to: "schedule-visit",
    label: "Schedule Visit",
    icon: <PlusCircle size={20} />,
  },
  {
    to: "visit-summary",
    label: "Visit Summary",
    icon: <Clipboard size={20} />,
  },
  {
    to: "notifications",
    label: "Notifications",
    icon: <Bell size={20} />,
  },
  {
    to: "settings",
    label: "Settings",
    icon: <Settings size={20} />,
  },
];

const DashboardLayout = ({
  user,
  title,
  unreadNotifications,
  handleLogout,
  children,
  currentPath,
  navItems = defaultNavItems, // Use passed navItems or default to visitor navItems
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const handleResize = useCallback(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);

    if (!mobile && isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false);
    }
  }, [isMobileSidebarOpen]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-200 overflow-hidden">
      {/* Sidebar - Hidden on mobile unless explicitly opened */}
      <div
        className={`fixed md:static z-30 ${
          isMobile
            ? `transform transition-transform duration-300 ease-in-out ${
                isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : ""
        }`}
      >
        <Sidebar
          navItems={navItems}
          dashboardTitle={title}
          unreadNotifications={unreadNotifications}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          handleLogout={handleLogout}
          currentPath={currentPath}
          isMobile={isMobile}
          onCloseMobileSidebar={() => setIsMobileSidebarOpen(false)}
        />
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isMobile && isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/-50 z-20"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="relative flex flex-1 flex-col h-screen overflow-hidden">
        <VisitorHeader
          title={title}
          user={user}
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          showMobileToggle={isMobile}
          isCollapsed={isCollapsed}
        />

        {/* Scrollable Main */}
        <main className="flex-1 overflow-y-auto p-5 md:p-6 lg:p-8 lg:pb-10 mt-16">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
