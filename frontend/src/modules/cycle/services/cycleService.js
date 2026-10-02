import { apiClient } from '../../../shared/services/apiClient';

/**
 * Service to consume Cycle API endpoints.
 */
export const cycleService = {
  /**
   * Calculates fertile window and saves the cycle record.
   * @param {{ lastPeriodDate: string, cycleLength: number, periodLength: number, userId?: number }} payload
   * @returns {Promise<any>}
   */
  async calculateCycle(payload) {
    return apiClient.post('/cycle/calculate', payload);
  },

  /**
   * Retrieves historical cycle records, optionally filtered by user ID.
   * @param {number} [userId]
   * @returns {Promise<any[]>}
   */
  async getHistory(userId) {
    const params = userId ? { userId } : {};
    return apiClient.get('/cycle/history', params);
  },

  /**
   * Deletes a cycle record by its ID (DELETE → 204).
   * @param {number} id
   * @returns {Promise<null>}
   */
  async deleteCycle(id) {
    return apiClient.delete(`/cycle/${id}`);
  },
};
