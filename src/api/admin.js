import apiRequest, { setAuthSession, clearAuthSession } from "./client";

export const adminService = {
  // Auth
  async login(email, password) {
    const res = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (res?.data?.accessToken) {
      setAuthSession(res.data.accessToken, res.data.user);
    }
    return res;
  },

  logout() {
    clearAuthSession();
  },

  // Dashboard API endpoints
  async getDashboardStats() {
    return apiRequest("/admin/dashboard/stats");
  },

  async getWeeklyBookings() {
    return apiRequest("/admin/dashboard/weekly-bookings");
  },

  async getFleetStatusCounts() {
    return apiRequest("/admin/fleet/status-counts");
  },

  async getRecentBookings(limit = 5) {
    return apiRequest(`/admin/bookings?limit=${limit}`);
  },

  // Fleet Management Endpoints
  async getFleet(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== "all" && params.status !== "All") {
      query.set("status", params.status.toLowerCase());
    }
    if (params.search) {
      query.set("search", params.search.trim());
    }
    if (params.page) {
      query.set("page", params.page);
    }
    if (params.limit) {
      query.set("limit", params.limit);
    }
    const qs = query.toString();
    return apiRequest(`/admin/fleet${qs ? `?${qs}` : ""}`);
  },

  async getFleetVehicle(id) {
    return apiRequest(`/admin/fleet/${id}`);
  },

  async createFleetVehicle(data) {
    return apiRequest("/admin/fleet", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateFleetVehicle(id, data) {
    return apiRequest(`/admin/fleet/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async setFleetVehicleStatus(id, operationalStatus) {
    return apiRequest(`/admin/fleet/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ operationalStatus }),
    });
  },

  async deleteFleetVehicle(id) {
    return apiRequest(`/admin/fleet/${id}`, {
      method: "DELETE",
    });
  },

  // Vehicle VIN decode endpoint
  async decodeVin(vin) {
    return apiRequest(`/vehicles/vin/${encodeURIComponent(vin)}/decode`);
  },

  // Hosts list for host management & owner assignment
  async getHosts(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== "all" && params.status !== "All") {
      query.set("status", params.status.toLowerCase());
    }
    if (params.search) {
      query.set("search", params.search.trim());
    }
    if (params.page) {
      query.set("page", params.page);
    }
    if (params.limit) {
      query.set("limit", params.limit);
    }
    const qs = query.toString();
    return apiRequest(`/admin/hosts${qs ? `?${qs}` : ""}`);
  },

  async getHostDetails(id) {
    return apiRequest(`/admin/hosts/${id}`);
  },

  async blockHost(id) {
    return apiRequest(`/admin/hosts/${id}/block`, {
      method: "PATCH",
    });
  },

  async unblockHost(id) {
    return apiRequest(`/admin/hosts/${id}/unblock`, {
      method: "PATCH",
    });
  },

  // Live GPS Tracking & Telemetry Endpoints
  async getTrackingList() {
    return apiRequest("/admin/tracking");
  },

  async getTrackingSummary() {
    return apiRequest("/admin/tracking/summary");
  },

  async setVehicleImmobilize(vehicleId, isImmobilized) {
    return apiRequest(`/admin/tracking/${vehicleId}/immobilize`, {
      method: "PATCH",
      body: JSON.stringify({ isImmobilized }),
    });
  },

  async pingVehicleTelemetry(vehicleId, data) {
    return apiRequest(`/admin/tracking/${vehicleId}/ping`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Upload photos to vehicle using multipart/form-data
  async uploadVehiclePhotos(vehicleId, files, angles = []) {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("photos", files[i]);
    }
    if (angles && angles.length) {
      angles.forEach((angle) => formData.append("angles", angle));
    }
    return apiRequest(`/vehicles/${vehicleId}/photos`, {
      method: "POST",
      body: formData,
    });
  },

  // Delete vehicle photo
  async deleteVehiclePhoto(vehicleId, photoId) {
    return apiRequest(`/vehicles/${vehicleId}/photos/${photoId}`, {
      method: "DELETE",
    });
  },

  // Set primary photo
  async setPrimaryVehiclePhoto(vehicleId, photoId) {
    return apiRequest(`/vehicles/${vehicleId}/photos/${photoId}/primary`, {
      method: "PATCH",
    });
  },

  // Users / Customers Management Endpoints
  async getUsers(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== "all" && params.status !== "All") {
      query.set("status", params.status.toLowerCase());
    }
    if (params.search) {
      query.set("search", params.search.trim());
    }
    if (params.page) {
      query.set("page", params.page);
    }
    if (params.limit) {
      query.set("limit", params.limit);
    }
    const qs = query.toString();
    return apiRequest(`/admin/users${qs ? `?${qs}` : ""}`);
  },

  async getUserDetails(id) {
    return apiRequest(`/admin/users/${id}`);
  },

  async blockUser(id) {
    return apiRequest(`/admin/users/${id}/block`, {
      method: "PATCH",
    });
  },

  async unblockUser(id) {
    return apiRequest(`/admin/users/${id}/unblock`, {
      method: "PATCH",
    });
  },

  async createCustomer(data) {
    return apiRequest("/admin/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getPendingLicenses() {
    return apiRequest("/admin/licenses/pending");
  },

  async reviewLicense(id, status) {
    return apiRequest(`/admin/licenses/${id}/review`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  // Payments & Pricing Tiers Endpoints
  async getTransactions(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search.trim());
    if (params.status && params.status !== "all" && params.status !== "All") {
      query.set("status", params.status.toLowerCase());
    }
    if (params.page) query.set("page", params.page);
    if (params.limit) query.set("limit", params.limit);
    const qs = query.toString();
    return apiRequest(`/admin/transactions${qs ? `?${qs}` : ""}`);
  },

  async getTransactionsSummary(period = "all") {
    return apiRequest(`/admin/transactions/summary?period=${period}`);
  },

  async getPricingTiers() {
    return apiRequest("/admin/pricing-tiers");
  },

  async createPricingTier(data) {
    return apiRequest("/admin/pricing-tiers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updatePricingTier(id, data) {
    return apiRequest(`/admin/pricing-tiers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async deletePricingTier(id) {
    return apiRequest(`/admin/pricing-tiers/${id}`, {
      method: "DELETE",
    });
  },

  // Reports & Analytics Endpoints
  async getReportsOverview() {
    return apiRequest("/admin/reports/overview");
  },

  async getMonthlyRevenueReport(year = new Date().getFullYear()) {
    return apiRequest(`/admin/reports/monthly-revenue?year=${year}`);
  },

  async getTopPerformersReport(limit = 6) {
    return apiRequest(`/admin/reports/top-performers?limit=${limit}`);
  },

  // Bookings Ops Endpoints
  async getBookings(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== "all" && params.status !== "All") {
      query.set("status", params.status.toLowerCase());
    }
    if (params.search) {
      query.set("search", params.search.trim());
    }
    if (params.page) {
      query.set("page", params.page);
    }
    if (params.limit) {
      query.set("limit", params.limit);
    }
    const qs = query.toString();
    return apiRequest(`/admin/bookings${qs ? `?${qs}` : ""}`);
  },

  async getBookingDetails(id) {
    return apiRequest(`/admin/bookings/${id}`);
  },

  async updateBookingStatus(id, status) {
    return apiRequest(`/admin/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  // Damage Reports Endpoints
  async getDamageReports(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== "all" && params.status !== "All") {
      query.set("status", params.status.toLowerCase());
    }
    if (params.search) query.set("search", params.search.trim());
    if (params.page) query.set("page", params.page);
    if (params.limit) query.set("limit", params.limit);
    const qs = query.toString();
    return apiRequest(`/admin/damage-reports${qs ? `?${qs}` : ""}`);
  },

  async getDamageSummary() {
    return apiRequest("/admin/damage-reports/summary");
  },

  async chargeDamage(bookingId, reportId, chargeAmount) {
    return apiRequest(`/admin/damage-reports/${bookingId}/${reportId}/charge`, {
      method: "PATCH",
      body: JSON.stringify({ chargeAmount: Number(chargeAmount) }),
    });
  },

  async disputeDamage(bookingId, reportId) {
    return apiRequest(`/admin/damage-reports/${bookingId}/${reportId}/dispute`, {
      method: "PATCH",
    });
  },

  // CMS Endpoints: Terms & Conditions, About Us, FAQs, Privacy
  async getCmsSections(page = "terms") {
    return apiRequest(`/admin/cms/${page}`);
  },

  async createCmsSection(page = "terms", data) {
    return apiRequest(`/admin/cms/${page}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateCmsSection(page = "terms", id, data) {
    return apiRequest(`/admin/cms/${page}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async deleteCmsSection(page = "terms", id) {
    return apiRequest(`/admin/cms/${page}/${id}`, {
      method: "DELETE",
    });
  },

  async reorderCmsSections(page = "terms", orderedIds) {
    return apiRequest(`/admin/cms/${page}/reorder`, {
      method: "POST",
      body: JSON.stringify({ orderedIds }),
    });
  },

  // Blog Management Endpoints
  async getBlogPosts(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== "all" && params.status !== "All") {
      query.set("status", params.status.toLowerCase());
    }
    if (params.search) {
      query.set("search", params.search.trim());
    }
    const qs = query.toString();
    return apiRequest(`/admin/blog${qs ? `?${qs}` : ""}`);
  },

  async getBlogPost(id) {
    return apiRequest(`/admin/blog/${id}`);
  },

  async createBlogPost(data) {
    return apiRequest("/admin/blog", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateBlogPost(id, data) {
    return apiRequest(`/admin/blog/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async deleteBlogPost(id) {
    return apiRequest(`/admin/blog/${id}`, {
      method: "DELETE",
    });
  },

  async getAnalyticsOverview() {
    return apiRequest("/admin/analytics");
  },
};
