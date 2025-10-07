import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
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
  ArrowRight,
  ChevronLeft,
  Upload,
  Archive,
  CheckCircle
} from 'lucide-react';
import { LazySection } from '../utils/Perf';

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(9);
  const [isPublishing, setIsPublishing] = useState<{ [key: string]: boolean }>({});
  const [isArchiving, setIsArchiving] = useState<{ [key: string]: boolean }>({});
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

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
        const coursesData = Array.isArray(data) ? data : (data?.results || []);
        console.log('Courses data:', coursesData);
        console.log('First course thumbnail:', coursesData[0]?.thumbnail);
        
        // معالجة الصور لضمان عرضها من Cloudinary
        const processedCourses = coursesData.map((course: any) => {
          // معالجة خاصة للبيانات التجريبية
          if (course.thumbnail === 'string' || !course.thumbnail || course.thumbnail.trim() === '') {
            return {
              ...course,
              thumbnail: null
            };
          }
          
          return {
            ...course,
            thumbnail: course.thumbnail.startsWith('http') ? 
              course.thumbnail : 
              `https://res.cloudinary.com/dtoy7z1ou/${course.thumbnail}`
          };
        });
        
        console.log('Processed courses with thumbnails:', processedCourses);
        setCourses(processedCourses);
      } catch (e: any) {
        setError(e?.message || 'حدث خطأ غير متوقع');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleCourseSelect = (course: Course) => {
    if (onOpenCourse) {
      onOpenCourse(course);
    }
  };

  // دالة نشر الدورة
  const handlePublishCourse = async (courseId: string | number, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      setIsPublishing(prev => ({ ...prev, [courseId]: true }));
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
        await response.json();
        setStatusMessage('تم نشر الدورة بنجاح');
        setShowStatusModal(true);
        // تحديث حالة الدورة في القائمة
        setCourses(prev => prev.map(course => 
          course.id === courseId ? { ...course, status: 'published' } : course
        ));
      } else {
        const errorData = await response.json();
        setStatusMessage(errorData.detail || 'فشل في نشر الدورة');
        setShowStatusModal(true);
      }
    } catch (error) {
      setStatusMessage('حدث خطأ في الاتصال بالخادم');
      setShowStatusModal(true);
    } finally {
      setIsPublishing(prev => ({ ...prev, [courseId]: false }));
    }
  };

  // دالة أرشفة الدورة
  const handleArchiveCourse = async (courseId: string | number, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      setIsArchiving(prev => ({ ...prev, [courseId]: true }));
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
        await response.json();
        setStatusMessage('تم أرشفة الدورة بنجاح');
        setShowStatusModal(true);
        // تحديث حالة الدورة في القائمة
        setCourses(prev => prev.map(course => 
          course.id === courseId ? { ...course, status: 'archived' } : course
        ));
      } else {
        const errorData = await response.json();
        setStatusMessage(errorData.detail || 'فشل في أرشفة الدورة');
        setShowStatusModal(true);
      }
    } catch (error) {
      setStatusMessage('حدث خطأ في الاتصال بالخادم');
      setShowStatusModal(true);
    } finally {
      setIsArchiving(prev => ({ ...prev, [courseId]: false }));
    }
  };

  // Filter and sort courses
  const filteredAndSortedCourses = courses
    .filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = filterStatus === 'all' || course.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'students':
          return (b.students_count || 0) - (a.students_count || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'created_at':
        default:
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCourses.length / itemsPerPage);
  const paginatedCourses = filteredAndSortedCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getPaginationRange = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <p className="text-gray-800 text-xl font-semibold">جار تحميل الدورات...</p>
            <p className="text-gray-500 text-sm">يرجى الانتظار قليلاً</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-3xl shadow-xl max-w-md w-full">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-red-500 text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">حدث خطأ</h2>
          <p className="text-red-600 mb-6 leading-relaxed">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-300"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Simple Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">دوراتي التعليمية</h1>
                <p className="text-sm text-gray-600">{filteredAndSortedCourses.length} دورة</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                <span>العودة</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
                <span>دورة جديدة</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="البحث في الدورات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-right"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
              >
                <option value="all">جميع الدورات</option>
                <option value="published">منشورة</option>
                <option value="draft">مسودات</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
              >
                <option value="created_at">الأحدث</option>
                <option value="title">الاسم</option>
                <option value="students">عدد الطلاب</option>
                <option value="rating">التقييم</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {paginatedCourses.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {searchQuery || filterStatus !== 'all' ? 'لا توجد نتائج' : 'لا توجد دورات بعد'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
              {searchQuery || filterStatus !== 'all' 
                ? 'جرب البحث بكلمات مختلفة أو غير الفلتر' 
                : 'ابدأ بإنشاء دورة جديدة لطلابك'
              }
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                <Plus className="w-4 h-4" />
                <span>إنشاء دورة جديدة</span>
              </button>
            )}
          </div>
        ) : (
          <LazySection><div className="space-y-6">
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
            }>
              {paginatedCourses.map((course) => (
                <div
                  key={course.id}
                  className={`group cursor-pointer transition-all duration-300 ${
                    viewMode === 'grid' 
                      ? 'bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md overflow-hidden' 
                      : 'bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md'
                  }`}
                  onClick={() => handleCourseSelect(course)}
                >
                  {viewMode === 'grid' ? (
                    // Grid View
                    <>
                      {/* Course Thumbnail */}
                      <div className="relative h-40 bg-gray-100 overflow-hidden">
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-contain object-center bg-white"
                            onError={(e) => {
                              console.log('Image failed to load:', e.currentTarget.src);
                              e.currentTarget.style.display = 'none';
                              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                              if (nextElement) {
                                nextElement.style.display = 'flex';
                              }
                            }}
                            onLoad={(e) => {
                              console.log('Image loaded successfully:', e.currentTarget.src);
                              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                              if (nextElement) {
                                nextElement.style.display = 'none';
                              }
                            }}
                            loading="lazy"
                          />
                        ) : null}
                        <div className="w-full h-full flex items-center justify-center" style={{ display: course.thumbnail ? 'none' : 'flex' }}>
                          <BookOpen className="w-12 h-12 text-gray-400" />
                        </div>
                        
                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            course.status === 'published' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {course.status === 'published' ? 'منشور' : 'مسودة'}
                          </span>
                        </div>
                      </div>

                      {/* Course Content */}
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors text-right leading-tight">
                          {course.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed text-right">
                          {course.description || 'لا يوجد وصف للدورة'}
                        </p>

                        {/* Course Stats */}
                        <div className="flex items-center gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{course.duration_hours || 0} ساعة</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>{course.students_count || 0}</span>
                          </div>
                          {course.rating && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span>{course.rating}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between">
                          <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
                            <span>عرض الدورة</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          
                          <div className="flex items-center gap-1">
                            {course.status !== 'published' && (
                              <button 
                                onClick={(e) => handlePublishCourse(course.id, e)}
                                disabled={isPublishing[course.id]}
                                className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                title="نشر الدورة"
                              >
                                {isPublishing[course.id] ? (
                                  <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Upload className="w-4 h-4" />
                                )}
                              </button>
                            )}
                            
                            {course.status === 'published' && (
                              <button 
                                onClick={(e) => handleArchiveCourse(course.id, e)}
                                disabled={isArchiving[course.id]}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                title="أرشفة الدورة"
                              >
                                {isArchiving[course.id] ? (
                                  <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Archive className="w-4 h-4" />
                                )}
                              </button>
                            )}
                            
                            <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-all">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    // List View
                   <div className="flex items-center gap-4 p-4">
                      {/* Thumbnail */}
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-contain object-center bg-white"
                            onError={(e) => {
                              console.log('Image failed to load:', e.currentTarget.src);
                              e.currentTarget.style.display = 'none';
                              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                              if (nextElement) {
                                nextElement.style.display = 'flex';
                              }
                            }}
                            onLoad={(e) => {
                              console.log('Image loaded successfully:', e.currentTarget.src);
                              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                              if (nextElement) {
                                nextElement.style.display = 'none';
                              }
                            }}
                          />
                        ) : null}
                        <div className="w-full h-full flex items-center justify-center" style={{ display: course.thumbnail ? 'none' : 'flex' }}>
                          <BookOpen className="w-8 h-8 text-gray-400" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-right">
                                {course.title}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                course.status === 'published' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-amber-100 text-amber-700'
                              }`}>
                                {course.status === 'published' ? 'منشور' : 'مسودة'}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-1 leading-relaxed text-right">
                              {course.description || 'لا يوجد وصف للدورة'}
                            </p>
                            
                            {/* Stats */}
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{course.duration_hours || 0} ساعة</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{course.students_count || 0} طالب</span>
                              </div>
                              {course.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                  <span>{course.rating}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            {course.status !== 'published' && (
                              <button 
                                onClick={(e) => handlePublishCourse(course.id, e)}
                                disabled={isPublishing[course.id]}
                                className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                title="نشر الدورة"
                              >
                                {isPublishing[course.id] ? (
                                  <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Upload className="w-4 h-4" />
                                )}
                              </button>
                            )}
                            
                            {course.status === 'published' && (
                              <button 
                                onClick={(e) => handleArchiveCourse(course.id, e)}
                                disabled={isArchiving[course.id]}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                title="أرشفة الدورة"
                              >
                                {isArchiving[course.id] ? (
                                  <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Archive className="w-4 h-4" />
                                )}
                              </button>
                            )}
                            
                            <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-all">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>

                <div className="flex items-center gap-1">
                  {getPaginationRange().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === 'number' && setCurrentPage(page)}
                      disabled={page === '...'}
                      className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                        page === currentPage
                          ? 'bg-blue-600 text-white'
                          : typeof page === 'number'
                          ? 'bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300'
                          : 'bg-transparent text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span>التالي</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}
          </div></LazySection>
        )}
      </div>

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">تم بنجاح</h3>
              <p className="text-gray-600 mb-4  leading-relaxed">{statusMessage}</p>
              <button
                onClick={() => setShowStatusModal(false)}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                موافق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherCoursesList;