import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PropTypes from "prop-types";

const ResponsiveTable = ({
  columns,
  data,
  itemsPerPage = 5,
  emptyMessage = "No data available",
  rowActions,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination logic
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
              {rowActions && <th className="px-6 py-3"></th>}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {currentData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200"
                  >
                    {column.render ? column.render(row) : row[column.accessor]}
                  </td>
                ))}
                {rowActions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {rowActions(row)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {currentData.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700"
          >
            {/* {mobileCardTitle && (
              <h3 className="font-medium text-gray-800 dark:text-white mb-2">
                {typeof mobileCardTitle === "function"
                  ? mobileCardTitle(row)
                  : mobileCardTitle}
              </h3>
            )} */}
            <div className="space-y-2">
              {columns.map((column, colIndex) => (
                <div key={colIndex} className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {column.header}:
                  </span>
                  <span className="text-sm text-gray-800 dark:text-gray-200">
                    {column.render ? column.render(row) : row[column.accessor]}
                  </span>
                </div>
              ))}
            </div>
            {rowActions && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                {rowActions(row)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {data.length > itemsPerPage && (
        <div className="flex items-center justify-between px-2 py-3">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className={`flex items-center px-3 py-1 rounded-md ${
              currentPage === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <ChevronLeft size={16} className="mr-1" />
            Previous
          </button>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className={`flex items-center px-3 py-1 rounded-md ${
              currentPage === totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Next
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};

ResponsiveTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      header: PropTypes.string.isRequired,
      accessor: PropTypes.string,
      render: PropTypes.func,
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  itemsPerPage: PropTypes.number,
  mobileCardTitle: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  emptyMessage: PropTypes.string,
  rowActions: PropTypes.func,
};

export default ResponsiveTable;
