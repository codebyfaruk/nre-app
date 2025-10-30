// src/components/common/StatCard.jsx - MONOCHROME VERSION
export const StatCard = ({
  title,
  value,
  icon,
  variant = "default",
  subtitle,
}) => {
  const variants = {
    default: "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700",
    light:
      "bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300 text-gray-900",
    dark: "bg-gradient-to-br from-black to-gray-900 border-gray-800",
  };

  const isLight = variant === "light";

  return (
    <div
      className={`${
        variants[variant]
      } rounded-xl shadow-lg p-6 border transform hover:scale-105 transition-all duration-300 ${
        isLight ? "text-gray-900" : "text-white"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 ${
            isLight ? "bg-gray-300" : "bg-gray-700"
          } rounded-lg flex items-center justify-center`}
        >
          <span className="text-2xl">{icon}</span>
        </div>
        {subtitle && (
          <span
            className={`text-sm font-semibold ${
              isLight ? "bg-gray-300" : "bg-gray-800"
            } px-3 py-1 rounded-full`}
          >
            {subtitle}
          </span>
        )}
      </div>
      <h4 className="text-3xl font-bold mb-1">{value}</h4>
      <p className={`text-sm ${isLight ? "text-gray-600" : "text-gray-400"}`}>
        {title}
      </p>
    </div>
  );
};
