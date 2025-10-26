# Educational Platform

A comprehensive educational platform built with React and TypeScript, featuring a modern and responsive user interface.

## Project Overview

This is an educational platform that supports multiple user roles: Students, Teachers, Parents, and Admins. It includes features like course management, quizzes, attendance tracking, and more. The platform uses Firebase for backend services and is built with a focus on user experience and security.

## Project Structure

```
educational_platform/
├── public/                    # Static assets (images, videos, icons)
│   ├── vite.svg
│   └── ... (add your images/videos here)
├── src/
│   ├── admin/                 # Admin-specific components and pages
│   │   ├── pages/            # Admin pages (UsersManagement, Permissions, etc.)
│   │   ├── AdminDashboard.tsx
│   │   └── index.tsx
│   ├── component/             # Shared components
│   │   ├── Navbar.tsx        # Navigation bar
│   │   ├── VerifyEmail.tsx   # Email verification component
│   │   └── PasswordReset.tsx # Password reset component
│   ├── pages/                 # General pages
│   │   ├── Home.tsx          # Landing page
│   │   ├── SignIn.tsx        # Login/Signup page
│   │   ├── Dashboard.tsx     # Main dashboard
│   │   └── ... (other general pages)
│   ├── StudentsPages/         # Student-specific pages
│   │   ├── StudentDashboard.tsx
│   │   ├── StudentCoursesPage.tsx
│   │   └── ... (student pages)
│   ├── TeachersPages/         # Teacher-specific pages
│   │   ├── TeacherDashboard.tsx
│   │   ├── TeacherCreateCourse.tsx
│   │   └── ... (teacher pages)
│   ├── ParentPages/           # Parent-specific pages
│   │   ├── ParentDashboard.tsx
│   │   ├── ParentChildMonitoring.tsx
│   │   └── ... (parent pages)
│   ├── assets/                # Static assets (React logo, etc.)
│   ├── utils/                 # Utility functions
│   │   ├── fetchBase.ts       # Base fetch configuration
│   │   ├── i18n.ts           # Internationalization
│   │   └── Perf.tsx          # Performance utilities
│   ├── App.tsx               # Main app component
│   ├── main.tsx              # App entry point
│   └── index.css             # Global styles
├── functions/                 # Firebase Cloud Functions
│   ├── index.js
│   └── package.json
├── .firebaserc               # Firebase project configuration
├── firebase.json             # Firebase hosting configuration
├── package.json              # Project dependencies
├── vite.config.ts            # Vite configuration
└── README.md                 # This file
```



## 🚀 Features

- ✅ User authentication and account creation
- ✅ Email verification system
- ✅ Multiple dashboard types (Student, Teacher, Parent, Admin)
- ✅ Parent-child account linking
- ✅ Modern and responsive user interface
- ✅ Secure token system with auto-refresh
- ✅ Course management and enrollment
- ✅ Video streaming with security measures
- ✅ Quiz and assessment system
- ✅ Progress tracking and reports
- ✅ Support ticket system
- ✅ Real-time notifications
- ✅ Certificate generation (PDF)
- ✅ Multi-device access control
- ✅ Content encryption and download prevention

## 🗺️ Project Sitemap

### 📚 Educational Platform
```
├── 🏠 Homepage
│   ├── Login / Sign up
│   ├── Browse courses
│   ├── Student reviews
│   └── FAQ / Support
│
├── 👩‍🎓 Student Account
│   ├── View enrolled courses
│   ├── Access course content
│   │   ├── Watch videos
│   │   ├── Download attachments
│   │   ├── Take quizzes
│   │   └── Request technical support
│   └── Final certificate (PDF)
│
├── 👨‍🏫 Teacher Dashboard
│   ├── Create new courses
│   ├── Upload videos and content
│   ├── Add quizzes and assessments
│   ├── Manage enrolled students
│   ├── View engagement and analytics
│   └── Send notifications to students
│
├── 🧑‍💼 Admin Dashboard (Project Owner)
│   ├── Manage teachers
│   ├── Manage students
│   ├── Monitor sales and statistics
│   ├── Manage reviews and ratings
│   ├── Add / modify platform sections
│   └── User permissions system
│
├── 👨‍👩‍👧 Parent Dashboard
│   ├── Monitor child's progress
│   ├── View completed lessons
│   ├── Check quiz grades
│   └── Attendance and progress reports
│
├── 🔐 Security Features
│   ├── Single device access restriction
│   └── Video encryption and download prevention
│
└── 🛠️ Technical Support
    ├── Ticket system
    └── Live chat support
```



**Video Guidelines:**
- Show the main features and user flows
- Demonstrate the different user roles (Student, Teacher, Parent, Admin)
- Include course creation, enrollment, and learning process
- Highlight security features and responsive design
- Keep it concise (5-10 minutes recommended)
- Use MP4 format for best compatibility
- Add a thumbnail/poster image for better loading experience

## 🛠️ التقنيات المستخدمة

- **Frontend:** React 18 + TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Routing:** React Router DOM
- **Build Tool:** Vite


