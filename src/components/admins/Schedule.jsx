import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  Bookmark,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { statusStyles } from "../../utils";

const Schedule = () => {
  // State management
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Generate calendar days
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Format dates for API (YYYY-MM-DD)
      const formatDate = (date) => {
        return date.toISOString().split("T")[0];
      };

      // Get first and last day of current month
      const firstDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const lastDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      const response = await fetch(
        `https://phawaazvms.onrender.com/api/admin/schedule?start=${formatDate(
          firstDay
        )}&end=${formatDate(lastDay)}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          mode: "cors",
        }
      );

      const data = await response.json();
      if (data.success) {
        // Transform API data to match our component's expected format
        const transformedData = data.data.map((item) => ({
          id: item._id,
          visitorName: item.user
            ? `${item.user.firstName} ${item.user.lastName}`
            : "Unknown Visitor",
          purpose: item.purpose,
          host: item.company,
          time: new Date(item.visitDate).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          date: new Date(item.visitDate),
          notes: item.notes,
          email: item.user?.email || "",
          phone: item.user?.phone || "",
          status: item.status,
        }));
        setAppointments(transformedData);
      } else {
        throw new Error("Failed to fetch schedules");
      }
    } catch (error) {
      toast.error(error.message || "Failed to load schedules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const handleDateSelect = (date) => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      date
    );
    setSelectedDate(newDate);
  };

  // Calendar configuration
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Calendar day rendering
  const renderCalendarDays = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(
      currentDate.getFullYear(),
      currentDate.getMonth()
    );
    const firstDayOfMonth = getFirstDayOfMonth(
      currentDate.getFullYear(),
      currentDate.getMonth()
    );

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10" />);
    }

    // Cells for days in the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();
      const hasAppointments = appointments.some(
        (appt) => appt.date.toDateString() === date.toDateString()
      );

      days.push(
        <div
          key={day}
          className={`h-10 w-10 flex items-center justify-center rounded-full cursor-pointer transition-colors duration-200
          ${isToday ? "bg-blue-100 dark:bg-blue-900/40" : ""}
          ${isSelected ? "bg-blue-500 dark:bg-blue-600" : ""}
          ${
            hasAppointments && !isSelected && !isToday
              ? "border-2 border-blue-400 dark:border-blue-500"
              : ""
          }
          hover:bg-gray-200 dark:hover:bg-gray-700`}
          onClick={() => handleDateSelect(day)}
        >
          <span
            className={
              isSelected || isToday
                ? "dark:text-white"
                : "text-gray-800 dark:text-white"
            }
          >
            {day}
          </span>
        </div>
      );
    }

    return days;
  };

  // Filter appointments for the selected date
  const filteredAppointments = appointments.filter(
    (appt) => appt.date.toDateString() === selectedDate.toDateString()
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800 dark:text-white flex items-center gap-2">
          <Calendar size={28} className="text-blue-500" />
          Schedule
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          View visitor appointments and meetings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <div className="bg-white dark:bg-gray-800 p-5 md:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 dark:border-gray-700 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                aria-label="Previous month"
              >
                <ChevronLeft
                  size={20}
                  className="text-gray-800 dark:text-gray-300"
                />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                aria-label="Next month"
              >
                <ChevronRight
                  size={20}
                  className="text-gray-800 dark:text-gray-300"
                />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-center font-medium text-gray-500 dark:text-gray-400 text-sm"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {renderCalendarDays()}
              </div>
            </>
          )}
        </div>

        {/* Appointments List */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No appointments scheduled for this date.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-700/40 border-gray-200 dark:border-gray-600"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-gray-800 dark:text-white">
                        {appointment.visitorName}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          statusStyles[appointment.status] ||
                          statusStyles["checked-out"]
                        }`}
                      >
                        {appointment.status
                          .replace(/-/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm mb-1">
                    <Clock size={14} className="mr-1" />
                    {appointment.time}
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm mb-1">
                    <Bookmark size={14} className="mr-1" />
                    {appointment.purpose}
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                    <User size={14} className="mr-1" />
                    Host: {appointment.host}
                  </div>
                  {appointment.notes && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      <p>{appointment.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Schedule;
