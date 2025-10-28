// src/pages/Shops.jsx - COMPLETE
import { useState, useEffect } from "react";
import { Layout } from "../components/layout/Layout";
import {
  ShopsHeader,
  ShopsFilters,
  ShopsTable,
  ShopModal,
} from "../components/shops";
import { apiService } from "../services/api.service";
import { showSuccess, showError } from "../utils/toast";

export const Shops = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingShop, setEditingShop] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const shopsRes = await apiService.getShops();
      setShops(shopsRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
      showError("Failed to load shops");
    } finally {
      setLoading(false);
    }
  };

  // Filter shops
  const filteredShops = shops.filter((shop) => {
    const matchesSearch =
      shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.phone.includes(searchTerm) ||
      shop.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && shop.isActive) ||
      (statusFilter === "inactive" && !shop.isActive);

    return matchesSearch && matchesStatus;
  });

  const activeShops = shops.filter((s) => s.isActive).length;

  const handleAddShop = () => {
    setEditingShop(null);
    setShowModal(true);
  };

  const handleEditShop = (shop) => {
    setEditingShop(shop);
    setShowModal(true);
  };

  const handleDeleteShop = async (shop) => {
    if (
      window.confirm(
        `Delete shop "${shop.name}"?\n\nThis action cannot be undone.`
      )
    ) {
      try {
        await apiService.deleteShop(shop.id);
        showSuccess("Shop deleted successfully!");
        loadData();
      } catch (error) {
        console.error("Error deleting shop:", error);
        showError("Failed to delete shop");
      }
    }
  };

  const handleSaveShop = async (shopData) => {
    try {
      if (editingShop) {
        await apiService.updateShop(editingShop.id, shopData);
        showSuccess("Shop updated successfully!");
      } else {
        await apiService.createShop(shopData);
        showSuccess("Shop created successfully!");
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error("Error saving shop:", error);
      showError("Failed to save shop");
    }
  };

  return (
    <Layout title="Shops">
      <ShopsHeader
        onAddShop={handleAddShop}
        totalShops={shops.length}
        activeShops={activeShops}
      />

      <ShopsFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      <ShopsTable
        shops={filteredShops}
        onEdit={handleEditShop}
        onDelete={handleDeleteShop}
        loading={loading}
      />

      {showModal && (
        <ShopModal
          shop={editingShop}
          onClose={() => setShowModal(false)}
          onSave={handleSaveShop}
        />
      )}
    </Layout>
  );
};
