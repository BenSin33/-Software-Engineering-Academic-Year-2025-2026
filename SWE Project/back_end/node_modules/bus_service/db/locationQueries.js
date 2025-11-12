// Minimal location queries stub to satisfy controller imports
module.exports = {
  async getLocationTracking(busId, limit) {
    return [];
  },
  async getLocationHistory(busId, startDate, endDate) {
    return [];
  },
  async addLocationTracking(locationData) {
    return { success: true };
  },
  async getCurrentLocations() {
    return [];
  },
  async getBusRoute(busId) {
    return [];
  },
  async getLocationStatistics(busId) {
    return {};
  }
};


