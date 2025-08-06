import axios, { AxiosResponse } from 'axios';
import {
  ApiResponse,
  ApiListResponse,
  User,
  Course,
  CurrentAffair,
  Payment,
  OTPRequest,
  OTPVerifyRequest,
  LoginRequest,
  CreateOrderRequest,
  VerifyPaymentRequest,
  CourseFilters,
  CurrentAffairFilters
} from '../types';
import { tokenUtils } from '../utils/token';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://iasdesk-educational-platform-2.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = tokenUtils.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      tokenUtils.clearTokens();
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  sendOTP: (data: OTPRequest): Promise<AxiosResponse<ApiResponse>> =>
    api.post('/auth/send-otp', data),

  verifyOTP: (data: OTPVerifyRequest): Promise<AxiosResponse<ApiResponse<{ token: string; user: User }>>> =>
    api.post('/auth/verify-otp', data),

  login: (data: LoginRequest): Promise<AxiosResponse<ApiResponse<{ token: string; user: User }>>> =>
    api.post('/auth/login', data),

  getProfile: (): Promise<AxiosResponse<ApiResponse<{ user: User }>>> =>
    api.get('/auth/profile'),

  updateProfile: (data: Partial<User>): Promise<AxiosResponse<ApiResponse<{ user: User }>>> =>
    api.put('/auth/profile', data),
};

// Courses API
export const coursesAPI = {
  getCourses: (filters?: CourseFilters): Promise<AxiosResponse<ApiListResponse<{ courses: Course[] }>>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    return api.get(`/courses?${params.toString()}`);
  },

  getCourse: (id: string): Promise<AxiosResponse<ApiResponse<{ course: Course }>>> =>
    api.get(`/courses/${id}`),

  getFeaturedCourses: (): Promise<AxiosResponse<ApiResponse<{ courses: Course[] }>>> =>
    api.get('/courses/featured'),

  getCategories: (): Promise<AxiosResponse<ApiResponse<{ categories: string[] }>>> =>
    api.get('/courses/categories'),

  getEnrolledCourses: (): Promise<AxiosResponse<ApiResponse<{ courses: Course[] }>>> =>
    api.get('/courses/my/enrolled'),

  enrollCourse: (courseId: string, paymentId: string): Promise<AxiosResponse<ApiResponse>> =>
    api.post(`/courses/${courseId}/enroll`, { paymentId }),
};

// Current Affairs API
export const currentAffairsAPI = {
  getCurrentAffairs: (filters?: CurrentAffairFilters): Promise<AxiosResponse<ApiListResponse<{ currentAffairs: CurrentAffair[] }>>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    return api.get(`/current-affairs?${params.toString()}`);
  },

  getCurrentAffair: (id: string): Promise<AxiosResponse<ApiResponse<{ currentAffair: CurrentAffair }>>> =>
    api.get(`/current-affairs/${id}`),

  getRecentCurrentAffairs: (limit?: number): Promise<AxiosResponse<ApiResponse<{ currentAffairs: CurrentAffair[] }>>> =>
    api.get(`/current-affairs/recent${limit ? `?limit=${limit}` : ''}`),

  getCategories: (): Promise<AxiosResponse<ApiResponse<{ categories: string[] }>>> =>
    api.get('/current-affairs/categories'),
};

// Payment API
export const paymentAPI = {
  createOrder: (data: CreateOrderRequest): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.post('/payment/create-order', data),

  verifyPayment: (data: VerifyPaymentRequest): Promise<AxiosResponse<ApiResponse>> =>
    api.post('/payment/verify', data),

  getPaymentHistory: (page?: number, limit?: number): Promise<AxiosResponse<ApiListResponse<{ payments: Payment[] }>>> =>
    api.get(`/payment/history${page || limit ? `?page=${page || 1}&limit=${limit || 10}` : ''}`),
};

// Admin API (for admin users)
export const adminAPI = {
  // Courses
  createCourse: (data: Partial<Course>): Promise<AxiosResponse<ApiResponse<{ course: Course }>>> =>
    api.post('/admin/courses', data),

  updateCourse: (id: string, data: Partial<Course>): Promise<AxiosResponse<ApiResponse<{ course: Course }>>> =>
    api.put(`/admin/courses/${id}`, data),

  deleteCourse: (id: string): Promise<AxiosResponse<ApiResponse>> =>
    api.delete(`/admin/courses/${id}`),

  getAdminCourses: (page?: number, limit?: number, isActive?: boolean): Promise<AxiosResponse<ApiListResponse<{ courses: Course[] }>>> =>
    api.get(`/admin/courses?page=${page || 1}&limit=${limit || 10}${isActive !== undefined ? `&isActive=${isActive}` : ''}`),

  // Current Affairs
  createCurrentAffair: (data: Partial<CurrentAffair>): Promise<AxiosResponse<ApiResponse<{ currentAffair: CurrentAffair }>>> =>
    api.post('/admin/current-affairs', data),

  updateCurrentAffair: (id: string, data: Partial<CurrentAffair>): Promise<AxiosResponse<ApiResponse<{ currentAffair: CurrentAffair }>>> =>
    api.put(`/admin/current-affairs/${id}`, data),

  deleteCurrentAffair: (id: string): Promise<AxiosResponse<ApiResponse>> =>
    api.delete(`/admin/current-affairs/${id}`),

  getAdminCurrentAffairs: (page?: number, limit?: number, isActive?: boolean): Promise<AxiosResponse<ApiListResponse<{ currentAffairs: CurrentAffair[] }>>> =>
    api.get(`/admin/current-affairs?page=${page || 1}&limit=${limit || 10}${isActive !== undefined ? `&isActive=${isActive}` : ''}`),

  // Dashboard
  getDashboardStats: (): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get('/admin/dashboard'),

  getUsers: (page?: number, limit?: number, search?: string): Promise<AxiosResponse<ApiListResponse<{ users: User[] }>>> =>
    api.get(`/admin/users?page=${page || 1}&limit=${limit || 10}${search ? `&search=${search}` : ''}`),
};

export default api;
