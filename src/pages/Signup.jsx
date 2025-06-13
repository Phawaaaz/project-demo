import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, UserPlus, Eye, EyeOff, Sun, Moon, Upload } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import toast from "react-hot-toast";

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setPhoto(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic validation
    if (!firstName.trim()) {
      setError("First name is required");
      setLoading(false);
      return;
    }
    if (!lastName.trim()) {
      setError("Last name is required");
      setLoading(false);
      return;
    }
    if (!email.trim()) {
      setError("Email is required");
      setLoading(false);
      return;
    }
    if (!password.trim()) {
      setError("Password is required");
      setLoading(false);
      return;
    }
    if (!phone.trim()) {
      setError("Phone number is required");
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    // Password validation (at least 6 characters)
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    // Phone validation (basic format)
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(phone)) {
      setError("Please enter a valid phone number");
      setLoading(false);
      return;
    }

    const loadingToastId = toast.loading("Creating account...");

    try {
      const requestData = {
        email: email.trim(),
        password: password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        photo: photo ? photo.name : "default-avatar.png"
      };

      const response = await fetch("https://phawaazvms.onrender.com/api/auth/register", {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        mode: 'cors',
      });

      if (!response.ok) {
        let errorMessage = "Something went wrong. Please try again.";
        try {
          const errorData = await response.json();
          console.log('Registration error:', errorData);
          
          if (errorData.errors && Array.isArray(errorData.errors)) {
            // Handle validation errors
            const validationErrors = errorData.errors.map(err => err.message).join('\n');
            errorMessage = validationErrors;
          } else {
            errorMessage = errorData.message || errorData.error || errorData.detail || errorMessage;
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        
        setError(errorMessage);
        toast.error(errorMessage, {
          id: loadingToastId,
          duration: 5000,
        });
        setLoading(false);
        return;
      }

      let data;
      try {
        data = await response.json();
        console.log('Registration success:', data);
        toast.success("Account created successfully!", { id: loadingToastId });
        
        // Store the token if it's returned
        if (data.token) {
          localStorage.setItem("access_token", data.token);
        }

        // Redirect to login page after successful registration
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (parseError) {
        console.error('Error parsing success response:', parseError);
        toast.error("Registration successful but there was an error processing the response", {
          id: loadingToastId,
        });
      }

    } catch (err) {
      console.error('Network error:', err);
      setError("Network error. Please check your internet connection and try again.");
      toast.error("Network error. Please check your internet connection and try again.", { 
        id: loadingToastId,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md w-full max-w-md animate-fade-in-up border border-gray-100 dark:border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">
          Create an Account
        </h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Photo Upload */}
          <div className="flex flex-col items-center space-y-2">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <UserPlus className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            <label className="cursor-pointer bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center gap-2">
              <Upload size={18} />
              <span>Upload Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Max file size: 5MB. Supported formats: JPG, PNG, GIF
            </p>
          </div>

          {/* First Name */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">
              First Name
            </label>
            <input
              type="text"
              placeholder="John"
              className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">
              Last Name
            </label>
            <input
              type="text"
              placeholder="Doe"
              className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

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

          {/* Phone */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+1234567890"
              className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
              className="absolute right-3 top-13 -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
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
                Signing up...
              </div>
            ) : (
              <>
                <UserPlus size={20} />
                Sign Up
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

        {/* Google Signup Button */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-transform hover:scale-105"
        >
          <FcGoogle size={24} />
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            Sign Up with Google
          </span>
        </button>

        {/* Link to Login */}
        <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center justify-center gap-1"
          >
            <LogIn size={18} />
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
