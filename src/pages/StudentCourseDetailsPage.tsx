import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Clock, 
  Users, 
  Star, 
  Play, 
  Download, 
  FileText, 
  HelpCircle, 
  CheckCircle, 
  AlertCircle,
  BookOpen,
  Video,
  FileDown,
  Award,
  MessageCircle,
  ArrowLeft
} from 'lucide-react';

interface CourseDetails {
  id: number;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  progress: number;
  total_lessons: number;
  completed_lessons: number;
  image?: string;
  sections: CourseSection[];
}

interface CourseSection {
  id: number;
  title: string;
  lessons: Lesson[];
}

interface Lesson {
  id: number;
  title: string;
  type: 'video' | 'document' | 'quiz';
  duration?: string;
  is_completed: boolean;
  file_url?: string;
  video_url?: string;
}

interface StudentCourseDetailsPageProps {
  courseId: string | number;
  courseTitle?: string;
}

const StudentCourseDetailsPage: React.FC<StudentCourseDetailsPageProps> = ({ 
  courseId, 
  courseTitle 
}) => {
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

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

  const loadCourseDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      const res = await authFetch(`/student/my-courses/${courseId}/`);
      
      if (!res || !res.ok) {
        setError('تعذر تحميل تفاصيل الكورس');
        return;
      }
      
      const data = await res.json();
      setCourse(data);
    } catch (e) {
      console.error('Error loading course details:', e);
      setError('حدث خطأ أثناء تحميل تفاصيل الكورس');
    } finally {
      setLoading(false);
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4 text-blue-500" />;
      case 'document':
        return <FileText className="w-4 h-4 text-green-500" />;
      case 'quiz':
        return <FileText className="w-4 h-4 text-purple-500" />;
      default:
        return <BookOpen className="w-4 h-4 text-gray-500" />;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const handleLessonAction = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    
    switch (lesson.type) {
      case 'video':
        if (lesson.video_url) {
          window.open(lesson.video_url, '_blank');
        }
        break;
      case 'document':
        if (lesson.file_url) {
          window.open(lesson.file_url, '_blank');
        }
        break;
      case 'quiz':
        // يمكن إضافة منطق بدء الاختبار هنا
        alert('سيتم فتح الاختبار قريباً');
        break;
    }
  };

  const handleSupportRequest = () => {
    // يمكن إضافة منطق طلب الدعم الفني هنا
    alert('سيتم فتح نموذج طلب الدعم الفني قريباً');
  };

  const handleDownloadCertificate = () => {
    // يمكن إضافة منطق تحميل الشهادة هنا
    alert('سيتم تحميل الشهادة قريباً');
  };

  const handleDownloadAttachments = () => {
    // يمكن إضافة منطق تحميل المرفقات هنا
    alert('سيتم تحميل المرفقات قريباً');
  };

  useEffect(() => {
    loadCourseDetails();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جار تحميل تفاصيل الكورس...</p>
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
          onClick={loadCourseDetails}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">الكورس غير موجود</h3>
        <p className="text-gray-600">لم يتم العثور على الكورس المطلوب</p>
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
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          العودة
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
        <p className="text-gray-600">{course.description}</p>
      </div>

      {/* معلومات الكورس */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{course.progress}%</div>
            <div className="text-sm text-gray-600">التقدم</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full ${getProgressColor(course.progress)}`}
                style={{ width: `${course.progress}%` }}
              ></div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {course.completed_lessons}/{course.total_lessons}
            </div>
            <div className="text-sm text-gray-600">الدروس المكتملة</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">{course.duration}</div>
            <div className="text-sm text-gray-600">المدة</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">{course.instructor}</div>
            <div className="text-sm text-gray-600">المعلم</div>
          </div>
        </div>
      </div>

      {/* أقسام الكورس */}
      <div className="space-y-6">
        {course.sections.map((section) => (
          <div key={section.id} className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {section.lessons.map((lesson) => (
                  <div 
                    key={lesson.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      lesson.is_completed 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getLessonIcon(lesson.type)}
                      <div>
                        <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                        {lesson.duration && (
                          <p className="text-sm text-gray-500">{lesson.duration}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {lesson.is_completed && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      <button 
                        onClick={() => handleLessonAction(lesson)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                      >
                        {lesson.type === 'video' ? 'مشاهدة' : 
                         lesson.type === 'document' ? 'تحميل' : 
                         'بدء الاختبار'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* أزرار إضافية */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={handleSupportRequest}
          className="flex items-center justify-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
        >
          <MessageCircle className="w-5 h-5 text-blue-600" />
          <span className="text-blue-700 font-medium">طلب دعم فني</span>
        </button>
        <button 
          onClick={handleDownloadCertificate}
          className="flex items-center justify-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition"
        >
          <Award className="w-5 h-5 text-green-600" />
          <span className="text-green-700 font-medium">الشهادة النهائية (PDF)</span>
        </button>
        <button 
          onClick={handleDownloadAttachments}
          className="flex items-center justify-center gap-2 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition"
        >
          <Download className="w-5 h-5 text-purple-600" />
          <span className="text-purple-700 font-medium">تحميل المرفقات</span>
        </button>
      </div>

      {/* نافذة الدرس المحدد */}
      {selectedLesson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{selectedLesson.title}</h3>
                <button 
                  onClick={() => setSelectedLesson(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              {selectedLesson.type === 'video' && selectedLesson.video_url && (
                <div className="aspect-video bg-gray-100 rounded-lg mb-4">
                  <iframe
                    src={selectedLesson.video_url}
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                  />
                </div>
              )}
              
              {selectedLesson.type === 'document' && (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">مستند: {selectedLesson.title}</p>
                  {selectedLesson.file_url && (
                    <a 
                      href={selectedLesson.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Download className="w-4 h-4" />
                      تحميل المستند
                    </a>
                  )}
                </div>
              )}
              
              {selectedLesson.type === 'quiz' && (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">اختبار: {selectedLesson.title}</p>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                    بدء الاختبار
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StudentCourseDetailsPage;




