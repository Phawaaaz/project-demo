import toast from "react-hot-toast";

/**
 * Check if the current token is expired
 * @returns {boolean} true if token is expired or invalid, false otherwise
 */
export const isTokenExpired = () => {
  const token = localStorage.getItem("access_token");
  if (!token) return true;

  try {
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = tokenData.exp * 1000;
    return Date.now() >= expirationTime;
  } catch (error) {
    console.error("Error parsing token:", error);
    return true;
  }
};

/**
 * Get time until token expiration in milliseconds
 * @returns {number} milliseconds until expiration, negative if expired
 */
export const getTimeUntilExpiration = () => {
  const token = localStorage.getItem("access_token");
  if (!token) return -1;

  try {
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = tokenData.exp * 1000;
    return expirationTime - Date.now();
  } catch (error) {
    console.error("Error parsing token:", error);
    return -1;
  }
};

/**
 * Force logout user and redirect to login
 * @param {Function} navigate - React Router navigate function
 * @param {string} message - Optional custom message
 */
export const forceLogout = (navigate, message = "Session expired. Please log in again.") => {
  localStorage.clear();
  toast.error(message);
  navigate("/login");
};

/**
 * Check token expiration and logout if needed
 * @param {Function} navigate - React Router navigate function
 * @returns {boolean} true if token is valid, false if expired/invalid
 */
export const validateToken = (navigate) => {
  const token = localStorage.getItem("access_token");
  
  if (!token) {
    forceLogout(navigate, "No authentication token found. Please log in.");
    return false;
  }

  if (isTokenExpired()) {
    forceLogout(navigate);
    return false;
  }

  return true;
};

/**
 * Set up periodic token expiration checks
 * @param {Function} navigate - React Router navigate function
 * @returns {Function} cleanup function to clear the interval
 */
export const setupTokenExpirationChecks = (navigate) => {
  const checkTokenExpiration = () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = tokenData.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;

      // If token expires in less than 5 minutes, show warning
      if (timeUntilExpiration < 300000 && timeUntilExpiration > 0) {
        toast.error("Your session will expire soon. Please save your work.");
      }

      // If token is expired, logout immediately
      if (currentTime >= expirationTime) {
        forceLogout(navigate);
      }
    } catch (error) {
      console.error("Error checking token expiration:", error);
      forceLogout(navigate, "Invalid session. Please log in again.");
    }
  };

  // Check immediately
  checkTokenExpiration();

  // Set up periodic checks every minute
  const interval = setInterval(checkTokenExpiration, 60000);

  return () => clearInterval(interval);
};

/**
 * Handle API response for authentication errors
 * @param {Response} response - Fetch response object
 * @param {Function} navigate - React Router navigate function
 * @returns {boolean} true if response is ok, false if authentication error
 */
export const handleAuthResponse = (response, navigate) => {
  if (response.status === 401) {
    forceLogout(navigate);
    return false;
  }
  return true;
}; 