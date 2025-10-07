import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Award, Clock, TrendingUp, CheckCircle, Target } from 'lucide-react';
import { LazySection } from '../utils/Perf';

interface StatisticsData {
  total_learning_time_minutes: number;
  courses_in_progress: number;
  courses_completed: number;
  current_streak_days: number;
  total_quizzes_taken: number;
  average_quiz_score: number;
}

// Removed unused DashboardData interface

const DashboardHomePage: React.FC = () => {
  const [statisticsData, setStatisticsData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userName, setUserName] = useState<string>('');
  const [typedText, setTypedText] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [typeIndex, setTypeIndex] = useState<number>(0);

  const isStudentUser = (() => {
    const value = (localStorage.getItem('userType') || '').toLowerCase();
    return value === 'student' || value === 'طالب' || value === 'طالبة';
  })();

  const isTeacherOrParent = (() => {
    const value = (localStorage.getItem('userType') || '').toLowerCase();
    return value === 'teacher' || value === 'parent' || value === 'معلم' || value === 'معلمة' || value === 'ولي الأمر' || value === 'والد' || value === 'والدة';
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

  const loadUserProfile = async () => {
    try {
      const res = await authFetch('/user/profile/');
      if (res && res.ok) {
        const data = await res.json();
        const name = data.full_name || data.name || data.username || data.email || '';
        setUserName(name);
      } else {
        setUserName('');
      }
    } catch (e) {
      setUserName('');
    }
  };

  const loadDashboardData = async () => {
    try {
      const res = await authFetch('/student/dashboard/');
      
      if (res && res.ok) {
        const data = await res.json();
        console.log('Dashboard data loaded:', data);
      } else {
        console.log('Dashboard API failed, using default data');
      }
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    }
  };

  const loadAllData = async () => {
    if (!isStudentUser) {
      try {
        setLoading(true);
        await loadUserProfile();
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      
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

  // Typewriter effect for greeting (writes then erases continuously)
  useEffect(() => {
    if (!isTeacherOrParent) return;
    const base = `مرحبا، ${userName || 'صديقنا'}`;
    const typingSpeed = isDeleting ? 50 : 100;
    const pauseAfterCompleteMs = 1200;

    let timeoutId: number | undefined;

    const handleTyping = () => {
      if (!isDeleting) {
        const next = base.slice(0, typeIndex + 1);
        setTypedText(next);
        setTypeIndex(prev => prev + 1);
        if (next === base) {
          timeoutId = window.setTimeout(() => setIsDeleting(true), pauseAfterCompleteMs);
          return;
        }
      } else {
        const next = base.slice(0, typeIndex - 1);
        setTypedText(next);
        setTypeIndex(prev => Math.max(0, prev - 1));
        if (next.length === 0) {
          setIsDeleting(false);
          return;
        }
      }
      timeoutId = window.setTimeout(handleTyping, typingSpeed);
    };

    timeoutId = window.setTimeout(handleTyping, typingSpeed);
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [isTeacherOrParent, userName, typeIndex, isDeleting]);

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

 
 

 


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جار تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  // Greeting-only view for teacher/parent users
  if (!isStudentUser && isTeacherOrParent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-96 flex items-center justify-center"
        dir="rtl"
      >
        <div className="relative w-full max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-lg"
          >
            <div className="text-center">
              <motion.h1
                key={typedText}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-2xl md:text-3xl font-bold text-gray-900 mb-2"
              >
                {typedText}
                <span className="inline-block w-1.5 h-6 md:h-7 bg-blue-600 mr-1 align-middle animate-pulse" />
              </motion.h1>
              <p className="text-gray-600 text-sm md:text-base">نتمنى لك يوماً موفقاً. يمكنك إدارة مهامك من القائمة.</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} dir="rtl">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">لوحة التحكم</h1>
      
      {/* عرض معلومات إضافية للطلاب من Statistics API */}
      {isStudentUser && statisticsData && (
        <LazySection><div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
        </div></LazySection>
      )}

      {/* الإحصائيات السريعة */}
      <LazySection><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
      </div></LazySection>

      {/* المحتوى الرئيسي */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* الأنشطة الأخيرة */}
        <LazySection><div className="lg:col-span-2">
        
        </div></LazySection>

        {/* المهام القادمة */}
        <LazySection><div>
        

          {/* التقدم الأسبوعي */}
       
        </div></LazySection>
      </div>
    </motion.div>
  );
};

export default DashboardHomePage;