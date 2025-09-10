import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, Clock, TrendingUp, BarChart3, Calendar, Eye, Target } from 'lucide-react';

interface Child {
  id: number;
  name: string;
  username: string;
}

interface CourseProgress {
  course_id: number;
  course_name: string;
  sections_completed: number;
  total_sections: number;
  completion_percentage: number;
}

interface LessonsData {
  child: Child;
  courses: CourseProgress[];
  overall_summary: {
    total_courses: number;
    total_sections_completed: number;
    total_sections: number;
    overall_completion_percentage: number;
  };
}

const ParentLessonsCompleted: React.FC = () => {
  const [lessonsData, setLessonsData] = useState<LessonsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

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
      localStorage.clear();
      window.location.href = '/signin';
      return new Response(null, { status: 401 });
    }
    return res;
  };

  const loadLessonsData = async () => {
    try {
      setLoading(true);
      setError('');

      // استخدام child_id = 9 كمثال
      const res = await authFetch('/parent/children/9/sections-completion/');
      if (!res.ok) {
        throw new Error('فشل في تحميل بيانات الدروس المنجزة');
      }
      
      const data = await res.json();
      setLessonsData(data);
    } catch (err) {
      console.error('Error loading lessons data:', err);
      setError('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLessonsData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جار تحميل بيانات الدروس المنجزة...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="text-lg font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!lessonsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-gray-600">
          <p className="text-lg">لا توجد بيانات متاحة</p>
        </div>
      </div>
    );
  }

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'from-green-500 to-emerald-600';
    if (percentage >= 60) return 'from-yellow-500 to-orange-500';
    if (percentage >= 40) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-red-600';
  };

  const getCompletionTextColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">الإطلاع على الدروس المنجزة</h1>
          </div>
          <p className="text-gray-600">متابعة تقدم {lessonsData.child.name} في إنجاز الدروس</p>
        </motion.div>

        {/* Child Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {lessonsData.child.name.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{lessonsData.child.name}</h2>
              <p className="text-gray-600">اسم المستخدم: {lessonsData.child.username}</p>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الكورسات</p>
                <p className="text-3xl font-bold text-blue-600">{lessonsData.overall_summary.total_courses}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">الدروس المكتملة</p>
                <p className="text-3xl font-bold text-green-600">{lessonsData.overall_summary.total_sections_completed}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الدروس</p>
                <p className="text-3xl font-bold text-purple-600">{lessonsData.overall_summary.total_sections}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">نسبة الإنجاز</p>
                <p className="text-3xl font-bold text-orange-600">
                  {lessonsData.overall_summary.overall_completion_percentage.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Overall Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">التقدم الإجمالي</h3>
          </div>

          <div className="bg-gray-100 rounded-full h-6 mb-4">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-600 h-6 rounded-full transition-all duration-1000 flex items-center justify-end pr-4"
              style={{ width: `${lessonsData.overall_summary.overall_completion_percentage}%` }}
            >
              <span className="text-white text-sm font-bold">
                {lessonsData.overall_summary.overall_completion_percentage.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="flex justify-between text-sm text-gray-600">
            <span>{lessonsData.overall_summary.total_sections_completed} درس مكتمل</span>
            <span>{lessonsData.overall_summary.total_sections} إجمالي الدروس</span>
          </div>
        </motion.div>

        {/* Courses Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">تفاصيل الكورسات</h3>
          </div>

          <div className="space-y-6">
            {lessonsData.courses.map((course, index) => (
              <motion.div
                key={course.course_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">{course.course_name}</h4>
                      <p className="text-sm text-gray-600">كورس رقم {course.course_id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${getCompletionTextColor(course.completion_percentage)}`}>
                      {course.completion_percentage.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">مكتمل</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">تقدم الدروس</span>
                    <span className="text-sm text-gray-600">
                      {course.sections_completed} من {course.total_sections} درس
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3">
                    <div
                      className={`bg-gradient-to-r ${getCompletionColor(course.completion_percentage)} h-3 rounded-full transition-all duration-700`}
                      style={{ width: `${course.completion_percentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600">{course.sections_completed} مكتمل</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{course.total_sections - course.sections_completed} متبقي</span>
                    </div>
                  </div>
                  
                  {course.completion_percentage === 100 && (
                    <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">مكتمل بالكامل</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ParentLessonsCompleted;
