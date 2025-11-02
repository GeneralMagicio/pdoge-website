"use client";

import axios from 'axios';
import { accessTokenKey } from '../auth/AuthContext';

export function getBackendUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_BACKEND_URL || '').trim();
  return raw.replace(/\/$/, '');
}

export const axiosInstance = (() => {
  const backendUrl = getBackendUrl();
  if (!backendUrl) {
    throw new Error('Backend URL is not configured');
  }
  return axios.create({
    baseURL: backendUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  });
})()



axiosInstance.interceptors.request.use((config) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem(accessTokenKey) : null;
    if (token) {
      config.headers = config.headers || {};
      (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
  } catch {
    // ignore
  }
  return config;
});


