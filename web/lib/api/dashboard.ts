import { apiClient } from "../api-client";

export interface DashboardResponse {
  stats: {
    totalVolume: number;
    totalTransactions: number;
    successRate: number;
    growth: {
      volume: number;
      transactions: number;
      successRate: number;
    };
  };
  providerStats: {
    name: string;
    code: string;
    logoUrl: string | null;
    volume: number;
    transactions: number;
    successRate: number;
    percentage: number;
  }[];
  quickStats: {
    averageTransaction: number;
    averageFees: number;
    newPayers: number;
    topMethods: {
      name: string;
      code: string;
      percentage: number;
    }[];
  };
  recentTransactions: {
    id: string;
    reference: string;
    amount: number;
    currency: string;
    status: "PENDING" | "SUCCEEDED" | "FAILED";
    provider: {
      name: string;
      code: string;
    };
    payer: {
      phone: string;
      email: string;
      name: string;
    };
    createdAt: string; // ISO date string
    timeAgo: string;
  }[];
}

export const dashboardApi = {
  get: async (projectId: string, params?: any) => {
    const { data } = await apiClient.get<DashboardResponse>(`/projects/${projectId}/dashboard`, { params });
    return data;
  },
};