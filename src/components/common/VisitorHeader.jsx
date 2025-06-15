import { Menu } from "lucide-react";
import UserAvatar from "../reusable/UserAvatar";

const VisitorHeader = ({
  title,
  user,
  onToggleSidebar,
  showMobileToggle,
  isCollapsed,
}) => {
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-10 h-16 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-gray-700 transition-all duration-300  ${
        isCollapsed ? "md:left-20" : "md:left-64"
      }`}
    >
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Left Side */}
        <div className="flex items-center space-x-4">
          {showMobileToggle && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <Menu size={24} />
            </button>
          )}
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            {title}
          </h1>
        </div>

        {/* User Avatar and Info */}
        <UserAvatar user={user} />
      </div>
    </header>
  );
};

export default VisitorHeader;
