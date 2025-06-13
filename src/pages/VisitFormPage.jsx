import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import VisitForm from "../components/visitors/Visitform";
import toast from "react-hot-toast";
import { ArrowLeft, Download, Mail } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const VisitFormPage = () => {
  const navigate = useNavigate();
  const [generatedQRData, setGeneratedQRData] = useState("");
  const [visitDetails, setVisitDetails] = useState(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const qrRef = useRef(null);

  const handleQRGenerated = (qrData, visitData) => {
    setGeneratedQRData(qrData);
    setVisitDetails(visitData);
  };

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
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        // Draw the image on the canvas
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convert to PNG and download
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `visit-qr-${visitDetails?._id || Date.now()}.png`;
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
    if (!visitDetails) return;

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

      const response = await fetch("https://phawaazvms.onrender.com/api/visitors/send-qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        body: JSON.stringify({
          visitId: visitDetails._id,
          email: userEmail,
          visitDetails: {
            company: visitDetails.company,
            purpose: visitDetails.purpose,
            visitDate: visitDetails.visitDate,
            expectedDuration: visitDetails.expectedDuration
          }
        }),
        mode: "cors"
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send QR code via email");
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition-colors duration-200"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          Schedule a Visit
        </h1>

        <VisitForm
          onSubmit={(data) => handleQRGenerated(generatedQRData, data)}
          onQRGenerated={handleQRGenerated}
          initialQRData={generatedQRData}
        />

        {generatedQRData && (
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
                onClick={handleDownloadQR}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                <Download size={20} />
                Download QR Code
              </button>
              <button
                onClick={handleSendEmail}
                disabled={isSendingEmail}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSendingEmail ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
      </div>
    </div>
  );
};

export default VisitFormPage; 