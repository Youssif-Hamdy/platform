import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  FileText, 
  Download, 
  Clock, 
  Eye, 
  Plus,
  Edit,
  Trash2,
  Video,
  File,
  HelpCircle,
  Users,
  Star,
  BarChart3,
  ArrowRight,
  Play,
  Award,
  Menu,
  X
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
      {/* Sidebar - قائمة الأقسام */}
      <motion.div
        initial={false}
        animate={{ width: sidebarCollapsed ? 64 : 320 }}
        className="bg-white border-r border-gray-200 flex flex-col"
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
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {courseTitle || 'تفاصيل الكورس'}
              </h1>
              <p className="text-gray-600 mt-1">
                {selectedSection ? `القسم: ${selectedSection.title}` : 'اختر قسماً لعرض محتواه'}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.href = '/dashboard'}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة للداشبورد</span>
            </motion.button>
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
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedSection.title}</h2>
                      {selectedSection.description && (
                        <p className="text-gray-600 mt-1">{selectedSection.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {onAddQuiz && (
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onAddQuiz(selectedSection.title)} 
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إضافة اختبار</span>
                      </motion.button>
                    )}
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-600">المدة</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{selectedSection.duration_minutes || 0} دقيقة</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Eye className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-600">المشاهدات</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{selectedSection.total_views || 0}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart3 className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium text-gray-600">الترتيب</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{selectedSection.order || 0}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
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
                      المحتوى النصي
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
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
                      الفيديو التعليمي
                    </h3>
                    <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
                      <div className="text-center">
                        <Play className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">معاينة الفيديو</p>
                        <p className="text-sm text-gray-500 mt-1">انقر للتشغيل</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* PDF Content */}
                {selectedSection.pdf_file && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <File className="w-5 h-5 text-red-500" />
                      ملف PDF
                    </h3>
                    <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-3 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg text-lg transition-colors"
                      >
                        <Download className="w-5 h-5" />
                        <span>تحميل الملف</span>
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* Quiz Section */}
                {selectedSection.quiz && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-blue-600" />
                      معلومات الاختبار
                    </h3>
                    
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
                      <h4 className="font-semibold text-gray-900 mb-1">{selectedSection.quiz.title}</h4>
                      {selectedSection.quiz.description && (
                        <p className="text-gray-700 text-sm">{selectedSection.quiz.description}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-600">الوقت المحدد</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{selectedSection.quiz.time_limit_minutes} دقيقة</p>
                      </div>
                      
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-gray-600">درجة النجاح</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{selectedSection.quiz.passing_score}%</p>
                      </div>
                      
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-purple-500" />
                          <span className="text-sm font-medium text-gray-600">عدد المحاولات</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{selectedSection.quiz.total_attempts || 0}</p>
                      </div>
                      
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium text-gray-600">متوسط الدرجات</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{selectedSection.quiz.average_score || '0%'}</p>
                      </div>
                      
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <HelpCircle className="w-4 h-4 text-indigo-500" />
                          <span className="text-sm font-medium text-gray-600">عدد الأسئلة</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{selectedSection.quiz.question_count || 0}</p>
                      </div>
                      
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
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
    </div>
  );
};

export default TeacherCourseDetails;