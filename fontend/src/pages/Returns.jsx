// src/pages/Returns.jsx - COMPLETE WITH PROCESS FLOW

import { useState, useEffect } from "react";
import { Layout } from "../components/layout/Layout";
import {
  ReturnsHeader,
  ReturnsFilters,
  ReturnsTable,
  ReturnDetailModal,
} from "../components/returns";
import { SearchInvoiceModal } from "../components/returns/SearchInvoiceModal";
import { CreateReturnModal } from "../components/returns/CreateReturnModal";
import { apiService } from "../services/api.service";
import { showSuccess, showError } from "../utils/toast";

export const Returns = () => {
  // Data
  const [returns, setReturns] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedShop, setSelectedShop] = useState("");

  // Modals
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

      const sortedReturns = (returnsRes.data || []).sort(
        (a, b) => new Date(b.return_date) - new Date(a.return_date)
      );

      setReturns(sortedReturns);
      setShops(shopsRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      showError("Failed to load returns");
    } finally {
      setLoading(false);
    }
  };

  // Filter returns
  const filteredReturns = returns.filter((returnItem) => {
    const returnNumber = String(returnItem.return_number || "").toLowerCase();
    const invoiceNumber = String(returnItem.invoice_number || "").toLowerCase();
    const searchLower = searchTerm.toLowerCase().trim();

    const matchesSearch =
      !searchTerm ||
      returnNumber.includes(searchLower) ||
      invoiceNumber.includes(searchLower);

    const matchesStatus = !statusFilter || returnItem.status === statusFilter;

    let matchesDateFrom = true;
    let matchesDateTo = true;

    try {
      const returnDate = new Date(returnItem.return_date)
        .toISOString()
        .split("T")[0];

      matchesDateFrom = !dateFrom || returnDate >= dateFrom;
      matchesDateTo = !dateTo || returnDate <= dateTo;
    } catch (error) {
      console.error("Date parsing error:", error);
    }

    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  // Pagination
  const totalPages = Math.ceil(filteredReturns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReturns = filteredReturns.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFrom, dateTo, selectedShop]);

  // Stats
  const totalReturns = returns.length;
  const pendingReturns = returns.filter((r) => r.status === "pending").length;
  const totalRefunds = returns
    .filter((r) => r.status === "approved")
    .reduce((sum, r) => sum + parseFloat(r.refund_amount || 0), 0);

  const handleCreateReturn = () => {
    setShowSearchModal(true);
  };

  const handleSelectSale = (sale) => {
    setSelectedSale(sale);
    setShowSearchModal(false);
    setShowCreateModal(true);
  };

  const handleSubmitReturn = async (returnData) => {
    try {
      await apiService.createReturn(returnData);
      showSuccess("✅ Return created successfully!");
      setShowCreateModal(false);
      setSelectedSale(null);
      loadData();
    } catch (error) {
      console.error("Error creating return:", error);
      showError("❌ Failed to create return");
    }
  };

  const handleViewDetails = (returnItem) => {
    setSelectedReturn(returnItem);
    setShowDetailModal(true);
  };

  const handleApprove = async (returnId, notes) => {
    try {
      await apiService.processReturn(returnId, {
        status: "approved",
        action_notes: notes,
      });
      showSuccess("✅ Return approved successfully!");
      setShowDetailModal(false);
      loadData();
    } catch (error) {
      console.error("Error approving return:", error);
      showError("❌ Failed to approve return");
    }
  };

  const handleReject = async (returnId, notes) => {
    try {
      await apiService.processReturn(returnId, {
        status: "rejected",
        action_notes: notes,
      });
      showSuccess("✅ Return rejected");
      setShowDetailModal(false);
      loadData();
    } catch (error) {
      console.error("Error rejecting return:", error);
      showError("❌ Failed to reject return");
    }
  };

  return (
    <Layout>
      <ReturnsHeader
        totalReturns={totalReturns}
        pendingReturns={pendingReturns}
        totalRefunds={totalRefunds}
      />

      <div className="p-6 flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-slate-900">
          Returns Management
        </h2>
        <button
          onClick={handleCreateReturn}
          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-lg"
        >
          <span className="text-lg">➕</span> Create Return
        </button>
      </div>

      <ReturnsFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        selectedShop={selectedShop}
        onShopChange={setSelectedShop}
        shops={shops}
      />

      <ReturnsTable
        returns={paginatedReturns}
        onViewDetails={handleViewDetails}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalResults={filteredReturns.length}
        itemsPerPage={itemsPerPage}
      />

      {/* Modals */}
      {showSearchModal && (
        <SearchInvoiceModal
          onClose={() => setShowSearchModal(false)}
          onSelectSale={handleSelectSale}
          shops={shops}
        />
      )}

      {showCreateModal && selectedSale && (
        <CreateReturnModal
          sale={selectedSale}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedSale(null);
          }}
          onSubmit={handleSubmitReturn}
        />
      )}

      {showDetailModal && selectedReturn && (
        <ReturnDetailModal
          returnData={selectedReturn}
          shop={shops.find((s) => s.id === selectedReturn.shop_id)}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedReturn(null);
          }}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </Layout>
  );
};
