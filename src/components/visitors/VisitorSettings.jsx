import { useState, useEffect } from "react";
import SettingsTabs from "../../components/reusable/SettingsTabs";
import ProfileSettings from "../../components/admins/adminsettings/ProfileSettings";
import NotificationSettings from "../../components/admins/adminsettings/NotificationSettings";
import AppearanceSettings from "../../components/admins/adminsettings/AppearanceSettings";
import SaveButton from "../../components/reusable/SaveButton";
import toast from "react-hot-toast";
import { Settings } from "lucide-react";

const VisitorSettings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    profile: {
      fullName: "",
      email: "",
      phone: "",
      company: "",
      purpose: "",
      profileImage: "",
      timeZone: "UTC+0",
    },
    notifications: {
      emailAlerts: true,
      smsAlerts: false,
      pushNotifications: true,
      upcomingVisits: true,
      checkInReminders: true,
    },
    appearance: {
      theme: localStorage.getItem("theme") || "system",
      compactMode: false,
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
    },
  });

  useEffect(() => {
    const fetchVisitorSettings = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        // Fetch user profile data
        const response = await fetch("https://phawaazvms.onrender.com/api/auth/me", {
          method: "GET",
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          mode: 'cors',
        });

        if (!response.ok) {
          throw new Error("Failed to fetch visitor settings");
        }

        const userData = await response.json();
        
        // Update form data with fetched user data
        setFormData(prev => ({
          ...prev,
          profile: {
            fullName: userData.data?.firstName && userData.data?.lastName 
              ? `${userData.data.firstName} ${userData.data.lastName}`
              : localStorage.getItem("user_full_name") || "",
            email: userData.data?.email || "",
            phone: userData.data?.phone || "",
            company: userData.data?.company || "",
            purpose: userData.data?.purpose || "",
            profileImage: userData.data?.photo || localStorage.getItem("user_photo") || "",
            timeZone: userData.data?.timeZone || "UTC+0",
          }
        }));

        setLoading(false);
      } catch (error) {
        console.error("Error fetching visitor settings:", error);
        toast.error("Failed to load visitor settings");
        setLoading(false);
      }
    };

    fetchVisitorSettings();
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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const formData = new FormData();
        formData.append("photo", file);

        const response = await fetch("https://phawaazvms.onrender.com/api/auth/upload-photo", {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
          mode: 'cors',
        });

        if (!response.ok) {
          throw new Error("Failed to upload photo");
        }

        const data = await response.json();
        
        setFormData(prev => ({
          ...prev,
          profile: {
            ...prev.profile,
            profileImage: data.data.photo
          }
        }));

        localStorage.setItem("user_photo", data.data.photo);
        toast.success("Profile photo updated successfully");
      } catch (error) {
        console.error("Error uploading photo:", error);
        toast.error("Failed to upload photo");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveStatus("saving");

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Update profile data
      const response = await fetch("https://phawaazvms.onrender.com/api/auth/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        body: JSON.stringify({
          firstName: formData.profile.fullName.split(" ")[0],
          lastName: formData.profile.fullName.split(" ").slice(1).join(" "),
          email: formData.profile.email,
          phone: formData.profile.phone,
          company: formData.profile.company,
          purpose: formData.profile.purpose,
          timeZone: formData.profile.timeZone
        }),
        mode: "cors"
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      // Update notifications settings
      await fetch("https://phawaazvms.onrender.com/api/auth/update-notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        body: JSON.stringify(formData.notifications),
        mode: "cors"
      });

      // Update appearance settings
      localStorage.setItem("theme", formData.appearance.theme);
      localStorage.setItem("dateFormat", formData.appearance.dateFormat);
      localStorage.setItem("timeFormat", formData.appearance.timeFormat);

      setSaveStatus("saved");
      toast.success("Settings saved successfully");

      // Update localStorage with new name
      localStorage.setItem("user_full_name", formData.profile.fullName);

      // Reset the status after 3 seconds
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
      setSaveStatus("error");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 bg-gray-50 dark:bg-gray-900">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-pulse" style={{ animationDuration: '2s' }} />
        </div>
        <div className="flex flex-col items-center space-y-2">
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium animate-bounce">
            Loading your settings...
          </p>
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    );
  }

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
      case "appearance":
        return (
          <AppearanceSettings
            appearanceData={formData.appearance}
            handleInputChange={handleInputChange}
            handleCheckboxChange={handleCheckboxChange}
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
          <Settings size={28} className="text-blue-500" />
          Visitor Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your visitor account settings and preferences
        </p>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Tabs sidebar - passing the visitor-specific tabs */}
          <SettingsTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            availableTabs={["profile", "notifications", "appearance"]}
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

export default VisitorSettings;
