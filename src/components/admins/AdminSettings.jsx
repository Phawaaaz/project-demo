import { useState, useEffect } from "react";
import SettingsTabs from "../reusable/SettingsTabs";
import ProfileSettings from "./adminsettings/ProfileSettings";
import NotificationSettings from "./adminsettings/NotificationSettings";
import SecuritySettings from "./adminsettings/SecuritySettings";
import AppearanceSettings from "./adminsettings/AppearanceSettings";
import SystemSettings from "./adminsettings/SystemSettings";
import SaveButton from "../reusable/SaveButton";
import toast from "react-hot-toast";
import { SettingsIcon } from "lucide-react";

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch("https://phawaazvms.onrender.com/api/admin/settings", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({}) // Send empty object for fetch
        });
        const contentType = response.headers.get("content-type");
        if (!response.ok) {
          let errorMsg = "Unknown error";
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            errorMsg = errorData.message || JSON.stringify(errorData);
          } else {
            const errorText = await response.text();
            errorMsg = errorText;
          }
          throw new Error(errorMsg);
        }
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server did not return JSON");
        }
        const result = await response.json();
        if (!result.success) throw new Error(result.message || "Failed to fetch settings");
        setSettings(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();

    // Check for user's dark mode preference
    const userPrefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkMode(userPrefersDark);
  }, []);

  const handleChange = (section, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleCheckboxChange = (section, field) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: !prev[section][field],
      },
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSettings((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          profileImage: URL.createObjectURL(file),
        },
      }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("https://phawaazvms.onrender.com/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      const contentType = response.headers.get("content-type");
      if (!response.ok) {
        let errorMsg = "Unknown error";
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMsg = errorData.message || JSON.stringify(errorData);
        } else {
          const errorText = await response.text();
          errorMsg = errorText;
        }
        throw new Error(errorMsg);
      }
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server did not return JSON");
      }
      const result = await response.json();
      if (!result.success) throw new Error(result.message || "Failed to update settings");
      setSuccess("Settings updated successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 bg-gray-50 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 dark:text-gray-300">Loading settings...</p>
      </div>
    );
  }

  // Determine which tab component to show based on activeTab
  // Replace just the renderTabContent function in your Settings.jsx file:

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <ProfileSettings
            profileData={settings?.profile || {}}
            handleInputChange={handleChange}
            handleImageChange={handleImageChange}
          />
        );
      case "notifications":
        return (
          <NotificationSettings
            notificationsData={settings?.notificationSettings || {}}
            handleCheckboxChange={handleCheckboxChange}
          />
        );
      case "security":
        return (
          <SecuritySettings
            securityData={settings?.securitySettings || {}}
            handleInputChange={handleChange}
            handleCheckboxChange={handleCheckboxChange}
          />
        );
      case "appearance":
        return (
          <AppearanceSettings
            appearanceData={settings?.appearanceSettings || {}}
            handleInputChange={handleChange}
            handleCheckboxChange={handleCheckboxChange}
          />
        );
      case "system":
        return (
          <SystemSettings
            systemData={settings?.systemSettings || {}}
            handleInputChange={handleChange}
          />
        );
      default:
        return <ProfileSettings profileData={settings?.profile || {}} />;
    }
  };

  return (
    <div className="dark:bg-gray-900 transition-colors duration-200">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800 dark:text-white flex items-center gap-2">
          <SettingsIcon size={28} className="text-blue-500" />
          Admin Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Tabs sidebar */}
          <SettingsTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            availableTabs={[
              "profile",
              "notifications",
              "security",
              "appearance",
              "system",
            ]}
          />

          {/* Tab content */}
          <div className="flex-1 p-6">
            <form onSubmit={handleSave}>
              {renderTabContent()}

              {/* Save Button */}
              <SaveButton saveStatus={saveStatus} />
              {error && <div style={{color: 'red'}}>{error}</div>}
              {success && <div style={{color: 'green'}}>{success}</div>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
