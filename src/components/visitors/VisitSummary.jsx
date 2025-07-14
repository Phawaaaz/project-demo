import React, { useState, useEffect } from "react";
import ResponsiveTable from "../../components/common/ResponsiveTable";
import toast from "react-hot-toast";
import {
  CalendarDays,
  Building2,
  Clock,
  CheckCircle,
  AlertCircle,
  Clock3,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";
import { getStatusStyle } from "../../utils";

const VisitSummary = () => {
  const [allVisits, setAllVisits] = useState([]);
  const [upcomingVisits, setUpcomingVisits] = useState([]);
  const [completedVisits, setCompletedVisits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // New state for active tab
  const [selectedQRCodeData, setSelectedQRCodeData] = useState(null);

  // Fetch visitor visits data
  const fetchVisitorVisits = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        "https://phawaazvms.onrender.com/api/visitors/my-visits",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          mode: "cors",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch visitor data");
      }

      const data = await response.json();
      console.log("Fetched visits data:", data);

      // Set the visits data
      setUpcomingVisits(data.data.upcomingVisits || []);
      setCompletedVisits(data.data.completedVisits || []);

      // Combine all visits for the table
      const combined = [
        ...(data.data.upcomingVisits || []),
        ...(data.data.completedVisits || []),
      ];
      setAllVisits(combined);
    } catch (error) {
      console.error("Error fetching visitor data:", error);
      setUpcomingVisits([]);
      setCompletedVisits([]);
      setAllVisits([]);
      toast.error("Failed to load visit data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitorVisits();
  }, []);

  // Function to get the appropriate icon based on visit status
  const getStatusIcon = (status) => {
    switch (status) {
      case "Checked In":
      case "Completed":
        return <CheckCircle size={18} className="text-green-500" />;
      case "Scheduled":
      case "Upcoming":
        return <Clock3 size={18} className="text-blue-500" />;
      case "Cancelled":
        return <AlertCircle size={18} className="text-red-500" />;
      default:
        return null;
    }
  };

  // Function to determine visit status
  const getVisitStatus = (visit, isCompleted) => {
    if (isCompleted) {
      return "Completed";
    }
    return "Upcoming";
  };

  // Function to get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case "upcoming":
        return upcomingVisits;
      case "completed":
        return completedVisits;
      default:
        return allVisits;
    }
  };

  // Tab configuration
  const tabs = [
    {
      id: "all",
      label: "All Visits",
      count: allVisits.length,
      icon: <CalendarDays size={16} />,
    },
    {
      id: "upcoming",
      label: "Upcoming",
      count: upcomingVisits.length,
      icon: <Clock3 size={16} />,
    },
    {
      id: "completed",
      label: "Completed",
      count: completedVisits.length,
      icon: <CheckCircle size={16} />,
    },
  ];

  // Define table columns
  const columns = [
    {
      header: "Company",
      accessor: "company",
      render: (row) => (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold mr-2">
            <Building2 size={16} />
          </div>
          {row.company || "Not specified"}
        </div>
      ),
    },
    {
      header: "Visit Date",
      accessor: "date",
      render: (row) => (
        <div className="flex items-center">
          <CalendarDays size={16} className="mr-2 text-gray-400" />
          {format(row.visitDate, "yyyy-MM-dd")}
        </div>
      ),
    },
    {
      header: "Visit Time",
      accessor: "time",
      render: (row) => (
        <div className="flex items-center">
          <Clock size={16} className="mr-2 text-gray-400" />
          {row.time || "Not specified"}
        </div>
      ),
    },
    {
      header: "Purpose",
      accessor: "purpose",
    },
    {
      header: "QR Code",
      accessor: "qr-code",
      render: (row) => {
        const qrData = JSON.stringify({
          visitId: row._id,
          company: row.company,
          date: row.date,
          time: row.time,
          purpose: row.purpose,
        });

        return (
          <div
            onClick={() => setSelectedQRCodeData(qrData)}
            title="Click to enlarge"
            className="flex items-center flex-col gap-2"
          >
            <QRCodeSVG
              value={qrData}
              size={64} // smaller size for table
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {row._id?.slice(-6)}
            </span>
          </div>
        );
      },
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <span
          className={`flex items-center gap-1.5 ${getStatusStyle(row.status)}`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="h-full">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800 dark:text-white flex items-center gap-2">
            <CalendarDays size={28} className="text-blue-500" />
            Visit Summary
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            View and manage all your scheduled and past visits.
          </p>
        </header>

        {/* Custom Tab UI */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200`}
                >
                  {tab.icon}
                  {tab.label}
                  <span
                    className={`${
                      activeTab === tab.id
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                    } ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium transition-colors duration-200`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 dark:border-gray-700 mb-8">
          <ResponsiveTable
            columns={columns}
            data={getCurrentData()}
            emptyMessage={`No ${
              activeTab === "all" ? "" : activeTab
            } visits to display. ${
              activeTab === "upcoming"
                ? "Scheduled visits will appear here."
                : activeTab === "completed"
                ? "Completed visits will appear here."
                : "Scheduled and past visits will appear here."
            }`}
            mobileCardTitle={(row) => row.company || "Visit"}
            emptyIcon={
              <Clock size={48} className="text-gray-400 mx-auto mb-4" />
            }
          />
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
          <h3 className="text-blue-800 dark:text-blue-200 font-medium mb-2">
            Tip:
          </h3>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            You can scan a visitor's QR code to quickly check them in using the
            Scanner page.
          </p>
        </div>
      </div>

      {selectedQRCodeData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl relative">
            <button
              onClick={() => setSelectedQRCodeData(null)}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-6 text-center text-gray-800 dark:text-gray-100">
              Visit QR Code
            </h2>

            <QRCodeSVG
              value={selectedQRCodeData}
              size={300}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default VisitSummary;
