import { useState, useMemo } from "react";
import SearchBox from "../reusable/SearchBox";
import VisitorsTable from "./VisitorsTable";

const TodayVisitorsCard = ({ visitors }) => {
  // Local state for search query
  const [searchQuery, setSearchQuery] = useState("");

  // Filter visitors based on search query
  const filteredVisitors = useMemo(() => {
    if (!searchQuery) return visitors;

    const query = searchQuery.toLowerCase();
    return visitors.filter(
      (visitor) =>
        visitor.name.toLowerCase().includes(query) ||
        visitor.purpose.toLowerCase().includes(query) ||
        visitor.host.toLowerCase().includes(query)
    );
  }, [visitors, searchQuery]);

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 dark:border-gray-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Today's Visitors
        </h2>
        <SearchBox searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </div>
      <VisitorsTable filteredVisitors={filteredVisitors} />
    </div>
  );
};

export default TodayVisitorsCard;
