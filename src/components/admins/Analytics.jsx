import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Calendar, Filter, Download, RefreshCw, BarChart3 } from "lucide-react";

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("week");
  const [isLoading, setIsLoading] = useState(true);
  const [visitorData, setVisitorData] = useState([]);
  const [purposeData, setPurposeData] = useState([]);
  const [timeData, setTimeData] = useState([]);
  const [comparisonData, setComparisonData] = useState({
    current: 0,
    previous: 0,
    percentChange: 0,
  });

  useEffect(() => {
    // Load analytics data immediately
    setIsLoading(true);
    fetchAnalyticsData(timeRange);
    setIsLoading(false);
  }, [timeRange]);

  const fetchAnalyticsData = (range) => {
    // Mock data for different time ranges
    let visitorsByDay = [];
    let visitorsByPurpose = [];
    let visitorsByTime = [];
    let comparison = { current: 0, previous: 0, percentChange: 0 };

    if (range === "week") {
      visitorsByDay = [
        { name: "Mon", visitors: 14 },
        { name: "Tue", visitors: 22 },
        { name: "Wed", visitors: 18 },
        { name: "Thu", visitors: 29 },
        { name: "Fri", visitors: 24 },
        { name: "Sat", visitors: 8 },
        { name: "Sun", visitors: 5 },
      ];
      comparison = { current: 120, previous: 105, percentChange: 14.3 };
    } else if (range === "month") {
      visitorsByDay = [
        { name: "Week 1", visitors: 95 },
        { name: "Week 2", visitors: 104 },
        { name: "Week 3", visitors: 120 },
        { name: "Week 4", visitors: 108 },
      ];
      comparison = { current: 427, previous: 392, percentChange: 8.9 };
    } else if (range === "year") {
      visitorsByDay = [
        { name: "Jan", visitors: 340 },
        { name: "Feb", visitors: 378 },
        { name: "Mar", visitors: 420 },
        { name: "Apr", visitors: 389 },
        { name: "May", visitors: 402 },
        { name: "Jun", visitors: 467 },
        { name: "Jul", visitors: 510 },
        { name: "Aug", visitors: 490 },
        { name: "Sep", visitors: 520 },
        { name: "Oct", visitors: 498 },
        { name: "Nov", visitors: 460 },
        { name: "Dec", visitors: 380 },
      ];
      comparison = { current: 5254, previous: 4890, percentChange: 7.4 };
    }

    visitorsByPurpose = [
      { name: "Meeting", value: 45 },
      { name: "Interview", value: 25 },
      { name: "Delivery", value: 15 },
      { name: "Event", value: 10 },
      { name: "Other", value: 5 },
    ];

    visitorsByTime = [
      { name: "8-9 AM", visitors: 5 },
      { name: "9-10 AM", visitors: 12 },
      { name: "10-11 AM", visitors: 18 },
      { name: "11-12 PM", visitors: 14 },
      { name: "12-1 PM", visitors: 8 },
      { name: "1-2 PM", visitors: 10 },
      { name: "2-3 PM", visitors: 15 },
      { name: "3-4 PM", visitors: 17 },
      { name: "4-5 PM", visitors: 11 },
      { name: "5-6 PM", visitors: 4 },
    ];

    setVisitorData(visitorsByDay);
    setPurposeData(visitorsByPurpose);
    setTimeData(visitorsByTime);
    setComparisonData(comparison);
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  const exportData = () => {
    toast.success("Analytics data exported!");
    // In a real app, this would trigger a download of CSV or PDF
  };

  const refreshData = () => {
    setIsLoading(true);
    fetchAnalyticsData(timeRange);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 bg-gray-50 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 dark:text-gray-300">
          Loading analytics data...
        </p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800 dark:text-white flex items-center gap-2">
          <BarChart3 size={28} className="text-blue-500" />
          Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Monitor visitor trends and performance metrics
        </p>
      </header>

      {/* Time Range Selector and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-gray-500 dark:text-gray-400" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
        <div className="flex gap-3">
          <button
            onClick={refreshData}
            className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-md text-sm"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            onClick={exportData}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
          >
            <Download size={16} />
            Export Data
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 dark:border-gray-700">
          <h3 className="text-gray-500 dark:text-gray-300 text-sm font-medium">
            TOTAL VISITORS
          </h3>
          <p className="text-3xl font-bold mt-2 text-gray-800 dark:text-white">
            {comparisonData.current}
          </p>
          <div className="flex items-center mt-2">
            <span
              className={`text-sm ${
                comparisonData.percentChange >= 0
                  ? "text-green-500 dark:text-green-400"
                  : "text-red-500 dark:text-red-400"
              }`}
            >
              {comparisonData.percentChange >= 0 ? "+" : ""}
              {comparisonData.percentChange}%
            </span>
            <span className="text-gray-400 dark:text-gray-500 text-sm ml-2">
              vs previous {timeRange}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 dark:border-gray-700">
          <h3 className="text-gray-500 dark:text-gray-300 text-sm font-medium">
            AVG. DAILY VISITORS
          </h3>
          <p className="text-3xl font-bold mt-2 text-gray-800 dark:text-white">
            {Math.round(
              comparisonData.current /
                (timeRange === "week" ? 7 : timeRange === "month" ? 30 : 365)
            )}
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            Peak day:{" "}
            {
              visitorData.reduce(
                (max, day) => (day.visitors > max.visitors ? day : max),
                { visitors: 0 }
              ).name
            }
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 dark:border-gray-700">
          <h3 className="text-gray-500 dark:text-gray-300 text-sm font-medium">
            MOST COMMON PURPOSE
          </h3>
          <p className="text-3xl font-bold mt-2 text-gray-800 dark:text-white">
            {
              purposeData.reduce(
                (max, purpose) => (purpose.value > max.value ? purpose : max),
                { value: 0 }
              ).name
            }
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            {purposeData[0].value}% of total visits
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Visitors Over Time */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Visitors Over Time
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={visitorData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                strokeOpacity={0.5}
              />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "#e5e7eb",
                  borderRadius: "0.5rem",
                  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />
              <Bar dataKey="visitors" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Visitors by Purpose */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Visitors by Purpose
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={purposeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {purposeData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "#e5e7eb",
                  borderRadius: "0.5rem",
                  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Visitors by Time of Day */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Visitors by Hour
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                strokeOpacity={0.5}
              />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "#e5e7eb",
                  borderRadius: "0.5rem",
                  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="visitors"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ fill: "#8884d8", r: 4 }}
                activeDot={{ fill: "#8884d8", r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Trends */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Key Insights
          </h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-300 rounded-lg mt-1">
                <Filter size={16} />
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white">
                  Peak Hours
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Visitor traffic is highest between 10 AM and 11 AM. Consider
                  scheduling more reception staff during these hours.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="p-2 bg-green-50 dark:bg-green-900/30 text-green-500 dark:text-green-300 rounded-lg mt-1">
                <Filter size={16} />
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white">
                  Growth Trend
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Visitor numbers have increased by{" "}
                  {comparisonData.percentChange}% compared to the previous
                  period.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="p-2 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-500 dark:text-yellow-300 rounded-lg mt-1">
                <Filter size={16} />
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white">
                  Purpose Analysis
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Meetings and interviews account for 70% of all visits.
                  Consider optimizing meeting rooms and interview spaces.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
