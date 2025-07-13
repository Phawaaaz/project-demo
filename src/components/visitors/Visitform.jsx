import { useState, useCallback, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import toast from "react-hot-toast";
import { Download, Mail } from "lucide-react";

const VisitForm = ({ onSubmit, onQRGenerated, initialQRData = "" }) => {
  const [newCompany, setNewCompany] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [expectedDuration, setExpectedDuration] = useState(60); // Default 60 minutes
  const [notes, setNotes] = useState("");
  const [generatedQRData, setGeneratedQRData] = useState(initialQRData);
  const [showQR, setShowQR] = useState(!!initialQRData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const qrRef = useRef(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Use useCallback to prevent recreation of handler functions on each render
  const handleCompanyChange = useCallback((e) => {
    const value = e.target.value;
    const sentenceCase = value.charAt(0).toUpperCase() + value.slice(1);
    setNewCompany(sentenceCase);
  }, []);

  const handleDateChange = useCallback((e) => {
    setNewDate(e.target.value);
  }, []);

  const handleTimeChange = useCallback((e) => {
    setNewTime(e.target.value);
  }, []);

  const handlePurposeChange = useCallback((e) => {
    setPurpose(e.target.value);
  }, []);

  const handleDurationChange = useCallback((e) => {
    setExpectedDuration(parseInt(e.target.value));
  }, []);

  const handleNotesChange = useCallback((e) => {
    setNotes(e.target.value);
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        // Combine date and time into a single ISO string
        const visitDateTime = new Date(`${newDate}T${newTime}`);
        const visitDate = visitDateTime.toISOString();

        // Calculate QR code expiry (24 hours from now)
        const qrCodeExpiry = new Date(
          Date.now() + 24 * 60 * 60 * 1000
        ).toISOString();

        const visitData = {
          purpose,
          visitDate,
          expectedDuration,
          company: newCompany,
          notes,
          status: "scheduled",
          qrCodeExpiry,
        };

        const response = await fetch(
          "https://phawaazvms.onrender.com/api/visitors",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            body: JSON.stringify(visitData),
            mode: "cors",
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create visit");
        }

        const data = await response.json();

        // Generate QR code data
        const qrData = JSON.stringify({
          visitId: data._id,
          company: newCompany,
          date: newDate,
          time: newTime,
          purpose: purpose,
        });

        setGeneratedQRData(qrData);
        setShowQR(true);

        if (onQRGenerated) {
          onQRGenerated(qrData, data);
        }

        if (onSubmit) {
          onSubmit(data);
        }

        toast.success("Visit scheduled successfully!");
      } catch (error) {
        console.error("Error creating visit:", error);
        toast.error(error.message || "Failed to schedule visit");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      newCompany,
      newDate,
      newTime,
      purpose,
      expectedDuration,
      notes,
      onSubmit,
      onQRGenerated,
    ]
  );

  // Use effect to update local QR data state when parent passes new data
  useEffect(() => {
    if (initialQRData) {
      setGeneratedQRData(initialQRData);
      setShowQR(true);
    }
  }, [initialQRData]);

  // Reset form function
  const handleReset = useCallback(() => {
    setNewCompany("");
    setNewDate("");
    setNewTime("");
    setPurpose("");
    setExpectedDuration(60);
    setNotes("");
    setGeneratedQRData("");
    setShowQR(false);
  }, []);

  const handleDownloadQR = () => {
    if (!qrRef.current) return;

    try {
      // Get the SVG element
      const svg = qrRef.current.querySelector("svg");
      if (!svg) {
        throw new Error("QR code SVG not found");
      }

      // Create a canvas element
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Set canvas size
      canvas.width = 300;
      canvas.height = 300;

      // Create an image from the SVG
      const img = new Image();
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        // Draw the image on the canvas
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convert to PNG and download
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `visit-qr-${Date.now()}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();

        // Clean up
        URL.revokeObjectURL(url);
      };

      img.src = url;
    } catch (error) {
      console.error("Error downloading QR code:", error);
      toast.error("Failed to download QR code");
    }
  };

  const handleSendEmail = async () => {
    if (!generatedQRData) return;

    setIsSendingEmail(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Get user email from localStorage
      const userEmail = localStorage.getItem("user_email");
      if (!userEmail) {
        throw new Error("User email not found");
      }

      const response = await fetch(
        "https://phawaazvms.onrender.com/api/visitors/send-qr",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({
            visitId: generatedQRData,
            email: userEmail,
            visitDetails: {
              company: newCompany,
              purpose: purpose,
              visitDate: newDate,
              expectedDuration: expectedDuration,
            },
          }),
          mode: "cors",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to send QR code via email"
        );
      }

      toast.success("QR code sent to your email!");
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error(error.message || "Failed to send QR code via email");
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="company"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Company Name
            </label>
            <input
              type="text"
              id="company"
              value={newCompany}
              onChange={handleCompanyChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
              placeholder="Enter company name"
              required
            />
          </div>

          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Visit Date
            </label>
            <input
              type="date"
              id="date"
              value={newDate}
              onChange={handleDateChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
              required
            />
          </div>

          <div>
            <label
              htmlFor="time"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Visit Time
            </label>
            <input
              type="time"
              id="time"
              value={newTime}
              onChange={handleTimeChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="purpose"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Purpose of Visit
            </label>
            <input
              type="text"
              id="purpose"
              value={purpose}
              onChange={handlePurposeChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
              placeholder="Enter purpose of visit"
              required
            />
          </div>

          <div>
            <label
              htmlFor="duration"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Expected Duration (minutes)
            </label>
            <input
              type="number"
              id="duration"
              value={expectedDuration}
              onChange={handleDurationChange}
              min="15"
              max="480"
              step="15"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
              required
            />
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Additional Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={handleNotesChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
              placeholder="Any additional information..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={handleReset}
          className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Scheduling...
            </>
          ) : (
            "Schedule Visit"
          )}
        </button>
      </div>

      {showQR && generatedQRData && (
        <div className="mt-8">
          <div ref={qrRef} className="flex justify-center mb-6">
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <QRCodeSVG
                value={generatedQRData}
                size={300}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
              />
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={handleDownloadQR}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              <Download size={20} />
              Download QR Code
            </button>
            <button
              type="button"
              onClick={handleSendEmail}
              disabled={isSendingEmail}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSendingEmail ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <Mail size={20} />
                  Send to Email
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </form>
  );
};

export default VisitForm;
