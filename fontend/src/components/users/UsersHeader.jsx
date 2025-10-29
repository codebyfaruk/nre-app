// src/components/users/UsersHeader.jsx
export const UsersHeader = ({ onAddUser, totalUsers, activeUsers }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Users Management</h1>
        <p className="text-gray-600 mt-1">
          Total: {totalUsers} users • Active: {activeUsers}
        </p>
      </div>
      <button
        onClick={onAddUser}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
      >
        <span className="text-xl">+</span>
        Add User
      </button>
    </div>
  );
};
