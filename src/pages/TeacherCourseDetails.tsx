import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  FileText, 
  Download, 
  Clock, 
  Eye, 
  ChevronDown, 
  Plus,
  Edit,
  Trash2,
  Video,
  File,
  HelpCircle,
  Users,
  Star,
  BarChart3,
  ArrowRight
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
  const [expandedSection, setExpandedSection] = useState<string | number | null>(null);

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
      }
    } catch (error) {
      console.error('Error fetching section details:', error);
    }
  };

  const toggleSection = (sectionId: string | number) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectionId);
      // Fetch detailed section data if not already loaded
      const section = sections.find(s => s.id === sectionId);
      if (section && !section.quiz) {
        fetchSectionDetails(sectionId);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">جار تحميل محتوى الدورة...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white p-8 rounded-2xl shadow-lg"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">حدث خطأ</h2>
          <p className="text-red-600">{error}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-40 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Title Section */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center space-x-3 space-x-reverse"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {courseTitle || 'تفاصيل الكورس'}
                </h1>
                <p className="text-gray-600 text-sm">محتوى وأقسام الدورة التعليمية</p>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-2 space-x-reverse"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/dashboard'}
                className="flex items-center space-x-2 space-x-reverse bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ArrowRight className="w-4 h-4" />
                <span>العودة للداشبورد</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 space-x-reverse bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة قسم</span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {sections.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <BookOpen className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">لا توجد أقسام بعد</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              ابدأ بإضافة أقسام للدورة لتنظيم المحتوى التعليمي
            </p>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center space-x-2 space-x-reverse bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              <span>إضافة قسم جديد</span>
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-200/60 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden"
              >
                {/* Section Header */}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => toggleSection(section.id)}
                      className="flex-1 text-right hover:bg-gray-50 p-3 rounded-xl transition-all duration-300 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                            {section.content_type === 'video' ? (
                              <Video className="w-5 h-5 text-blue-600" />
                            ) : section.content_type === 'pdf' ? (
                              <File className="w-5 h-5 text-blue-600" />
                            ) : (
                              <FileText className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                              {section.title}
                            </h3>
                            {section.description && (
                              <p className="text-gray-600 mt-1 text-sm">{section.description}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                            {section.content_type || 'نص'}
                          </span>
                          <motion.div
                            animate={{ rotate: expandedSection === section.id ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          </motion.div>
                        </div>
                      </div>
                    </button>
                  </div>
                  
                  {onAddQuiz && (
                    <div className="mt-4">
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onAddQuiz(section.title)} 
                        className="flex items-center space-x-2 space-x-reverse px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg transition-all duration-300"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إضافة اختبار</span>
                      </motion.button>
                    </div>
                  )}
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedSection === section.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-200/60"
                    >
                      <div className="p-6 space-y-4">
                        {/* Content */}
                        {section.content && (
                          <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center space-x-2 space-x-reverse mb-3">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <h4 className="text-base font-semibold text-gray-900">المحتوى النصي</h4>
                            </div>
                            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                              {section.content}
                            </div>
                          </div>
                        )}
                        
                        {/* Video */}
                        {section.video_file && (
                          <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center space-x-2 space-x-reverse mb-3">
                              <Video className="w-4 h-4 text-blue-600" />
                              <h4 className="text-base font-semibold text-gray-900">الفيديو</h4>
                            </div>
                            <video controls className="w-full rounded-lg shadow-lg">
                              <source src={section.video_file} />
                            </video>
                          </div>
                        )}
                        
                        {/* PDF */}
                        {section.pdf_file && (
                          <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center space-x-2 space-x-reverse mb-3">
                              <File className="w-4 h-4 text-blue-600" />
                              <h4 className="text-base font-semibold text-gray-900">ملف PDF</h4>
                            </div>
                            <motion.a 
                              whileHover={{ scale: 1.05 }}
                              href={section.pdf_file} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center space-x-2 space-x-reverse bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                            >
                              <Download className="w-4 h-4" />
                              <span>تحميل الملف</span>
                            </motion.a>
                          </div>
                        )}

                        {/* Quiz */}
                        {section.quiz && (
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                            <div className="flex items-center space-x-2 space-x-reverse mb-3">
                              <HelpCircle className="w-4 h-4 text-blue-600" />
                              <h4 className="text-base font-semibold text-blue-900">الاختبار</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              <div className="bg-white/80 rounded-lg p-3">
                                <h5 className="font-semibold text-gray-900 mb-1 text-sm">{section.quiz.title}</h5>
                                {section.quiz.description && (
                                  <p className="text-gray-600 text-xs mb-2">{section.quiz.description}</p>
                                )}
                              </div>
                              <div className="bg-white/80 rounded-lg p-3">
                                <div className="flex items-center space-x-1 space-x-reverse mb-1">
                                  <Clock className="w-3 h-3 text-blue-500" />
                                  <span className="text-xs font-medium">الحد الزمني</span>
                                </div>
                                <p className="text-sm font-bold text-gray-900">{section.quiz.time_limit_minutes} دقيقة</p>
                              </div>
                              <div className="bg-white/80 rounded-lg p-3">
                                <div className="flex items-center space-x-1 space-x-reverse mb-1">
                                  <BarChart3 className="w-3 h-3 text-green-500" />
                                  <span className="text-xs font-medium">درجة النجاح</span>
                                </div>
                                <p className="text-sm font-bold text-gray-900">{section.quiz.passing_score}%</p>
                              </div>
                              <div className="bg-white/80 rounded-lg p-3">
                                <div className="flex items-center space-x-1 space-x-reverse mb-1">
                                  <Users className="w-3 h-3 text-purple-500" />
                                  <span className="text-xs font-medium">المحاولات</span>
                                </div>
                                <p className="text-sm font-bold text-gray-900">{section.quiz.total_attempts || 0}</p>
                              </div>
                              <div className="bg-white/80 rounded-lg p-3">
                                <div className="flex items-center space-x-1 space-x-reverse mb-1">
                                  <Star className="w-3 h-3 text-yellow-500" />
                                  <span className="text-xs font-medium">متوسط الدرجة</span>
                                </div>
                                <p className="text-sm font-bold text-gray-900">{section.quiz.average_score || '0%'}</p>
                              </div>
                              <div className="bg-white/80 rounded-lg p-3">
                                <div className="flex items-center space-x-1 space-x-reverse mb-1">
                                  <HelpCircle className="w-3 h-3 text-indigo-500" />
                                  <span className="text-xs font-medium">عدد الأسئلة</span>
                                </div>
                                <p className="text-sm font-bold text-gray-900">{section.quiz.question_count || 0}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Section Stats */}
                        <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center space-x-4 space-x-reverse">
                            <div className="flex items-center space-x-1 space-x-reverse">
                              <span className="font-medium">الترتيب:</span>
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs">{section.order || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1 space-x-reverse">
                              <Clock className="w-3 h-3" />
                              <span>{section.duration_minutes || 0} دقيقة</span>
                            </div>
                            <div className="flex items-center space-x-1 space-x-reverse">
                              <Eye className="w-3 h-3" />
                              <span>{section.total_views || 0} مشاهدة</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-all duration-300"
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all duration-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherCourseDetails;
