export interface Instructor {
  name: string;
  bio: string;
  imageURL?: string;
}

export interface LiveSession {
  _id: string;
  date: string;
  time: string;
  meetLink: string;
  title: string;
  isActive: boolean;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  level: string;
  duration: string;
  features: string[];
  imageURL: string;
  enrollmentCount: number;
  rating?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  meetLink?: string;
  videoURL?: string;
  instructor?: Instructor;
  meetSchedule?: {
    dailyTime: string;
    timezone: string;
    isActive: boolean;
  };
  liveSessions?: LiveSession[];
}
