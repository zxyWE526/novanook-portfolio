import type { AnalyticsData, DashboardStats } from '../types';
import { mockAnalyticsData, mockDashboardStats } from '../services/mockData';

export const analyticsApi = {
  getDashboardStats: () => Promise.resolve({ ...mockDashboardStats }),
  getAnalyticsData: () => Promise.resolve({ ...mockAnalyticsData }),
};
