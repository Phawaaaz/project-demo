export const statusStyles = {
  scheduled: "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300",
  "checked-in":
    "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300",
  "checked-out":
    "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300",
  cancelled: "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300",
};

// Function to get status styling
export const getStatusStyle = (status) => {
  switch (status) {
    case "checked-in":
    case "completed":
      return "px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full dark:bg-green-900/30 dark:text-green-400";
    case "scheduled":
      return "px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full dark:bg-blue-900/30 dark:text-blue-400";
    case "cancelled":
      return "px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full dark:bg-red-900/30 dark:text-red-400";
    default:
      return "px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-300";
  }
};
