import { Menu, LogOut, ChevronRight, ChevronLeft } from "lucide-react";
import NavMenu from "../reusable/NavMenu";

const Sidebar = ({
  navItems,
  dashboardTitle,
  unreadNotifications,
  isCollapsed,
  setIsCollapsed,
  handleLogout,
  currentPath,
  isMobile,
  onCloseMobileSidebar,
  // currentPath,
}) => {
  return (
    <aside
      className={`h-screen flex flex-col justify-between ${
        isMobile
          ? "w-64 bg-white dark:bg-gray-950 shadow-xl"
          : isCollapsed
          ? "w-20 bg-gray-100 dark:bg-gray-950"
          : "w-64 bg-gray-100 dark:bg-gray-950"
      } p-4 transition-all duration-300`}
    >
      <div>
        {/* Collapse toggle - only shown on desktop */}
        {!isMobile && (
          <div
            className={`flex mb-4 mt-2 ${
              isCollapsed ? "justify-center" : "justify-end"
            }`}
          >
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-md bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-50 transition-colors"
              aria-label="Toggle sidebar"
            >
              {isCollapsed ? (
                <ChevronRight size={24} />
              ) : (
                <ChevronLeft size={24} />
              )}
            </button>
          </div>
        )}

        {(!isCollapsed || isMobile) && (
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent mb-6">
            {dashboardTitle}
          </h2>
        )}

        {/* Navigation */}
        <nav className="flex mt-8">
          <NavMenu
            items={navItems}
            isCollapsed={isCollapsed && !isMobile}
            currentPath={currentPath}
            unreadCounts={{
              Dashboard: unreadNotifications,
              Notifications: unreadNotifications,
            }}
            onItemClick={isMobile ? onCloseMobileSidebar : undefined}
          />
        </nav>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className={`flex items-center ${
          isCollapsed && !isMobile ? "justify-center" : "justify-start"
        } gap-2 bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg transition-colors duration-200 w-full mt-auto text-white`}
      >
        <LogOut size={18} />
        {(!isCollapsed || isMobile) && <span>Logout</span>}
      </button>
    </aside>
  );
};

export default Sidebar;
