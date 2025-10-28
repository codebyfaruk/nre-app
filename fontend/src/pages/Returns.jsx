// src/pages/Returns.jsx - COMPLETE
import { useState, useEffect } from "react";
import { Layout } from "../components/layout/Layout";
import {
  ReturnsHeader,
  ReturnsFilters,
  ReturnsTable,
  ReturnDetailModal,
} from "../components/returns";
import { apiService } from "../services/api.service";
import { showSuccess, showError } from "../utils/toast";

export const Returns = () => {
  const [returns, setReturns] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedShop, setSelectedShop] = useState("");
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [returnsRes, shopsRes] = await Promise.all([
        apiService.getReturns(),
        apiService.getShops(),
      ]);
      setReturns(returnsRes.data);
      setShops(shopsRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
      showError("Failed to load returns data");
    } finally {
      setLoading(false);
    }
  };

  // Filter returns
  const filteredReturns = returns.filter((returnItem) => {
    // Search filter
    const matchesSearch =
      returnItem.returnNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      returnItem.invoiceNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      returnItem.customerName?.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = !statusFilter || returnItem.status === statusFilter;

    // Date filters
    const returnDate = new Date(returnItem.returnDate)
      .toISOString()
      .split("T")[0];
    const matchesDateFrom = !dateFrom || returnDate >= dateFrom;
    const matchesDateTo = !dateTo || returnDate <= dateTo;

    // Shop filter
    const matchesShop =
      !selectedShop || returnItem.shopId === parseInt(selectedShop);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesDateFrom &&
      matchesDateTo &&
      matchesShop
    );
  });

  // Calculate stats
  const totalReturns = returns.length;
  const pendingReturns = returns.filter((r) => r.status === "pending").length;
  const totalRefunds = returns
    .filter((r) => r.status === "approved")
    .reduce((sum, r) => sum + r.refundAmount, 0);

  const handleViewDetails = (returnItem) => {
    setSelectedReturn(returnItem);
    setShowDetailModal(true);
  };

  const handleApprove = async (returnId, notes) => {
    try {
      await apiService.approveReturn(returnId, notes);
      showSuccess("Return approved successfully!");
      setShowDetailModal(false);
      loadData();
    } catch (error) {
      console.error("Error approving return:", error);
      showError("Failed to approve return");
    }
  };

  const handleReject = async (returnId, notes) => {
    if (!notes.trim()) {
      showError("Please provide a rejection reason");
      return;
    }

    try {
      await apiService.rejectReturn(returnId, notes);
      showSuccess("Return rejected");
      setShowDetailModal(false);
      loadData();
    } catch (error) {
      console.error("Error rejecting return:", error);
      showError("Failed to reject return");
    }
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedReturn(null);
  };

  return (
    <Layout title="Returns">
      <ReturnsHeader
        totalReturns={totalReturns}
        pendingReturns={pendingReturns}
        totalRefunds={totalRefunds}
      />

      <ReturnsFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        selectedShop={selectedShop}
        onShopChange={setSelectedShop}
        shops={shops}
      />

      <ReturnsTable
        returns={filteredReturns}
        onViewDetails={handleViewDetails}
        loading={loading}
      />

      {showDetailModal && selectedReturn && (
        <ReturnDetailModal
          returnData={selectedReturn}
          shop={shops.find((s) => s.id === selectedReturn.shopId)}
          onClose={handleCloseModal}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </Layout>
  );
};
