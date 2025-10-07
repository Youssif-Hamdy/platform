import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, TrendingUp, BarChart3, Target, BookOpen, Star, Trophy, Medal, ChevronDown } from 'lucide-react';

interface Child {
  id: number;
  name: string;
  username: string;
}

interface QuizResult {
  course_name: string;
  quizzes_completed: number;
  average_score: number;
}

interface QuizData {
  child: Child;
  courses: QuizResult[];
  summary: {
    total_courses: number;
    overall_total_score: number;
    total_quizzes_completed: number;
    overall_average: number;
  };
}

const ParentQuizGrades: React.FC = () => {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [childId, setChildId] = useState<number | null>(null);
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
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (res.status === 401) {
      localStorage.clear();
      window.location.href = '/signin';
      return new Response(null, { status: 401 });
    }
    return res;
  };

  const loadQuizData = async (id: number) => {
    try {
      setLoading(true);
      setError('');

      const res = await authFetch(`/parent/children/${id}/quiz-results/`);
      if (!res.ok) {
        throw new Error('فشل في تحميل بيانات درجات الاختبارات');
      }

      const data = await res.json();
      setQuizData(data);
    } catch (err) {
      console.error('Error loading quiz data:', err);
      setError('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authFetch('/user/profile/parent/');
        if (!res.ok) throw new Error('فشل في تحميل بيانات البروفايل');

        const profileData = await res.json();

        if (profileData.children && profileData.children.length > 0) {
          setChildren(profileData.children);
          const firstChildId = profileData.children[0].id;
          setChildId(firstChildId);
          loadQuizData(firstChildId);
        } else {
          setError('لا يوجد أطفال مسجلين');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching parent profile:', err);
        setError('حدث خطأ في تحميل البروفايل');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChildChange = (childId: number) => {
    setChildId(childId);
    setShowDropdown(false);
    loadQuizData(childId);
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جار تحميل بيانات درجات الاختبارات...</p>
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

  if (!quizData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-gray-600">
          <p className="text-lg">لا توجد بيانات متاحة</p>
        </div>
      </div>
    );
  }

  const getGradeColor = (score: number) => {
    if (score >= 90) return 'from-green-500 to-emerald-600';
    if (score >= 80) return 'from-blue-500 to-indigo-600';
    if (score >= 70) return 'from-yellow-500 to-orange-500';
    if (score >= 60) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-red-600';
  };

  const getGradeTextColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeIcon = (score: number) => {
    if (score >= 90) return <Trophy className="w-5 h-5" />;
    if (score >= 80) return <Medal className="w-5 h-5" />;
    if (score >= 70) return <Star className="w-5 h-5" />;
    return <Award className="w-5 h-5" />;
  };

  const getGradeLabel = (score: number) => {
    if (score >= 90) return 'ممتاز';
    if (score >= 80) return 'جيد جداً';
    if (score >= 70) return 'جيد';
    if (score >= 60) return 'مقبول';
    return 'ضعيف';
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-6"
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
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">عرض درجات الاختبارات</h1>
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
                                {childId ? children.find(child => child.id === childId)?.name || 'اختر الابن/الابنة' : 'اختر الابن/الابنة'}
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
                                        childId === child.id ? 'bg-green-50 text-green-700' : 'text-gray-700'
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
          <p className="text-gray-600">متابعة أداء {childId ? children.find(child => child.id === childId)?.name || 'الابن/الابنة' : 'الابن/الابنة'} في الاختبارات</p>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الكورسات</p>
                <p className="text-3xl font-bold text-blue-600">{quizData.summary.total_courses}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">الاختبارات المكتملة</p>
                <p className="text-3xl font-bold text-green-600">{quizData.summary.total_quizzes_completed}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
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
                <p className="text-sm font-medium text-gray-600">متوسط الدرجات</p>
                <p className="text-3xl font-bold text-purple-600">
                  {quizData.summary.overall_average.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
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
                <p className="text-sm font-medium text-gray-600">إجمالي النقاط</p>
                <p className="text-3xl font-bold text-orange-600">
                  {quizData.summary.overall_total_score.toFixed(1)}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Overall Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">الأداء الإجمالي</h3>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${quizData.summary.overall_average * 2.51} 251`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">
                    {quizData.summary.overall_average.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">متوسط الأداء</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Course Grades */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">درجات الكورسات</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizData.courses.map((course, index) => (
              <motion.div
                key={course.course_name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getGradeColor(course.average_score)} rounded-lg flex items-center justify-center`}>
                      {getGradeIcon(course.average_score)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 truncate" title={course.course_name}>
                        {course.course_name.length > 25 
                          ? course.course_name.substring(0, 25) + '...'
                          : course.course_name
                        }
                      </h4>
                      <p className="text-sm text-gray-600">{course.quizzes_completed} اختبار</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">متوسط الدرجة</span>
                    <span className={`text-lg font-bold ${getGradeTextColor(course.average_score)}`}>
                      {course.average_score.toFixed(1)}%
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3">
                    <div
                      className={`bg-gradient-to-r ${getGradeColor(course.average_score)} h-3 rounded-full transition-all duration-700`}
                      style={{ width: `${course.average_score}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                      course.average_score >= 90 ? 'bg-green-100 text-green-700' :
                      course.average_score >= 80 ? 'bg-blue-100 text-blue-700' :
                      course.average_score >= 70 ? 'bg-yellow-100 text-yellow-700' :
                      course.average_score >= 60 ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {getGradeLabel(course.average_score)}
                    </span>
                  </div>
                  
                  {course.quizzes_completed > 0 ? (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Award className="w-4 h-4" />
                      <span>{course.quizzes_completed} اختبار</span>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">
                      لم يتم إجراء اختبارات
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Performance Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl shadow-lg p-6 mt-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">تحليل الأداء</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-2xl font-bold text-blue-600">
                {quizData.courses.filter(c => c.average_score >= 80).length}
              </p>
              <p className="text-sm text-gray-600">كورسات بمستوى جيد جداً</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-2xl font-bold text-green-600">
                {quizData.courses.filter(c => c.quizzes_completed > 0).length}
              </p>
              <p className="text-sm text-gray-600">كورسات تم اختبارها</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <p className="text-2xl font-bold text-purple-600">
                {quizData.courses.filter(c => c.average_score === 100).length}
              </p>
              <p className="text-sm text-gray-600">كورسات بدرجة مثالية</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ParentQuizGrades;
