// src/components/returns/SearchInvoiceModal.jsx - BEAUTIFULLY STYLED

import { useState, useEffect } from "react";
import { apiService } from "../../services/api.service";
import { showError } from "../../utils/toast";

export const SearchInvoiceModal = ({ onClose, onSelectSale, shops }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedShop, setSelectedShop] = useState("");
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    setLoading(true);
    try {
      const res = await apiService.getSales();
      const sortedSales = (res.data || []).sort(
        (a, b) =>
          new Date(b.sale_date || b.saleDate) -
          new Date(a.sale_date || a.saleDate)
      );
      setSales(sortedSales);
    } catch (error) {
      console.error("Error loading sales:", error);
      showError("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = sales.filter((sale) => {
    const invoiceNumber = String(
      sale.invoice_number || sale.invoiceNumber || ""
    ).toLowerCase();
    const customerName = String(
      sale.customer_name || sale.customerName || ""
    ).toLowerCase();
    const customerPhone = String(
      sale.customer_phone || sale.customerPhone || ""
    ).toLowerCase();

    const searchLower = searchTerm.toLowerCase().trim();

    const matchesSearch =
      !searchTerm ||
      invoiceNumber.includes(searchLower) ||
      customerName.includes(searchLower) ||
      customerPhone.includes(searchLower);

    let matchesDateFrom = true;
    let matchesDateTo = true;

    try {
      const saleDate = new Date(sale.sale_date || sale.saleDate)
        .toISOString()
        .split("T")[0];

      matchesDateFrom = !dateFrom || saleDate >= dateFrom;
      matchesDateTo = !dateTo || saleDate <= dateTo;
    } catch (error) {
      console.error("Date parsing error:", error);
    }

    const shopId = sale.shop_id || sale.shopId;
    const matchesShop = !selectedShop || shopId === parseInt(selectedShop);

    return matchesSearch && matchesDateFrom && matchesDateTo && matchesShop;
  });

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSales = filteredSales.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFrom, dateTo, selectedShop]);

  return (
    <div
      className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Search Invoices</h2>
              <p className="text-slate-300 text-sm mt-1">
                Find invoices to create returns
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white text-3xl font-light transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-50 border-b border-slate-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Invoice, customer, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Shop
              </label>
              <select
                value={selectedShop}
                onChange={(e) => setSelectedShop(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-900"
              >
                <option value="">All Shops</option>
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin inline-block w-12 h-12 border-4 border-slate-300 border-t-blue-600 rounded-full"></div>
                <p className="mt-4 text-slate-600 font-medium">
                  Loading invoices...
                </p>
              </div>
            </div>
          ) : paginatedSales.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-slate-600 text-lg font-medium">
                  No invoices found
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  Try adjusting your search filters
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSales.map((sale, index) => (
                      <tr
                        key={sale.id}
                        className={`border-b border-slate-100 hover:bg-blue-50 transition ${
                          index % 2 === 0 ? "bg-white" : "bg-slate-50"
                        }`}
                      >
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {sale.invoice_number || sale.invoiceNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(
                            sale.sale_date || sale.saleDate
                          ).toLocaleDateString("en-IN")}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-slate-900">
                            {sale.customer_name ||
                              sale.customerName ||
                              "Walk-in"}
                          </div>
                          {(sale.customer_phone || sale.customerPhone) && (
                            <div className="text-xs text-slate-500 mt-1">
                              {sale.customer_phone || sale.customerPhone}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-900">
                          ₹{parseFloat(sale.total_amount || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => onSelectSale(sale)}
                            className="px-5 py-2 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg"
                          >
                            ↩️ Return
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {!loading && paginatedSales.length > 0 && (
          <div className="bg-slate-50 border-t border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600 font-medium">
                Showing{" "}
                <span className="text-slate-900 font-bold">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="text-slate-900 font-bold">
                  {Math.min(currentPage * itemsPerPage, filteredSales.length)}
                </span>{" "}
                of{" "}
                <span className="text-slate-900 font-bold">
                  {filteredSales.length}
                </span>{" "}
                invoices
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  ← Prev
                </button>
                <div className="flex gap-1">
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg font-semibold transition ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "border-2 border-slate-300 text-slate-700 hover:border-blue-500"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
