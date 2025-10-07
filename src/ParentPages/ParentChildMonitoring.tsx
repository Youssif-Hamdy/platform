import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, TrendingUp, Award, Target, BarChart3, ChevronDown } from 'lucide-react';

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


interface MonitoringData {
  child: Child;
  courses: CourseProgress[];
  overall_summary: {
    total_courses: number;
    total_sections_completed: number;
    total_sections: number;
    overall_completion_percentage: number;
  };
  quiz_summary: {
    total_courses: number;
    overall_total_score: number;
    total_quizzes_completed: number;
    overall_average: number;
  };
}

const ParentChildMonitoring: React.FC = () => {
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [selectedChild, setSelectedChild] = useState<number | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

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

  const loadChildData = async (childId: number) => {
    try {
      setLoading(true);
      setError('');

      // تحميل بيانات تقدم الدروس
      const sectionsRes = await authFetch(`/parent/children/${childId}/sections-completion/`);
      if (!sectionsRes.ok) {
        throw new Error('فشل في تحميل بيانات تقدم الدروس');
      }
      const sectionsData = await sectionsRes.json();

      // تحميل بيانات نتائج الاختبارات
      const quizRes = await authFetch(`/parent/children/${childId}/quiz-results/`);
      if (!quizRes.ok) {
        throw new Error('فشل في تحميل بيانات نتائج الاختبارات');
      }
      const quizData = await quizRes.json();

      // دمج البيانات
      const combinedData: MonitoringData = {
        child: sectionsData.child,
        courses: sectionsData.courses,
        overall_summary: sectionsData.overall_summary,
        quiz_summary: quizData.summary
      };

      setMonitoringData(combinedData);
    } catch (err) {
      console.error('Error loading child data:', err);
      setError('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // أولاً: نجيب البروفايل ونجيب منه الـ child id
    const fetchProfile = async () => {
      try {
        const res = await authFetch('/user/profile/parent/');
        if (!res.ok) {
          throw new Error('فشل في تحميل بيانات البروفايل');
        }
        const profileData = await res.json();

        if (profileData.children && profileData.children.length > 0) {
          setChildren(profileData.children);
          const firstChildId = profileData.children[0].id;
          setSelectedChild(firstChildId);
          loadChildData(firstChildId);
        } else {
          setError('لا يوجد أطفال مسجلين');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching parent profile:', err);
        setError('حدث خطأ في تحميل بيانات البروفايل');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChildChange = (childId: number) => {
    setSelectedChild(childId);
    setShowDropdown(false);
    loadChildData(childId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جار تحميل بيانات المتابعة...</p>
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

  if (!monitoringData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-gray-600">
          <p className="text-lg">لا توجد بيانات متاحة</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6"
      onClick={() => setShowDropdown(false)}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">متابعة الابن/الابنة</h1>
            </div>
            
            {/* Child Selection Dropdown */}
            {children.length > 1 && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(!showDropdown);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-700">
                    {children.find(child => child.id === selectedChild)?.name || 'اختر الابن/الابنة'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                
                {showDropdown && (
                  <div 
                    className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="py-2">
                      {children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => handleChildChange(child.id)}
                          className={`w-full text-right px-4 py-2 hover:bg-gray-50 transition-colors ${
                            selectedChild === child.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                          }`}
                        >
                          <div className="font-medium">{child.name}</div>
                          <div className="text-sm text-gray-500">{child.username}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="text-gray-600">مراقبة تقدم {children.find(child => child.id === selectedChild)?.name || 'الابن/الابنة'} في التعلم</p>
        </motion.div>

        {/* Child Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {monitoringData.child.name.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{monitoringData.child.name}</h2>
              <p className="text-gray-600">اسم المستخدم: {monitoringData.child.username}</p>
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
                <p className="text-3xl font-bold text-blue-600">{monitoringData.overall_summary.total_courses}</p>
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
                <p className="text-sm font-medium text-gray-600">نسبة الإنجاز</p>
                <p className="text-3xl font-bold text-green-600">
                  {monitoringData.overall_summary.overall_completion_percentage.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
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
                <p className="text-sm font-medium text-gray-600">الاختبارات المكتملة</p>
                <p className="text-3xl font-bold text-purple-600">{monitoringData.quiz_summary.total_quizzes_completed}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" />
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
                <p className="text-sm font-medium text-gray-600">متوسط الدرجات</p>
                <p className="text-3xl font-bold text-orange-600">
                  {monitoringData.quiz_summary.overall_average.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Courses Progress */}
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
            <h3 className="text-xl font-bold text-gray-900">تقدم الكورسات</h3>
          </div>

          <div className="space-y-4">
            {monitoringData.courses.map((course, index) => (
              <motion.div
                key={course.course_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{course.course_name}</h4>
                  <span className="text-sm font-medium text-gray-600">
                    {course.sections_completed}/{course.total_sections} دروس
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${course.completion_percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-700 min-w-[3rem]">
                    {course.completion_percentage.toFixed(1)}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quiz Results Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">ملخص نتائج الاختبارات</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-2xl font-bold text-blue-600">{monitoringData.quiz_summary.total_quizzes_completed}</p>
              <p className="text-sm text-gray-600">إجمالي الاختبارات المكتملة</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-2xl font-bold text-green-600">
                {monitoringData.quiz_summary.overall_average.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600">متوسط الدرجات</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <p className="text-2xl font-bold text-purple-600">{monitoringData.quiz_summary.total_courses}</p>
              <p className="text-sm text-gray-600">عدد الكورسات</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ParentChildMonitoring;
