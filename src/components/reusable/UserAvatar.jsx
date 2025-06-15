const UserAvatar = ({ user }) => {
  if (!user || !user.avatarUrl) return null;

  // Expanded view (avatar with user info)
  return (
    <div className="flex items-center space-x-3">
      <div className="relative">
        <img
          src={user.avatarUrl}
          alt="User Avatar"
          className="w-10 h-10 rounded-full object-cover border-2 border-blue-400"
        />
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800 dark:border-gray-950"></span>
      </div>

      <div className="hidden md:block">
        <p className="text-sm font-semibold">{user.fullName}</p>
        <p className="text-xs dark:text-gray-300">{user.role}</p>
      </div>
    </div>
  );
};

export default UserAvatar;
