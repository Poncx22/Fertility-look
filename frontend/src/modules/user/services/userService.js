import { apiClient } from '../../../shared/services/apiClient';

/**
 * Service to consume User API endpoints.
 */
export const userService = {
  /**
   * Registers a new user.
   * @param {{ name: string, email: string }} userData
   * @returns {Promise<any>}
   */
  async createUser(userData) {
    return apiClient.post('/users', userData);
  },

  /**
   * Fetches all registered users.
   * @returns {Promise<any[]>}
   */
  async getAllUsers() {
    return apiClient.get('/users');
  },

  /**
   * Deletes a user by ID. Their history is preserved as anonymous (DELETE → 204).
   * @param {number} id
   * @returns {Promise<null>}
   */
  async deleteUser(id) {
    return apiClient.delete(`/users/${id}`);
  },
};
