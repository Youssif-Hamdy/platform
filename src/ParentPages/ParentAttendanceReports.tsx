import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, TrendingUp, BarChart3, CheckCircle, AlertTriangle, Target, BookOpen, Users, Activity } from 'lucide-react';

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

interface QuizResult {
  course_name: string;
  quizzes_completed: number;
  average_score: number;
}

interface AttendanceData {
  child: Child;
  courses: CourseProgress[];
  quiz_results: QuizResult[];
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

const ParentAttendanceReports: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [childId, setChildId] = useState<number | null>(null);

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
        'Accept': 'application/json',
      },
    });

    if (res.status === 401) {
      localStorage.clear();
      window.location.href = '/signin';
      return new Response(null, { status: 401 });
    }
    return res;
  };

  const loadAttendanceData = async (id: number) => {
    try {
      setLoading(true);
      setError('');

      // بيانات الدروس
      const sectionsRes = await authFetch(`/parent/children/${id}/sections-completion/`);
      if (!sectionsRes.ok) {
        throw new Error('فشل في تحميل بيانات تقدم الدروس');
      }
      const sectionsData = await sectionsRes.json();

      // بيانات الاختبارات
      const quizRes = await authFetch(`/parent/children/${id}/quiz-results/`);
      if (!quizRes.ok) {
        throw new Error('فشل في تحميل بيانات نتائج الاختبارات');
      }
      const quizData = await quizRes.json();

      const combinedData: AttendanceData = {
        child: sectionsData.child,
        courses: sectionsData.courses,
        quiz_results: quizData.courses,
        overall_summary: sectionsData.overall_summary,
        quiz_summary: quizData.summary,
      };

      setAttendanceData(combinedData);
    } catch (err) {
      console.error('Error loading attendance data:', err);
      setError('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authFetch('/user/profile/parent/');
        if (!res.ok) throw new Error('فشل في تحميل البروفايل');

        const profileData = await res.json();

        if (profileData.children && profileData.children.length > 0) {
          const firstChildId = profileData.children[0].id;
          setChildId(firstChildId);
          loadAttendanceData(firstChildId);
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
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جار تحميل تقارير الحضور والتقدم...</p>
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

  if (!attendanceData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-gray-600">
          <p className="text-lg">لا توجد بيانات متاحة</p>
        </div>
      </div>
    );
  }

  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 90) return { level: 'ممتاز', color: 'green', icon: CheckCircle };
    if (percentage >= 70) return { level: 'جيد', color: 'blue', icon: TrendingUp };
    if (percentage >= 50) return { level: 'مقبول', color: 'yellow', icon: Target };
    return { level: 'يحتاج تحسين', color: 'red', icon: AlertTriangle };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">تقارير الحضور والتقدم</h1>
          </div>
          <p className="text-gray-600">تقرير شامل عن أداء {attendanceData.child.name} في التعلم</p>
        </motion.div>

        {/* Child Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {attendanceData.child.name.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{attendanceData.child.name}</h2>
              <p className="text-gray-600">اسم المستخدم: {attendanceData.child.username}</p>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">نسبة إنجاز الدروس</p>
                <p className="text-3xl font-bold text-blue-600">
                  {attendanceData.overall_summary.overall_completion_percentage.toFixed(1)}%
                </p>
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
                <p className="text-sm font-medium text-gray-600">متوسط درجات الاختبارات</p>
                <p className="text-3xl font-bold text-green-600">
                  {attendanceData.quiz_summary.overall_average.toFixed(1)}%
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
                <p className="text-3xl font-bold text-purple-600">{attendanceData.quiz_summary.total_quizzes_completed}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600" />
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
                <p className="text-sm font-medium text-gray-600">إجمالي الكورسات</p>
                <p className="text-3xl font-bold text-orange-600">{attendanceData.overall_summary.total_courses}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Overall Performance Chart */}
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
            <h3 className="text-xl font-bold text-gray-900">الأداء الإجمالي</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Lessons Progress */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">تقدم الدروس</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">الدروس المكتملة</span>
                    <span className="text-sm text-gray-600">
                      {attendanceData.overall_summary.total_sections_completed} من {attendanceData.overall_summary.total_sections}
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${attendanceData.overall_summary.overall_completion_percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quiz Performance */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">أداء الاختبارات</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">متوسط الدرجات</span>
                    <span className="text-sm text-gray-600">
                      {attendanceData.quiz_summary.overall_average.toFixed(1)}%
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${attendanceData.quiz_summary.overall_average}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Detailed Course Reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">تقارير تفصيلية للكورسات</h3>
          </div>

          <div className="space-y-6">
            {attendanceData.courses.map((course, index) => {
              const quizResult = attendanceData.quiz_results.find(q => q.course_name === course.course_name);
              const performance = getPerformanceLevel(course.completion_percentage);
              const PerformanceIcon = performance.icon;

              return (
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
                    <div className="flex items-center gap-2">
                      <PerformanceIcon className={`w-5 h-5 text-${performance.color}-600`} />
                      <span className={`text-sm font-medium px-3 py-1 rounded-full bg-${performance.color}-100 text-${performance.color}-700`}>
                        {performance.level}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Lessons Progress */}
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-3">تقدم الدروس</h5>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-600">الدروس المكتملة</span>
                            <span className="text-sm font-medium text-gray-900">
                              {course.sections_completed}/{course.total_sections}
                            </span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-700"
                              style={{ width: `${course.completion_percentage}%` }}
                            />
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {course.completion_percentage.toFixed(1)}% مكتمل
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Quiz Results */}
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-3">نتائج الاختبارات</h5>
                      <div className="space-y-3">
                        {quizResult && quizResult.quizzes_completed > 0 ? (
                          <>
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm text-gray-600">متوسط الدرجة</span>
                                <span className="text-sm font-medium text-gray-900">
                                  {quizResult.average_score.toFixed(1)}%
                                </span>
                              </div>
                              <div className="bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-700"
                                  style={{ width: `${quizResult.average_score}%` }}
                                />
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">
                              {quizResult.quizzes_completed} اختبار مكتمل
                            </p>
                          </>
                        ) : (
                          <div className="text-center py-4">
                            <AlertTriangle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">لم يتم إجراء اختبارات بعد</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Summary Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">ملخص التحليل</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-2xl font-bold text-blue-600">
                {attendanceData.courses.filter(c => c.completion_percentage >= 80).length}
              </p>
              <p className="text-sm text-gray-600">كورسات بمستوى إنجاز عالي</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-2xl font-bold text-green-600">
                {attendanceData.quiz_results.filter(q => q.average_score >= 80).length}
              </p>
              <p className="text-sm text-gray-600">كورسات بدرجات ممتازة</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <p className="text-2xl font-bold text-purple-600">
                {attendanceData.courses.filter(c => c.completion_percentage === 100).length}
              </p>
              <p className="text-sm text-gray-600">كورسات مكتملة بالكامل</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ParentAttendanceReports;
