import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Clock, Users, Star, AlertCircle, X, Check, Info } from 'lucide-react';

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  students_count: number;
  rating: number;
  image?: string;
  price?: number;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

// مكون Toast
const ToastContainer: React.FC<{ toasts: Toast[]; removeToast: (id: string) => void }> = ({ toasts, removeToast }) => {
  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'info':
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getToastColors = (type: string) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          icon: 'text-green-600',
          title: 'text-green-800',
          message: 'text-green-700',
          progress: 'bg-green-500'
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: 'text-red-600',
          title: 'text-red-800',
          message: 'text-red-700',
          progress: 'bg-red-500'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-600',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          progress: 'bg-yellow-500'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-800',
          message: 'text-blue-700',
          progress: 'bg-blue-500'
        };
    }
  };

  return (
    <div className="fixed top-8 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => {
          const colors = getToastColors(toast.type);
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: -100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 0.8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`relative overflow-hidden rounded-xl border ${colors.bg} backdrop-blur-sm shadow-lg`}
            >
              {/* شريط التقدم */}
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
                className={`absolute top-0 left-0 h-1 ${colors.progress}`}
                onAnimationComplete={() => removeToast(toast.id)}
              />
              
              <div className="p-4 pr-10">
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 ${colors.icon}`}>
                    {getToastIcon(toast.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-semibold ${colors.title} mb-1`}>
                      {toast.title}
                    </h4>
                    <p className={`text-sm ${colors.message}`}>
                      {toast.message}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* زر الإغلاق */}
            <button
              onClick={() => removeToast(toast.id)}
              className="absolute top-2 left-2 p-1 rounded-lg hover:bg-black/5 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>

            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

const StudentCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [enrolling, setEnrolling] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  // عرض تقييمات عبر GET فقط على الكروت

  // دالة إضافة Toast
  const addToast = (type: Toast['type'], title: string, message: string) => {
    const id = Date.now().toString();
    const newToast: Toast = { id, type, title, message };
    setToasts(prev => [...prev, newToast]);
  };

  // دالة إزالة Toast
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

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

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError('');
      
      // تحميل الكورسات المتاحة
      const res = await authFetch('/student/get-all-courses/');
      
      if (!res || !res.ok) {
        setError('تعذر تحميل الكورسات');
        addToast('error', 'خطأ في التحميل', 'تعذر تحميل الكورسات، يرجى المحاولة مرة أخرى');
        return;
      }
      
      const data = await res.json();
      const allCourses = data.results || data || [];
      
      // تحميل الكورسات المسجلة لاستبعادها
      const enrolledRes = await authFetch('/student/my-courses/');
      let enrolledCourses: any[] = [];
      
      if (enrolledRes && enrolledRes.ok) {
        const enrolledData = await enrolledRes.json();
        enrolledCourses = enrolledData.results || enrolledData || [];
      }
      
      // استبعاد الكورسات المسجلة من الكورسات المتاحة
      const enrolledCourseIds = enrolledCourses.map((course: any) => course.id);
      const availableCourses: Course[] = allCourses.filter((course: Course) => !enrolledCourseIds.includes(course.id));

      // جلب متوسط التقييم لكل كورس من API التقييمات
      const withRatings = await Promise.all(
        availableCourses.map(async (course) => {
          try {
            const r = await authFetch(`/teacher/courses/${course.id}/reviews/`);
            if (r && r.ok) {
              const reviews = await r.json();
              const ratings: number[] = Array.isArray(reviews) ? reviews.map((rev: any) => Number(rev.rating) || 0) : [];
              const avg = ratings.length ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)) : 0;
              return { ...course, rating: avg } as Course;
            }
          } catch (err) {
            // ignore
          }
          return { ...course, rating: course.rating || 0 } as Course;
        })
      );

      setCourses(withRatings);
      addToast('success', 'تم بنجاح', `تم تحميل ${withRatings.length} كورس متاح`);
    } catch (e) {
      console.error('Error loading courses:', e);
      setError('حدث خطأ أثناء تحميل الكورسات');
      addToast('error', 'خطأ في الشبكة', 'حدث خطأ أثناء تحميل الكورسات');
    } finally {
      setLoading(false);
    }
  };

  const enrollInCourse = async (courseId: number) => {
    try {
      setEnrolling(courseId);
      
      // البحث عن اسم الكورس
      const course = courses.find(c => c.id === courseId);
      const courseName = course?.title || 'الكورس';
      
      const res = await authFetch(`/student/enroll/temporary/${courseId}/`, {
        method: 'POST'
      });
      
      if (!res || !res.ok) {
        throw new Error('فشل في الاشتراك');
      }
      
      // إزالة الكورس من القائمة المتاحة (لأنه أصبح مسجلاً)
      setCourses(prev => prev.filter(course => course.id !== courseId));
      
      // إظهار رسالة نجاح
      addToast('success', 'تم الاشتراك بنجاح! 🎉', `تم اشتراكك في "${courseName}" بنجاح. يمكنك الآن الوصول إليه من صفحة "كورساتي"`);
      
    } catch (e) {
      console.error('Error enrolling:', e);
      addToast('error', 'فشل في الاشتراك', 'حدث خطأ أثناء الاشتراك في الكورس، يرجى المحاولة مرة أخرى');
    } finally {
      setEnrolling(null);
    }
  };

  // لا يوجد POST للتقييم هنا وفق الطلب

  useEffect(() => {
    loadCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جار تحميل الكورسات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">خطأ في التحميل</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={loadCourses}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">الكورسات المتاحة</h1>
          <p className="text-gray-600">استكشف الكورسات الجديدة المتاحة للاشتراك</p>
        </div>
        
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد كورسات جديدة متاحة</h3>
            <p className="text-gray-600">جميع الكورسات متاحة في صفحة "كورساتي" أو لم يتم إضافة كورسات جديدة بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: course.id * 0.1 }}
                className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 relative">
                  {course.image ? (
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <GraduationCap className="w-16 h-16 text-blue-400" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-gray-700 flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    {course.rating || '4.5'}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{course.students_count || 0} طالب</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration || 'غير محدد'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">المعلم: {course.instructor || 'غير محدد'}</span>
                    <button 
                      onClick={() => enrollInCourse(course.id)}
                      disabled={enrolling === course.id}
                      className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                        enrolling === course.id
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {enrolling === course.id ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          جاري الاشتراك...
                        </div>
                      ) : (
                        'اشتراك'
                      )}
                    </button>
                  </div>

                  {/* عرض متوسط التقييم فقط */}
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <div className="text-xs text-gray-600">التقييم: {course.rating || 0}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* إحصائيات سريعة */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{courses.length}</div>
            <div className="text-gray-600">الكورسات المتاحة</div>
          </div>
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {courses.length}
            </div>
            <div className="text-gray-600">كورسات جديدة للاشتراك</div>
          </div>
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {courses.reduce((sum, course) => sum + (course.students_count || 0), 0)}
            </div>
            <div className="text-gray-600">إجمالي الطلاب المسجلين</div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default StudentCoursesPage;

