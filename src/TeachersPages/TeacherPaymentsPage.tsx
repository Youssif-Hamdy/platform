import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Users, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Search, 
  DollarSign,
  User,
  BookOpen,
  Clock,
  Check,
  X,
  Info,
  TrendingUp,
  
} from 'lucide-react';

interface Payment {
  id: number;
  payment_method: 'instapay' | 'vodafone_cash' | 'orange_cash';
  payment_date: string;
  student: number;
  course: number;
  student_name?: string;
  course_name?: string;
}

interface Enrollment {
  id: number;
  student_id?: number;
  student_name?: string;
  student_email?: string;
  course_id?: number;
  course_title?: string;
  enrollment_date?: string;
  status?: 'active' | 'pending' | 'completed' | 'cancelled';
}

 

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
    <div className="fixed top-8 left-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => {
          const colors = getToastColors(toast.type);
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
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
              
              <div className="p-4 pl-10">
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
                className="absolute top-2 right-2 p-1 rounded-lg hover:bg-black/5 transition-colors"
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

const TeacherPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [activatingPayment, setActivatingPayment] = useState<number | null>(null);

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

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError('');
      
      const res = await authFetch('/teacher/payments/');
      
      if (!res || !res.ok) {
        setError('تعذر تحميل المدفوعات');
        addToast('error', 'خطأ في التحميل', 'تعذر تحميل المدفوعات، يرجى المحاولة مرة أخرى');
        return;
      }
      
      const data = await res.json();
      setPayments(data.results || data || []);
      
    } catch (e) {
      console.error('Error loading payments:', e);
      setError('حدث خطأ أثناء تحميل المدفوعات');
      addToast('error', 'خطأ في الشبكة', 'حدث خطأ أثناء تحميل المدفوعات');
    } finally {
      setLoading(false);
    }
  };

  const loadEnrollments = async () => {
    try {
      const res = await authFetch('/teacher/enrollments/');
      
      if (res && res.ok) {
        const data = await res.json();
        setEnrollments(data.results || data || []);
      }
    } catch (e) {
      console.error('Error loading enrollments:', e);
    }
  };

  const activatePayment = async (courseId: number, studentId: number) => {
    try {
      setActivatingPayment(studentId);
      
      const res = await authFetch(`/teacher/payments/${courseId}/${studentId}/`, {
        method: 'POST'
      });
      
      if (!res || !res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'فشل في تفعيل الدفع');
      }
      
      addToast('success', 'تم التفعيل بنجاح! 🎉', 'تم تفعيل عملية الشراء للطالب بنجاح');
      
      // إعادة تحميل البيانات
      await loadPayments();
      await loadEnrollments();
      
    } catch (e) {
      console.error('Error activating payment:', e);
      const errorMessage = e instanceof Error ? e.message : 'حدث خطأ أثناء تفعيل الدفع، يرجى المحاولة مرة أخرى';
      addToast('error', 'فشل في التفعيل', errorMessage);
    } finally {
      setActivatingPayment(null);
    }
  };

  const getPaymentMethodInfo = (method: string) => {
    switch (method) {
      case 'instapay':
        return { name: 'Instapay', icon: '💳', color: 'blue' };
      case 'vodafone_cash':
        return { name: 'Vodafone Cash', icon: '📱', color: 'red' };
      case 'orange_cash':
        return { name: 'Orange Cash', icon: '🍊', color: 'orange' };
      default:
        return { name: 'غير محدد', icon: '❓', color: 'gray' };
    }
  };

  const getStudentInfo = (studentId: number) => {
    const enrollment = enrollments.find(e => e.student_id === studentId);
    return {
      name: enrollment?.student_name || `طالب #${studentId}`,
      email: enrollment?.student_email || 'غير متوفر'
    };
  };

  const getCourseInfo = (courseId: number) => {
    const enrollment = enrollments.find(e => e.course_id === courseId);
    return {
      title: enrollment?.course_title || `كورس #${courseId}`,
      price: 'غير محدد'
    };
  };

  const filteredPayments = payments.filter(payment => {
    const studentInfo = getStudentInfo(payment.student);
    const courseInfo = getCourseInfo(payment.course);
    const studentName = (payment.student_name || studentInfo.name || '').toLowerCase();
    const studentEmail = (studentInfo.email || '').toLowerCase();
    const courseTitle = (payment.course_name || courseInfo.title || '').toLowerCase();

    const query = searchQuery.toLowerCase();

    const matchesSearch = query === '' ||
      studentName.includes(query) ||
      studentEmail.includes(query) ||
      courseTitle.includes(query);

    const matchesFilter = filterMethod === 'all' || payment.payment_method === filterMethod;

    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    loadPayments();
    loadEnrollments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جار تحميل المدفوعات...</p>
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
          onClick={loadPayments}
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
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        dir="rtl"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">إدارة المدفوعات</h1>
              <p className="text-green-100 text-lg">عرض وإدارة جميع المدفوعات والطلاب المسجلين</p>
            </div>
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full"></div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center shadow-lg"
          >
            <CreditCard className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900 mb-1">{payments.length}</div>
            <div className="text-gray-600 text-sm">إجمالي المدفوعات</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center shadow-lg"
          >
            <Users className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900 mb-1">{enrollments.length}</div>
            <div className="text-gray-600 text-sm">الطلاب المسجلين</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center shadow-lg"
          >
            <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {payments.filter(p => p.payment_method === 'instapay').length}
            </div>
            <div className="text-gray-600 text-sm">مدفوعات Instapay</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center shadow-lg"
          >
            <DollarSign className="w-8 h-8 text-orange-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {new Set(payments.map(p => p.student)).size}
            </div>
            <div className="text-gray-600 text-sm">طلاب دفعوا</div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن طالب أو كورس..."
                  className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">جميع طرق الدفع</option>
                <option value="instapay">Instapay</option>
                <option value="vodafone_cash">Vodafone Cash</option>
                <option value="orange_cash">Orange Cash</option>
              </select>
              <button
                onClick={() => {
                  loadPayments();
                  loadEnrollments();
                }}
                className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                تحديث
              </button>
            </div>
          </div>
        </div>

        {/* Payments List */}
        {filteredPayments.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-12 max-w-md mx-auto">
              <CreditCard className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">لا توجد مدفوعات</h3>
              <p className="text-gray-600">لم يتم العثور على مدفوعات تطابق معايير البحث</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPayments.map((payment, index) => {
              const studentInfo = getStudentInfo(payment.student);
              const courseInfo = getCourseInfo(payment.course);
              const methodInfo = getPaymentMethodInfo(payment.payment_method);
              const studentDisplayName = payment.student_name || studentInfo.name;
              const courseDisplayTitle = payment.course_name || courseInfo.title;
              
              return (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    {/* Payment Info */}
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-semibold text-blue-800">الطالب</span>
                          </div>
                          <div className="text-lg font-bold text-blue-900">{studentDisplayName}</div>
                          <div className="text-sm text-blue-700">{studentInfo.email}</div>
                        </div>
                        
                        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                          <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-semibold text-green-800">الكورس</span>
                          </div>
                          <div className="text-lg font-bold text-green-900">{courseDisplayTitle}</div>
                        </div>
                        
                        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                          <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="w-5 h-5 text-purple-600" />
                            <span className="text-sm font-semibold text-purple-800">طريقة الدفع</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{methodInfo.icon}</span>
                            <div className="text-lg font-bold text-purple-900">{methodInfo.name}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(payment.payment_date).toLocaleDateString('ar-EG')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(payment.payment_date).toLocaleTimeString('ar-EG')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                            Payment ID: {payment.id}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => activatePayment(payment.course, payment.student)}
                        disabled={activatingPayment === payment.student}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all transform ${
                          activatingPayment === payment.student
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : 'bg-green-500 text-white hover:bg-green-600 hover:scale-105 shadow-lg hover:shadow-xl'
                        }`}
                      >
                        {activatingPayment === payment.student ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                            جاري التفعيل...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            تفعيل الشراء
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </>
  );
};

export default TeacherPaymentsPage;
