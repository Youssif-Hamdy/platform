import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './admin-styles.css';
import { 
  Menu, 
  X, 
  Users, 
  GraduationCap, 
  Star, 
  Shield, 
  Bell,
  Search,
  LogOut,
  ChevronRight,
  Home,
  TrendingUp,
  UserCheck,
  ChevronLeft,
  MessageSquare,
  BarChart3
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import pages
import TeachersManagement from './pages/TeachersManagement';
import StudentsManagement from './pages/StudentsManagement';
import SalesAnalytics from './pages/SalesAnalytics';
import ReviewsManagement from './pages/ReviewsManagement';
import UsersManagement from './pages/UsersManagement';
import PermissionsManagement from './pages/PermissionsManagement';
import SupportCenter from './pages/SupportCenter';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'admin' | 'teacher' | 'student' | 'parent';
  phone_number: string;
  date_joined: string;
  last_login: string;
  is_active: boolean;
  email_verified: boolean;
  parent: number | null;
}

const AdminDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Support panel state
  const [unreadTicketCount, setUnreadTicketCount] = useState<number>(0);

  // Sidebar menu items
  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: Home, color: 'text-blue-500' },
    { id: 'users', label: 'إدارة المستخدمين', icon: Users, color: 'text-blue-500' },
    { id: 'teachers', label: 'إدارة المدرسين', icon: Users, color: 'text-green-500' },
    { id: 'students', label: 'إدارة الطلاب', icon: GraduationCap, color: 'text-purple-500' },
    { id: 'analytics', label: 'متابعة المبيعات والإحصائيات', icon: BarChart3, color: 'text-orange-500' },
    { id: 'reviews', label: 'إدارة التقييمات', icon: Star, color: 'text-yellow-500' },
    { id: 'permissions', label: 'نظام صلاحيات المستخدمين', icon: Shield, color: 'text-red-500' },
    { id: 'support', label: 'مركز الدعم', icon: MessageSquare, color: 'text-blue-500' },
  ];

  // Fetch users data
  const fetchUsers = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      if (!accessToken) {
        toast.error('يرجى تسجيل الدخول أولاً');
        return;
      }

      const response = await fetch('/admin-panel/users/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else if (response.status === 401) {
        toast.error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
        // يمكن إضافة redirect إلى صفحة تسجيل الدخول هنا
      } else {
        toast.error('فشل في تحميل بيانات المستخدمين');
      }
    } catch (error) {
      toast.error('خطأ في الاتصال بالخادم');
    }
  };

  // Fetch ticket count (for bell badge)
  const fetchSupportTicketCount = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (!accessToken) return;
      const response = await fetch('/support/get/ticket/stats/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) return;
      const data = await response.json();
      if (typeof data?.total_tickets === 'number') {
        setUnreadTicketCount(data.total_tickets);
      }
    } catch (e) {
      // ignore badge errors silently
    }
  };

  useEffect(() => {
    fetchSupportTicketCount();
  }, []);

  useEffect(() => {
    if (activePage === 'support') {
      setUnreadTicketCount(0);
    }
  }, [activePage]);

  useEffect(() => {
    // Check if user is authenticated
    const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!accessToken) {
      toast.error('يرجى تسجيل الدخول أولاً');
      // يمكن إضافة redirect إلى صفحة تسجيل الدخول هنا
      return;
    }
    
    fetchUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get statistics
  const stats = {
    totalUsers: users.length,
    teachers: users.filter(u => u.user_type === 'teacher').length,
    students: users.filter(u => u.user_type === 'student').length,
    activeUsers: users.filter(u => u.is_active).length,
  };

  // Render main content based on active page
  const renderMainContent = () => {
    switch (activePage) {
      case 'users':
        return <UsersManagement />;
      case 'teachers':
        return <TeachersManagement users={filteredUsers.filter(u => u.user_type === 'teacher')} onRefresh={fetchUsers} />;
      case 'students':
        return <StudentsManagement users={filteredUsers.filter(u => u.user_type === 'student')} onRefresh={fetchUsers} />;
      case 'analytics':
        return <SalesAnalytics users={users} />;
      case 'reviews':
        return <ReviewsManagement />;
      case 'permissions':
        return <PermissionsManagement />;
      case 'support':
        return <SupportCenter />;
      default:
        return (
          <div className="p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">مرحباً بك في لوحة التحكم</h1>
              <p className="text-gray-600">إدارة شاملة لمنصتك التعليمية</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">إجمالي المستخدمين</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">المدرسين</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.teachers}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <GraduationCap className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">الطلاب</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.students}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <UserCheck className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">المستخدمين النشطين</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.activeUsers}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <TrendingUp className="w-6 h-6 text-orange-500" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">النشاط الأخير</h3>
              <div className="space-y-4">
                {users.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {user.first_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{user.first_name} {user.last_name}</p>
                        <p className="text-sm text-gray-600">{user.user_type === 'teacher' ? 'مدرس' : user.user_type === 'student' ? 'طالب' : 'أدمن'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{new Date(user.date_joined).toLocaleDateString('ar-EG')}</p>
                      <p className="text-xs text-gray-500">{user.is_active ? 'نشط' : 'غير نشط'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Sidebar - Always visible on desktop, hidden on mobile */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-white shadow-xl transform transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 ${sidebarCollapsed ? 'w-20' : 'w-80'}`}>
        <div className="flex flex-col h-full" dir="rtl">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {!sidebarCollapsed && (
             <div className="flex items-center gap-3">
  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
    <GraduationCap className="w-5 h-5 text-white" />
  </div>
  <div className="flex flex-col">
    <h2 className="text-xl font-bold text-gray-800 leading-tight">لوحة التحكم</h2>
    <p className="text-sm text-gray-600 mt-0.5">الإدارة العامة</p>
  </div>
</div>
            )}
            {sidebarCollapsed && (
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
            )}
            <div className="flex items-center space-x-2">
              {/* Collapse button - only visible on desktop */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title={sidebarCollapsed ? 'توسيع السايد بار' : 'تصغير السايد بار'}
              >
                {sidebarCollapsed ? <ChevronRight className="w-5 h-5 text-gray-500" /> : <ChevronLeft className="w-5 h-5 text-gray-500" />}
              </button>
              {/* Close button only visible on mobile */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

         

          {/* Menu Items */}
          <nav className="flex-1 px-6 py-4 space-y-2" dir="rtl">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  setActivePage(item.id);
                  setSidebarOpen(false); // Close sidebar on mobile after selection
                }}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} p-3 rounded-lg transition-all duration-200 ${
                  activePage === item.id
                    ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-500'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={sidebarCollapsed ? item.label : ''}
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <item.icon className={`w-5 h-5 m-1 ${activePage === item.id ? 'text-blue-500' : item.color}`} />
                  {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                </div>
              </motion.button>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-6 border-t border-gray-200">
            <button 
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3 space-x-reverse'} p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors`}
              title={sidebarCollapsed ? 'تسجيل الخروج' : ''}
            >
              <LogOut className="w-5 h-5" />
              {!sidebarCollapsed && <span className="font-medium">تسجيل الخروج</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ml-0 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-80'}`}>
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
  <div className="flex items-center gap-4">
    {/* Mobile Menu Button */}
    <button
      onClick={() => setSidebarOpen(true)}
      className="lg:hidden p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
    >
      <Menu className="w-6 h-6 text-blue-600" />
    </button>
    
    <h1 className="text-2xl font-bold text-gray-800">
      {menuItems.find(item => item.id === activePage)?.label || 'لوحة التحكم'}
    </h1>
  </div>

            <div className="flex items-center space-x-4 space-x-reverse">
              <button onClick={() => setActivePage('support')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                <Bell className="w-6 h-6 text-gray-600" />
                {unreadTicketCount > 0 && (
                  <span className="absolute -top-1 -left-1 min-w-[1.25rem] h-5 px-1 rounded-full bg-blue-600 text-white text-[10px] leading-5 text-center font-bold">
                    {unreadTicketCount}
                  </span>
                )}
              </button>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderMainContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Overlay for mobile only */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 backdrop-blur-sm bg-opacity-50 z-40"
        />
      )}

      {/* Support Panel */}

    </div>
  );
};

export default AdminDashboard;
