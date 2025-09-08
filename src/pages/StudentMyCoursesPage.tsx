import React, { useState, useEffect } from 'react';
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
  Target,
  Star,
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
  const [sectionExplanations, setSectionExplanations] = useState<{[key: string]: string}>({});
  const [loadingExplanation, setLoadingExplanation] = useState<{[key: string]: boolean}>({});
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [loadingQuiz, setLoadingQuiz] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const navigate = useNavigate();

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
      setError('');
      
      const res = await authFetch('/student/my-courses/');
      
      if (!res || !res.ok) {
        setError('تعذر تحميل الكورسات المسجلة');
        addToast('error', 'فشل في تحميل الكورسات المسجلة');
        return;
      }
      
      const data = await res.json();
      const coursesData = data.results || data || [];
      
      const coursesWithProgress = coursesData.map((course: Course) => ({
        ...course,
        progress: calculateCourseProgress(course),
        completed_sections: course.sections?.filter(s => s.is_completed).length || 0
      }));
      
      setCourses(coursesWithProgress);
      if (coursesWithProgress.length > 0) {
        addToast('success', `تم تحميل ${coursesWithProgress.length} كورس بنجاح`);
      }
    } catch (e) {
      console.error('Error loading my courses:', e);
      setError('حدث خطأ أثناء تحميل الكورسات المسجلة');
      addToast('error', 'حدث خطأ أثناء تحميل الكورسات');
    } finally {
      setLoading(false);
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

  const calculateCourseProgress = (course: Course): number => {
    if (!course.sections || course.sections.length === 0) return 0;
    const completedSections = course.sections.filter(s => s.is_completed).length;
    return Math.round((completedSections / course.sections.length) * 100);
  };

  const loadSectionExplanation = async (courseId: number, sectionOrder: number) => {
    const key = `${courseId}-${sectionOrder}`;
    
    if (sectionExplanations[key] || loadingExplanation[key]) {
      return;
    }

    try {
      setLoadingExplanation(prev => ({ ...prev, [key]: true }));
      
      const res = await authFetch(`/student/course/${courseId}/section/${sectionOrder}/explain`);
      
      if (res && res.ok) {
        const data = await res.json();
        setSectionExplanations(prev => ({ 
          ...prev, 
          [key]: data.explanation || 'لا يوجد شرح متاح لهذا القسم' 
        }));
        addToast('success', 'تم تحميل الشرح بنجاح');
      } else {
        addToast('error', 'فشل في تحميل الشرح');
      }
    } catch (e) {
      console.error('Error loading section explanation:', e);
      setSectionExplanations(prev => ({ 
        ...prev, 
        [key]: 'حدث خطأ في تحميل شرح القسم' 
      }));
      addToast('error', 'حدث خطأ في تحميل الشرح');
    } finally {
      setLoadingExplanation(prev => ({ ...prev, [key]: false }));
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
          <p className="text-blue-800 font-medium">جار تحميل الكورسات المسجلة...</p>
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
      <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white px-6 py-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedCourse(null)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-700/50 hover:bg-blue-600/50 transition-all duration-300 transform hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden md:inline font-medium">العودة</span>
              </button>
              <div>
                <h1 className="text-xl font-bold truncate">{selectedCourse.title}</h1>
                <p className="text-blue-200 text-sm">المعلم: {selectedCourse.teacher_name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-3">
                <div className="text-right">
                  <div className="text-blue-200 text-sm">التقدم</div>
                  <div className="text-white font-bold">{selectedCourse.progress || 0}%</div>
                </div>
                <div className="w-32 bg-blue-700/50 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full bg-gradient-to-r from-white to-blue-200 transition-all duration-500"
                    style={{ width: `${selectedCourse.progress || 0}%` }}
                  ></div>
                </div>
              </div>
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-3 rounded-xl bg-blue-700/50 hover:bg-blue-600/50 transition-all duration-300 transform hover:scale-105 lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
         {/* Sidebar */}
{sidebarOpen && (
  <div className={`bg-white/90 backdrop-blur-xl border-r border-blue-200/50 flex flex-col overflow-hidden absolute lg:relative z-10 h-full lg:h-auto shadow-xl transition-all duration-300 ${
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
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
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
        <span>{selectedCourse.completed_sections || 0} من {selectedCourse.total_sections} مكتمل</span>
      </div>
    </div>

    {/* Sections List */}
    <div className="flex-1 overflow-y-auto">
      {selectedCourse.sections?.map((section, index) => (
        <div key={section.id} className="border-b border-blue-100/50 last:border-b-0">
          <button
            onClick={() => {
              setSelectedSection(section);
              setCurrentQuiz(null);
              if (window.innerWidth < 1024) setSidebarOpen(false);
            }}
            className={`w-full text-right p-4 hover:bg-blue-50/50 transition-all duration-300 group ${
              selectedSection?.id === section.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {section.is_completed ? (
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
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
                    {section.is_completed && (
                      <div className="flex items-center gap-1 text-blue-700">
                        <CheckCircle className="w-3 h-3" />
                        <span>مكتمل</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {!sidebarCollapsed && (
                <ChevronRight className="w-4 h-4 text-blue-400 group-hover:text-blue-600 transition-all duration-300" />
              )}
            </div>
          </button>
        </div>
      ))}
    </div>

    {/* Progress Summary - يظهر فقط عندما لا يكون السايدبار مصغرًا */}
    {!sidebarCollapsed && (
      <div className="p-6 bg-gradient-to-r from-blue-50 to-white border-t border-blue-200/50">
        <div className="mb-4">
          <div className="flex justify-between text-sm text-blue-700 mb-2">
            <span className="font-medium">التقدم الإجمالي</span>
            <span className="font-bold">{selectedCourse.progress || 0}%</span>
          </div>
          <div className="w-full bg-blue-200/50 rounded-full h-3">
            <div 
              className={`h-3 rounded-full bg-gradient-to-r ${getProgressColor(selectedCourse.progress || 0)} transition-all duration-500`}
              style={{ width: `${selectedCourse.progress || 0}%` }}
            ></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-white/70 rounded-xl p-3">
            <div className="text-lg font-bold text-blue-800">{selectedCourse.completed_sections || 0}</div>
            <div className="text-xs text-blue-600">أقسام مكتملة</div>
          </div>
          <div className="bg-white/70 rounded-xl p-3">
            <div className="text-lg font-bold text-blue-800">{selectedCourse.total_sections}</div>
            <div className="text-xs text-blue-600">إجمالي الأقسام</div>
          </div>
        </div>
      </div>
    )}
  </div>
)}

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedSection ? (
              <div className="flex-1 overflow-y-auto p-8">
                {/* Section Header */}
                <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-200/50">
                  <h1 className="text-3xl font-bold text-blue-900 mb-3">{selectedSection.title}</h1>
                  <p className="text-blue-600 mb-4 leading-relaxed">{selectedSection.description}</p>
                  
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
                    {selectedSection.is_completed && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg">
                        <CheckCircle className="w-4 h-4" />
                        <span>مكتمل</span>
                      </div>
                    )}
                  </div>
                </div>
                

                {/* Main Content */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200/50 overflow-hidden mb-8">
                  {selectedSection.content_type === 'video' && selectedSection.video_file && (
                    <div className="aspect-video bg-gradient-to-br from-blue-900 to-blue-800 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <PlayCircle className="w-10 h-10" />
                        </div>
                        <p className="text-lg font-medium mb-2">مشغل الفيديو</p>
                        <p className="text-sm text-blue-200">{selectedSection.video_file}</p>
                      </div>
                    </div>
                  )}

                  {selectedSection.content_type === 'text' && (
                    <div className="p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <BookOpen className="w-6 h-6 text-blue-500" />
                        <h3 className="text-xl font-semibold text-blue-900">المحتوى النصي</h3>
                      </div>
                      <div className="prose max-w-none text-blue-800 whitespace-pre-wrap leading-relaxed bg-blue-50/50 rounded-xl p-6">
                        {selectedSection.content}
                      </div>
                    </div>
                  )}

                  {selectedSection.content_type === 'pdf' && selectedSection.pdf_file && (
                    <div className="p-8 text-center">
                      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-10 h-10 text-blue-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-blue-900 mb-3">ملف PDF</h3>
                      <p className="text-blue-600 mb-6">انقر للتحميل أو المشاهدة</p>
                      <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                        <div className="flex items-center gap-2">
                          <FileDown className="w-5 h-5" />
                          <span>تحميل PDF</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* Section Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {/* Explanation */}
                  <button 
                    onClick={() => loadSectionExplanation(selectedCourse.id, selectedSection.order)}
                    className="group p-6 bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-2xl hover:bg-blue-50/50 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    disabled={loadingExplanation[`${selectedCourse.id}-${selectedSection.order}`]}
                  >
                    <div className="flex items-center justify-center gap-3">
                      {loadingExplanation[`${selectedCourse.id}-${selectedSection.order}`] ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-300 border-t-blue-600"></div>
                      ) : (
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-all duration-300">
                          <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                      )}
                      <div className="text-right">
                        <div className="font-semibold text-blue-900">عرض الشرح</div>
                        <div className="text-sm text-blue-600">شرح مفصل للقسم</div>
                      </div>
                    </div>
                  </button>

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

                  {/* Mark as Complete */}
                  {!selectedSection.is_completed && (
                    <button className="group p-6 bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-2xl hover:bg-blue-50/50 transition-all duration-300 transform hover:scale-105 shadow-lg">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-all duration-300">
                          <CheckCircle className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-blue-900">تسجيل كمكتمل</div>
                          <div className="text-sm text-blue-600">اتمام القسم</div>
                        </div>
                      </div>
                    </button>
                  )}
                </div>

                {/* Section Explanation */}
                {sectionExplanations[`${selectedCourse.id}-${selectedSection.order}`] && (
                  <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-200/50 rounded-2xl p-8 mb-8 shadow-lg animate-fade-in">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-blue-900">شرح القسم</h3>
                    </div>
                    <div className="text-blue-800 whitespace-pre-wrap leading-relaxed bg-white/70 rounded-xl p-6">
                      {sectionExplanations[`${selectedCourse.id}-${selectedSection.order}`]}
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
                    <div className="space-y-6">
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
                            <div className="space-y-3 mr-12">
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
        <div className="fixed top-4 left-4 z-50 space-y-2 max-w-sm">
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onClose={removeToast} />
          ))}
        </div>
      </div>
    );
  }

  // Courses Grid View
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
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
                onClick={() => setSelectedCourse(course)}
              >
                <div className="relative h-56 bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
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
                    {course.progress || 0}% مكتمل
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/20 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-white transition-all duration-500"
                        style={{ width: `${course.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="p-8">
                  <h3 className="text-xl font-bold text-blue-900 mb-3 line-clamp-2 group-hover:text-blue-700 transition-colors duration-300">
                    {course.title}
                  </h3>
                  <p className="text-blue-600 text-sm mb-6 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                  
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-blue-700 mb-2 font-medium">
                      <span>التقدم</span>
                      <span>{course.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full bg-gradient-to-r ${getProgressColor(course.progress || 0)} transition-all duration-500`}
                        style={{ width: `${course.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <BookOpen className="w-4 h-4" />
                      <span>{course.completed_sections || 0}/{course.total_sections}</span>
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
                    <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm font-bold transform hover:scale-105 shadow-lg">
                      <div className="flex items-center gap-2">
                        <PlayCircle className="w-4 h-4" />
                        <span>دخول للكورس</span>
                      </div>
                    </button>
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
                {courses.filter(c => (c.progress || 0) === 100).length}
              </div>
              <div className="text-blue-600 font-medium">الكورسات المكتملة</div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm border border-blue-200/50 rounded-3xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-blue-900 mb-2">
                {Math.round(courses.reduce((sum, course) => sum + (course.progress || 0), 0) / courses.length) || 0}%
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
      `}</style>
    </div>
  );
};

export default StudentMyCoursesPage;


