import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, User, Activity, Settings, LogOut, LayoutDashboard, GraduationCap, FileText, Users, ChevronLeft, Menu, AlertTriangle, CheckCircle, Upload, Bell, Eye, Award, BarChart3, CreditCard } from 'lucide-react';
import ProfilePage from './ProfilePage';
import SettingsPage from './SettingsPage';
import LinkChildPage from '../ParentPages/LinkChildPage';
import TeachersPage from '../TeachersPages/TeachersPage';
import ReportsPage from './ReportsPage';
import DashboardHomePage from './DashboardHomePage';
import TeacherCreateCourse from '../TeachersPages/TeacherCreateCourse';
import TeacherCoursesList from '../TeachersPages/TeacherCoursesList';
import TeacherCourseDetails from '../TeachersPages/TeacherCourseDetails';
import { ManageStudentsPage, EngagementReportsPage, SendNotificationsPage } from '../TeachersPages/TeacherPlaceholders';
import TeacherAddQuiz from '../TeachersPages/TeacherAddQuiz';
import TeacherUploadContent from '../TeachersPages/TeacherUploadContent';
import TeacherPaymentsPage from '../TeachersPages/TeacherPaymentsPage';
import StudentCoursesPage from '../StudentsPages/StudentCoursesPage';
import StudentMyCoursesPage from '../StudentsPages/StudentMyCoursesPage';
import StudentCourseDetailsPage from '../StudentsPages/StudentCourseDetailsPage';
import ParentChildMonitoring from '../ParentPages/ParentChildMonitoring';
import ParentLessonsCompleted from '../ParentPages/ParentLessonsCompleted';
import ParentQuizGrades from '../ParentPages/ParentQuizGrades';
import ParentAttendanceReports from '../ParentPages/ParentAttendanceReports';
import NotificationsPage from './NotificationsPage';

interface Profile {
  id?: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  user_type?: string;
  phone_number?: string;
  date_of_birth?: string;
  bio?: string;
  address?: string;
  city?: string;
  country?: string;
  profile_picture?: string;
  level?: number;
  skills?: string[];
}

interface Notification {
  id: number;
  sender_name: string;
  course_title: string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
}

const Dashboard: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState<
    | 'dashboard'
    | 'profile'
    | 'settings'
    | 'courses'
    | 'teachers'
    | 'reports'
    | 'linkChild'
    | 'teacherCreateCourse'
    | 'teacherUploadContent'
    | 'teacherAddExams'
    | 'teacherManageStudents'
    | 'teacherPayments'
    | 'teacherEngagementReports'
    | 'teacherSendNotifications'
    | 'teacherCoursesList'
    | 'teacherCourseDetails'
    | 'studentCourses'
    | 'studentMyCourses'
    | 'studentCourseDetails'
    | 'parentChildMonitoring'
    | 'parentLessonsCompleted'
    | 'parentQuizGrades'
    | 'parentAttendanceReports'
    | 'notifications'
  >('dashboard');
  const [selectedCourse, setSelectedCourse] = useState<{ id: string | number; title?: string } | null>(null);
  const [selectedSectionTitle, setSelectedSectionTitle] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const isParentUser = (() => {
    const value = (localStorage.getItem('userType') || '').toLowerCase();
    return value === 'parent' || value === 'ولي أمر' || value === 'ولي الامر';
  })();
  const isTeacherUser = (() => {
    const value = (localStorage.getItem('userType') || '').toLowerCase();
    return value === 'teacher' || value === 'معلم' || value === 'مدرس';
  })();
  const isStudentUser = (() => {
    const value = (localStorage.getItem('userType') || '').toLowerCase();
    return value === 'student' || value === 'طالب' || value === 'طالبة';
  })();

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem('refreshToken');
      if (!refresh) return null;
      
      console.log('=== REFRESH TOKEN REQUEST ===');
      console.log('Request URL:', '/user/token/refresh/');
      
      const res = await fetch('/user/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh })
      });
      
      console.log('=== REFRESH TOKEN RESPONSE ===');
      console.log('Response Status:', res.status);
      console.log('Response OK:', res.ok);
      
      if (!res.ok) return null;
      
      const data = await res.json();
      if (data.access) localStorage.setItem('accessToken', data.access);
      
      console.log('Token refreshed successfully');
      return data.access as string;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  };

  const authFetch = async (url: string, init?: RequestInit) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      // إذا لم يوجد توكن، توجيه إلى صفحة تسجيل الدخول
      window.location.href = '/signin';
      return new Response(null, { status: 401 });
    }
    
    console.log('=== AUTH FETCH REQUEST ===');
    console.log('Request URL:', url);
    console.log('Request Headers:', {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      ...(init && init.headers ? init.headers : {})
    });
    
    let res = await fetch(url, {
      ...init,
      headers: {
        ...(init && init.headers ? init.headers : {}),
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    console.log('=== AUTH FETCH RESPONSE ===');
    console.log('Response Status:', res.status);
    console.log('Response OK:', res.ok);
    
    if (res.status === 401) {
      console.log('Token expired, attempting refresh...');
      const newToken = await refreshToken();
      if (newToken) {
        console.log('Retrying request with new token...');
        res = await fetch(url, {
          ...init,
          headers: {
            ...(init && init.headers ? init.headers : {}),
            'Authorization': `Bearer ${newToken}`,
            'Accept': 'application/json'
          }
        });
        
        console.log('=== RETRY RESPONSE ===');
        console.log('Response Status:', res.status);
        console.log('Response OK:', res.ok);
      } else {
        // إذا فشل تجديد التوكن، توجيه إلى صفحة تسجيل الدخول
        console.log('Refresh token failed, redirecting to login');
        localStorage.clear();
        window.location.href = '/signin';
        return new Response(null, { status: 401 });
      }
    }
    return res;
  };

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchNotifications = async () => {
    if (!isStudentUser) return;
    
    try {
      const res = await authFetch('/student/get/notifications/');
      
      if (res && res.ok) {
        const data = await res.json();
        // API returns { notifications: [], unread_count: 3, total_count: 3 }
        setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
  };

  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.is_read).length : 0;



  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        
        // التحقق من وجود التوكن أولاً
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setError('يجب تسجيل الدخول أولاً');
          setLoading(false);
          window.location.href = '/signin';
          return;
        }

        console.log('=== PROFILE REQUEST ===');
        console.log('Request URL:', '/user/profile/');
        
        const res = await authFetch('/user/profile/');
        
        if (!res || !res.ok) {
          console.log('Profile request failed');
          setError('تعذر تحميل الملف الشخصي');
          setLoading(false);
          return;
        }
        
        let data;
        try {
          const responseText = await res.text();
          console.log('Response Text:', responseText);

          if (responseText) {
            data = JSON.parse(responseText);
          } else {
            data = {};
          }
        } catch (error) {
          console.error('Error parsing JSON response:', error);
          setError('خطأ في استقبال البيانات من الخادم');
          setLoading(false);
          return;
        }
        
        console.log('=== PROFILE DATA ===');
        console.log('Profile Data:', data);
        
        setProfile(data);
        
        // حفظ بعض البيانات للوصول السريع عبر التطبيق
        if (data) {
          const displayName = data.first_name && data.last_name
            ? `${data.first_name} ${data.last_name}`
            : data.username || '';
          if (displayName) localStorage.setItem('displayName', displayName);
          if (data.user_type) localStorage.setItem('userType', data.user_type);
          if (data.profile_picture) localStorage.setItem('profileImageUrl', data.profile_picture);
        }
      } catch (e) {
        console.error('Unexpected error:', e);
        setError('حدث خطأ غير متوقع');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Fetch notifications for students
  useEffect(() => {
    if (isStudentUser) {
      fetchNotifications();
    }
  }, [isStudentUser]);


  // Track viewport to apply desktop-only margins for content/header
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)');
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener ? mql.addEventListener('change', update) : mql.addListener(update as any);
    return () => {
      mql.removeEventListener ? mql.removeEventListener('change', update) : mql.removeListener(update as any);
    };
  }, []);

  

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardHomePage />;
      case 'profile':
        return <ProfilePage profile={profile} />;
      case 'settings':
        return <SettingsPage showToast={showToast} />;
      case 'courses':
        return <StudentCoursesPage />;
      case 'teachers':
        return <TeachersPage />;
      case 'reports':
        return <ReportsPage />;
      case 'linkChild':
        return <LinkChildPage />;
      case 'teacherCreateCourse':
        return <TeacherCreateCourse />;
      case 'teacherUploadContent':
        return <TeacherUploadContent />;
      case 'teacherAddExams':
        return <TeacherAddQuiz />;
      case 'teacherManageStudents':
        return <ManageStudentsPage />;
      case 'teacherPayments':
        return <TeacherPaymentsPage />;
      case 'teacherEngagementReports':
        return <EngagementReportsPage />;
      case 'teacherSendNotifications':
        return <SendNotificationsPage />;
      case 'teacherCoursesList':
        return (
          <TeacherCoursesList
            onOpenCourse={(course) => {
              setSelectedCourse({ id: course.id, title: course.title });
              setCurrentPage('teacherCourseDetails');
            }}
          />
        );
      case 'teacherCourseDetails':
        return selectedCourse ? (
          <TeacherCourseDetails
            courseId={selectedCourse.id}
            courseTitle={selectedCourse.title}
            onAddQuiz={(sectionTitle) => {
              setSelectedSectionTitle(sectionTitle);
              setCurrentPage('teacherAddExams');
            }}
          />
        ) : (
          <DashboardHomePage />
        );
      case 'teacherAddExams':
        return <TeacherAddQuiz courseTitle={selectedCourse?.title} sectionTitle={selectedSectionTitle ?? undefined} />;
      case 'studentCourses':
        return <StudentCoursesPage onModalStateChange={setIsModalOpen} />;
      case 'studentMyCourses':
        return <StudentMyCoursesPage />;
      case 'studentCourseDetails':
        return selectedCourse ? (
          <StudentCourseDetailsPage
            courseId={selectedCourse.id}
            courseTitle={selectedCourse.title}
          />
        ) : (
          <DashboardHomePage />
        );
      case 'parentChildMonitoring':
        return <ParentChildMonitoring />;
      case 'parentLessonsCompleted':
        return <ParentLessonsCompleted />;
      case 'parentQuizGrades':
        return <ParentQuizGrades />;
      case 'parentAttendanceReports':
        return <ParentAttendanceReports />;
      case 'notifications':
        return <NotificationsPage onBack={() => setCurrentPage('dashboard')} />;
      default:
        return <DashboardHomePage />;
    }
  };

  const NotificationsButton = () => (
    <button
      onClick={() => setCurrentPage('notifications')}
      className="relative p-2 mr-2 rounded-lg bg-white border border-gray-200 hover:bg-blue-50 text-gray-700 shadow"
      aria-label="Notifications"
    >
      <Bell className="w-4 h-4" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.8 }}
            className={`fixed top-4 right-4 z-80 p-4 rounded-xl shadow-lg max-w-sm ${
              toast.type === 'success' ? 'bg-green-500 text-white' :
              toast.type === 'error' ? 'bg-red-500 text-white' :
              'bg-blue-500 text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {toast.type === 'error' && <AlertTriangle className="w-5 h-5" />}
              {toast.type === 'info' && <Activity className="w-5 h-5" />}
              <span className="font-medium">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top headers */}
      {/* Mobile full-width header */}
      <div className={`fixed top-0 inset-x-0 z-50 h-12 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-3 md:hidden ${(currentPage === 'teacherCoursesList' || currentPage === 'teacherCourseDetails' || currentPage === 'studentMyCourses') ? '!hidden' : ''} ${isModalOpen ? 'blur-sm' : ''}`}>

        <button onClick={() => setMobileSidebarOpen(true)} className="p-2 rounded-md bg-white border border-gray-200 shadow" aria-label="Open sidebar">
          <Menu className="w-5 h-5 text-blue-700" />
        </button>
        <div className="flex items-center gap-2">
          {isStudentUser && <NotificationsButton />}
          <button className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-blue-50 text-gray-700 shadow" aria-label="Settings">
            <Settings className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-red-50 text-red-600 shadow" onClick={() => { localStorage.clear(); window.location.href = '/signin'; }} aria-label="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Desktop inline header inside content area (no overlap with sidebar) */}
      <div className={`hidden md:block ${(currentPage === 'teacherCoursesList' || currentPage === 'teacherCourseDetails' || currentPage === 'studentMyCourses')
 ? '!hidden' : ''} ${isModalOpen ? 'blur-sm' : ''}`} style={{ marginRight: isDesktop ? (sidebarCollapsed ? 80 : 256) : 0, transition: 'margin-right 300ms ease-in-out' }}>
        <div className="h-14 flex items-center justify-end px-4 border-b border-gray-100 bg-white/70 backdrop-blur-md">
          {isStudentUser && <NotificationsButton />}
          <button className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-blue-50 text-gray-700 shadow" aria-label="Settings">
            <Settings className="w-4 h-4" />
          </button>
          <button className="ml-2 p-2 rounded-lg bg-white border border-gray-200 hover:bg-red-50 text-red-600 shadow" onClick={() => { localStorage.clear(); window.location.href = '/signin'; }} aria-label="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sidebar (desktop) */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} transition-[width] duration-300 fixed right-0 top-0 bottom-0 bg-white/80 backdrop-blur-xl border-l border-gray-100 z-60 hidden md:flex ${(currentPage === 'teacherCoursesList' || currentPage === 'teacherCourseDetails' || currentPage === 'studentMyCourses')
? '!hidden' : ''} ${isModalOpen ? 'blur-sm' : ''}`} dir="rtl">
        <div className="w-full h-full p-4 overflow-y-auto">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} mb-4`}>
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <span className="text-base font-bold text-gray-900">تعلم</span>
              </div>
            )}
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className={`p-1 rounded-md hover:bg-blue-50 text-blue-700 transition ${sidebarCollapsed ? '' : ''}`} aria-label="Collapse sidebar">
              <ChevronLeft className={`w-5 h-5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>
          <nav className="space-y-1">
            {!isTeacherUser && !isParentUser && (
              <button 
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  currentPage === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                }`}
                onClick={() => setCurrentPage('dashboard')}
              >
                <LayoutDashboard className="w-5 h-5" />
                {!sidebarCollapsed && <span className="text-sm">لوحة التحكم</span>}
              </button>
            )}
            {isTeacherUser ? (
              <>
                <button
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    currentPage === 'teacherCoursesList' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                  onClick={() => setCurrentPage('teacherCoursesList')}
                >
                  <GraduationCap className="w-5 h-5" />
                  {!sidebarCollapsed && <span className="text-sm">دوراتي</span>}
                </button>
                <button
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    currentPage === 'teacherCreateCourse' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                  onClick={() => setCurrentPage('teacherCreateCourse')}
                >
                  <FileText className="w-5 h-5" />
                  {!sidebarCollapsed && <span className="text-sm">إنشاء كورس جديد</span>}
                </button>
                <button
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    currentPage === 'teacherUploadContent' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                  onClick={() => setCurrentPage('teacherUploadContent')}
                >
                  <Upload className="w-5 h-5" />
                  {!sidebarCollapsed && <span className="text-sm">رفع الفيديوهات والمحتوى</span>}
                </button>
                <button
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    currentPage === 'teacherAddExams' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                  onClick={() => setCurrentPage('teacherAddExams')}
                >
                  <FileText className="w-5 h-5" />
                  {!sidebarCollapsed && <span className="text-sm">إضافة اختبارات</span>}
                </button>
                <button
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    currentPage === 'teacherManageStudents' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                  onClick={() => setCurrentPage('teacherManageStudents')}
                >
                  <Users className="w-5 h-5" />
                  {!sidebarCollapsed && <span className="text-sm">إدارة الطلاب المسجلين</span>}
                </button>
                <button
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    currentPage === 'teacherPayments' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                  onClick={() => setCurrentPage('teacherPayments')}
                >
                  <CreditCard className="w-5 h-5" />
                  {!sidebarCollapsed && <span className="text-sm">إدارة المدفوعات</span>}
                </button>
                <button
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    currentPage === 'teacherEngagementReports' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                  onClick={() => setCurrentPage('teacherEngagementReports')}
                >
                  <FileText className="w-5 h-5" />
                  {!sidebarCollapsed && <span className="text-sm">تقارير التفاعل والمشاهدة</span>}
                </button>
                <button
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    currentPage === 'teacherSendNotifications' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                  onClick={() => setCurrentPage('teacherSendNotifications')}
                >
                  <Bell className="w-5 h-5" />
                  {!sidebarCollapsed && <span className="text-sm">إرسال إشعارات للطلاب</span>}
                </button>
              </>
            ) : isStudentUser ? (
              <>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    currentPage === 'studentCourses' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                  onClick={() => setCurrentPage('studentCourses')}
                >
                  <GraduationCap className="w-5 h-5" />
                  {!sidebarCollapsed && <span className="text-sm">مشاهدة الكورسات</span>}
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    currentPage === 'studentMyCourses' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                  onClick={() => setCurrentPage('studentMyCourses')}
                >
                  <BookOpen className="w-5 h-5" />
                  {!sidebarCollapsed && <span className="text-sm">دخول إلى الكورس</span>}
                </button>
              </>
            ) : !isParentUser && (
              <>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    currentPage === 'courses' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                  onClick={() => setCurrentPage('courses')}
                >
                  <GraduationCap className="w-5 h-5" />
                  {!sidebarCollapsed && <span className="text-sm">الدورات</span>}
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    currentPage === 'teachers' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                  onClick={() => setCurrentPage('teachers')}
                >
                  <Users className="w-5 h-5" />
                  {!sidebarCollapsed && <span className="text-sm">المعلمون</span>}
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    currentPage === 'reports' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                  onClick={() => setCurrentPage('reports')}
                >
                  <FileText className="w-5 h-5" />
                  {!sidebarCollapsed && <span className="text-sm">التقارير</span>}
                </button>
              </>
            )}
            <button 
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                currentPage === 'profile' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
              }`} 
              onClick={() => setCurrentPage('profile')}
            >
              <User className="w-5 h-5" />
              {!sidebarCollapsed && <span className="text-sm">البروفايل</span>}
            </button>
            {isParentUser && (
              <>
                <button
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    currentPage === 'parentChildMonitoring' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                  onClick={() => setCurrentPage('parentChildMonitoring')}
                >
                  <Users className="w-5 h-5" />
                  {!sidebarCollapsed && <span className="text-sm">متابعة الابن/الابنة</span>}
                </button>
                <button
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    currentPage === 'parentLessonsCompleted' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                  }`}
                  onClick={() => setCurrentPage('parentLessonsCompleted')}
                >
                  <Eye className="w-5 h-5" />
                  {!sidebarCollapsed && <span className="text-sm">الإطلاع على الدروس المنجزة</span>}
                </button>
                <button
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    currentPage === 'parentQuizGrades' ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                  }`}
                  onClick={() => setCurrentPage('parentQuizGrades')}
                >
                  <Award className="w-5 h-5" />
                  {!sidebarCollapsed && <span className="text-sm">عرض درجات الاختبارات</span>}
                </button>
                <button
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    currentPage === 'parentAttendanceReports' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                  }`}
                  onClick={() => setCurrentPage('parentAttendanceReports')}
                >
                  <BarChart3 className="w-5 h-5" />
                  {!sidebarCollapsed && <span className="text-sm">تقارير الحضور والتقدم</span>}
                </button>
                <button
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    currentPage === 'linkChild' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                  }`}
                  onClick={() => setCurrentPage('linkChild')}
                >
                  <Users className="w-5 h-5" />
                  {!sidebarCollapsed && <span className="text-sm">ربط حساب الابن</span>}
                </button>
              </>
            )}
          </nav>
          <div className="pt-3 mt-3 border-t border-gray-100" />
          <button 
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              currentPage === 'settings' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
            }`}
            onClick={() => setCurrentPage('settings')}
          >
            <Settings className="w-5 h-5" />
            {!sidebarCollapsed && <span className="text-sm">الإعدادات</span>}
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition" onClick={() => {  window.location.href = '/'; }}>
            <LogOut className="w-5 h-5" />
            {!sidebarCollapsed && <span className="text-sm">خروج</span>}
          </button>
        </div>
      </aside>

      {/* Sidebar (mobile drawer) */}
      <div className={`fixed inset-0 z-60 md:hidden ${mobileSidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'} ${(currentPage === 'teacherCoursesList' || currentPage === 'teacherCourseDetails'||currentPage === 'studentMyCourses') ? '!hidden' : ''}`}>
        <div className={`absolute inset-0 bg-black/30 transition-opacity ${mobileSidebarOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setMobileSidebarOpen(false)} />
        <div className={`absolute top-0 bottom-0 right-0 w-64 bg-white shadow-xl transition-transform ${mobileSidebarOpen ? 'translate-x-0' : 'translate-x-full'} ${isModalOpen ? 'blur-sm' : ''}`} dir="rtl">
          <div className="h-full p-4 overflow-y-auto">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <span className="text-base font-bold text-gray-900">تعلم</span>
            </div>
            <nav className="space-y-1">
              {!isTeacherUser && !isParentUser && (
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    currentPage === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                  onClick={() => { setMobileSidebarOpen(false); setCurrentPage('dashboard'); }}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="text-sm">لوحة التحكم</span>
                </button>
              )}
              {isTeacherUser ? (
                <>
                  <button 
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                      currentPage === 'teacherCoursesList' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                    onClick={() => { setMobileSidebarOpen(false); setCurrentPage('teacherCoursesList'); }}
                  >
                    <GraduationCap className="w-5 h-5" />
                    <span className="text-sm">دوراتي</span>
                  </button>
                  <button 
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                      currentPage === 'teacherCreateCourse' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                    onClick={() => { setMobileSidebarOpen(false); setCurrentPage('teacherCreateCourse'); }}
                  >
                    <FileText className="w-5 h-5" />
                    <span className="text-sm">إنشاء كورس جديد</span>
                  </button>
                  <button 
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                      currentPage === 'teacherUploadContent' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                    onClick={() => { setMobileSidebarOpen(false); setCurrentPage('teacherUploadContent'); }}
                  >
                    <Upload className="w-5 h-5" />
                    <span className="text-sm">رفع الفيديوهات والمحتوى</span>
                  </button>
                  <button 
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                      currentPage === 'teacherAddExams' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                    onClick={() => { setMobileSidebarOpen(false); setCurrentPage('teacherAddExams'); }}
                  >
                    <FileText className="w-5 h-5" />
                    <span className="text-sm">إضافة اختبارات</span>
                  </button>
                  <button 
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                      currentPage === 'teacherManageStudents' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                    onClick={() => { setMobileSidebarOpen(false); setCurrentPage('teacherManageStudents'); }}
                  >
                    <Users className="w-5 h-5" />
                    <span className="text-sm">إدارة الطلاب المسجلين</span>
                  </button>
                  <button 
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                      currentPage === 'teacherPayments' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                    onClick={() => { setMobileSidebarOpen(false); setCurrentPage('teacherPayments'); }}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="text-sm">إدارة المدفوعات</span>
                  </button>
                  <button 
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                      currentPage === 'teacherEngagementReports' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                    onClick={() => { setMobileSidebarOpen(false); setCurrentPage('teacherEngagementReports'); }}
                  >
                    <FileText className="w-5 h-5" />
                    <span className="text-sm">تقارير التفاعل والمشاهدة</span>
                  </button>
                  <button 
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                      currentPage === 'teacherSendNotifications' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                    onClick={() => { setMobileSidebarOpen(false); setCurrentPage('teacherSendNotifications'); }}
                  >
                    <Bell className="w-5 h-5" />
                    <span className="text-sm">إرسال إشعارات للطلاب</span>
                  </button>
                </>
              ) : isStudentUser ? (
                <>
                  <button 
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                      currentPage === 'studentCourses' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                    onClick={() => { setMobileSidebarOpen(false); setCurrentPage('studentCourses'); }}
                  >
                    <GraduationCap className="w-5 h-5" />
                    <span className="text-sm">مشاهدة الكورسات</span>
                  </button>
                  <button 
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                      currentPage === 'studentMyCourses' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                    onClick={() => { setMobileSidebarOpen(false); setCurrentPage('studentMyCourses'); }}
                  >
                    <BookOpen className="w-5 h-5" />
                    <span className="text-sm">دخول إلى الكورس</span>
                  </button>
                </>
              ) : !isParentUser && (
                <>
                  <button 
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                      currentPage === 'courses' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                    onClick={() => { setMobileSidebarOpen(false); setCurrentPage('courses'); }}
                  >
                    <GraduationCap className="w-5 h-5" />
                    <span className="text-sm">الدورات</span>
                  </button>
                  <button 
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                      currentPage === 'teachers' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                    onClick={() => { setMobileSidebarOpen(false); setCurrentPage('teachers'); }}
                  >
                    <Users className="w-5 h-5" />
                    <span className="text-sm">المعلمون</span>
                  </button>
                  <button 
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                      currentPage === 'reports' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                    onClick={() => { setMobileSidebarOpen(false); setCurrentPage('reports'); }}
                  >
                    <FileText className="w-5 h-5" />
                    <span className="text-sm">التقارير</span>
                  </button>
                </>
              )}
              <button 
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  currentPage === 'profile' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                }`} 
                onClick={() => { setMobileSidebarOpen(false); setCurrentPage('profile'); }}
              >
                <User className="w-5 h-5" />
                <span className="text-sm">البروفايل</span>
              </button>
              {isParentUser && (
                <>
                  <button
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                      currentPage === 'parentChildMonitoring' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                    onClick={() => { setMobileSidebarOpen(false); setCurrentPage('parentChildMonitoring'); }}
                  >
                    <Users className="w-5 h-5" />
                    <span className="text-sm">متابعة الابن/الابنة</span>
                  </button>
                  <button
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                      currentPage === 'parentLessonsCompleted' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                    }`}
                    onClick={() => { setMobileSidebarOpen(false); setCurrentPage('parentLessonsCompleted'); }}
                  >
                    <Eye className="w-5 h-5" />
                    <span className="text-sm">الإطلاع على الدروس المنجزة</span>
                  </button>
                  <button
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                      currentPage === 'parentQuizGrades' ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                    }`}
                    onClick={() => { setMobileSidebarOpen(false); setCurrentPage('parentQuizGrades'); }}
                  >
                    <Award className="w-5 h-5" />
                    <span className="text-sm">عرض درجات الاختبارات</span>
                  </button>
                  <button
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                      currentPage === 'parentAttendanceReports' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                    }`}
                    onClick={() => { setMobileSidebarOpen(false); setCurrentPage('parentAttendanceReports'); }}
                  >
                    <BarChart3 className="w-5 h-5" />
                    <span className="text-sm">تقارير الحضور والتقدم</span>
                  </button>
                  <button
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                      currentPage === 'linkChild' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                    }`}
                    onClick={() => { setMobileSidebarOpen(false); setCurrentPage('linkChild'); }}
                  >
                    <Users className="w-5 h-5" />
                    <span className="text-sm">ربط حساب الابن</span>
                  </button>
                </>
              )}
            </nav>
            <div className="pt-3 mt-3 border-t border-gray-100" />
            <button 
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                currentPage === 'settings' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
              }`}
              onClick={() => { setMobileSidebarOpen(false); setCurrentPage('settings'); }}
            >
              <Settings className="w-5 h-5" />
              <span className="text-sm">الإعدادات</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
     {/* Main */}
<main
  className={`${(currentPage === 'teacherCoursesList' || currentPage === 'teacherCourseDetails' || currentPage === 'studentMyCourses') 
    ? 'p-0' 
    : 'px-4 sm:px-6 lg:px-8 pt-12 md:pt-6'}`}
  style={{ 
    marginRight: (currentPage === 'teacherCoursesList' || currentPage === 'teacherCourseDetails' || currentPage === 'studentMyCourses') 
      ? 0 
      : (isDesktop ? (sidebarCollapsed ? 80 : 256) : 0), 
    transition: 'margin-right 300ms ease-in-out' 
  }}
>
  {children ? (
    <div className="pb-10">{children}</div>
  ) : loading ? (
    <div className="text-center text-gray-600">...جار التحميل</div>
  ) : error ? (
    <div className="text-center text-red-600">{error}</div>
  ) : (
    <div className="pb-10">
      {renderCurrentPage()}
    </div>
  )}
</main>



    </div>
  );
};

export default Dashboard;