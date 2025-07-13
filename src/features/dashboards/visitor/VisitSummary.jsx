import { useState, useEffect } from "react";
import { Calendar, Clock, Building2, Clipboard, CheckCircle, XCircle, Clock4 } from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "../../../components/reusable/LoadingSpinner";
import QRCode from "qrcode.react";
import { X } from "lucide-react";

const VisitSummary = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, upcoming, completed, cancelled
  const [sortBy, setSortBy] = useState("date"); // date, company, status
  const [sortOrder, setSortOrder] = useState("desc"); // asc, desc
  const [selectedVisit, setSelectedVisit] = useState(null);

  const fetchVisits = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("https://phawaazvms.onrender.com/api/visits", {
        method: "GET",
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error("Failed to fetch visits");
      }

      const data = await response.json();
      setVisits(data.data || []);
    } catch (error) {
      console.error("Error fetching visits:", error);
      toast.error("Failed to load visits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
            Scheduled
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full">
            {status}
          </span>
        );
    }
  };

  const filteredVisits = visits.filter(visit => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return new Date(visit.visitDate) > new Date() && visit.status === 'scheduled';
    if (filter === 'completed') return visit.status === 'completed';
    if (filter === 'cancelled') return visit.status === 'cancelled';
    return true;
  });

  const sortedVisits = [...filteredVisits].sort((a, b) => {
    const order = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'date') {
      return order * (new Date(a.visitDate) - new Date(b.visitDate));
    }
    if (sortBy === 'company') {
      return order * a.company.localeCompare(b.company);
    }
    if (sortBy === 'status') {
      return order * a.status.localeCompare(b.status);
    }
    return 0;
  });

  if (loading) {
    return <LoadingSpinner message="Loading visits..." />;
  }

  return (
    <div className="space-y-6">
      <header className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h1 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
          Visit Summary
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          View and manage all your visits
        </p>
      </header>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                filter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All Visits
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                filter === 'upcoming'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                filter === 'completed'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                filter === 'cancelled'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Cancelled
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="date">Sort by Date</option>
              <option value="company">Sort by Company</option>
              <option value="status">Sort by Status</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Company</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Time</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Duration</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Purpose</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedVisits.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No visits found
                  </td>
                </tr>
              ) : (
                sortedVisits.map((visit) => (
                  <tr key={visit._id} className="hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer" onClick={() => { console.log('Row clicked:', visit); setSelectedVisit(visit); }}>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <Building2 size={16} className="mr-2 text-gray-500" />
                        <span className="text-gray-800 dark:text-white">{visit.company}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-2 text-gray-500" />
                        <span className="text-gray-800 dark:text-white">{formatDate(visit.visitDate)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <Clock size={16} className="mr-2 text-gray-500" />
                        <span className="text-gray-800 dark:text-white">{formatTime(visit.visitDate)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <Clock4 size={16} className="mr-2 text-gray-500" />
                        <span className="text-gray-800 dark:text-white">{visit.expectedDuration} mins</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <Clipboard size={16} className="mr-2 text-gray-500" />
                        <span className="text-gray-800 dark:text-white">{visit.purpose}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(visit.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {selectedVisit && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-md relative border-4 border-red-500">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              onClick={() => setSelectedVisit(null)}
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Visit QR Code</h2>
            <div className="flex flex-col items-center gap-4">
              <QRCode value={selectedVisit._id} size={180} />
              <div className="w-full space-y-2 mt-4">
                <div><strong>Company:</strong> {selectedVisit.company}</div>
                <div><strong>Date:</strong> {formatDate(selectedVisit.visitDate)}</div>
                <div><strong>Time:</strong> {formatTime(selectedVisit.visitDate)}</div>
                <div><strong>Duration:</strong> {selectedVisit.expectedDuration} mins</div>
                <div><strong>Purpose:</strong> {selectedVisit.purpose}</div>
                <div><strong>Status:</strong> {getStatusBadge(selectedVisit.status)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitSummary; 