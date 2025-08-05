<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# IASDesk - MERN Educational Platform

This is a comprehensive MERN stack educational website project with the following key characteristics:

## Project Structure
- **Backend**: Node.js + Express + MongoDB + Mongoose
- **Frontend**: React + TypeScript + Tailwind CSS
- **Authentication**: JWT + Mobile OTP via Twilio
- **Payment**: Razorpay/Stripe integration
- **Database**: MongoDB with Mongoose schemas

## Key Features
1. **Mobile-first authentication** with OTP verification (one-time registration)
2. **Course management** with admin controls
3. **Current affairs** module for daily updates
4. **Payment integration** for course enrollment
5. **Responsive design** inspired by Physics Wallah

## Code Style Guidelines
- Use TypeScript for all React components
- Follow functional components with hooks
- Use Tailwind CSS for styling
- Implement proper error handling with try-catch
- Use async/await for API calls
- Follow RESTful API conventions
- Use descriptive variable and function names
- Add proper TypeScript types and interfaces

## Backend Conventions
- Use middleware for authentication and validation
- Implement proper MongoDB schema validation
- Use environment variables for configuration
- Follow MVC pattern with routes, models, and controllers
- Implement rate limiting for security
- Use bcrypt for password hashing (if needed)
- Validate all inputs using Joi or similar

## Frontend Conventions
- Use React Context for state management
- Implement proper loading states and error handling
- Use React Router for navigation
- Create reusable components
- Follow mobile-first responsive design
- Use React Hot Toast for notifications
- Implement proper form validation

## API Structure
- Authentication: `/api/auth/*`
- Courses: `/api/courses/*`
- Current Affairs: `/api/current-affairs/*`
- Payment: `/api/payment/*`
- Admin: `/api/admin/*`

## Important Notes
- This is an educational platform focused on civil services preparation
- Mobile number + OTP is the primary authentication method
- Payment integration is essential for course enrollment
- Admin panel is required for content management
- The design should be modern and user-friendly like Physics Wallah

When writing code for this project, prioritize:
1. Security and proper authentication
2. Mobile responsiveness
3. User experience and intuitive design
4. Performance optimization
5. Code maintainability and readability
