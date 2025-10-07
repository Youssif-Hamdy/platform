import React, { useEffect, useMemo, useState } from 'react';
import { Users, AlertCircle, RefreshCw, Search, GraduationCap, CalendarDays, Send, BookOpen, Check, CheckCircle2, Bell, CreditCard } from 'lucide-react';

export const UploadContentPage: React.FC = () => (
  <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur rounded-xl border border-gray-100 p-4 sm:p-6 shadow-sm" dir="rtl">
    <h2 className="text-lg font-bold text-gray-900 mb-2">رفع الفيديوهات والمحتوى</h2>
    <p className="text-gray-600 text-sm">سيتم التنفيذ لاحقًا.</p>
  </div>
);

export const AddExamsPage: React.FC = () => (
  <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur rounded-xl border border-gray-100 p-4 sm:p-6 shadow-sm" dir="rtl">
    <h2 className="text-lg font-bold text-gray-900 mb-2">إضافة اختبارات</h2>
    <p className="text-gray-600 text-sm">سيتم التنفيذ لاحقًا.</p>
  </div>
);

type Enrollment = {
  id: number;
  student_id?: number;
  student_name?: string;
  student_email?: string;
  course_id?: number;
  course_title?: string;
  enrolled_at?: string;
  status?: string;
};

export const ManageStudentsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [query, setQuery] = useState<string>('');
  const [reloading, setReloading] = useState<boolean>(false);

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

  const loadEnrollments = async () => {
    try {
      setError('');
      setLoading(true);
      const res = await authFetch('/teacher/enrollments/');
      if (!res || !res.ok) {
        setError('تعذر تحميل بيانات تسجيلات الطلاب');
        return;
      }
      const data = await res.json();
      const list = (data.results || data || []) as Enrollment[];
      setEnrollments(list);
    } catch (e) {
      setError('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnrollments();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return enrollments;
    return enrollments.filter((e) =>
      (e.student_name || '').toLowerCase().includes(q) ||
      (e.student_email || '').toLowerCase().includes(q) ||
      (e.course_title || '').toLowerCase().includes(q) ||
      String(e.course_id || '').includes(q)
    );
  }, [query, enrollments]);

  const handleRefresh = async () => {
    setReloading(true);
    await loadEnrollments();
    setReloading(false);
  };

  const totalCount = enrollments.length;
  const activeCount = useMemo(() => enrollments.filter(e => e.status === 'active').length, [enrollments]);
  const pendingCount = useMemo(() => enrollments.filter(e => e.status === 'pending').length, [enrollments]);

  return (
    <div className="max-w-6xl mx-auto" dir="rtl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">إدارة الطلاب المسجلين</h2>
            <p className="text-gray-600 text-sm">عرض كل التسجيلات عبر المسار /teacher/enrollments/</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.open('/teacher/payments', '_blank')}
            className="px-3 py-2 bg-green-500 text-white rounded-lg shadow-sm hover:bg-green-600 flex items-center gap-2 transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">إدارة المدفوعات</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={reloading}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-gray-700 flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${reloading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">تحديث</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="bg-white/80 backdrop-blur rounded-xl border border-gray-100 p-4 shadow-sm animate-fade-in">
          <div className="text-xs text-gray-500 mb-1">إجمالي التسجيلات</div>
          <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
        </div>
        <div className="bg-white/80 backdrop-blur rounded-xl border border-green-100 p-4 shadow-sm animate-fade-in" style={{ animationDelay: '60ms' }}>
          <div className="text-xs text-gray-500 mb-1">نشط</div>
          <div className="text-2xl font-bold text-green-700">{activeCount}</div>
        </div>
        <div className="bg-white/80 backdrop-blur rounded-xl border border-yellow-100 p-4 shadow-sm animate-fade-in" style={{ animationDelay: '120ms' }}>
          <div className="text-xs text-gray-500 mb-1">قيد الانتظار</div>
          <div className="text-2xl font-bold text-yellow-700">{pendingCount}</div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur rounded-xl border border-gray-100 p-4 sm:p-6 shadow-sm mb-4">
        <div className="flex items-center gap-2 p-2 border rounded-lg bg-white">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث باسم الطالب، البريد، أو الكورس"
            className="flex-1 outline-none text-sm bg-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-600">جار تحميل بيانات التسجيلات...</div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-600">لا توجد تسجيلات مطابقة</div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filtered.map((e, idx) => (
              <div key={e.id} className="bg-white/90 backdrop-blur p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow animate-slide-up" style={{ animationDelay: `${idx * 40}ms` }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{e.student_name || '—'}</div>
                      <div className="text-xs text-gray-500">{e.student_email || '—'}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${e.status === 'active' ? 'bg-green-100 text-green-700' : e.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                    {e.status || '—'}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-3 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <GraduationCap className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="font-medium text-gray-900">{e.course_title || '—'}</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                  <CalendarDays className="w-4 h-4" />
                  <span>تاريخ التسجيل: {e.enrolled_at ? new Date(e.enrolled_at).toLocaleString('ar-EG') : '—'}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="overflow-x-auto bg-white/80 backdrop-blur rounded-xl border border-gray-100 shadow-sm hidden md:block animate-fade-in">
            <table className="min-w-full text-right">
              <thead>
                <tr className="bg-gray-50 text-gray-700 text-sm">
                  <th className="px-4 py-3 font-semibold">الطالب</th>
                  <th className="px-4 py-3 font-semibold">البريد</th>
                  <th className="px-4 py-3 font-semibold">الكورس</th>
                  <th className="px-4 py-3 font-semibold">تاريخ التسجيل</th>
                  <th className="px-4 py-3 font-semibold">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{e.student_name || '—'}</div>
                          <div className="text-xs text-gray-500">ID: {e.student_id ?? '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{e.student_email || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <GraduationCap className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{e.course_title || '—'}</div>
                          <div className="text-xs text-gray-500">ID: {e.course_id ?? '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-gray-700">
                        <CalendarDays className="w-4 h-4" />
                        <span>{e.enrolled_at ? new Date(e.enrolled_at).toLocaleString('ar-EG') : '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${e.status === 'active' ? 'bg-green-100 text-green-700' : e.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                        {e.status || '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in .5s ease-out both; }
        .animate-slide-up { animation: slide-up .45s ease-out both; }
      `}</style>
    </div>
  );
};

type StudentAnalytics = {
  student_id: number;
  student_name: string;
  student_email: string;
  course_title: string;
  enrollment_date: string;
  progress_percentage: number;
  sections_completed: number;
  total_sections: number;
  quizzes_passed: number;
  total_quizzes: number;
  total_time_spent_minutes: number;
  last_activity: string;
};

export const EngagementReportsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [analytics, setAnalytics] = useState<StudentAnalytics[]>([]);
  const [query, setQuery] = useState<string>('');
  const [reloading, setReloading] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'progress' | 'activity' | 'time' | 'quizzes'>('progress');

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

  const loadAnalytics = async () => {
    try {
      setError('');
      setLoading(true);
      const res = await authFetch('/teacher/analytics/students/');
      if (!res || !res.ok) {
        setError('تعذر تحميل بيانات التحليلات');
        return;
      }
      const data = await res.json();
      const list = (data.results || data || []) as StudentAnalytics[];
      setAnalytics(list);
    } catch (e) {
      setError('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = analytics;
    
    if (q) {
      result = result.filter((s) =>
        s.student_name.toLowerCase().includes(q) ||
        s.student_email.toLowerCase().includes(q) ||
        s.course_title.toLowerCase().includes(q)
      );
    }

    // Sort by selected criteria
    return result.sort((a, b) => {
      switch (sortBy) {
        case 'progress':
          return b.progress_percentage - a.progress_percentage;
        case 'activity':
          return new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime();
        case 'time':
          return b.total_time_spent_minutes - a.total_time_spent_minutes;
        case 'quizzes':
          return (b.quizzes_passed / Math.max(1, b.total_quizzes)) - (a.quizzes_passed / Math.max(1, a.total_quizzes));
        default:
          return 0;
      }
    });
  }, [query, analytics, sortBy]);

  const handleRefresh = async () => {
    setReloading(true);
    await loadAnalytics();
    setReloading(false);
  };

  // Calculate summary statistics
  const totalStudents = analytics.length;
  const avgProgress = useMemo(() => {
    if (!analytics.length) return 0;
    return analytics.reduce((sum, s) => sum + s.progress_percentage, 0) / analytics.length;
  }, [analytics]);
  const totalTimeSpent = useMemo(() => {
    return analytics.reduce((sum, s) => sum + s.total_time_spent_minutes, 0);
  }, [analytics]);
  const activeStudents = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return analytics.filter(s => new Date(s.last_activity) > weekAgo).length;
  }, [analytics]);

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'text-green-700 bg-green-100';
    if (progress >= 50) return 'text-blue-700 bg-blue-100';
    if (progress >= 25) return 'text-yellow-700 bg-yellow-100';
    return 'text-red-700 bg-red-100';
  };

  const getQuizScore = (passed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((passed / total) * 100);
  };

  const formatTimeSpent = (minutes: number) => {
    if (minutes === 0) return '0 دقيقة';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} دقيقة`;
    return `${hours} ساعة ${mins > 0 ? `${mins} دقيقة` : ''}`;
  };

  const getActivityStatus = (lastActivity: string) => {
    const now = new Date();
    const last = new Date(lastActivity);
    const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return { text: 'اليوم', color: 'text-green-700 bg-green-100' };
    if (diffDays === 1) return { text: 'أمس', color: 'text-blue-700 bg-blue-100' };
    if (diffDays <= 7) return { text: `${diffDays} أيام`, color: 'text-yellow-700 bg-yellow-100' };
    return { text: `${diffDays} يوم`, color: 'text-red-700 bg-red-100' };
  };

  return (
    <div className="max-w-7xl mx-auto" dir="rtl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">تقارير التفاعل والمشاهدة</h2>
            <p className="text-gray-600 text-sm">تحليلات شاملة لأداء وتفاعل الطلاب</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={reloading}
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-gray-700 flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${reloading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">تحديث</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/80 backdrop-blur rounded-xl border border-gray-100 p-4 shadow-sm animate-fade-in">
          <div className="text-xs text-gray-500 mb-1">إجمالي الطلاب</div>
          <div className="text-2xl font-bold text-gray-900">{totalStudents}</div>
        </div>
        <div className="bg-white/80 backdrop-blur rounded-xl border border-green-100 p-4 shadow-sm animate-fade-in" style={{ animationDelay: '60ms' }}>
          <div className="text-xs text-gray-500 mb-1">متوسط التقدم</div>
          <div className="text-2xl font-bold text-green-700">{avgProgress.toFixed(1)}%</div>
        </div>
        <div className="bg-white/80 backdrop-blur rounded-xl border border-blue-100 p-4 shadow-sm animate-fade-in" style={{ animationDelay: '120ms' }}>
          <div className="text-xs text-gray-500 mb-1">إجمالي وقت التعلم</div>
          <div className="text-lg font-bold text-blue-700">{formatTimeSpent(totalTimeSpent)}</div>
        </div>
        <div className="bg-white/80 backdrop-blur rounded-xl border border-purple-100 p-4 shadow-sm animate-fade-in" style={{ animationDelay: '180ms' }}>
          <div className="text-xs text-gray-500 mb-1">نشط هذا الأسبوع</div>
          <div className="text-2xl font-bold text-purple-700">{activeStudents}</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/80 backdrop-blur rounded-xl border border-gray-100 p-4 sm:p-6 shadow-sm mb-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 p-2 border rounded-lg bg-white">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث باسم الطالب، البريد، أو الكورس"
                className="flex-1 outline-none text-sm bg-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full p-2 border rounded-lg bg-white text-sm outline-none"
            >
              <option value="progress">ترتيب حسب: التقدم</option>
              <option value="activity">ترتيب حسب: النشاط</option>
              <option value="time">ترتيب حسب: الوقت المستهلك</option>
              <option value="quizzes">ترتيب حسب: نتائج الاختبارات</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-600 py-8">جار تحميل بيانات التحليلات...</div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-600 py-8">لا توجد بيانات مطابقة للبحث</div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {filtered.map((student, idx) => {
              const activityStatus = getActivityStatus(student.last_activity);
              const quizScore = getQuizScore(student.quizzes_passed, student.total_quizzes);
              
              return (
                <div key={student.student_id} className="bg-white/90 backdrop-blur p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow animate-slide-up" style={{ animationDelay: `${idx * 40}ms` }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{student.student_name}</div>
                        <div className="text-xs text-gray-500">{student.student_email}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${activityStatus.color}`}>
                      {activityStatus.text}
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm font-medium text-gray-900">{student.course_title}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">التقدم</div>
                      <div className={`text-lg font-bold px-2 py-1 rounded-lg ${getProgressColor(student.progress_percentage)}`}>
                        {student.progress_percentage.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {student.sections_completed} من {student.total_sections} أقسام
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">الاختبارات</div>
                      <div className={`text-lg font-bold px-2 py-1 rounded-lg ${getProgressColor(quizScore)}`}>
                        {quizScore}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {student.quizzes_passed} من {student.total_quizzes} اختبار
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600">
                    <span>وقت التعلم: {formatTimeSpent(student.total_time_spent_minutes)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="overflow-x-auto bg-white/80 backdrop-blur rounded-xl border border-gray-100 shadow-sm hidden lg:block animate-fade-in">
            <table className="min-w-full text-right">
              <thead>
                <tr className="bg-gray-50 text-gray-700 text-sm">
                  <th className="px-4 py-3 font-semibold">الطالب</th>
                  <th className="px-4 py-3 font-semibold">الكورس</th>
                  <th className="px-4 py-3 font-semibold">التقدم</th>
                  <th className="px-4 py-3 font-semibold">الاختبارات</th>
                  <th className="px-4 py-3 font-semibold">وقت التعلم</th>
                  <th className="px-4 py-3 font-semibold">آخر نشاط</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filtered.map((student) => {
                  const activityStatus = getActivityStatus(student.last_activity);
                  const quizScore = getQuizScore(student.quizzes_passed, student.total_quizzes);
                  
                  return (
                    <tr key={student.student_id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{student.student_name}</div>
                            <div className="text-xs text-gray-500">{student.student_email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-indigo-600" />
                          <span className="text-gray-900">{student.course_title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`inline-block px-2 py-1 rounded-lg text-sm font-semibold ${getProgressColor(student.progress_percentage)}`}>
                          {student.progress_percentage.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {student.sections_completed}/{student.total_sections} أقسام
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`inline-block px-2 py-1 rounded-lg text-sm font-semibold ${getProgressColor(quizScore)}`}>
                          {quizScore}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {student.quizzes_passed}/{student.total_quizzes} اختبار
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {formatTimeSpent(student.total_time_spent_minutes)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${activityStatus.color}`}>
                          {activityStatus.text}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(student.last_activity).toLocaleDateString('ar-EG')}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in .5s ease-out both; }
        .animate-slide-up { animation: slide-up .45s ease-out both; }
      `}</style>
    </div>
  );
};

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  course_title?: string;
  progress_percentage?: number;
  enrollment_date?: string;
  sections_completed?: number;
  total_sections?: number;
  quizzes_passed?: number;
  total_quizzes?: number;
  total_time_spent_minutes?: number;
  last_activity?: string | null;
}

interface Course {
  id: number;
  title: string;
  description?: string;
}

export const SendNotificationsPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [notificationType, setNotificationType] = useState<'teacher_students' | 'teacher_course'>('teacher_students');
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const authFetch = async (url: string, init?: RequestInit) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      window.location.href = '/signin';
      return new Response(null, { status: 401 });
    }
    let res = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(init && init.headers ? init.headers : {}),
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
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${data.access}`,
              ...(init && init.headers ? init.headers : {}),
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

  const loadData = async () => {
    try {
      setError('');
      setLoading(true);
      
      // Fetch students
      const studentsRes = await authFetch('/teacher/analytics/students/');
      if (studentsRes && studentsRes.ok) {
        const studentsData = await studentsRes.json();
        const studentsList = Array.isArray(studentsData) ? studentsData : studentsData?.results || [];
        console.log('Raw students data:', studentsList);
        
        // Filter out students with null IDs and ensure ID is a number
        const validStudents = studentsList
          .filter((student: any) => 
            student && 
            student.student_id !== null && 
            student.student_id !== undefined && 
            !isNaN(Number(student.student_id))
          )
          .map((student: any) => ({
            id: Number(student.student_id),
            first_name: student.student_name?.split(' ')[0] || '',
            last_name: student.student_name?.split(' ').slice(1).join(' ') || '',
            email: student.student_email || '',
            course_title: student.course_title || '',
            progress_percentage: student.progress_percentage || 0,
            enrollment_date: student.enrollment_date || '',
            sections_completed: student.sections_completed || 0,
            total_sections: student.total_sections || 0,
            quizzes_passed: student.quizzes_passed || 0,
            total_quizzes: student.total_quizzes || 0,
            total_time_spent_minutes: student.total_time_spent_minutes || 0,
            last_activity: student.last_activity
          }));
        
        console.log('Valid students:', validStudents);
        setStudents(validStudents);
      }

      // Fetch courses
      const coursesRes = await authFetch('/teacher/courses/');
      if (coursesRes && coursesRes.ok) {
        const coursesData = await coursesRes.json();
        const coursesList = Array.isArray(coursesData) ? coursesData : coursesData?.results || [];
        setCourses(coursesList);
      }
    } catch (e) {
      setError('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStudentToggle = (studentId: number) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAllStudents = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(student => student.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !message.trim()) {
      setError('العنوان والرسالة مطلوبان');
      return;
    }

    if (notificationType === 'teacher_students' && selectedStudents.length === 0) {
      setError('يرجى اختيار طالب واحد على الأقل');
      return;
    }

    if (notificationType === 'teacher_course' && (!selectedCourse || selectedCourse === 0)) {
      setError('يرجى اختيار دورة واحدة على الأقل');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const payload: any = {
        title: title.trim(),
        message: message.trim(),
        notification_type: notificationType
      };

      if (notificationType === 'teacher_students') {
        // Ensure all selected students have valid IDs
        const validStudentIds = selectedStudents.filter(id => 
          id !== null && 
          id !== undefined && 
          !isNaN(Number(id))
        ).map(id => Number(id));
        
        console.log('Selected students:', selectedStudents);
        console.log('Valid student IDs:', validStudentIds);
        
        payload.student_ids = validStudentIds;
      } else if (notificationType === 'teacher_course') {
        payload.course = selectedCourse;
      }

      console.log('Sending notification payload:', payload);
      
      const response = await authFetch('/teacher/notifications/send/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response?.status);
      console.log('Response headers:', response?.headers);

      if (response && response.ok) {
        setSuccess('تم إرسال الإشعار بنجاح');
        setTitle('');
        setMessage('');
        setSelectedStudents([]);
        setSelectedCourse(null);
      } else {
        const errorText = await response?.text();
        console.log('Error response:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          setError(errorData?.message || errorData?.detail || 'حدث خطأ في إرسال الإشعار');
        } catch {
          setError(errorText || 'حدث خطأ في إرسال الإشعار');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ في إرسال الإشعار');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur rounded-xl border border-gray-100 p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">جاري تحميل البيانات...</p>
          </div>
        </div>
  </div>
);
  }
 return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-2 sm:p-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/90 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-blue-100 shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 sm:p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 space-x-0 sm:space-x-4 space-x-reverse">
              <div className="p-2 sm:p-3 bg-white/20 rounded-full backdrop-blur-sm">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold">إرسال إشعارات للطلاب</h2>
                <p className="text-blue-100 text-xs sm:text-sm mt-1">قم بإرسال إشعارات مخصصة للطلاب أو الدورات</p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            {/* Alert Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-r-4 border-red-400 rounded-lg transform transition-all duration-300 animate-pulse">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-400 ml-3" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border-r-4 border-green-400 rounded-lg transform transition-all duration-300 animate-bounce">
                <div className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-400 ml-3" />
                  <p className="text-green-700">{success}</p>
                </div>
              </div>
            )}

            <div className="space-y-6 sm:space-y-8">
              
              {/* Notification Type */}
              <div className="bg-blue-50/50 p-4 sm:p-6 rounded-xl border border-blue-100">
                <label className="block text-lg font-semibold text-blue-900 mb-4">
                  نوع الإشعار
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  <label className="relative group cursor-pointer">
                    <input
                      type="radio"
                      value="teacher_students"
                      checked={notificationType === 'teacher_students'}
                      onChange={(e) => setNotificationType(e.target.value as 'teacher_students')}
                      className="sr-only"
                    />
                    <div className={`p-4 rounded-lg border-2 transition-all duration-300 transform group-hover:scale-105 ${
                      notificationType === 'teacher_students' 
                        ? 'border-blue-500 bg-blue-100 shadow-md' 
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                    }`}>
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <Users className={`w-5 h-5 ${notificationType === 'teacher_students' ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className={`font-medium ${notificationType === 'teacher_students' ? 'text-blue-900' : 'text-gray-700'}`}>
                          إشعار للطلاب
                        </span>
                        {notificationType === 'teacher_students' && (
                          <Check className="w-4 h-4 text-blue-600 ml-auto" />
                        )}
                      </div>
                    </div>
                  </label>

                  <label className="relative group cursor-pointer">
                    <input
                      type="radio"
                      value="teacher_course"
                      checked={notificationType === 'teacher_course'}
                      onChange={(e) => setNotificationType(e.target.value as 'teacher_course')}
                      className="sr-only"
                    />
                    <div className={`p-4 rounded-lg border-2 transition-all duration-300 transform group-hover:scale-105 ${
                      notificationType === 'teacher_course' 
                        ? 'border-blue-500 bg-blue-100 shadow-md' 
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                    }`}>
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <BookOpen className={`w-5 h-5 ${notificationType === 'teacher_course' ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className={`font-medium ${notificationType === 'teacher_course' ? 'text-blue-900' : 'text-gray-700'}`}>
                          إشعار للدورات
                        </span>
                        {notificationType === 'teacher_course' && (
                          <Check className="w-4 h-4 text-blue-600 ml-auto" />
                        )}
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Title */}
              <div className="group">
                <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-3">
                  عنوان الإشعار *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-3 sm:px-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 group-hover:border-blue-300 text-sm sm:text-base"
                  placeholder="أدخل عنوان الإشعار"
                  required
                />
              </div>

              {/* Message */}
              <div className="group">
                <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-3">
                  نص الرسالة *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-3 sm:px-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 resize-none group-hover:border-blue-300 text-sm sm:text-base"
                  placeholder="أدخل نص الرسالة"
                  required
                />
              </div>

              {/* Students Selection */}
              {notificationType === 'teacher_students' && (
                <div className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
                    <label className="block text-lg font-semibold text-gray-800">
                      اختيار الطلاب *
                    </label>
                    <button
                      type="button"
                      onClick={handleSelectAllStudents}
                      className="w-full sm:w-auto px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-300 font-medium border border-blue-200"
                    >
                      {selectedStudents.length === students.length ? 'إلغاء الكل' : 'اختيار الكل'}
                    </button>
                  </div>
                  
                  {students.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-xl border-2 border-gray-200">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">لا يوجد طلاب متاحون</p>
                    </div>
                  ) : (
                    <>
                      {/* Mobile Cards View */}
                      <div className="block sm:hidden max-h-80 overflow-y-auto">
                        <div className="grid gap-3">
                          {students.map((student) => (
                            <div 
                              key={student.id} 
                              className={`bg-white rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                                selectedStudents.includes(student.id) 
                                  ? 'border-blue-400 bg-blue-50 shadow-lg' 
                                  : 'border-gray-200 hover:border-blue-300'
                              }`}
                              onClick={() => handleStudentToggle(student.id)}
                            >
                              <div className="p-4">
                                <div className="flex items-start space-x-3 space-x-reverse">
                                  <div className="flex-shrink-0">
                                    <input
                                      type="checkbox"
                                      checked={selectedStudents.includes(student.id)}
                                      onChange={() => handleStudentToggle(student.id)}
                                      className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 space-x-reverse mb-2">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        selectedStudents.includes(student.id) 
                                          ? 'bg-blue-100 text-blue-600' 
                                          : 'bg-gray-100 text-gray-600'
                                      }`}>
                                        <Users className="w-5 h-5" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className={`font-semibold truncate ${
                                          selectedStudents.includes(student.id) 
                                            ? 'text-blue-900' 
                                            : 'text-gray-900'
                                        }`}>
                                          {student.first_name} {student.last_name}
                                        </h4>
                                        <p className="text-sm text-gray-600 truncate">{student.email}</p>
                                      </div>
                                    </div>
                                    
                                    {student.course_title && (
                                      <div className="flex items-center space-x-2 space-x-reverse mt-2">
                                        <GraduationCap className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                                        <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full truncate">
                                          {student.course_title}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {student.progress_percentage !== undefined && (
                                      <div className="mt-2">
                                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                                          <span>التقدم</span>
                                          <span>{student.progress_percentage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                          <div 
                                            className={`h-2 rounded-full transition-all duration-300 ${
                                              student.progress_percentage >= 75 ? 'bg-green-500' :
                                              student.progress_percentage >= 50 ? 'bg-blue-500' :
                                              student.progress_percentage >= 25 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                            style={{ width: `${student.progress_percentage}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Desktop List View */}
                      <div className="hidden sm:block max-h-64 overflow-y-auto border-2 border-gray-200 rounded-xl p-4 bg-white">
                        <div className="space-y-3">
                          {students.map((student) => (
                            <label key={student.id} className="flex items-center p-3 rounded-lg hover:bg-blue-50 transition-all duration-200 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={selectedStudents.includes(student.id)}
                                onChange={() => handleStudentToggle(student.id)}
                                className="w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 ml-3"
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 space-x-reverse">
                                  <span className="font-medium text-gray-800 group-hover:text-blue-800 transition-colors">
                                    {student.first_name} {student.last_name}
                                  </span>
                                  <span className="text-sm text-gray-500">({student.email})</span>
                                </div>
                                {student.course_title && (
                                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full mt-1 inline-block">
                                    دورة: {student.course_title}
                                  </span>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  
                  {selectedStudents.length > 0 && (
                    <div className="mt-3 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <span>تم اختيار {selectedStudents.length} من {students.length} طالب</span>
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Course Selection */}
              {notificationType === 'teacher_course' && (
                <div className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200">
                  <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-3">
                    اختيار الدورة *
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCourse || ''}
                      onChange={(e) => setSelectedCourse(Number(e.target.value))}
                      className="w-full px-3 py-3 sm:px-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 appearance-none bg-white hover:border-blue-300 text-sm sm:text-base"
                      required
                    >
                      <option value="">اختر دورة</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  {courses.length === 0 && (
                    <p className="mt-2 text-sm text-gray-500 bg-yellow-50 p-2 rounded-lg border border-yellow-200">
                      لا توجد دورات متاحة
                    </p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold text-base sm:text-lg shadow-lg transform transition-all duration-300 ${
                    loading 
                      ? 'opacity-75 cursor-not-allowed' 
                      : 'hover:from-blue-700 hover:to-blue-800 hover:scale-105 hover:shadow-xl active:scale-95'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-3 space-x-reverse">
                    {loading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>جاري الإرسال...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        <span>إرسال الإشعار</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};