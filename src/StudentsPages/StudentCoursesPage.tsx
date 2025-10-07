import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  Clock, 
  Users, 
  Star, 
  AlertCircle, 
  X, 
  Check, 
  Info, 
  Eye,
  BookOpen,
  Calendar,
  DollarSign,
  Play,
  User,
  Target,
  BarChart3
} from 'lucide-react';

interface Course {
  id: number;
  title: string;
  description: string;
  teacher_name: string;
  thumbnail: string;
  status: 'draft' | 'published' | 'archived';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  price: string;
  duration_hours: number;
  total_sections: number;
  total_quizzes: number;
  total_enrollments: number;
  average_rating: string;
  created_at: string;
  updated_at: string;
}

type PaymentMethod = 'instapay' | 'vodafone_cash' | 'orange_cash';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

// مكون Toast
const ToastContainer: React.FC<{ toasts: Toast[]; removeToast: (id: string) => void }> = memo(({ toasts, removeToast }) => {
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
});

// مكون مودال تفاصيل الكورس
const CourseModal: React.FC<{
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onEnroll: (courseId: number, paymentMethod: PaymentMethod) => void;
  isEnrolling: boolean;
}> = memo(({ course, isOpen, onClose, onEnroll, isEnrolling }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  
  if (!course || !isOpen) return null;

  const paymentMethods = [
    { id: 'instapay' as PaymentMethod, name: 'Instapay', icon: '💳', color: 'blue' },
    { id: 'vodafone_cash' as PaymentMethod, name: 'Vodafone Cash', icon: '📱', color: 'red' },
    { id: 'orange_cash' as PaymentMethod, name: 'Orange Cash', icon: '🍊', color: 'orange' }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'مبتدئ';
      case 'intermediate':
        return 'متوسط';
      case 'advanced':
        return 'متقدم';
      default:
        return 'غير محدد';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        dir="rtl"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative">
            <div className="h-64 bg-blue-500 relative overflow-hidden">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover opacity-50"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <GraduationCap className="w-24 h-24 text-white/30" />
                </div>
              )}
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 left-4 p-2 bg-black/20 hover:bg-black/30 rounded-full transition-colors backdrop-blur-sm"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              
              {/* Course info overlay */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(course.difficulty)}`}>
                    {getDifficultyText(course.difficulty)}
                  </span>
                  <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-white text-sm font-medium">
                      {parseFloat(course.average_rating || '0').toFixed(1)}
                    </span>
                  </div>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {course.title}
                </h1>
                <div className="flex items-center gap-2 text-white/90">
                  <User className="w-4 h-4" />
                  <span className="text-sm">المعلم: {course.teacher_name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200">
                <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-blue-900">
                  {course.duration_hours}
                </div>
                <div className="text-xs text-blue-700">ساعة</div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border border-green-200">
                <BookOpen className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-green-900">
                  {course.total_sections}
                </div>
                <div className="text-xs text-green-700">قسم</div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center border border-purple-200">
                <Target className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-purple-900">
                  {course.total_quizzes}
                </div>
                <div className="text-xs text-purple-700">اختبار</div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center border border-orange-200">
                <Users className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-orange-900">
                  {course.total_enrollments}
                </div>
                <div className="text-xs text-orange-700">طالب</div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                وصف الكورس
              </h3>
              <p className="text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-200">
                {course.description}
              </p>
            </div>

            {/* Course Details */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  تفاصيل الكورس
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">مستوى الصعوبة:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(course.difficulty)}`}>
                      {getDifficultyText(course.difficulty)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">حالة الكورس:</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {course.status === 'published' ? 'منشور' : course.status === 'draft' ? 'مسودة' : 'مؤرشف'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">تاريخ الإنشاء:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(course.created_at).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  السعر وطريقة الدفع
                </h3>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-green-700 mb-1">
                      ${parseFloat(course.price || '0').toFixed(2)}
                    </div>
                    <div className="text-sm text-green-600">سعر الكورس</div>
                  </div>
                  
                  {/* Payment Methods */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">اختر طريقة الدفع:</h4>
                    <div className="space-y-2">
                      {paymentMethods.map((method) => (
                        <label
                          key={method.id}
                          className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedPaymentMethod === method.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={selectedPaymentMethod === method.id}
                            onChange={() => setSelectedPaymentMethod(method.id)}
                            className="sr-only"
                          />
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-2xl">{method.icon}</span>
                            <span className="font-medium text-gray-900">{method.name}</span>
                          </div>
                          {selectedPaymentMethod === method.id && (
                            <Check className="w-5 h-5 text-blue-600" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => selectedPaymentMethod && onEnroll(course.id, selectedPaymentMethod)}
                    disabled={isEnrolling || !selectedPaymentMethod}
                    className={`w-full py-3 rounded-xl font-semibold transition-all transform ${
                      isEnrolling || !selectedPaymentMethod
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:from-blue-700 hover:to-purple-700 hover:scale-105 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {isEnrolling ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                        جاري الاشتراك...
                      </div>
                    ) : !selectedPaymentMethod ? (
                      <div className="flex items-center justify-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        اختر طريقة الدفع أولاً
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Play className="w-5 h-5" />
                        اشتراك في الكورس
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

import { LazySection } from '../utils/Perf';

const StudentCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [enrolling, setEnrolling] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addToast = useCallback((type: Toast['type'], title: string, message: string) => {
    const id = Date.now().toString();
    const newToast: Toast = { id, type, title, message };
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

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

      setCourses(availableCourses);
      addToast('success', 'تم بنجاح', `تم تحميل ${availableCourses.length} كورس متاح`);
    } catch (e) {
      console.error('Error loading courses:', e);
      setError('حدث خطأ أثناء تحميل الكورسات');
      addToast('error', 'خطأ في الشبكة', 'حدث خطأ أثناء تحميل الكورسات');
    } finally {
      setLoading(false);
    }
  };

  const enrollInCourse = async (courseId: number, paymentMethod: PaymentMethod) => {
    try {
      setEnrolling(courseId);
      
      const course = courses.find(c => c.id === courseId);
      const courseName = course?.title || 'الكورس';
      
      const res = await authFetch(`/student/enroll/temporary/${courseId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          payment_method: paymentMethod
        })
      });
      
      if (!res || !res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'فشل في الاشتراك');
      }
      
      await res.json();
      
      setCourses(prev => prev.filter(course => course.id !== courseId));
      setIsModalOpen(false);
      setSelectedCourse(null);
      
      addToast('success', 'تم الاشتراك بنجاح! 🎉', `تم اشتراكك في "${courseName}" بنجاح باستخدام ${paymentMethod}. يمكنك الآن الوصول إليه من صفحة "كورساتي"`);
      
    } catch (e) {
      console.error('Error enrolling:', e);
      const errorMessage = e instanceof Error ? e.message : 'حدث خطأ أثناء الاشتراك في الكورس، يرجى المحاولة مرة أخرى';
      addToast('error', 'فشل في الاشتراك', errorMessage);
    } finally {
      setEnrolling(null);
    }
  };

  const openCourseModal = useCallback((course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  }, []);

  const closeCourseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'مبتدئ';
      case 'intermediate':
        return 'متوسط';
      case 'advanced':
        return 'متقدم';
      default:
        return 'غير محدد';
    }
  };

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
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <CourseModal
        course={selectedCourse}
        isOpen={isModalOpen}
        onClose={closeCourseModal}
        onEnroll={enrollInCourse}
        isEnrolling={enrolling !== null}
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        dir="rtl"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="bg-blue-500 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">الكورسات المتاحة</h1>
              <p className="text-blue-100 text-lg">استكشف مجموعة متنوعة من الكورسات التعليمية واختر ما يناسبك</p>
            </div>
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full"></div>
          </div>
        </div>
        
        {courses.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-12 max-w-md mx-auto">
              <GraduationCap className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">لا توجد كورسات جديدة متاحة</h3>
              <p className="text-gray-600">جميع الكورسات متاحة في صفحة "كورساتي" أو لم يتم إضافة كورسات جديدة بعد</p>
            </div>
          </div>
        ) : (
          <LazySection><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Course Image */}
                <div className="relative h-48 overflow-hidden">
                  {course.thumbnail ? (
                    <img
                      src={`https://res.cloudinary.com/dtoy7z1ou/${course.thumbnail}`}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                      <GraduationCap className="w-16 h-16 text-white/80" />
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <div className="bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-gray-700 flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      {parseFloat(course.average_rating || '0').toFixed(1)}
                    </div>
                  </div>
                  
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${getDifficultyColor(course.difficulty)}`}>
                      {getDifficultyText(course.difficulty)}
                    </span>
                  </div>
                  
                  {/* Price Badge */}
                  <div className="absolute bottom-3 right-3 bg-green-500 text-white rounded-full px-3 py-1 text-xs font-bold">
                    ${parseFloat(course.price || '0').toFixed(0)}
                  </div>
                </div>
                
                {/* Course Content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {course.description}
                  </p>
                  
                  {/* Course Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center bg-blue-50 rounded-lg p-2 border border-blue-100">
                      <Clock className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                      <div className="text-xs font-semibold text-blue-900">{course.duration_hours}ساعة</div>
                    </div>
                    <div className="text-center bg-green-50 rounded-lg p-2 border border-green-100">
                      <BookOpen className="w-4 h-4 text-green-600 mx-auto mb-1" />
                      <div className="text-xs font-semibold text-green-900">{course.total_sections} قسم</div>
                    </div>
                    <div className="text-center bg-purple-50 rounded-lg p-2 border border-purple-100">
                      <Users className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                      <div className="text-xs font-semibold text-purple-900">{course.total_enrollments}</div>
                    </div>
                  </div>
                  
                  {/* Teacher Info */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">المعلم: {course.teacher_name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(course.created_at).toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openCourseModal(course)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      عرض التفاصيل
                    </button>
                    <button 
                      onClick={() => openCourseModal(course)}
                      className="flex-1 px-4 py-2 rounded-lg transition text-sm font-medium flex items-center justify-center gap-2 bg-blue-500 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Play className="w-4 h-4" />
                      اشتراك
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div></LazySection>
        )}
        
        {/* Statistics Section */}
        <LazySection><div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-blue-500 text-white rounded-2xl p-6 text-center shadow-lg"
          >
            <BookOpen className="w-8 h-8 mx-auto mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">{courses.length}</div>
            <div className="text-blue-100 text-sm">الكورسات المتاحة</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 text-center shadow-lg"
          >
            <Clock className="w-8 h-8 mx-auto mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">
              {courses.reduce((sum, course) => sum + (course.duration_hours || 0), 0)}
            </div>
            <div className="text-green-100 text-sm">إجمالي الساعات</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6 text-center shadow-lg"
          >
            <Users className="w-8 h-8 mx-auto mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">
              {courses.reduce((sum, course) => sum + (course.total_enrollments || 0), 0)}
            </div>
            <div className="text-purple-100 text-sm">إجمالي الطلاب</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl p-6 text-center shadow-lg"
          >
            <Star className="w-8 h-8 mx-auto mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">
              {courses.length > 0 ? 
                (courses.reduce((sum, course) => sum + parseFloat(course.average_rating || '0'), 0) / courses.length).toFixed(1) : 
                '0.0'
              }
            </div>
            <div className="text-orange-100 text-sm">متوسط التقييم</div>
          </motion.div>
        </div></LazySection>

        {/* Quick Filters */}
        {courses.length > 0 && (
          <LazySection><motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">تصنيف الكورسات حسب المستوى</h3>
            <div className="flex flex-wrap gap-3">
              {['beginner', 'intermediate', 'advanced'].map((level) => {
                const count = courses.filter(course => course.difficulty === level).length;
                if (count === 0) return null;
                
                return (
                  <div
                    key={level}
                    className={`px-4 py-2 rounded-full text-sm font-semibold border ${getDifficultyColor(level)} flex items-center gap-2`}
                  >
                    <Target className="w-4 h-4" />
                    {getDifficultyText(level)}: {count} كورس
                  </div>
                );
              })}
            </div>
          </motion.div></LazySection>
        )}
      </motion.div>
    </>
  );
};

export default StudentCoursesPage;