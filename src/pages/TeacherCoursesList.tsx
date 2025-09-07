import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Play, 
  Clock, 
  Users, 
  Star, 
  ChevronRight, 
  Plus,
  Search,
  Grid3X3,
  List,
  Eye,
  Edit,
  Trash2,
  ArrowRight
} from 'lucide-react';

const API_BASE = '';

interface Course {
  id: number | string;
  title: string;
  description?: string;
  thumbnail?: string;
  status?: string;
  difficulty?: string;
  price?: string;
  duration_hours?: number;
  created_at?: string;
  students_count?: number;
  rating?: number;
  total_lessons?: number;
}

interface Props {
  onOpenCourse?: (course: Course) => void;
}

const TeacherCoursesList: React.FC<Props> = ({ onOpenCourse }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [, setSelectedCourse] = useState<Course | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setError('يجب تسجيل الدخول أولاً');
          setLoading(false);
          return;
        }
        const res = await fetch(`${API_BASE}/teacher/courses/`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'تعذر تحميل الدورات');
        }
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : (data?.results || []));
      } catch (e: any) {
        setError(e?.message || 'حدث خطأ غير متوقع');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    if (onOpenCourse) {
      onOpenCourse(course);
    }
  };

  // Filter courses based on search and status
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || course.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">جار تحميل الدورات...</p>
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
                  دوراتي التعليمية
                </h1>
                <p className="text-gray-600 text-sm">إدارة وتنظيم المحتوى التعليمي</p>
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
                <span>دورة جديدة</span>
              </motion.button>
            </motion.div>
          </div>

          {/* Search and Filter Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 flex flex-col lg:flex-row gap-3"
          >
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="البحث في الدورات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400"
              />
            </div>

            {/* Filter and View Controls */}
            <div className="flex items-center space-x-3 space-x-reverse">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium"
              >
                <option value="all">جميع الدورات</option>
                <option value="published">منشورة</option>
                <option value="draft">مسودات</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <List className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredCourses.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <BookOpen className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {searchQuery || filterStatus !== 'all' ? 'لا توجد نتائج' : 'لا توجد دورات بعد'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchQuery || filterStatus !== 'all' 
                ? 'جرب البحث بكلمات مختلفة أو غير الفلتر' 
                : 'ابدأ بإنشاء دورة جديدة لطلابك'
              }
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center space-x-2 space-x-reverse bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                <span>إنشاء دورة جديدة</span>
              </motion.button>
            )}
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
                : 'space-y-4'
              }
            >
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -8, scale: 1.03 }}
                  className={`group cursor-pointer ${
                    viewMode === 'grid' 
                      ? 'bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-200/60 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden' 
                      : 'bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/60 shadow-lg hover:shadow-xl transition-all duration-500'
                  }`}
                  onClick={() => handleCourseSelect(course)}
                >
                  {viewMode === 'grid' ? (
                    // Grid View
                    <>
                      {/* Course Thumbnail */}
                      <div className="relative h-48 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 overflow-hidden">
                        {course.thumbnail ? (
                          <img 
                            src={course.thumbnail} 
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-16 h-16 text-blue-500" />
                          </div>
                        )}
                        
                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
                            course.status === 'published' 
                              ? 'bg-green-500 text-white' 
                              : 'bg-amber-500 text-white'
                          }`}>
                            {course.status === 'published' ? 'منشور' : 'مسودة'}
                          </span>
                        </div>

                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                          <motion.div 
                            whileHover={{ scale: 1.1 }}
                            className="w-16 h-16 bg-white/95 rounded-full flex items-center justify-center shadow-2xl"
                          >
                            <Play className="w-8 h-8 text-blue-600 ml-1" />
                          </motion.div>
                        </div>
                      </div>

                      {/* Course Content */}
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                          {course.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                          {course.description || 'لا يوجد وصف للدورة'}
                        </p>

                        {/* Course Stats */}
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                          <div className="flex items-center space-x-1 space-x-reverse bg-gray-50 px-2 py-1 rounded-lg">
                            <Clock className="w-3 h-3 text-blue-500" />
                            <span className="font-medium">{course.duration_hours || 0} ساعة</span>
                          </div>
                          <div className="flex items-center space-x-1 space-x-reverse bg-gray-50 px-2 py-1 rounded-lg">
                            <Users className="w-3 h-3 text-green-500" />
                            <span className="font-medium">{course.students_count || 0}</span>
                          </div>
                          {course.rating && (
                            <div className="flex items-center space-x-1 space-x-reverse bg-gray-50 px-2 py-1 rounded-lg">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="font-medium">{course.rating}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center space-x-1 space-x-reverse text-blue-600 hover:text-blue-700 font-semibold text-sm"
                          >
                            <span>عرض الدورة</span>
                            <ChevronRight className="w-4 h-4" />
                          </motion.button>
                          
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-300"
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
                    </>
                  ) : (
                    // List View
                    <div className="flex items-center space-x-4 space-x-reverse p-6">
                      {/* Thumbnail */}
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden shadow-lg">
                        {course.thumbnail ? (
                          <img 
                            src={course.thumbnail} 
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <BookOpen className="w-10 h-10 text-blue-500" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-300">
                              {course.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                              {course.description || 'لا يوجد وصف للدورة'}
                            </p>
                            
                            {/* Stats */}
                            <div className="flex items-center space-x-4 space-x-reverse text-xs text-gray-500">
                              <div className="flex items-center space-x-1 space-x-reverse bg-gray-50 px-2 py-1 rounded-lg">
                                <Clock className="w-3 h-3 text-blue-500" />
                                <span className="font-medium">{course.duration_hours || 0} ساعة</span>
                              </div>
                              <div className="flex items-center space-x-1 space-x-reverse bg-gray-50 px-2 py-1 rounded-lg">
                                <Users className="w-3 h-3 text-green-500" />
                                <span className="font-medium">{course.students_count || 0} طالب</span>
                              </div>
                              {course.rating && (
                                <div className="flex items-center space-x-1 space-x-reverse bg-gray-50 px-2 py-1 rounded-lg">
                                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                  <span className="font-medium">{course.rating}</span>
          </div>
                              )}
                            </div>
                          </div>

                          {/* Status and Actions */}
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
                              course.status === 'published' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {course.status === 'published' ? 'منشور' : 'مسودة'}
                            </span>
                            
                            <div className="flex items-center space-x-1 space-x-reverse">
                              <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-300"
                              >
                                <Eye className="w-4 h-4" />
                              </motion.button>
                              <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-300"
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
                      </div>
          </div>
                  )}
                </motion.div>
      ))}
            </motion.div>
          </AnimatePresence>
      )}
      </div>
    </div>
  );
};

export default TeacherCoursesList;


