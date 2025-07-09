import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, UserPlus, Eye, EyeOff, Moon, Sun } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import toast from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Remove automatic redirect logic - always show login form
    // Users should manually log in even if they have tokens
  }, [navigate]);

  // Function to handle role-based redirects (only used after successful login)
  const redirectBasedOnRole = (role) => {
    switch (role) {
      case "admin":
        navigate("/admin");
        break;
      case "visitor":
        navigate("/visitor");
        break;
      default:
        navigate("/visitor");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const requestBody = {
        email: email.trim(),
        password: password,
      };

      const response = await fetch(
        "https://phawaazvms.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
          mode: "cors",
        }
      );

      console.log("Login response status:", response.status);
      console.log("Login response headers:", response.headers);

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Login error response:", errorData);
        console.log("Full response status:", response.status);
        console.log("Full response status text:", response.statusText);

        const errorMessage =
          errorData.message ||
          errorData.error ||
          "Failed to login. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
        setLoading(false);
        return;
      }

      const responseData = await response.json();
      console.log("Login successful response:", responseData);

      // Handle different response structures
      let token, user, redirectTo;

      if (responseData.success && responseData.data) {
        // New structure with data wrapper
        token = responseData.data.token;
        user = responseData.data.user;
        redirectTo = responseData.data.redirectTo;
      } else if (responseData.token) {
        // Direct structure
        token = responseData.token;
        user = responseData.user;
        redirectTo = responseData.redirectTo;
      } else {
        console.error("Unexpected response structure:", responseData);
        setError("Invalid response structure from server");
        toast.error("Login failed. Please try again.");
        setLoading(false);
        return;
      }

      console.log("Extracted token:", token);
      console.log("Extracted user:", user);
      console.log("Extracted redirectTo:", redirectTo);

      // Store the token
      if (token) {
        localStorage.setItem("access_token", token);

        // Store user data
        if (user) {
          console.log("Storing user data:", user);
          const fullName = `${user.firstName || ""} ${
            user.lastName || ""
          }`.trim();
          const role = user.role || "visitor";

          localStorage.setItem("user_full_name", fullName);
          localStorage.setItem("user_role", role);
          localStorage.setItem("user_id", user._id);
          localStorage.setItem("user_email", user.email);
          if (user.phone) {
            localStorage.setItem("user_phone", user.phone);
          }
          if (user.photo) {
            localStorage.setItem("user_photo", user.photo);
          }

          toast.success("Login successful!");

          // Use redirectTo from response if available, otherwise use role-based redirect
          if (redirectTo) {
            console.log("Redirecting to:", redirectTo);
            navigate(redirectTo);
          } else {
            // Fallback to role-based redirect
            if (role === "admin") {
              navigate("/admin");
            } else {
              navigate("/visitor");
            }
          }
        } else {
          setError("No user data received");
          toast.error("Login failed. Please try again.");
        }
      } else {
        console.error("No token in response");
        setError("No authentication token received");
        toast.error("Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        "Network error. Please check your internet connection and try again."
      );
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md w-full max-w-md animate-fade-in-up border border-gray-100 dark:border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">
          Welcome Back
        </h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <input
              type="email"
              placeholder="example@email.com"
              className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="********"
              className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white dark:bg-gray-700 text-gray-800 dark:text-white pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-13 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 p-2 rounded-lg text-center">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 dark:bg-blue-700 text-white p-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-transform ${
              loading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-700 dark:hover:bg-blue-600 hover:scale-105"
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Logging in...
              </div>
            ) : (
              <>
                <LogIn size={20} />
                Log In
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <hr className="flex-grow border-t border-gray-300 dark:border-gray-600" />
          <span className="mx-4 text-gray-500 dark:text-gray-400 font-semibold">
            OR
          </span>
          <hr className="flex-grow border-t border-gray-300 dark:border-gray-600" />
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-transform hover:scale-105"
        >
          <FcGoogle size={24} />
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            Log In with Google
          </span>
        </button>

        {/* Link to Signup */}
        <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center justify-center gap-1"
          >
            <UserPlus size={18} />
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
