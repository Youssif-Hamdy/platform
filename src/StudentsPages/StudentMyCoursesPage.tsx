import React, { useState, useEffect } from 'react';
import StarRating from '../component/StarRating';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Clock, 
  Users, 
  FileText, 
  HelpCircle, 
  CheckCircle, 
  AlertCircle,
  BookOpen,
  FileDown,
  PlayCircle,
  Menu,
  X,
  ArrowLeft,
  Trophy,
  Star,
  Target,
  ChevronRight,
  AlertTriangle,
  Check,
  Info,
  ChevronLeft
} from 'lucide-react';

interface Course {
  id: number;
  title: string;
  description: string;
  teacher_name: string;
  thumbnail: string | null;
  status: string;
  difficulty: string;
  price: string;
  duration_hours: number;
  total_sections: number;
  total_quizzes: number;
  total_enrollments: number;
  total_views: number;
  sections: CourseSection[];
  progress?: number;
  completed_sections?: number;
  analytics?: CourseAnalytics;
}

interface CourseAnalytics {
  user_type: string;
  course_info: {
    id: number;
    title: string;
    teacher_name: string;
    start_date: string;
  };
  progress_overview: {
    progress_percentage: number;
    sections_completed: number;
    total_sections: number;
    quizzes_passed: number;
    total_time_spent_minutes: number;
    estimated_time_remaining_minutes: number | null;
    enrollment_date: string;
    completion_date: string | null;
  };
  section_progress: SectionProgress[];
  quiz_performance: QuizPerformance[];
  recent_activity: RecentActivity[];
}

interface SectionProgress {
  section_id: number;
  section_title: string;
  is_completed: boolean;
  first_viewed: string;
  last_viewed: string;
  time_spent_minutes: number;
  order: number;
}

interface QuizPerformance {
  quiz_id: number;
  quiz_title: string;
  section_title: string;
  attempts_count: number;
  best_score: number | null;
  latest_score: number | null;
  is_passed: boolean;
  last_attempt: string | null;
}

interface RecentActivity {
  type: string;
  title: string;
  time: string;
  action: string;
  completed?: boolean;
  passed?: boolean;
}

interface CourseSection {
  id: number;
  title: string;
  description: string;
  content_type: 'text' | 'video' | 'pdf';
  content: string;
  video_file: string | null;
  pdf_file: string | null;
  order: number;
  duration_minutes: number;
  total_views: number;
  quiz: any;
  has_quiz: boolean;
  created_at: string;
  updated_at: string;
  is_completed?: boolean;
}

interface Quiz {
  attempt_id: number;
  quiz_title: string;
  time_limit_minutes: number;
  questions: QuizQuestion[];
  started_at: string;
}

interface QuizQuestion {
  id: number;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  points: number;
  order: number;
  choices: QuizChoice[];
}

interface QuizChoice {
  id: number;
  choice_text: string;
}

interface QuizAnswer {
  question_id: number;
  choice_id: number;
}

interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface CertificatePayload {
  certificate_url: string;
  download_url?: string;
  verification_code: string;
  issued_date: string;
  student_name: string;
  course_title: string;
  message?: string;
  id?: number; // some APIs may include numeric id
}

const StudentMyCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedSection, setSelectedSection] = useState<CourseSection | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const [quizTimeRemaining, setQuizTimeRemaining] = useState<number>(0);
  const [quizSubmitting, setQuizSubmitting] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [loadingQuiz, setLoadingQuiz] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [courseRating, setCourseRating] = useState<number | ''>('');
  const [courseComment, setCourseComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(false);
  const [loadingCourseAnalytics, setLoadingCourseAnalytics] = useState<boolean>(false);
  const [certificatesByCourseId, setCertificatesByCourseId] = useState<Record<number, CertificatePayload>>({});
  const [loadingCertificateCourseId, setLoadingCertificateCourseId] = useState<number | null>(null);

  const navigate = useNavigate();

  // Helper: prefer analytics progress, then server progress, then derive from sections
  const getServerOrDerivedProgress = (course: Course) => {
    if (course.analytics?.progress_overview?.progress_percentage !== undefined) {
      return course.analytics.progress_overview.progress_percentage;
    }
    if (typeof course.progress === 'number') return course.progress;
    const total = (course.sections?.length || course.total_sections || 0);
    if (total === 0) return 0;
    const completed = (course.sections?.filter(s => s.is_completed).length || course.completed_sections || 0);
    return Math.round((completed / total) * 100);
  };

  // Load course analytics
  const loadCourseAnalytics = async (courseId: number) => {
    try {
      setLoadingAnalytics(true);
      const res = await authFetch(`/teacher/analytics/courses/${courseId}/`);
      
      if (res && res.ok) {
        const data = await res.json();
        setSelectedCourse(prev => prev ? { ...prev, analytics: data } : prev);
        addToast('success', 'تم تحميل بيانات التقدم بنجاح');
      } else {
        addToast('error', 'فشل في تحميل بيانات التقدم');
      }
    } catch (e) {
      console.error('Error loading course analytics:', e);
      addToast('error', 'حدث خطأ في تحميل بيانات التقدم');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const markSectionAsCompleted = async (_courseId: number, sectionId: number) => {
    try {
      const res = await authFetch(`/student/sections/${sectionId}/complete/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_completed: true })
      });

      if (res && res.ok) {
        const responseData = await res.json();
        console.log('Section completion response:', responseData);
        
        if (responseData.status === 'success' && responseData.data?.is_completed) {
          addToast('success', 'تم تحديد القسم كمكتمل!');
          // Optimistically update selected course/section in state
          setSelectedCourse(prev => {
            if (!prev) return prev;
            const updatedSections = prev.sections?.map(s => (
              s.id === sectionId ? { ...s, is_completed: true } : s
            )) || [];
            const completedCount = updatedSections.filter(s => s.is_completed).length;
            return {
              ...prev,
              sections: updatedSections,
              completed_sections: completedCount,
              progress: getServerOrDerivedProgress({ ...prev, sections: updatedSections, completed_sections: completedCount })
            };
          });
          setSelectedSection(prev => (prev ? { ...prev, is_completed: true } : prev));
          // Refresh courses list to sync with server
          loadMyCourses();
        } else {
          addToast('error', 'تعذر تحديد القسم كمكتمل');
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('API Error:', errorData);
        addToast('error', errorData.message || 'تعذر تحديد القسم كمكتمل');
      }
    } catch (e) {
      console.error('Error marking section as completed:', e);
      addToast('error', 'حدث خطأ أثناء تحديد القسم كمكتمل');
    }
  };


  // Toast functions
  const addToast = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    const id = Date.now();
    const toast = { id, type, message };
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Toast component
  const Toast: React.FC<{ toast: Toast; onClose: (id: number) => void }> = ({ toast, onClose }) => {
    const getToastIcon = () => {
      switch (toast.type) {
        case 'success': return <Check className="w-5 h-5 text-green-500" />;
        case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
        case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
        case 'info': return <Info className="w-5 h-5 text-blue-500" />;
        default: return <Info className="w-5 h-5 text-blue-500" />;
      }
    };

    const getToastStyles = () => {
      switch (toast.type) {
        case 'success': return 'bg-green-50 border-green-200 text-green-800';
        case 'error': return 'bg-red-50 border-red-200 text-red-800';
        case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
        case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
        default: return 'bg-blue-50 border-blue-200 text-blue-800';
      }
    };

    return (
      <div className={`flex items-center gap-3 p-4 border rounded-lg shadow-md ${getToastStyles()} animate-slide-in`}>
        {getToastIcon()}
        <span className="flex-1">{toast.message}</span>
        <button 
          onClick={() => onClose(toast.id)}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
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

  const loadMyCourses = async () => {
    try {
      setLoading(true);
      setLoadingCourseAnalytics(true);
      setError('');
      
      const res = await authFetch('/student/my-courses/');
      
      if (!res || !res.ok) {
        setError('تعذر تحميل الكورسات المسجلة');
        addToast('error', 'فشل في تحميل الكورسات المسجلة');
        return;
      }
      
      const data = await res.json();
      const coursesData: Course[] = data.results || data || [];
      
      // Load analytics for each course
      const coursesWithAnalytics = await Promise.all(
        coursesData.map(async (course) => {
          try {
            const analyticsRes = await authFetch(`/teacher/analytics/courses/${course.id}/`);
            if (analyticsRes && analyticsRes.ok) {
              const analyticsData = await analyticsRes.json();
              return { ...course, analytics: analyticsData };
            }
          } catch (e) {
            console.warn(`Failed to load analytics for course ${course.id}:`, e);
          }
          return course;
        })
      );
      
      setCourses(coursesWithAnalytics);
      if (coursesWithAnalytics.length > 0) {
        addToast('success', `تم تحميل ${coursesWithAnalytics.length} كورس بنجاح`);
      }
    } catch (e) {
      console.error('Error loading my courses:', e);
      setError('حدث خطأ أثناء تحميل الكورسات المسجلة');
      addToast('error', 'حدث خطأ أثناء تحميل الكورسات');
    } finally {
      setLoading(false);
      setLoadingCourseAnalytics(false);
    }
  };

  // Certificates
  const fetchCertificate = async (courseId: number, action?: 'view' | 'download') => {
    try {
      setLoadingCertificateCourseId(courseId);
      const res = await authFetch(`/student/certificates/${courseId}/`);
      if (res && res.ok) {
        const data: CertificatePayload = await res.json();
        setCertificatesByCourseId(prev => ({ ...prev, [courseId]: data }));
        addToast('success', 'تم إنشاء/جلب الشهادة بنجاح');

        if (action === 'view') {
          navigate(`/student/certificate/${courseId}`);
        }
        if (action === 'download') {
          await downloadCertificate(courseId, data);
        }
      } else {
        addToast('error', 'تعذر جلب الشهادة');
      }
    } catch (e) {
      console.error('Error fetching certificate:', e);
      addToast('error', 'حدث خطأ أثناء جلب الشهادة');
    } finally {
      setLoadingCertificateCourseId(null);
    }
  };

  const downloadCertificate = async (courseId: number, payload?: CertificatePayload) => {
    try {
      const certificate = payload || certificatesByCourseId[courseId];
      let usedCertificate = certificate;
      if (!usedCertificate) {
        // fetch first if not present
        setLoadingCertificateCourseId(courseId);
        const res = await authFetch(`/student/certificates/${courseId}/`);
        if (!res || !res.ok) {
          addToast('error', 'تعذر جلب الشهادة للتحميل');
          return;
        }
        usedCertificate = await res.json();
        setCertificatesByCourseId(prev => ({ ...prev, [courseId]: usedCertificate! }));
      }

      let dlUrl = usedCertificate.download_url
        ? usedCertificate.download_url
        : `/student/certificates/download/${usedCertificate.id ?? usedCertificate.verification_code}/`;

      // Normalize '/api' prefix to match vite proxy config
      if (!/^https?:\/\//.test(dlUrl) && dlUrl.startsWith('/api/')) {
        dlUrl = dlUrl.replace(/^\/api/, '');
      }

      // Fetch as blob with auth header to avoid client-side routing issues
      const resBlob = await authFetch(dlUrl, { method: 'GET' });
      if (!resBlob || !resBlob.ok) {
        addToast('error', 'تعذر تحميل ملف الشهادة');
        return;
      }
      const blob = await resBlob.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `certificate_${usedCertificate.verification_code || courseId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
      addToast('success', 'تم تنزيل الشهادة');
    } catch (e) {
      console.error('Error downloading certificate:', e);
      addToast('error', 'حدث خطأ أثناء تنزيل الشهادة');
    } finally {
      setLoadingCertificateCourseId(null);
    }
  };

  const loadQuiz = async (courseId: number, sectionId: number, quizId: number) => {
    try {
      setLoadingQuiz(true);
      const res = await authFetch(`/student/course/${courseId}/section/${sectionId}/quiz/${quizId}/`);
      
      if (res && res.ok) {
        const data = await res.json();
        setCurrentQuiz(data);
        setQuizAnswers([]);
        setQuizTimeRemaining(data.time_limit_minutes * 60);
        addToast('info', 'تم تحميل الاختبار بنجاح');
      } else {
        addToast('error', 'فشل في تحميل الاختبار');
      }
    } catch (e) {
      console.error('Error loading quiz:', e);
      addToast('error', 'حدث خطأ في تحميل الاختبار');
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleQuizAnswerChange = (questionId: number, choiceId: number) => {
    setQuizAnswers(prev => {
      const existing = prev.findIndex(a => a.question_id === questionId);
      if (existing >= 0) {
        const newAnswers = [...prev];
        newAnswers[existing] = { question_id: questionId, choice_id: choiceId };
        return newAnswers;
      } else {
        return [...prev, { question_id: questionId, choice_id: choiceId }];
      }
    });
  };

  const submitQuiz = async () => {
    if (!currentQuiz || !selectedCourse || !selectedSection) return;

    try {
      setQuizSubmitting(true);
      
      const payload = {
        attempt_id: currentQuiz.attempt_id,
        answers: quizAnswers
      };

      const res = await authFetch(
        `/student/course/${selectedCourse.id}/section/${selectedSection.id}/quiz/${selectedSection.quiz?.id}/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      if (res && res.ok) {
        // Read submission response (if any) then navigate to results page
        try { await res.json(); } catch (e) { /* ignore body parse if empty */ }
        addToast('success', 'تم إرسال الإجابات بنجاح!');
        const attemptId = currentQuiz.attempt_id;
        setCurrentQuiz(null);
        setQuizAnswers([]);
        loadMyCourses();
        navigate(`/student/quiz-results/${attemptId}`);
      } else {
        addToast('error', 'حدث خطأ في إرسال الإجابات');
      }
    } catch (e) {
      console.error('Error submitting quiz:', e);
      addToast('error', 'حدث خطأ في إرسال الإجابات');
    } finally {
      setQuizSubmitting(false);
    }
  };

  const submitCourseReview = async () => {
    if (!selectedCourse) return;
    if (!courseRating) {
      addToast('warning', 'يرجى اختيار تقييم أولاً');
      return;
    }
    try {
      setSubmittingReview(true);
      const res = await authFetch(`/teacher/courses/${selectedCourse.id}/reviews/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: courseRating, comment: courseComment })
      });
      if (res && res.ok) {
        addToast('success', 'تم إرسال تقييمك، شكراً لك!');
        setCourseRating('');
        setCourseComment('');
      } else {
        addToast('error', 'تعذر إرسال التقييم');
      }
    } catch (e) {
      console.error('Error submitting course review:', e);
      addToast('error', 'حدث خطأ أثناء إرسال التقييم');
    } finally {
      setSubmittingReview(false);
    }
  };


  const getSectionIcon = (contentType: string, hasQuiz: boolean) => {
    if (hasQuiz) {
      return <HelpCircle className="w-5 h-5 text-blue-500" />;
    }
    
    switch (contentType) {
      case 'video':
        return <PlayCircle className="w-5 h-5 text-blue-600" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'text':
        return <BookOpen className="w-5 h-5 text-blue-400" />;
      default:
        return <BookOpen className="w-5 h-5 text-gray-500" />;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'from-blue-500 to-blue-600';
    if (progress >= 50) return 'from-blue-400 to-blue-500';
    return 'from-blue-300 to-blue-400';
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}`;
    }
    return `${mins} دقيقة`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isCourseCompleted = (course: Course) => getServerOrDerivedProgress(course) === 100;

  // Quiz Timer Effect
  useEffect(() => {
    let interval: number | undefined;
    
    if (currentQuiz && quizTimeRemaining > 0) {
      interval = window.setInterval(() => {
        setQuizTimeRemaining(prev => {
          if (prev <= 1) {
            submitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, [currentQuiz, quizTimeRemaining]);

  useEffect(() => {
    loadMyCourses();
  }, []);

  // Force black scrollbars globally while this page is mounted
  useEffect(() => {
    document.body.classList.add('student-scroll-dark-page');
    return () => {
      document.body.classList.remove('student-scroll-dark-page');
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96 bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-blue-800 font-medium">
            {loadingCourseAnalytics ? 'جار تحميل بيانات التقدم...' : 'جار تحميل الكورسات المسجلة...'}
          </p>
          {loadingCourseAnalytics && (
            <p className="text-blue-600 text-sm mt-2">يرجى الانتظار...</p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-white min-h-96 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm border border-blue-200 rounded-2xl p-8 max-w-md mx-auto shadow-xl">
          <AlertCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-blue-900 mb-2">خطأ في التحميل</h3>
          <p className="text-blue-600 mb-6">{error}</p>
          <button 
            onClick={loadMyCourses}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              إعادة المحاولة
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Course Player View
  if (selectedCourse) {
    return (
      <div className="student-scroll-dark h-screen flex flex-col overflow-hidden bg-gradient-to-br from-blue-50 to-white" dir="rtl">
        {/* Header */}
    <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white px-4 py-3 sm:px-6 sm:py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <button 
              onClick={() => setSelectedCourse(null)}
              className="flex-shrink-0 flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-xl bg-blue-700/50 hover:bg-blue-600/50 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline font-medium text-xs sm:text-sm">العودة</span>
            </button>
            
            <div className="min-w-0 flex-1 text-right mr-2">
              <h1 className="text-sm sm:text-xl font-bold truncate">
                {selectedCourse.title.length > 20 ? 
                  `${selectedCourse.title.substring(0, 20)}...` : 
                  selectedCourse.title
                }
              </h1>
              <p className="text-blue-200 text-xs sm:text-sm truncate">
                المعلم: {selectedCourse.teacher_name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right hidden md:block">
                <div className="text-blue-200 text-xs sm:text-sm">التقدم</div>
                <div className="text-white font-bold text-sm">{getServerOrDerivedProgress(selectedCourse)}%</div>
              </div>
              <div className="w-20 sm:w-32 bg-blue-700/50 rounded-full h-2 sm:h-3">
                <div 
                  className="h-2 sm:h-3 rounded-full bg-gradient-to-r from-white to-blue-200 transition-all duration-500"
                  style={{ width: `${getServerOrDerivedProgress(selectedCourse)}%` }}
                ></div>
              </div>
            </div>
            <button 
              onClick={() => loadCourseAnalytics(selectedCourse.id)}
              disabled={loadingAnalytics}
              className="p-2 sm:p-3 rounded-xl bg-blue-700/50 hover:bg-blue-600/50 transition-all duration-300 disabled:opacity-50"
              title="تحديث بيانات التقدم"
            >
              {loadingAnalytics ? (
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 sm:p-3 rounded-xl bg-blue-700/50 hover:bg-blue-600/50 transition-all duration-300 lg:hidden"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden relative min-h-0">
         {/* Sidebar */}
{sidebarOpen && (
  <div className={`bg-white/90 backdrop-blur-xl border-l border-blue-200/50 flex flex-col overflow-hidden absolute lg:relative inset-y-0 right-0 z-10 h-full lg:h-full shadow-xl transition-all duration-300 ${
    sidebarCollapsed ? 'lg:w-20' : 'lg:w-80'
  } w-80`}>
    <div className="p-6 border-b border-blue-200/50 bg-gradient-to-r from-blue-50 to-white">
      <div className="flex items-center justify-between mb-3">
        <h2 className={`font-bold text-blue-900 text-lg ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
          محتوى الكورس
        </h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg text-blue-500 hover:text-blue-700 hover:bg-blue-100 transition-all duration-300 hidden lg:block"
          >
            {sidebarCollapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg text-blue-500 hover:text-blue-700 hover:bg-blue-100 transition-all duration-300 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className={`flex items-center gap-2 text-sm text-blue-600 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
        <Trophy className="w-4 h-4" />
        <span>
          {selectedCourse.analytics?.progress_overview?.sections_completed || selectedCourse.completed_sections || 0} 
          من {selectedCourse.analytics?.progress_overview?.total_sections || selectedCourse.total_sections}
        </span>
      </div>
    </div>

    {/* Sections List */}
    <div className="flex-1 overflow-y-auto custom-scrollbar">
                {selectedCourse.sections?.map((section, index) => {
                  // Use analytics data if available, otherwise fall back to section data
                  const sectionProgress = selectedCourse.analytics?.section_progress?.find(sp => sp.section_id === section.id);
                  const isCompleted = sectionProgress ? sectionProgress.is_completed : Boolean(section.is_completed);
                  return (
        <div key={section.id} className="border-b border-blue-100/50 last:border-b-0">
          <button
            onClick={() => {
              setSelectedSection(section);
              setCurrentQuiz(null);
              if (window.innerWidth < 1024) setSidebarOpen(false);
            }}
            className={`w-full text-right p-4 hover:bg-blue-50/50 transition-all duration-300 group ${
              selectedSection?.id === section.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-all duration-300">
                    {getSectionIcon(section.content_type, section.has_quiz)}
                  </div>
                )}
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-blue-900 text-sm line-clamp-2 mb-1">
                    {index + 1}. {section.title}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-blue-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDuration(section.duration_minutes)}</span>
                    </div>
                    {section.has_quiz && (
                      <div className="flex items-center gap-1">
                        <HelpCircle className="w-3 h-3" />
                        <span>اختبار</span>
                      </div>
                    )}
                    {isCompleted && (
                      <div className="flex items-center gap-1 text-green-700">
                        <CheckCircle className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>
              )}
              {!sidebarCollapsed && (
                <ChevronLeft className="w-4 h-4 text-blue-400 group-hover:text-blue-600 transition-all duration-300" />
              )}
            </div>
          </button>
        </div>
      );
      })}
    </div>

    {/* Progress Summary - يظهر فقط عندما لا يكون السايدبار مصغرًا */}
    {!sidebarCollapsed && (
      <div className="p-6 bg-gradient-to-r from-blue-50 to-white border-t border-blue-200/50">
        <div className="mb-4">
          <div className="flex justify-between text-sm text-blue-700 mb-2">
            <span className="font-medium">التقدم الإجمالي</span>
            <span className="font-bold">{getServerOrDerivedProgress(selectedCourse)}%</span>
          </div>
          <div className="w-full bg-blue-200/50 rounded-full h-3">
            <div 
              className={`h-3 rounded-full bg-gradient-to-r ${getProgressColor(getServerOrDerivedProgress(selectedCourse))} transition-all duration-500`}
              style={{ width: `${getServerOrDerivedProgress(selectedCourse)}%` }}
            ></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-white/70 rounded-xl p-3">
            <div className="text-lg font-bold text-blue-800">
              {selectedCourse.analytics?.progress_overview?.sections_completed || selectedCourse.completed_sections || 0}
            </div>
            <div className="text-xs text-blue-600">أقسام</div>
          </div>
          <div className="bg-white/70 rounded-xl p-3">
            <div className="text-lg font-bold text-blue-800">
              {selectedCourse.analytics?.progress_overview?.total_sections || selectedCourse.total_sections}
            </div>
            <div className="text-xs text-blue-600">إجمالي الأقسام</div>
          </div>
        </div>
      </div>
    )}
  </div>
)}

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden custom-scrollbar">
            {selectedSection ? (
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {/* Section Header */}
                <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-200/50">
                  <h1 className="text-3xl font-bold text-blue-900 mb-3">{selectedSection.title}</h1>
                    <p
                      className="text-blue-600 mb-4 leading-relaxed"
                      dir="auto"
                    >
                      {selectedSection.description}
                    </p>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg text-blue-700">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(selectedSection.duration_minutes)}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg text-blue-700">
                      <Users className="w-4 h-4" />
                      <span>{selectedSection.total_views} مشاهدة</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg text-blue-700">
                      {getSectionIcon(selectedSection.content_type, selectedSection.has_quiz)}
                      <span>
                        {selectedSection.content_type === 'video' ? 'فيديو' :
                         selectedSection.content_type === 'pdf' ? 'ملف PDF' : 'محتوى نصي'}
                      </span>
                    </div>
                    {Boolean(selectedSection.is_completed) && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
                

                {/* Main Content */}
             <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200/50 overflow-hidden mb-8">
  {selectedSection.content_type === 'video' && selectedSection.video_file && (
    <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl overflow-hidden">
      <div className="aspect-video">
        <video
          src={`https://res.cloudinary.com/dtoy7z1ou/${selectedSection.video_file}`}
          controls
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <PlayCircle className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-blue-900">مشغل الفيديو</h3>
        </div>
       
        </div>
      </div>
  )}

                  {selectedSection.content_type === 'text' && (
                    <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl overflow-hidden">
                      <div className="p-6 bg-white/95 backdrop-blur-sm border-b border-blue-200/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-blue-900">المحتوى النصي</h3>
                        </div>
                      </div>
                      <div className="p-6 max-h-96 overflow-y-auto custom-scrollbar">
                        <div className="prose max-w-none text-blue-800 whitespace-pre-wrap leading-relaxed">
                          {selectedSection.content}
                        </div>
                        
                      </div>
                    </div>
                  )}

                {selectedSection.content_type === 'pdf' && selectedSection.pdf_file && (
  <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl overflow-hidden">
    <div className="p-6 bg-white/95 backdrop-blur-sm border-b border-blue-200/50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-blue-900">ملف PDF</h3>
      </div>
    </div>
    <div className="p-6 max-h-96 overflow-y-auto custom-scrollbar">
      <div className="text-center mb-6">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-12 h-12 text-blue-500" />
        </div>
        <p className="text-blue-600 text-lg font-medium mb-6">انقر للتحميل أو المشاهدة</p>
        <a
          href={selectedSection.pdf_file.startsWith('http') 
            ? selectedSection.pdf_file 
            : `https://res.cloudinary.com/dtoy7z1ou/${selectedSection.pdf_file}`
          }
          download
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-bold text-lg"
        >
          <FileDown className="w-6 h-6" />
          <span>تحميل PDF</span>
        </a>
      </div>
     
    </div>
  </div>
)}

                </div>

                {/* Section Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {/* Mark as Completed Button */}
                  {!Boolean(selectedSection.is_completed) && (
                    <button 
                      onClick={() => markSectionAsCompleted(selectedCourse.id, selectedSection.id)}
                      className="group p-6 bg-white/80 backdrop-blur-sm border border-green-200/50 rounded-2xl hover:bg-green-50/50 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-all duration-300">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-900">تحديد كمكتمل</div>
                          <div className="text-sm text-green-600">انتهيت من هذا القسم</div>
                        </div>
                      </div>
                    </button>
                  )}

                  {/* Quiz */}
                  {selectedSection.has_quiz && (
                    <button 
                      onClick={() => {
                        if (selectedSection.quiz && selectedSection.quiz.id) {
                          loadQuiz(selectedCourse.id, selectedSection.id, selectedSection.quiz.id);
                        }
                      }}
                      className="group p-6 bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-2xl hover:bg-blue-50/50 transition-all duration-300 transform hover:scale-105 shadow-lg"
                      disabled={loadingQuiz}
                    >
                      <div className="flex items-center justify-center gap-3">
                        {loadingQuiz ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-300 border-t-blue-600"></div>
                        ) : (
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-all duration-300">
                            <HelpCircle className="w-6 h-6 text-blue-600" />
                          </div>
                        )}
                        <div className="text-right">
                          <div className="font-semibold text-blue-900">بدء الاختبار</div>
                          <div className="text-sm text-blue-600">اختبر معرفتك</div>
                        </div>
                      </div>
                    </button>
                  )}

                
                </div>

                {/* Course Review */}
                <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-200/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Star className="w-6 h-6 text-yellow-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-blue-900">قيّم هذا الكورس</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div>
                      <label className="block text-sm text-blue-700 mb-2">التقييم</label>
                      <div className="flex items-center gap-3">
                        <StarRating
                          value={typeof courseRating === 'number' ? courseRating : 0}
                          onChange={(r) => setCourseRating(r as number)}
                          maxStars={5}
                        />
                        {courseRating !== '' && (
                          <span className="text-sm text-blue-700">{courseRating} / 5</span>
                        )}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-blue-700 mb-2">تعليق (اختياري)</label>
                      <input
                        type="text"
                        className="w-full border border-blue-200 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                        placeholder="اكتب رأيك عن الكورس"
                        value={courseComment}
                        onChange={(e) => setCourseComment(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mt-4 text-right">
                    <button
                      onClick={submitCourseReview}
                      disabled={submittingReview}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingReview ? 'جار الإرسال...' : 'إرسال التقييم'}
                    </button>
                  </div>
                </div>

             

                {/* Quiz Display */}
                {/* Certificate Info Panel */}
                {selectedCourse && isCourseCompleted(selectedCourse) && certificatesByCourseId[selectedCourse.id] && (
                  <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-green-200/60">
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-right">
                        <div className="text-green-900 font-bold mb-1">الشهادة متاحة</div>
                        <div className="text-green-700 text-sm">
                          كود التحقق: {certificatesByCourseId[selectedCourse.id].verification_code}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/student/certificate/${selectedCourse.id}`)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg"
                        >
                          عرض الشهادة
                        </button>
                        <button
                          onClick={() => fetchCertificate(selectedCourse.id, 'download')}
                          className="px-4 py-2 rounded-xl bg-white text-green-700 border border-green-300 text-sm font-bold hover:bg-green-50 transition-all duration-300 shadow-sm"
                        >
                          <div className="flex items-center gap-1">
                            <FileDown className="w-4 h-4" />
                            <span>تحميل</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quiz Display */}
                {currentQuiz && (
                  <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-200/50 rounded-2xl p-8 shadow-lg animate-fade-in">
                    {/* Quiz Header */}
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                            <HelpCircle className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-blue-900">{currentQuiz.quiz_title}</h3>
                            <div className="text-sm text-blue-600">
                              بدأ في: {new Date(currentQuiz.started_at).toLocaleString('ar-EG')}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Timer */}
                      <div className={`bg-white/90 rounded-2xl p-6 border-2 text-center min-w-[140px] shadow-lg ${
                        quizTimeRemaining < 300 ? 'border-red-300 bg-red-50/50' : 'border-blue-300'
                      }`}>
                        <div className={`text-3xl font-bold ${quizTimeRemaining < 300 ? 'text-red-600' : 'text-blue-900'}`}>
                          {formatTime(quizTimeRemaining)}
                        </div>
                        <div className="text-xs text-blue-700 font-medium">الوقت المتبقي</div>
                        {quizTimeRemaining < 300 && (
                          <div className="mt-2">
                            <AlertTriangle className="w-4 h-4 text-red-500 mx-auto" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quiz Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      <div className="text-center p-4 bg-white/70 rounded-xl border border-blue-200/50">
                        <div className="text-2xl font-bold text-blue-900 mb-1">{currentQuiz.time_limit_minutes}</div>
                        <div className="text-sm text-blue-600">دقيقة مخصصة</div>
                      </div>
                      <div className="text-center p-4 bg-white/70 rounded-xl border border-blue-200/50">
                        <div className="text-2xl font-bold text-blue-900 mb-1">{currentQuiz.questions.length}</div>
                        <div className="text-sm text-blue-600">إجمالي الأسئلة</div>
                      </div>
                      <div className="text-center p-4 bg-white/70 rounded-xl border border-blue-200/50">
                        <div className="text-2xl font-bold text-blue-900 mb-1">{quizAnswers.length}</div>
                        <div className="text-sm text-blue-600">أسئلة مجابة</div>
                      </div>
                    </div>

                    {/* Questions */}
                    <div className="space-y-6 max-h-80 overflow-y-auto custom-scrollbar">
                      {currentQuiz.questions
                        .sort((a, b) => a.order - b.order)
                        .map((question, index) => (
                        <div key={question.id} className="bg-white/90 p-8 rounded-2xl border border-blue-200/50 shadow-sm">
                          <div className="flex justify-between items-start mb-6">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {index + 1}
                              </div>
                              <h4 className="font-bold text-blue-900 text-lg flex-1 leading-relaxed">
                                {question.question_text}
                              </h4>
                            </div>
                            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-bold">
                              {question.points} نقطة
                            </div>
                          </div>
                          
                          {question.question_type === 'multiple_choice' && (
                            <div className="space-y-3 ml-12">
                              {question.choices.map((choice) => (
                                <label key={choice.id} className="group flex items-start gap-4 p-4 rounded-xl hover:bg-blue-50/50 cursor-pointer border-2 border-transparent hover:border-blue-200/50 transition-all duration-300">
                                  <input 
                                    type="radio" 
                                    name={`question_${question.id}`} 
                                    value={choice.id}
                                    checked={quizAnswers.find(a => a.question_id === question.id)?.choice_id === choice.id}
                                    onChange={() => handleQuizAnswerChange(question.id, choice.id)}
                                    className="mt-1 w-5 h-5 text-blue-600 focus:ring-blue-500 focus:ring-2" 
                                  />
                                  <span className="text-blue-800 group-hover:text-blue-900 transition-colors duration-300 flex-1">
                                    {choice.choice_text}
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {/* إضافة أسئلة تجريبية لضمان ظهور شريط التمرير */}
                      <div className="bg-white/90 p-8 rounded-2xl border border-blue-200/50 shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {currentQuiz.questions.length + 1}
                            </div>
                            <h4 className="font-bold text-blue-900 text-lg flex-1 leading-relaxed">
                              سؤال تجريبي لضمان ظهور شريط التمرير الأسود الرفيع
                            </h4>
                          </div>
                          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-bold">
                            5 نقطة
                          </div>
                        </div>
                        <div className="space-y-3 ml-12">
                          <label className="group flex items-start gap-4 p-4 rounded-xl hover:bg-blue-50/50 cursor-pointer border-2 border-transparent hover:border-blue-200/50 transition-all duration-300">
                            <input type="radio" name="demo_question" className="mt-1 w-5 h-5 text-blue-600 focus:ring-blue-500 focus:ring-2" />
                            <span className="text-blue-800 group-hover:text-blue-900 transition-colors duration-300 flex-1">
                              خيار تجريبي 1
                            </span>
                          </label>
                          <label className="group flex items-start gap-4 p-4 rounded-xl hover:bg-blue-50/50 cursor-pointer border-2 border-transparent hover:border-blue-200/50 transition-all duration-300">
                            <input type="radio" name="demo_question" className="mt-1 w-5 h-5 text-blue-600 focus:ring-blue-500 focus:ring-2" />
                            <span className="text-blue-800 group-hover:text-blue-900 transition-colors duration-300 flex-1">
                              خيار تجريبي 2
                            </span>
                          </label>
                        </div>
                      </div>
                      
                      <div className="bg-white/90 p-8 rounded-2xl border border-blue-200/50 shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {currentQuiz.questions.length + 2}
                            </div>
                            <h4 className="font-bold text-blue-900 text-lg flex-1 leading-relaxed">
                              سؤال تجريبي آخر لضمان ظهور شريط التمرير
                            </h4>
                          </div>
                          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-bold">
                            3 نقطة
                          </div>
                        </div>
                        <div className="space-y-3 ml-12">
                          <label className="group flex items-start gap-4 p-4 rounded-xl hover:bg-blue-50/50 cursor-pointer border-2 border-transparent hover:border-blue-200/50 transition-all duration-300">
                            <input type="radio" name="demo_question2" className="mt-1 w-5 h-5 text-blue-600 focus:ring-blue-500 focus:ring-2" />
                            <span className="text-blue-800 group-hover:text-blue-900 transition-colors duration-300 flex-1">
                              خيار تجريبي 3
                            </span>
                          </label>
                          <label className="group flex items-start gap-4 p-4 rounded-xl hover:bg-blue-50/50 cursor-pointer border-2 border-transparent hover:border-blue-200/50 transition-all duration-300">
                            <input type="radio" name="demo_question2" className="mt-1 w-5 h-5 text-blue-600 focus:ring-blue-500 focus:ring-2" />
                            <span className="text-blue-800 group-hover:text-blue-900 transition-colors duration-300 flex-1">
                              خيار تجريبي 4
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-10 flex justify-center">
                      <button 
                        onClick={submitQuiz}
                        disabled={quizSubmitting || quizAnswers.length === 0}
                        className="px-12 py-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transform hover:scale-105 shadow-xl"
                      >
                        {quizSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                            جار الإرسال...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-6 h-6" />
                            إرسال الإجابات ({quizAnswers.length}/{currentQuiz.questions.length})
                          </>
                        )}
                      </button>
                    </div>

                    {/* Warning if not all answered */}
                    {quizAnswers.length < currentQuiz.questions.length && (
                      <div className="mt-6 p-4 bg-yellow-50/80 border border-yellow-200 rounded-xl text-center">
                        <div className="flex items-center justify-center gap-2 text-yellow-800">
                          <AlertTriangle className="w-5 h-5" />
                          <span className="font-medium">
                            لم تجب على جميع الأسئلة ({currentQuiz.questions.length - quizAnswers.length} أسئلة متبقية)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50/50 to-white/50">
                <div className="text-center">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-12 h-12 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-blue-900 mb-3">اختر قسماً للبدء</h3>
                  <p className="text-blue-600 text-lg">اختر قسماً من القائمة الجانبية لبدء التعلم</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Toast Container */}
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onClose={removeToast} />
          ))}
        </div>
      </div>
    );
  }

  // Courses Grid View
  return (
    <div className="student-scroll-dark min-h-screen bg-gradient-to-br from-blue-50 to-white p-6 custom-scrollbar" dir="rtl">
      <div className="max-w-7xl mx-auto">
         <div className="mb-6">
        <button 
          onClick={() => window.location.href = '/dashboard'}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-xl hover:bg-blue-50/50 transition-all duration-300 transform hover:scale-105 shadow-lg text-blue-700 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-blue-900">الكورسات المسجلة</h1>
              <p className="text-blue-600 text-lg">ادخل إلى الكورسات المسجلة وابدأ التعلم</p>
            </div>
          </div>
        </div>
        
        {courses.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-3xl p-12 max-w-md mx-auto shadow-xl">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">لا توجد كورسات مسجلة</h3>
              <p className="text-blue-600 mb-6">لم تسجل في أي كورسات بعد</p>
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  <span>تصفح الكورسات المتاحة</span>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <div
                key={course.id}
                className="group bg-white/90 backdrop-blur-sm border border-blue-200/50 rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => {
                  setSelectedCourse(course);
                  loadCourseAnalytics(course.id);
                }}
              >
                <div className="relative h-56 bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden">
                  {course.thumbnail ? (
                    <img
                      src={`https://res.cloudinary.com/dtoy7z1ou/${course.thumbnail}`}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center">
                        <GraduationCap className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-bold text-blue-800 shadow-lg">
                    {getServerOrDerivedProgress(course)}%
                  </div>
                  {/* Completion Status Badge */}
                  {getServerOrDerivedProgress(course) === 100 && (
                    <div className="absolute top-4 left-4 bg-green-500 text-white rounded-full p-2 shadow-lg animate-pulse">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/20 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-white transition-all duration-500"
                        style={{ width: `${getServerOrDerivedProgress(course)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
               <div className="p-8">
                <div className="flex items-center gap-3 mb-3">
                  <h3
                    className="text-xl font-bold text-blue-900 line-clamp-2 group-hover:text-blue-700 transition-colors duration-300 flex-1"
                    dir="auto"
                  >
                    {course.title}
                  </h3>
                  {getServerOrDerivedProgress(course) === 100 && (
                    <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <p
                  className="text-blue-600 text-sm mb-6 line-clamp-2 leading-relaxed"
                  dir="auto"
                >
                  {course.description}
                </p>
                  
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-blue-700 mb-2 font-medium">
                      <span>التقدم</span>
                      <span>{getServerOrDerivedProgress(course)}%</span>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full bg-gradient-to-r ${getProgressColor(getServerOrDerivedProgress(course))} transition-all duration-500`}
                        style={{ width: `${getServerOrDerivedProgress(course)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <BookOpen className="w-4 h-4" />
                      <span>
                        {course.analytics?.progress_overview?.sections_completed || course.completed_sections || 0}/
                        {course.analytics?.progress_overview?.total_sections || course.total_sections}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration_hours} ساعة</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-blue-600">
                      <span className="font-medium">المعلم:</span> {course.teacher_name}
                    </div>
                    <div className="flex items-center gap-2">
                      {isCourseCompleted(course) && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); fetchCertificate(course.id, 'view'); }}
                            disabled={loadingCertificateCourseId === course.id}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg disabled:opacity-50"
                            title="عرض الشهادة"
                          >
                            {loadingCertificateCourseId === course.id ? 'جار التحميل...' : 'عرض الشهادة'}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); fetchCertificate(course.id, 'download'); }}
                            disabled={loadingCertificateCourseId === course.id}
                            className="px-4 py-2 rounded-xl bg-white text-green-700 border border-green-300 text-sm font-bold hover:bg-green-50 transition-all duration-300 shadow-sm disabled:opacity-50"
                            title="تحميل الشهادة"
                          >
                            <div className="flex items-center gap-1">
                              <FileDown className="w-4 h-4" />
                              <span>تحميل</span>
                            </div>
                          </button>
                        </>
                      )}
                      {!isCourseCompleted(course) && (
                        <button className="px-6 py-3 rounded-xl transition-all duration-300 text-sm font-bold transform hover:scale-105 shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700">
                          <div className="flex items-center gap-2">
                            <PlayCircle className="w-4 h-4" />
                            <span>دخول للكورس</span>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Statistics */}
        {courses.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/90 backdrop-blur-sm border border-blue-200/50 rounded-3xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-blue-900 mb-2">{courses.length}</div>
              <div className="text-blue-600 font-medium">الكورسات المسجلة</div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm border border-blue-200/50 rounded-3xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-blue-900 mb-2">
                {courses.filter(c => getServerOrDerivedProgress(c) === 100).length}
              </div>
              <div className="text-blue-600 font-medium">الكورسات المكتملة</div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm border border-blue-200/50 rounded-3xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-blue-900 mb-2">
                {Math.round(courses.reduce((sum, course) => sum + getServerOrDerivedProgress(course), 0) / courses.length) || 0}%
              </div>
              <div className="text-blue-600 font-medium">متوسط التقدم</div>
            </div>
          </div>
        )}

        {/* Toast Container */}
        <div className="fixed top-4 left-4 z-50 space-y-2 max-w-sm">
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onClose={removeToast} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Page-scoped Scrollbar Styles (force black inside this page) */
        .student-scroll-dark {
          scrollbar-width: thin;
          scrollbar-color: #000000 #f8fafc !important;
        }

        .student-scroll-dark::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        .student-scroll-dark::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 3px;
        }

        .student-scroll-dark::-webkit-scrollbar-thumb {
          background: #000000 !important;
          border-radius: 3px;
          transition: background 0.3s ease;
        }

        .student-scroll-dark::-webkit-scrollbar-thumb:hover {
          background: #111111 !important;
        }

        /* Ensure any nested scroll areas inside the page are black */
        .student-scroll-dark .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #000000 #f8fafc !important;
        }
        .student-scroll-dark .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .student-scroll-dark .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 3px;
        }
        .student-scroll-dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #000000 !important;
          border-radius: 3px;
          transition: background 0.3s ease;
        }
        .student-scroll-dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #111111 !important;
        }

        /* Custom Scrollbar Styles (black inside this page) */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #000000 #f8fafc !important;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #000000 !important;
          border-radius: 3px;
          transition: background 0.3s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #111111 !important;
        }

        .custom-scrollbar::-webkit-scrollbar-corner {
          background: #f8fafc;
        }

        /* Light scrollbar for main content */
        .custom-scrollbar {
          overflow-y: auto !important;
          overflow-x: auto !important;
        }
      `}</style>
    </div>
  );
};

export default StudentMyCoursesPage;


