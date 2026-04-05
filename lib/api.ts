import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from './config';

/**
 * Base Fetch Utility for API Calls
 * Automatically adds the Content-Type and x-auth-token headers.
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  // Dynamically get token from storage
  let token = null;
  try {
    token = await AsyncStorage.getItem('auth_token');
  } catch (e) {
    console.error('Error fetching token for API call', e);
  }

  const url = `${CONFIG.API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('x-auth-token', token);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = (data && (data.message || data.msg)) || 'API request failed';
    throw new Error(errorMessage);
  }

  return data;
}

/**
 * Authentication API Methods
 */
export const authApi = {
  login: (payload: any) => {
    return apiFetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

/**
 * Client Management API Methods
 */
export const clientApi = {
  // Fetch all clients with pagination, search, and status
  getClients: (params: { page?: number; limit?: number; search?: string; status?: string; sortBy?: string; order?: string }) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) query.append(key, String(value));
    });
    return apiFetch(`/api/clients?${query.toString()}`);
  },

  // Fetch a single client by ID
  getClientById: (id: string) => {
    return apiFetch(`/api/clients/${id}`);
  },

  // Save or Update a client
  saveClient: (id: string | null, payload: any) => {
    return apiFetch(`/api/clients${id ? `/${id}` : ''}`, {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Delete a client
  deleteClient: (id: string) => {
    return apiFetch(`/api/clients/${id}`, {
      method: 'DELETE',
    });
  },

  // Fetch categories for the dropdown
  getCategories: () => {
    return apiFetch('/api/category');
  },

  // Create a new category
  createCategory: (name: string) => {
    return apiFetch('/api/category', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },
};

/**
 * Vendor / Provider API Methods
 */
export const vendorApi = {
  getProviders: () => {
    return apiFetch('/api/master/provider');
  },
  saveProvider: (id: string | null, formData: any) => { // any because FormData
    if (id) {
      return apiFetch(`/api/master/providers/${id}`, {
        method: 'PUT',
        body: formData,
      });
    }
    return apiFetch('/api/master/provider', {
      method: 'POST',
      body: formData,
    });
  },
  deleteProvider: (id: string) => {
    return apiFetch(`/api/master/providers/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Domain Management API Methods
 */
export const domainApi = {
  // Fetch domains with pagination, search, status, and registrar (vendor) filters
  getDomains: (params: { page?: number; limit?: number; search?: string; status?: string; registrar?: string; sortBy?: string; order?: string }) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) query.append(key, String(value));
    });
    return apiFetch(`/api/domains?${query.toString()}`);
  },

  // Fetch a single domain by ID
  getDomainById: (id: string) => {
    return apiFetch(`/api/domains/${id}`);
  },

  // Add or Update a domain
  saveDomain: (id: string | null, payload: any) => {
    return apiFetch(`/api/domains${id ? `/${id}` : ''}`, {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Delete a domain
  deleteDomain: (id: string) => {
    return apiFetch(`/api/domains/${id}`, {
      method: 'DELETE',
    });
  },

  // Renew a domain
  renewDomain: (id: string, payload: { expiryDate: string; cost: number; remark: string }) => {
    return apiFetch(`/api/domains/${id}/renew`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Fetch expiring domains alerts
  getRenewalAlerts: () => {
    return apiFetch('/api/domains/renewal-alerts');
  },

  // Fetch list of expiring domains
  getExpiringDomains: () => {
    return apiFetch('/api/domains/expiring');
  },
};

/**
 * Hosting Management API Methods
 */
export const hostingApi = {
  // Fetch hosting records with filters
  getHostings: (params: { page?: number; limit?: number; search?: string; status?: string; provider?: string; serviceType?: string; sortBy?: string; order?: string }) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) query.append(key, String(value));
    });
    return apiFetch(`/api/hosting?${query.toString()}`);
  },

  // Fetch single hosting record
  getHostingById: (id: string) => {
    return apiFetch(`/api/hosting/${id}`);
  },

  // Add or update hosting record
  saveHosting: (id: string | null, payload: any) => {
    return apiFetch(`/api/hosting${id ? `/${id}` : ''}`, {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Delete hosting record
  deleteHosting: (id: string) => {
    return apiFetch(`/api/hosting/${id}`, {
      method: 'DELETE',
    });
  },

  // Renew hosting
  renewHosting: (id: string, payload: { renewalDate: string; monthlyCost: number; remark: string }) => {
    return apiFetch(`/api/hosting/${id}/renew`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Fetch expiring hosting alerts
  getRenewalAlerts: () => {
    return apiFetch('/api/hosting/renewal-alerts');
  },

  // Fetch list of expiring hosting
  getExpiringHostings: () => {
    return apiFetch('/api/hosting/expiring');
  },

  // Get domains belonging to a specific client
  getClientDomains: (clientId: string) => {
    return apiFetch(`/api/hosting/domains/client/${clientId}`);
  },

  // Get Service Types for Hosting
  getServiceTypes: () => {
    return apiFetch('/api/master/service-type');
  },
};

