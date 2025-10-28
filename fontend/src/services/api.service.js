// src/services/api.service.js

// ⚙️ CONFIGURATION - CHANGE THIS TO SWITCH BETWEEN MOCK AND REAL API
const USE_MOCK_API = false; // Set to false when backend is ready

// Import services
import { mockService } from "./mock.service";
import { httpService } from "./http.service";

// Export the active service
export const apiService = USE_MOCK_API ? mockService : httpService;

// Helper to check which API is active
export const isUsingMockAPI = () => USE_MOCK_API;

// You can also use environment variables:
// export const apiService = import.meta.env.VITE_USE_MOCK === 'true' ? mockService : httpService;
