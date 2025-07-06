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

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    profile: {
      fullName: "",
      email: "",
      phone: "",
      jobTitle: "",
      department: "",
      profileImage: "",
      timeZone: "UTC+0",
    },
    notifications: {
      emailAlerts: true,
      smsAlerts: false,
      pushNotifications: true,
      dailyReports: true,
      visitorCheckins: true,
      securityAlerts: true,
    },
    security: {
      twoFactorAuth: false,
      passwordLastChanged: "",
      sessionTimeout: "30",
      ipWhitelist: "",
    },
    appearance: {
      theme: "light",
      sidebarExpanded: true,
      compactMode: false,
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
    },
    system: {
      visitorRetention: "90",
      autoCheckout: "8",
      defaultDashboard: "overview",
      systemEmails: "",
    },
  });

  useEffect(() => {
    // Check for user's dark mode preference
    const userPrefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkMode(userPrefersDark);

    // Load settings data immediately
    setFormData({
      profile: {
        fullName: "Admin User",
        email: "admin@company.com",
        phone: "+1 (555) 123-4567",
        jobTitle: "Super Admin",
        department: "Administration",
        profileImage: "https://i.pravatar.cc/100?img=1",
        timeZone: "UTC-5",
      },
      notifications: {
        emailAlerts: true,
        smsAlerts: false,
        pushNotifications: true,
        dailyReports: true,
        visitorCheckins: true,
        securityAlerts: true,
      },
      security: {
        twoFactorAuth: true,
        passwordLastChanged: "2024-12-15",
        sessionTimeout: "30",
        ipWhitelist: "192.168.1.1, 10.0.0.1",
      },
      appearance: {
        theme: localStorage.getItem("theme") || "system",
        sidebarExpanded: true,
        compactMode: false,
        dateFormat: "MM/DD/YYYY",
        timeFormat: "12h",
      },
      system: {
        visitorRetention: "90",
        autoCheckout: "8",
        defaultDashboard: "overview",
        systemEmails: "security@company.com, reception@company.com",
      },
    });
    setLoading(false);
  }, []);

  const handleInputChange = (section, field, value) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value,
      },
    });
  };

  const handleCheckboxChange = (section, field) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: !formData[section][field],
      },
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          profileImage: URL.createObjectURL(file),
        },
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaveStatus("saving");

    // Simulate API call to save settings
    setTimeout(() => {
      setSaveStatus("saved");
      toast.success("Settings saved successfully");

      // Reset the status after 3 seconds
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    }, 500);
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
            profileData={formData.profile}
            handleInputChange={handleInputChange}
            handleImageChange={handleImageChange}
          />
        );
      case "notifications":
        return (
          <NotificationSettings
            notificationsData={formData.notifications}
            handleCheckboxChange={handleCheckboxChange}
          />
        );
      case "security":
        return (
          <SecuritySettings
            securityData={formData.security}
            handleInputChange={handleInputChange}
            handleCheckboxChange={handleCheckboxChange}
          />
        );
      case "appearance":
        return (
          <AppearanceSettings
            appearanceData={formData.appearance}
            handleInputChange={handleInputChange}
            handleCheckboxChange={handleCheckboxChange}
          />
        );
      case "system":
        return (
          <SystemSettings
            systemData={formData.system}
            handleInputChange={handleInputChange}
          />
        );
      default:
        return <ProfileSettings profileData={formData.profile} />;
    }
  };

  return (
    <div className="h-full dark:bg-gray-900 transition-colors duration-200">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800 dark:text-white flex items-center gap-2">
          <SettingsIcon size={28} className="text-blue-500" />
          Admin Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your account settings and preferences
        </p>
      </header>

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
            <form onSubmit={handleSubmit}>
              {renderTabContent()}

              {/* Save Button */}
              <SaveButton saveStatus={saveStatus} />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
