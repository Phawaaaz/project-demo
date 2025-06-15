import { Link } from "react-router-dom";

const NavItem = ({ item, isCollapsed, isActive, unreadCount = 0 }) => {
  return (
    <li>
      <Link
        to={item.to}
        className={`flex items-center ${
          isCollapsed ? "justify-center" : "space-x-3"
        } hover:bg-gray-300 dark:hover:bg-gray-800 hover:text-dark-400 transition-all duration-100 rounded-lg p-3 ${
          isActive
            ? "text-white font-bold bg-gray-300 dark:bg-gray-800 shadow-sm"
            : "dark:text-gray-300"
        }`}
        title={isCollapsed ? item.label : ""}
      >
        <div className="relative">
          {item.icon}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full ring-2">
              {unreadCount}
            </span>
          )}
        </div>
        {!isCollapsed && <span>{item.label}</span>}
      </Link>
    </li>
  );
};

export default NavItem;
