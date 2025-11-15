// Base URL for backend
export const BASE_API = "http://localhost:5001/api"; //changed

// Separate endpoints for different modules
export const USER_API = `${BASE_API}/users`;
export const SUPPLIER_API = `${BASE_API}/suppliers`;
export const RESERVATION_API = `${BASE_API}/reservations`;

// Food API endpoint
export const FOOD_API = `${BASE_API}/food`;


// frontend/src/services/api.js
export const API_URL = "http://localhost:5001"; // ✅ update if backend runs on another port
