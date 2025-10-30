// src/pages/Users.jsx - COMPLETE FIXED
import { useState, useEffect } from "react";
import { Layout } from "../components/layout/Layout";
import {
  UsersHeader,
  UsersFilters,
  UsersTable,
  UserModal,
} from "../components/users";
import { apiService } from "../services/api.service";
import { showSuccess, showError } from "../utils/toast";

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        apiService.getUsers(),
        apiService.getRoles(),
      ]);

      setUsers(usersRes.data);
      setRoles(rolesRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
      showError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Filter by search, role, and status
  const filteredUsers = users.filter((user) => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const username = (user.username || "").toLowerCase();
      const email = (user.email || "").toLowerCase();
      if (!username.includes(search) && !email.includes(search)) {
        return false;
      }
    }

    // Role filter
    if (selectedRole && selectedRole !== "") {
      const userRoleNames =
        user.roles?.map((r) =>
          typeof r === "object" && r.role
            ? r.role.name
            : typeof r === "object"
            ? r.name
            : r
        ) || [];

      if (!userRoleNames.includes(selectedRole)) {
        return false;
      }
    }

    // Status filter
    if (statusFilter === "active" && !user.is_active) {
      return false;
    }
    if (statusFilter === "inactive" && user.is_active) {
      return false;
    }

    return true;
  });

  const handleAddUser = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDeleteUser = async (user) => {
    if (
      window.confirm(
        `Delete user "${user.username}"?\n\nThis action cannot be undone.`
      )
    ) {
      try {
        await apiService.deleteUser(user.id);
        showSuccess("User deleted successfully!");
        loadData();
      } catch (error) {
        console.error("Error deleting user:", error);
        showError(error.response?.data?.detail || "Failed to delete user");
      }
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      if (editingUser) {
        // Update existing user
        await apiService.updateUser(editingUser.id, userData);
        showSuccess("User updated successfully!");
      } else {
        // Create new user
        await apiService.createUser(userData);
        showSuccess("User created successfully!");
      }

      setShowModal(false);
      loadData();
    } catch (error) {
      console.error("Error saving user:", error);
      const errorMsg = error.response?.data?.detail || "Failed to save user";
      showError(errorMsg);
    }
  };

  const activeUsers = users.filter((u) => u.is_active).length;

  return (
    <Layout>
      <div className="p-6">
        <UsersHeader
          onAddUser={handleAddUser}
          totalUsers={users.length}
          activeUsers={activeUsers}
        />

        <UsersFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          roles={roles}
        />

        {loading ? (
          <div className="text-center py-8">Loading users...</div>
        ) : (
          <UsersTable
            users={filteredUsers}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
          />
        )}

        {showModal && (
          <UserModal
            isOpen={showModal}
            user={editingUser}
            roles={roles}
            onClose={() => setShowModal(false)}
            onSave={handleSaveUser}
          />
        )}
      </div>
    </Layout>
  );
};
