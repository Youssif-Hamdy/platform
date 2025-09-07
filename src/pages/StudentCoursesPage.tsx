import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Clock, Users, Star, Play, Download, FileText, HelpCircle, CheckCircle, AlertCircle } from 'lucide-react';

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
  is_enrolled?: boolean;
}

const StudentCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [enrolling, setEnrolling] = useState<number | null>(null);

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
        return;
      }
      
      const data = await res.json();
      setCourses(data.results || data || []);
    } catch (e) {
      console.error('Error loading courses:', e);
      setError('حدث خطأ أثناء تحميل الكورسات');
    } finally {
      setLoading(false);
    }
  };

  const enrollInCourse = async (courseId: number) => {
    try {
      setEnrolling(courseId);
      
      const res = await authFetch(`/student/enroll/temporary/${courseId}/`, {
        method: 'POST'
      });
      
      if (!res || !res.ok) {
        throw new Error('فشل في الاشتراك');
      }
      
      // تحديث حالة الكورس
      setCourses(prev => prev.map(course => 
        course.id === courseId 
          ? { ...course, is_enrolled: true }
          : course
      ));
      
      // إظهار رسالة نجاح
      alert('تم الاشتراك في الكورس بنجاح!');
    } catch (e) {
      console.error('Error enrolling:', e);
      alert('حدث خطأ أثناء الاشتراك في الكورس');
    } finally {
      setEnrolling(null);
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">مشاهدة الكورسات</h1>
        <p className="text-gray-600">استكشف جميع الكورسات المتاحة واشترك في ما يناسبك</p>
      </div>
      
      {courses.length === 0 ? (
        <div className="text-center py-12">
          <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد كورسات متاحة</h3>
          <p className="text-gray-600">لم يتم العثور على أي كورسات في الوقت الحالي</p>
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
                {course.is_enrolled && (
                  <div className="absolute top-3 left-3 bg-green-500 text-white rounded-full px-2 py-1 text-xs font-medium flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    مشترك
                  </div>
                )}
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
                    disabled={enrolling === course.id || course.is_enrolled}
                    className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                      course.is_enrolled
                        ? 'bg-green-100 text-green-700 cursor-not-allowed'
                        : enrolling === course.id
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {enrolling === course.id ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        جاري الاشتراك...
                      </div>
                    ) : course.is_enrolled ? (
                      'مشترك'
                    ) : (
                      'اشتراك'
                    )}
                  </button>
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
          <div className="text-gray-600">إجمالي الكورسات</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {courses.filter(c => c.is_enrolled).length}
          </div>
          <div className="text-gray-600">الكورسات المشترك فيها</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {courses.reduce((sum, course) => sum + (course.students_count || 0), 0)}
          </div>
          <div className="text-gray-600">إجمالي الطلاب</div>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentCoursesPage;




