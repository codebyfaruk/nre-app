// src/pages/Users.jsx - COMPLETE
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

  // Filter users
  const filteredUsers = users.filter((user) => {
    if (!searchTerm) return true;

    const search = searchTerm.toLowerCase();
    const username = (user.username || "").toLowerCase();
    const email = (user.email || "").toLowerCase();

    return username.includes(search) || email.includes(search);
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
        `Delete user "${user.fullName}"?\n\nThis action cannot be undone.`
      )
    ) {
      try {
        await apiService.deleteUser(user.id);
        showSuccess("User deleted successfully!");
        loadData();
      } catch (error) {
        console.error("Error deleting user:", error);
        showError("Failed to delete user");
      }
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      if (editingUser) {
        await apiService.updateUser(editingUser.id, userData);
        showSuccess("User updated successfully!");
      } else {
        await apiService.createUser(userData);
        showSuccess("User created successfully!");
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error("Error saving user:", error);
      showError("Failed to save user");
    }
  };

  const activeUsers = users.filter((u) => u.isActive).length;

  return (
    <Layout title="Users">
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

      <UsersTable
        users={filteredUsers}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        loading={loading}
      />

      {showModal && (
        <UserModal
          user={editingUser}
          roles={roles}
          onClose={() => setShowModal(false)}
          onSave={handleSaveUser}
        />
      )}
    </Layout>
  );
};
