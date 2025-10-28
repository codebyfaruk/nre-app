// src/components/shops/ShopsTable.jsx
export const ShopsTable = ({ shops, onEdit, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Shop Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Contact
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {shops.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <span className="text-4xl block mb-2">🏪</span>
                  <p className="text-lg font-semibold">No shops found</p>
                  <p className="text-sm">
                    Try adjusting your filters or add a new shop
                  </p>
                </td>
              </tr>
            ) : (
              shops.map((shop) => (
                <tr key={shop.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">
                      {shop.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{shop.address}</div>
                    <div className="text-sm text-gray-600">
                      {shop.city}, {shop.state} - {shop.pincode}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">📞 {shop.phone}</div>
                    <div className="text-sm text-gray-600">📧 {shop.email}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        shop.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {shop.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => onEdit(shop)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => onDelete(shop)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden divide-y divide-gray-200">
        {shops.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-500">
            <span className="text-4xl block mb-2">🏪</span>
            <p className="text-lg font-semibold">No shops found</p>
            <p className="text-sm">
              Try adjusting your filters or add a new shop
            </p>
          </div>
        ) : (
          shops.map((shop) => (
            <div key={shop.id} className="p-4 hover:bg-gray-50 transition">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {shop.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{shop.address}</p>
                  <p className="text-sm text-gray-600">
                    {shop.city}, {shop.state} - {shop.pincode}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ml-2 ${
                    shop.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {shop.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="text-sm text-gray-600 mb-3">
                <p>📞 {shop.phone}</p>
                <p>📧 {shop.email}</p>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(shop)}
                  className="flex-1 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition text-center"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => onDelete(shop)}
                  className="flex-1 p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition text-center"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
