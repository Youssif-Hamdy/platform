import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  FileText, 
  Download, 
  Clock, 
  Eye, 
  Plus,

  Video,
  File,
  HelpCircle,
  Users,
  Star,
  BarChart3,
  ArrowRight,
  Award,
  Menu,
  X,
  Upload,
  Archive,
  CheckCircle
} from 'lucide-react';

const API_BASE = '';

interface Section {
  id: number | string;
  title: string;
  description?: string;
  content_type?: string;
  content?: string;
  video_file?: string;
  pdf_file?: string;
  order?: number;
  duration_minutes?: number;
  total_views?: number;
}

interface DetailedSection extends Section {
  quiz?: {
    id: string | number;
    title: string;
    description?: string;
    time_limit_minutes?: number;
    passing_score?: number;
    max_attempts?: number;
    shuffle_questions?: boolean;
    total_attempts?: number;
    average_score?: string;
    questions?: any[];
    question_count?: number;
  };
}

interface Course {
  id: number | string;
  title: string;
  description?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

interface Props {
  courseId: string | number;
  courseTitle?: string;
  onAddQuiz?: (sectionTitle: string) => void;
}

const TeacherCourseDetails: React.FC<Props> = ({ courseId, courseTitle, onAddQuiz }) => {
  const [sections, setSections] = useState<DetailedSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSection, setSelectedSection] = useState<DetailedSection | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setError('يجب تسجيل الدخول أولاً');
          setLoading(false);
          return;
        }
        
        // جلب معلومات الدورة
        const courseRes = await fetch(`${API_BASE}/teacher/courses/${encodeURIComponent(String(courseId))}/`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
        
        if (courseRes.ok) {
          const courseData = await courseRes.json();
          setCourse(courseData);
        }
        
        // جلب أقسام الدورة
        const res = await fetch(`${API_BASE}/teacher/courses/${encodeURIComponent(String(courseId))}/sections/`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || 'تعذر جلب أقسام الكورس');
        }
        const data = await res.json();
        const basicSections = Array.isArray(data) ? data : (data?.results || []);
        setSections(basicSections);
        // تحديد أول قسم كافتراضي
        if (basicSections.length > 0) {
          setSelectedSection(basicSections[0]);
        }
      } catch (e: any) {
        setError(e?.message || 'حدث خطأ غير متوقع');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [courseId]);

  const fetchSectionDetails = async (sectionId: string | number) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const res = await fetch(`${API_BASE}/teacher/sections/${encodeURIComponent(String(sectionId))}/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      
      if (res.ok) {
        const detailedSection = await res.json();
        setSections(prev => prev.map(s => 
          s.id === sectionId ? { ...s, ...detailedSection } : s
        ));
        return detailedSection;
      }
    } catch (error) {
      console.error('Error fetching section details:', error);
    }
  };

  const handleSectionClick = async (section: DetailedSection) => {
    setSelectedSection(section);
    
    // إذا لم نحمل التفاصيل بعد، احضرها
    if (!section.quiz) {
      const detailedSection = await fetchSectionDetails(section.id);
      if (detailedSection) {
        setSelectedSection({ ...section, ...detailedSection });
      }
    }
  };

  // دالة نشر الدورة
  const handlePublishCourse = async () => {
    try {
      setIsPublishing(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('يجب تسجيل الدخول أولاً');
        return;
      }

      const response = await fetch(`${API_BASE}/teacher/courses/${encodeURIComponent(String(courseId))}/publish/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStatusMessage(data.message || 'تم نشر الدورة بنجاح');
        setShowStatusModal(true);
        // تحديث حالة الدورة
        if (course) {
          setCourse({ ...course, status: 'published' });
        }
      } else {
        const errorData = await response.json();
        setStatusMessage(errorData.detail || 'فشل في نشر الدورة');
        setShowStatusModal(true);
      }
    } catch (error) {
      setStatusMessage('حدث خطأ في الاتصال بالخادم');
      setShowStatusModal(true);
    } finally {
      setIsPublishing(false);
    }
  };

  // دالة أرشفة الدورة
  const handleArchiveCourse = async () => {
    try {
      setIsArchiving(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('يجب تسجيل الدخول أولاً');
        return;
      }

      const response = await fetch(`${API_BASE}/teacher/courses/${encodeURIComponent(String(courseId))}/archive/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStatusMessage(data.message || 'تم أرشفة الدورة بنجاح');
        setShowStatusModal(true);
        // تحديث حالة الدورة
        if (course) {
          setCourse({ ...course, status: 'archived' });
        }
      } else {
        const errorData = await response.json();
        setStatusMessage(errorData.detail || 'فشل في أرشفة الدورة');
        setShowStatusModal(true);
      }
    } catch (error) {
      setStatusMessage('حدث خطأ في الاتصال بالخادم');
      setShowStatusModal(true);
    } finally {
      setIsArchiving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جار تحميل محتوى الدورة...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white p-8 rounded-2xl shadow-sm max-w-md w-full"
        >
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-xl">⚠️</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">حدث خطأ</h2>
          <p className="text-red-600 text-sm">{error}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-black/50" />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute right-0 top-0 bottom-0 w-4/5 max-w-sm bg-white border-l border-gray-200 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 text-sm">أقسام الكورس</h2>
                    <p className="text-xs text-gray-600">{sections.length} قسم</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  aria-label="إغلاق القائمة الجانبية"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-2 overflow-y-auto flex-1">
                {sections.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">لا توجد أقسام</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {sections.map((section, index) => (
                      <motion.button
                        key={section.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => {
                          handleSectionClick(section);
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full text-right p-3 rounded-lg transition-all duration-200 ${
                          selectedSection?.id === section.id 
                            ? 'bg-blue-50 border border-blue-200 text-blue-900' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {section.content_type === 'video' ? (
                            <Video className="w-4 h-4 text-blue-500" />
                          ) : section.content_type === 'pdf' ? (
                            <File className="w-4 h-4 text-red-500" />
                          ) : (
                            <FileText className="w-4 h-4 text-green-500" />
                          )}
                          <span className="font-medium text-sm truncate flex-1">{section.title}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{section.duration_minutes || 0} دقيقة</span>
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs">{section.order || 0}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Sidebar - قائمة الأقسام (تظهر فقط على الشاشات الكبيرة) */}
      <motion.div
        initial={false}
        animate={{ width: sidebarCollapsed ? 64 : 320 }}
        className="hidden lg:flex bg-white border-r border-gray-200 flex-col"
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 text-sm">أقسام الكورس</h2>
                  <p className="text-xs text-gray-600">{sections.length} قسم</p>
                </div>
              </motion.div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </button>
          </div>

          {!sidebarCollapsed && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="w-full mt-3 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة قسم جديد</span>
            </motion.button>
          )}
        </div>

        {/* Sections List */}
        <div className="flex-1 overflow-y-auto p-2">
          {sections.length === 0 ? (
            !sidebarCollapsed && (
              <div className="text-center py-8">
                <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">لا توجد أقسام</p>
              </div>
            )
          ) : (
            <div className="space-y-1">
              {sections.map((section, index) => (
                <motion.button
                  key={section.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSectionClick(section)}
                  className={`w-full text-right p-3 rounded-lg transition-all duration-200 ${
                    selectedSection?.id === section.id 
                      ? 'bg-blue-50 border border-blue-200 text-blue-900' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {sidebarCollapsed ? (
                    <div className="flex justify-center">
                      {section.content_type === 'video' ? (
                        <Video className="w-5 h-5 text-blue-500" />
                      ) : section.content_type === 'pdf' ? (
                        <File className="w-5 h-5 text-red-500" />
                      ) : (
                        <FileText className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {section.content_type === 'video' ? (
                          <Video className="w-4 h-4 text-blue-500" />
                        ) : section.content_type === 'pdf' ? (
                          <File className="w-4 h-4 text-red-500" />
                        ) : (
                          <FileText className="w-4 h-4 text-green-500" />
                        )}
                        <span className="font-medium text-sm truncate">{section.title}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{section.duration_minutes || 0} دقيقة</span>
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {section.order || 0}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start justify-between lg:justify-start gap-3">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                aria-label="فتح القائمة الجانبية"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {course?.title || courseTitle || 'تفاصيل الكورس'}
                  </h1>
                  {course?.status && (
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      course.status === 'published' 
                        ? 'bg-green-100 text-green-700' 
                        : course.status === 'archived'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {course.status === 'published' ? 'منشور' : 
                       course.status === 'archived' ? 'مؤرشف' : 'مسودة'}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm">
                  {selectedSection ? `القسم: ${selectedSection.title}` : 'اختر قسماً لعرض محتواه'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* أزرار النشر والأرشفة */}
              {course?.status !== 'published' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePublishCourse}
                  disabled={isPublishing}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPublishing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">
                    {isPublishing ? 'جاري النشر...' : 'نشر الدورة'}
                  </span>
                </motion.button>
              )}
              
              {course?.status === 'published' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleArchiveCourse}
                  disabled={isArchiving}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isArchiving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Archive className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">
                    {isArchiving ? 'جاري الأرشفة...' : 'أرشفة الدورة'}
                  </span>
                </motion.button>
              )}

              {onAddQuiz && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onAddQuiz(selectedSection ? selectedSection.title : (courseTitle || ''))}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium">إضافة اختبار</span>
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = '/dashboard'}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                <span className="text-sm font-medium">العودة للداشبورد</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Content Display */}
        <div className="flex-1 overflow-y-auto">
          {selectedSection ? (
            <motion.div
              key={selectedSection.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6"
            >
              {/* Section Header */}
             <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                      {selectedSection.content_type === 'video' ? (
                        <Video className="w-6 h-6 text-blue-500" />
                      ) : selectedSection.content_type === 'pdf' ? (
                        <File className="w-6 h-6 text-red-500" />
                      ) : (
                        <FileText className="w-6 h-6 text-green-500" />
                      )}
                    </div>
                    <div className="text-right w-full">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 break-words">
                        {selectedSection.title}
                      </h2>
                      {selectedSection.description && (
                        <p
                          dir="auto"  /* يحدد الاتجاه تلقائي حسب اللغة */
                          className="hidden lg:block mt-1 leading-relaxed break-words text-gray-700"
                        >
                          {selectedSection.description}
                        </p>
                      )}
                    </div>
                  </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* عرض الوصف داخل مودال للموبايل */}
                    <button
                    onClick={() => setShowDescriptionModal(true)}
                    className="
                      inline-flex items-center gap-2 px-3 py-2 text-sm 
                      border border-gray-200 rounded-lg 
                      text-gray-700 hover:bg-gray-50
                      sm:hidden   /* يخفي الزر من أول شاشات أكبر من الموبايل */
                    "
                    aria-label="عرض الوصف"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="whitespace-nowrap">عرض الوصف</span>
                  </button>


                 

                 

                
                </div>

                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-600">المدة</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{selectedSection.duration_minutes || 0} دقيقة</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-600">المشاهدات</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{selectedSection.total_views || 0}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium text-gray-600">الترتيب</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{selectedSection.order || 0}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium text-gray-600">النوع</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {selectedSection.content_type === 'video' ? 'فيديو' :
                       selectedSection.content_type === 'pdf' ? 'PDF' : 'نص'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content Sections */}
              <div className="space-y-6">
                {/* Text Content */}
                {selectedSection.content && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-500" />
                      <span>المحتوى النصي</span>
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                      <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-right break-words">
                        {selectedSection.content}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Video Content */}
                {selectedSection.video_file && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Video className="w-5 h-5 text-blue-500" />
                      <span>الفيديو التعليمي</span>
                    </h3>
                    <div className="bg-gray-100 rounded-lg aspect-video overflow-hidden">
                      <video
                        src={`https://res.cloudinary.com/dtoy7z1ou/${selectedSection.video_file}`}
                        controls
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  </div>
                )}


                {/* PDF Content */}
                {selectedSection.pdf_file && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <File className="w-5 h-5 text-red-500" />
                      <span>ملف PDF</span>
                    </h3>
                    <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
                      <motion.a 
                        whileHover={{ scale: 1.05 }}
                        href={`https://res.cloudinary.com/dtoy7z1ou/${selectedSection.pdf_file.replace("upload/", "upload/fl_attachment/")}`}
                        download
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg text-lg transition-colors"
                      >
                        <Download className="w-5 h-5" />
                        <span>تحميل الملف</span>
                      </motion.a>
                    </div>
                  </div>
                )}


                {/* Quiz Section */}
                {selectedSection.quiz && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-blue-600" />
                      <span>معلومات الاختبار</span>
                    </h3>
                    
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
                      <h4 className="font-semibold text-gray-900 mb-2">{selectedSection.quiz.title}</h4>
                      {selectedSection.quiz.description && (
                        <p className="text-gray-700 text-sm leading-relaxed">{selectedSection.quiz.description}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-600">الوقت المحدد</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{selectedSection.quiz.time_limit_minutes} دقيقة</p>
                      </div>
                      
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-gray-600">درجة النجاح</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{selectedSection.quiz.passing_score}%</p>
                      </div>
                      
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-purple-500" />
                          <span className="text-sm font-medium text-gray-600">عدد المحاولات</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{selectedSection.quiz.total_attempts || 0}</p>
                      </div>
                      
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium text-gray-600">متوسط الدرجات</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{selectedSection.quiz.average_score || '0%'}</p>
                      </div>
                      
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <HelpCircle className="w-4 h-4 text-indigo-500" />
                          <span className="text-sm font-medium text-gray-600">عدد الأسئلة</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{selectedSection.quiz.question_count || 0}</p>
                      </div>
                      
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="w-4 h-4 text-orange-500" />
                          <span className="text-sm font-medium text-gray-600">الحد الأقصى للمحاولات</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{selectedSection.quiz.max_attempts || 'غير محدود'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">اختر قسماً لعرض محتواه</h3>
                <p className="text-gray-500">انقر على أي قسم من الشريط الجانبي لعرض تفاصيله</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Modal */}
      <AnimatePresence>
        {showStatusModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowStatusModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">تم بنجاح</h3>
                <p className="text-gray-600 mb-6">{statusMessage}</p>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  موافق
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Description Modal */}
      <AnimatePresence>
        {showDescriptionModal && selectedSection?.description && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDescriptionModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">وصف القسم</h3>
                <button
                  onClick={() => setShowDescriptionModal(false)}
                  className="w-9 h-9 inline-flex items-center justify-center rounded-lg hover:bg-gray-100"
                  aria-label="إغلاق"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="text-right text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                {selectedSection.description}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherCourseDetails;