export interface User {
  id: string;
  mobile: string;
  name?: string;
  email?: string;
  isVerified: boolean;
  isAdmin: boolean;
  enrolledCourses: EnrolledCourse[];
  createdAt: string;
  updatedAt: string;
}

export interface EnrolledCourse {
  courseId: string | Course;
  enrolledAt: string;
  paymentId: string;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  imageURL: string;
  price: number;
  originalPrice?: number;
  category: string;
  duration?: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  features?: string[];
  curriculum?: CurriculumItem[];
  instructor?: Instructor;
  isActive: boolean;
  enrollmentCount: number;
  rating: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CurriculumItem {
  title: string;
  topics: string[];
}

export interface Instructor {
  name: string;
  bio: string;
  image: string;
}

export interface CurrentAffair {
  _id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  imageURL?: string;
  isActive: boolean;
  importance: 'High' | 'Medium' | 'Low';
  datePosted: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  userId: string;
  courseId: string | Course;
  amount: number;
  currency: string;
  paymentGateway: 'razorpay' | 'stripe';
  paymentId: string;
  orderId: string;
  signature?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginationInfo {
  current: number;
  pages: number;
  total: number;
  limit: number;
}

export interface ApiListResponse<T = any> extends ApiResponse<T> {
  data: {
    pagination: PaginationInfo;
  } & T;
}

export interface OTPRequest {
  mobile: string;
}

export interface OTPVerifyRequest {
  mobile: string;
  otp: string;
}

export interface LoginRequest {
  mobile: string;
}

export interface CreateOrderRequest {
  courseId: string;
}

export interface VerifyPaymentRequest {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  courseId: string;
}

export interface CourseFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CurrentAffairFilters {
  category?: string;
  search?: string;
  importance?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}
