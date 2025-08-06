# 📚 IASDesk - MERN Educational Platform

A comprehensive MERN stack educational website designed specifically for civil services preparation, featuring modern authentication, course management, current affairs, and payment integration.

## 🚀 Features

### 🔐 Authentication
- **Mobile Number + OTP Authentication** using Twilio
- One-time OTP verification for registration
- Simple mobile-only login for returning users
- JWT-based session management

### 🏠 Frontend Features
- **Responsive Design** with Tailwind CSS
- **Physics Wallah-inspired** landing page
- **Course Catalog** with filtering and search
- **Current Affairs** section with categorization
- **User Dashboard** for enrolled courses
- **Payment Integration** with Razorpay/Stripe

### 🎓 Course Management
- Admin can create, edit, and delete courses
- Course categories and pricing
- Enrollment tracking
- Rich course content with curriculum

### 🗞️ Current Affairs
- Daily current affairs posts
- Category-wise organization
- Importance levels (High/Medium/Low)
- Search and filter functionality

### 💳 Payment Integration
- **Razorpay** payment gateway integration
- Secure payment verification
- Enrollment after successful payment
- Payment history tracking

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **React Hot Toast** for notifications
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Twilio** for SMS/OTP
- **Razorpay/Stripe** for payments
- **CORS** for cross-origin requests

## 📁 Project Structure

```
IASDesk/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API route handlers
│   ├── middleware/      # Authentication middleware
│   ├── utils/           # Utility functions
│   ├── server.js        # Main server file
│   └── .env             # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React Context providers
│   │   ├── services/    # API service functions
│   │   ├── types/       # TypeScript type definitions
│   │   ├── utils/       # Utility functions
│   │   └── App.tsx      # Main App component
│   └── public/          # Static assets
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Twilio account (for SMS)
- Razorpay account (for payments)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd IASDesk
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/iasdesk
JWT_SECRET=your_super_secure_jwt_secret_key
JWT_EXPIRE=30d

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Admin Configuration
ADMIN_SECRET=admin_secret_key
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `.env` file in frontend directory:
```env
REACT_APP_API_URL=${process.env.REACT_APP_API_URL}
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id
```

Start the frontend development server:
```bash
npm start
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health Check: ${process.env.REACT_APP_API_URL}/health

## 📱 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to mobile number
- `POST /api/auth/verify-otp` - Verify OTP and register user
- `POST /api/auth/login` - Login with mobile number
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Courses
- `GET /api/courses` - Get all courses (with filters)
- `GET /api/courses/:id` - Get single course
- `GET /api/courses/featured` - Get featured courses
- `GET /api/courses/categories` - Get course categories
- `POST /api/courses/:id/enroll` - Enroll in course
- `GET /api/courses/my/enrolled` - Get user's enrolled courses

### Current Affairs
- `GET /api/current-affairs` - Get all current affairs
- `GET /api/current-affairs/:id` - Get single current affair
- `GET /api/current-affairs/recent` - Get recent current affairs
- `GET /api/current-affairs/categories` - Get categories

### Payment
- `POST /api/payment/create-order` - Create payment order
- `POST /api/payment/verify` - Verify payment
- `GET /api/payment/history` - Get payment history

### Admin (Protected)
- `POST /api/admin/courses` - Create course
- `PUT /api/admin/courses/:id` - Update course
- `DELETE /api/admin/courses/:id` - Delete course
- `POST /api/admin/current-affairs` - Create current affair
- `PUT /api/admin/current-affairs/:id` - Update current affair
- `DELETE /api/admin/current-affairs/:id` - Delete current affair
- `GET /api/admin/dashboard` - Get dashboard stats

## 🔧 Development

### Adding a New Feature
1. Create the backend API endpoints in `backend/routes/`
2. Update the MongoDB models if needed in `backend/models/`
3. Add the API calls to `frontend/src/services/api.ts`
4. Create the frontend components in `frontend/src/components/`
5. Add the pages in `frontend/src/pages/`
6. Update the routing in `frontend/src/App.tsx`

### Database Models
- **User**: Mobile number, verification status, enrolled courses
- **Course**: Title, description, price, category, curriculum
- **CurrentAffair**: Title, content, category, importance level
- **OTP**: Mobile number, OTP code, expiration
- **Payment**: User, course, amount, payment gateway details

## 🔐 Security Features
- JWT-based authentication
- Rate limiting on OTP requests
- Input validation and sanitization
- CORS protection
- Payment signature verification
- Admin-only protected routes

## 📱 Mobile-First Design
- Responsive design for all screen sizes
- Touch-friendly interface
- Optimized for mobile devices
- Progressive Web App features

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or use cloud MongoDB
2. Configure environment variables on your hosting platform
3. Deploy to platforms like Heroku, DigitalOcean, or AWS

### Frontend Deployment
1. Build the production version: `npm run build`
2. Deploy to platforms like Netlify, Vercel, or AWS S3
3. Update API URLs in environment variables

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License
This project is licensed under the MIT License.

## 📞 Support
For support and queries, please contact [your-email@example.com]

---

Built with ❤️ for aspiring civil servants
