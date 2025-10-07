import React, { useEffect, useState } from 'react';
import { Bell, ArrowLeft, CheckCircle, Clock, User, BookOpen, Mail, AlertCircle, Info, Sparkles } from 'lucide-react';

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

interface NotificationsPageProps {
  onBack: () => void;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ onBack }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [hoveredNotification, setHoveredNotification] = useState<number | null>(null);

  const authFetch = async (url: string, init?: RequestInit) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      window.location.href = '/signin';
      return new Response(null, { status: 401 });
    }
    
    let res = await fetch(url, {
      ...init,
      headers: {
        ...(init && init.headers ? init.headers : {}),
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    if (res.status === 401) {
      const refresh = localStorage.getItem('refreshToken');
      if (refresh) {
        const refreshRes = await fetch('/user/token/refresh/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh })
        });
        
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          localStorage.setItem('accessToken', data.access);
          
          res = await fetch(url, {
            ...init,
            headers: {
              ...(init && init.headers ? init.headers : {}),
              'Authorization': `Bearer ${data.access}`,
              'Accept': 'application/json'
            }
          });
        } else {
          localStorage.clear();
          window.location.href = '/signin';
          return new Response(null, { status: 401 });
        }
      } else {
        localStorage.clear();
        window.location.href = '/signin';
        return new Response(null, { status: 401 });
      }
    }
    return res;
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/student/get/notifications/');
      
      if (res && res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
      } else {
        setError('تعذر تحميل الإشعارات');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('حدث خطأ في تحميل الإشعارات');
    } finally {
      setLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId: number) => {
    try {
      const res = await authFetch(`/student/notifications/${notificationId}/read/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: true })
      });
      
      if (res && res.ok) {
        setNotifications(prev => 
          Array.isArray(prev) ? prev.map(notif => 
            notif.id === notificationId ? { ...notif, is_read: true } : notif
          ) : []
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.is_read);
    for (const notification of unreadNotifications) {
      await markNotificationAsRead(notification.id);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotificationIcon = (type: string, isRead: boolean) => {
    const iconClass = `w-5 h-5 transition-all duration-300 ${isRead ? 'text-gray-400' : 'text-white'}`;
    
    switch (type) {
      case 'exam':
        return <AlertCircle className={iconClass} />;
      case 'assignment':
        return <BookOpen className={iconClass} />;
      case 'announcement':
        return <Info className={iconClass} />;
      case 'message':
        return <Mail className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  const getNotificationGradient = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-gradient-to-br from-gray-400 to-gray-500';
    
    switch (type) {
      case 'exam':
        return 'bg-gradient-to-br from-red-500 to-red-600';
      case 'assignment':
        return 'bg-gradient-to-br from-blue-500 to-blue-600';
      case 'announcement':
        return 'bg-gradient-to-br from-green-500 to-green-600';
      case 'message':
        return 'bg-gradient-to-br from-purple-500 to-purple-600';
      default:
        return 'bg-gradient-to-br from-blue-500 to-blue-600';
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-6"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-400 rounded-full mx-auto animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <p className="text-blue-600 font-semibold text-lg">جاري تحميل الإشعارات</p>
              <div className="flex items-center justify-center gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md mx-4">
            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Bell className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">خطأ في التحميل</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchNotifications}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Header */}
      <div className="relative bg-white/90 backdrop-blur-xl border-b border-blue-100/50 sticky top-0 z-40 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="group p-3 rounded-xl hover:bg-blue-100/80 transition-all duration-200 hover:scale-110 active:scale-95"
              >
                <ArrowLeft className="w-5 h-5 text-blue-600 group-hover:text-blue-700 transition-colors" />
              </button>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                    <Bell className="w-7 h-7 text-white" />
                  </div>
                  {unreadCount > 0 && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse shadow-lg">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    الإشعارات
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 flex items-center gap-2">
                    <span>{notifications.length} إشعار</span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <span className={unreadCount > 0 ? 'text-blue-600 font-semibold' : ''}>
                      {unreadCount} غير مقروء
                    </span>
                  </p>
                </div>
              </div>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="group px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                <CheckCircle className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
                <span className="hidden sm:inline">تعيين الكل كمقروء</span>
                <span className="sm:hidden">تعيين الكل</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative px-4 sm:px-6 lg:px-8 py-6">
        {notifications.length === 0 ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl max-w-md mx-4 transform hover:scale-105 transition-all duration-300">
              <div className="relative w-32 h-32 mx-auto mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full animate-pulse"></div>
                <div className="absolute inset-4 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full flex items-center justify-center">
                  <Bell className="w-12 h-12 text-blue-400" />
                </div>
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-blue-400 animate-bounce" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                لا توجد إشعارات
              </h3>
              <p className="text-gray-600 leading-relaxed">
                ستظهر الإشعارات الجديدة من المعلمين هنا
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
            {notifications.map((notification, index) => (
              <div
                key={notification.id}
                className={`group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border transition-all duration-300 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] ${
                  !notification.is_read 
                    ? 'border-blue-200 shadow-blue-100/50 bg-gradient-to-br from-blue-50/80 to-white/80' 
                    : 'border-gray-200 hover:border-blue-200'
                } ${hoveredNotification === notification.id ? 'shadow-xl shadow-blue-200/30' : ''}`}
                style={{
                  animationDelay: `${index * 0.1}s`,
                  opacity: 0,
                  animation: `slideUp 0.6s ease-out ${index * 0.1}s forwards`
                }}
                onMouseEnter={() => setHoveredNotification(notification.id)}
                onMouseLeave={() => setHoveredNotification(null)}
                onClick={() => {
                  if (!notification.is_read) {
                    markNotificationAsRead(notification.id);
                  }
                }}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-lg transform transition-all duration-300 ${
                        getNotificationGradient(notification.notification_type, notification.is_read)
                      } ${hoveredNotification === notification.id ? 'scale-110 rotate-6' : ''}`}>
                        {getNotificationIcon(notification.notification_type, notification.is_read)}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className={`text-lg sm:text-xl font-bold leading-tight pr-4 ${
                          !notification.is_read 
                            ? 'bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent' 
                            : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 flex-shrink-0">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="whitespace-nowrap">
                            {new Date(notification.created_at).toLocaleDateString('ar-SA', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">
                        {notification.message}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                          </div>
                          <span className="font-semibold text-blue-700">{notification.sender_name}</span>
                        </div>
                        {notification.course_title && (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                            </div>
                            <span className="truncate text-green-700 font-medium">{notification.course_title}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Unread indicator */}
                    {!notification.is_read && (
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-md animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hover effect line */}
                <div className={`h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 ${
                  hoveredNotification === notification.id ? 'opacity-100' : 'opacity-0'
                } rounded-b-2xl`}></div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationsPage;