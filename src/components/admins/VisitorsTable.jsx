import React from "react";
import { format } from "date-fns";
import { statusStyles } from "../../utils";

const VisitorsTable = ({ filteredVisitors = [] }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <th className="px-4 py-3">Visitor</th>
            <th className="px-4 py-3">Purpose</th>
            <th className="px-4 py-3">Host</th>
            <th className="px-4 py-3">Time</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {filteredVisitors.length === 0 ? (
            <tr>
              <td
                colSpan="6"
                className="px-4 py-4 text-center text-gray-500 dark:text-gray-400"
              >
                No visitors found.
              </td>
            </tr>
          ) : (
            filteredVisitors.slice(0, 5).map((visitor) => {
              const fullName = `${visitor.user.firstName} ${visitor.user.lastName}`;
              const formattedDate = format(
                new Date(visitor.visitDate),
                "MMM dd, yyyy - hh:mm a"
              );
              const statusClass =
                statusStyles[visitor.status] || statusStyles["checked-out"];

              return (
                <tr key={visitor._id}>
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-800 dark:text-white whitespace-nowrap">
                      {fullName}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-600 dark:text-gray-300">
                    {visitor.purpose}
                  </td>
                  <td className="px-4 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    {visitor.company}
                  </td>
                  <td className="px-4 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    {formattedDate}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${statusClass}`}
                    >
                      {visitor.status
                        .replace(/-/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {visitor.status === "scheduled" ? (
                      <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200 cursor-pointer whitespace-nowrap">
                        Check In
                      </button>
                    ) : visitor.status === "checked-in" ? (
                      <button className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200 cursor-pointer whitespace-nowrap">
                        Check Out
                      </button>
                    ) : (
                      <button
                        className="bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-3 py-1 rounded-md text-sm cursor-default whitespace-nowrap"
                        disabled
                      >
                        Completed
                      </button>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default VisitorsTable;
