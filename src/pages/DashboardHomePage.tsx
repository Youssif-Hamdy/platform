import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Award, Clock, TrendingUp, Calendar, CheckCircle, Target } from 'lucide-react';

interface StatisticsData {
  total_learning_time_minutes: number;
  courses_in_progress: number;
  courses_completed: number;
  current_streak_days: number;
  total_quizzes_taken: number;
  average_quiz_score: number;
}

interface DashboardData {
  enrolled_courses: number;
  study_hours: number;
  completed_quizzes: number;
  average_score: number;
  recent_activities: Array<{
    id: number;
    title: string;
    description: string;
    time: string;
    type: string;
  }>;
  upcoming_tasks: Array<{
    id: number;
    title: string;
    due_date: string;
    priority: string;
  }>;
  weekly_progress: Array<{
    subject: string;
    progress: number;
  }>;
}

const DashboardHomePage: React.FC = () => {
  const [statisticsData, setStatisticsData] = useState<StatisticsData | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const isStudentUser = (() => {
    const value = (localStorage.getItem('userType') || '').toLowerCase();
    return value === 'student' || value === 'طالب' || value === 'طالبة';
  })();

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
          if (data.access) localStorage.setItem('accessToken', data.access);
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

  const loadStudentStatistics = async () => {
    try {
      const res = await authFetch('/student/statistics/');
      
      if (res && res.ok) {
        const data = await res.json();
        console.log('Statistics data loaded:', data);
        setStatisticsData(data);
      } else {
        console.log('Statistics API failed');
        setStatisticsData(null);
      }
    } catch (e) {
      console.error('Error loading statistics data:', e);
      setStatisticsData(null);
    }
  };

  const loadDashboardData = async () => {
    try {
      const res = await authFetch('/student/dashboard/');
      
      if (res && res.ok) {
        const data = await res.json();
        console.log('Dashboard data loaded:', data);
        setDashboardData(data);
      } else {
        console.log('Dashboard API failed, using default data');
        setDashboardData(null);
      }
    } catch (e) {
      console.error('Error loading dashboard data:', e);
      setDashboardData(null);
    }
  };

  const loadAllData = async () => {
    if (!isStudentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // تحميل البيانات بالتوازي
      await Promise.all([
        loadStudentStatistics(),
        loadDashboardData()
      ]);
      
    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // تحويل الدقائق إلى ساعات
  const minutesToHours = (minutes: number) => {
    return Math.round(minutes / 60 * 10) / 10; // تقريب إلى منزلة عشرية واحدة
  };

  // بيانات تجريبية للإحصائيات (للطلاب الآخرين)
  const defaultStats = [
    {
      title: 'الدورات المسجلة',
      value: '8',
      change: '+2',
      trend: 'up',
      icon: BookOpen,
      color: 'blue'
    },
    {
      title: 'ساعات الدراسة',
      value: '24',
      change: '+6',
      trend: 'up',
      icon: Clock,
      color: 'green'
    },
    {
      title: 'الاختبارات المكتملة',
      value: '15',
      change: '+3',
      trend: 'up',
      icon: CheckCircle,
      color: 'purple'
    },
    {
      title: 'متوسط الدرجات',
      value: '87%',
      change: '+5%',
      trend: 'up',
      icon: Award,
      color: 'orange'
    }
  ];

  // استخدام البيانات من Statistics API أو البيانات الافتراضية
  const stats = isStudentUser && statisticsData ? [
    {
      title: 'الدورات قيد التقدم',
      value: statisticsData.courses_in_progress.toString(),
      change: '+2',
      trend: 'up',
      icon: BookOpen,
      color: 'blue'
    },
    {
      title: 'ساعات الدراسة',
      value: minutesToHours(statisticsData.total_learning_time_minutes).toString(),
      change: '+6',
      trend: 'up',
      icon: Clock,
      color: 'green'
    },
    {
      title: 'الاختبارات المكتملة',
      value: statisticsData.total_quizzes_taken.toString(),
      change: '+3',
      trend: 'up',
      icon: CheckCircle,
      color: 'purple'
    },
    {
      title: 'متوسط الدرجات',
      value: `${Math.round(statisticsData.average_quiz_score)}%`,
      change: '+5%',
      trend: 'up',
      icon: Award,
      color: 'orange'
    }
  ] : defaultStats;

  const defaultRecentActivities = [
    {
      id: 1,
      title: 'أكملت درس الرياضيات',
      description: 'تم إكمال الدرس الثالث في الجبر',
      time: 'منذ ساعتين',
      type: 'course'
    },
    {
      id: 2,
      title: 'حصلت على شهادة',
      description: 'شهادة إتمام دورة اللغة العربية',
      time: 'منذ يوم واحد',
      type: 'certificate'
    },
    {
      id: 3,
      title: 'أكملت اختبار',
      description: 'اختبار العلوم - الدرجة: 95%',
      time: 'منذ يومين',
      type: 'exam'
    }
  ];

  const defaultUpcomingTasks = [
    {
      id: 1,
      title: 'واجب الرياضيات',
      dueDate: 'غداً',
      priority: 'high'
    },
    {
      id: 2,
      title: 'اختبار اللغة الإنجليزية',
      dueDate: 'بعد يومين',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'مشروع العلوم',
      dueDate: 'الأسبوع القادم',
      priority: 'low'
    }
  ];

  const defaultWeeklyProgress = [
    { subject: 'الرياضيات', progress: 70 },
    { subject: 'اللغة العربية', progress: 78 },
    { subject: 'العلوم', progress: 86 },
    { subject: 'اللغة الإنجليزية', progress: 94 }
  ];

  // استخدام البيانات من Dashboard API أو البيانات الافتراضية
  const recentActivities = isStudentUser && dashboardData && dashboardData.recent_activities ? dashboardData.recent_activities : defaultRecentActivities;
  const upcomingTasks = isStudentUser && dashboardData && dashboardData.upcoming_tasks ? dashboardData.upcoming_tasks : defaultUpcomingTasks;
  const weeklyProgress = isStudentUser && dashboardData && dashboardData.weekly_progress ? dashboardData.weekly_progress : defaultWeeklyProgress;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'عالية';
      case 'medium': return 'متوسطة';
      case 'low': return 'منخفضة';
      default: return 'غير محدد';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جار تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">لوحة التحكم</h1>
      
      {/* عرض معلومات إضافية للطلاب من Statistics API */}
      {isStudentUser && statisticsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* الدورات المكتملة */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{statisticsData.courses_completed}</div>
                <div className="text-sm text-gray-600">الدورات المكتملة</div>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          {/* الأيام المتتالية */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{statisticsData.current_streak_days}</div>
                <div className="text-sm text-gray-600">أيام متتالية</div>
              </div>
              <div className="p-3 rounded-lg bg-orange-100">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* الإحصائيات السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>{stat.change}</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.title}</div>
          </motion.div>
        ))}
      </div>

      {/* المحتوى الرئيسي */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* الأنشطة الأخيرة */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">الأنشطة الأخيرة</h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: activity.id * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                    {activity.type === 'course' && <BookOpen className="w-5 h-5" />}
                    {activity.type === 'certificate' && <Award className="w-5 h-5" />}
                    {activity.type === 'exam' && <CheckCircle className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{activity.title}</h4>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* المهام القادمة */}
        <div>
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">المهام القادمة</h3>
            <div className="space-y-4">
              {upcomingTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: task.id * 0.1 }}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {getPriorityText(task.priority)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>موعد التسليم: {task.dueDate}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* التقدم الأسبوعي */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">التقدم الأسبوعي</h3>
            <div className="space-y-4">
              {weeklyProgress.map((item) => (
                <div key={item.subject} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.subject}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardHomePage;