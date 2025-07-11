import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { CheckCircle, AlertTriangle, QrCode } from "lucide-react";
import toast from "react-hot-toast";

const ScanQR = () => {
  const [scanning, setScanning] = useState(true);
  const [scanResult, setScanResult] = useState(null);
  const [visitorData, setVisitorData] = useState(null);
  const [error, setError] = useState(null);

  const handleScan = (data) => {
    if (data) {
      setScanning(false);
      setScanResult(data);

      try {
        // Parse the QR code data
        const parsedData = JSON.parse(data);
        setVisitorData(parsedData);
      } catch (err) {
        setError("Invalid QR code format");
      }
    }
  };

  const handleError = (err) => {
    console.error(err);
    setError("Error scanning QR code");
  };

  const handleCheckIn = async () => {
    if (!visitorData) return;
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("https://phawaazvms.onrender.com/api/visitors/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          qrCode: scanResult, // Adjust if backend expects a different key
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to check in visitor");
      }

      const data = await response.json();
      toast.success(data.message || "Visitor checked in successfully!");
      resetScan();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const resetScan = () => {
    setScanning(true);
    setScanResult(null);
    setVisitorData(null);
    setError(null);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800 dark:text-white flex items-center gap-2">
          <QrCode size={28} className="text-blue-500" />
          QR Code Scanner
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Scan a visitor's QR code to check them in or view their details.
        </p>
      </div>

      {scanning ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 dark:border-gray-700 mb-8">
          <div className="aspect-video relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <Scanner
              onDecode={handleScan}
              onError={handleError}
              constraints={{ facingMode: "environment" }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-blue-500 rounded-lg"></div>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Position the QR code within the frame to scan
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 dark:border-gray-700 mb-8">
          {error ? (
            <div className="text-center p-6">
              <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-500 dark:text-red-400 mb-2">
                Scan Error
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
              <button
                onClick={resetScan}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="text-center p-6">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-green-600 dark:text-green-400 mb-6">
                QR Code Scanned Successfully
              </h2>

              {visitorData && (
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-6 text-left">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                    Visitor Information
                  </h3>
                  <p className="mb-2 text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Name:</span>{" "}
                    {visitorData.fullName}
                  </p>
                  <p className="mb-2 text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Company:</span>{" "}
                    {visitorData.company}
                  </p>
                  <p className="mb-2 text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Date:</span>{" "}
                    {visitorData.date}
                  </p>
                  <p className="mb-2 text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Time:</span>{" "}
                    {visitorData.time}
                  </p>
                </div>
              )}

              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={handleCheckIn}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2 rounded-md transition-all duration-200"
                >
                  Check In Visitor
                </button>
                <button
                  onClick={resetScan}
                  className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-6 py-2 rounded-md transition-colors duration-200"
                >
                  Scan Another
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
        <h3 className="text-blue-800 dark:text-blue-200 font-medium mb-2">
          Tip:
        </h3>
        <p className="text-blue-700 dark:text-blue-300 text-sm">
          If a visitor doesn't have a QR code, you can manually check them in
          from the Visitors page.
        </p>
      </div>
    </div>
  );
};

export default ScanQR;
