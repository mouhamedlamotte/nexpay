// Common types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}

export interface PaginationResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  pagination?: PaginationResponse;
}

// Project types
export interface Project {
  id: string;
  name: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  callbackUrls?: CallbackUrls;
  metadata?: Record<string, any>;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  metadata?: Record<string, any>;
}

// Callback/Redirect types
export interface CallbackUrls {
  successUrl?: string;
  failureUrl?: string;
  cancelUrl?: string;
}

// Webhook types
export interface Webhook {
  id: string;
  url: string;
  header: string;
  secret: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWebhookDto {
  url: string;
  header: string;
  secret: string;
}

export interface UpdateWebhookDto {
  url?: string;
  header?: string;
  secret?: string;
}

// Payment Provider types
export interface PaymentProvider {
  id: string;
  name: string;
  code: string;
  secretsFields: string[]
  secrets: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePaymentProviderDto {
  providerId: string;
  secrets: Record<string, any>;
}

// Transaction types
export type TransactionStatus =
  | "PENDING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELLED"
  | "EXPIRED"
  | "REFUNDED";
export type Currency =
  | "USD"
  | "XOF"
  | "EUR"
  | "GBP"
  | "JPY"
  | "AUD"
  | "CAD"
  | "CHF"
  | "CNY"
  | "SEK"
  | "NZD";

export interface Transaction {
  id: string;
  amount: number;
  currency: Currency;
  status: TransactionStatus;
  reference: string;
  providerTransactionId?: string;
  clientReference: string;
  metadata?: Record<string, any>;
  expiresAt?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  payer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    userId: string;
    metadata?: Record<string, any>;
  }
}

export interface TransactionFilters extends PaginationParams {
  currency?: Currency;
  status?: TransactionStatus;
  reference?: string;
  providerTransactionId?: string;
  createdAfter?: string;
  createdBefore?: string;
}
