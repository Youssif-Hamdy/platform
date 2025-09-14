import React, { useEffect, useState } from 'react';
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
  ArrowRight,
  ChevronLeft,
  Filter,
  SortDesc,
  Calendar,
  Award
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
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(9);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Title Section */}
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  دوراتي التعليمية
                </h1>
                <p className="text-gray-600 text-base mt-1">إدارة وتنظيم المحتوى التعليمي</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4 space-x-reverse">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="flex items-center space-x-3 space-x-reverse bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 px-5 py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-105"
              >
                <ArrowRight className="w-5 h-5" />
                <span>العودة للداشبورد</span>
              </button>
              <button className="flex items-center space-x-3 space-x-reverse bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Plus className="w-5 h-5" />
                <span>دورة جديدة</span>
              </button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="mt-6 space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="البحث في الدورات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-12 pl-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/90 backdrop-blur-sm placeholder-gray-400 text-base"
                />
              </div>

              {/* Filter and Sort Controls */}
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="flex items-center space-x-2 space-x-reverse bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-1">
                  <Filter className="w-4 h-4 text-gray-500 mr-2" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-transparent border-0 focus:ring-0 font-medium text-gray-700 pr-2"
                  >
                    <option value="all">جميع الدورات</option>
                    <option value="published">منشورة</option>
                    <option value="draft">مسودات</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-1">
                  <SortDesc className="w-4 h-4 text-gray-500 mr-2" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent border-0 focus:ring-0 font-medium text-gray-700 pr-2"
                  >
                    <option value="created_at">الأحدث</option>
                    <option value="title">الاسم</option>
                    <option value="students">عدد الطلاب</option>
                    <option value="rating">التقييم</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-2xl p-1 shadow-inner">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="flex items-center justify-between bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-2xl px-6 py-4">
              <div className="flex items-center space-x-6 space-x-reverse text-sm">
                <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">{filteredAndSortedCourses.length} دورة</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
                  <Users className="w-4 h-4 text-green-500" />
                  <span className="font-medium">{courses.reduce((acc, course) => acc + (course.students_count || 0), 0)} طالب</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">
                    {courses.filter(c => c.status === 'published').length} منشورة
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                صفحة {currentPage} من {totalPages}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {paginatedCourses.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <BookOpen className="w-16 h-16 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {searchQuery || filterStatus !== 'all' ? 'لا توجد نتائج' : 'لا توجد دورات بعد'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg leading-relaxed">
              {searchQuery || filterStatus !== 'all' 
                ? 'جرب البحث بكلمات مختلفة أو غير الفلتر' 
                : 'ابدأ بإنشاء دورة جديدة لطلابك وشارك معرفتك مع العالم'
              }
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <button className="inline-flex items-center space-x-3 space-x-reverse bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Plus className="w-5 h-5" />
                <span>إنشاء دورة جديدة</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8' 
              : 'space-y-6'
            }>
              {paginatedCourses.map((course, index) => (
                <div
                  key={course.id}
                  className={`group cursor-pointer transform hover:scale-105 transition-all duration-500 ${
                    viewMode === 'grid' 
                      ? 'bg-white/95 backdrop-blur-xl rounded-3xl border border-gray-200/60 shadow-lg hover:shadow-2xl overflow-hidden' 
                      : 'bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-200/60 shadow-lg hover:shadow-xl'
                  }`}
                  onClick={() => handleCourseSelect(course)}
                >
                  {viewMode === 'grid' ? (
                    // Grid View
                    <>
                      {/* Course Thumbnail */}
                      <div className="relative h-52 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 overflow-hidden">
                        {course.thumbnail ? (
                          <img 
                            src={course.thumbnail} 
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-20 h-20 text-blue-500" />
                          </div>
                        )}
                        
                        {/* Status Badge */}
                        <div className="absolute top-4 right-4">
                          <span className={`px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${
                            course.status === 'published' 
                              ? 'bg-green-500 text-white' 
                              : 'bg-amber-500 text-white'
                          }`}>
                            {course.status === 'published' ? 'منشور' : 'مسودة'}
                          </span>
                        </div>

                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                          <div className="w-20 h-20 bg-white/95 rounded-full flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                            <Play className="w-10 h-10 text-blue-600 ml-1" />
                          </div>
                        </div>
                      </div>

                      {/* Course Content */}
                      <div className="p-7">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
                          {course.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-5 line-clamp-3 leading-relaxed">
                          {course.description || 'لا يوجد وصف للدورة'}
                        </p>

                        {/* Course Stats */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                          <div className="flex items-center space-x-2 space-x-reverse bg-gray-50 px-3 py-2 rounded-xl">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span className="font-medium text-sm">{course.duration_hours || 0} ساعة</span>
                          </div>
                          <div className="flex items-center space-x-2 space-x-reverse bg-gray-50 px-3 py-2 rounded-xl">
                            <Users className="w-4 h-4 text-green-500" />
                            <span className="font-medium text-sm">{course.students_count || 0}</span>
                          </div>
                          {course.rating ? (
                            <div className="flex items-center space-x-2 space-x-reverse bg-gray-50 px-3 py-2 rounded-xl">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="font-medium text-sm">{course.rating}</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2 space-x-reverse bg-gray-50 px-3 py-2 rounded-xl">
                              <Calendar className="w-4 h-4 text-purple-500" />
                              <span className="font-medium text-sm">جديد</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between">
                          <button className="flex items-center space-x-2 space-x-reverse text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors duration-300">
                            <span>عرض الدورة</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <button className="p-2 text-gray-400 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-green-600 rounded-xl hover:bg-green-50 transition-all duration-300">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all duration-300">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    // List View
                    <div className="flex items-center space-x-6 space-x-reverse p-6">
                      {/* Thumbnail */}
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden shadow-lg">
                        {course.thumbnail ? (
                          <img 
                            src={course.thumbnail} 
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <BookOpen className="w-12 h-12 text-blue-500" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                              {course.title}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                              {course.description || 'لا يوجد وصف للدورة'}
                            </p>
                            
                            {/* Stats */}
                            <div className="flex items-center space-x-6 space-x-reverse text-sm">
                              <div className="flex items-center space-x-2 space-x-reverse bg-gray-50 px-3 py-1 rounded-lg">
                                <Clock className="w-3 h-3 text-blue-500" />
                                <span className="font-medium">{course.duration_hours || 0} ساعة</span>
                              </div>
                              <div className="flex items-center space-x-2 space-x-reverse bg-gray-50 px-3 py-1 rounded-lg">
                                <Users className="w-3 h-3 text-green-500" />
                                <span className="font-medium">{course.students_count || 0} طالب</span>
                              </div>
                              {course.rating && (
                                <div className="flex items-center space-x-2 space-x-reverse bg-gray-50 px-3 py-1 rounded-lg">
                                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                  <span className="font-medium">{course.rating}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Status and Actions */}
                          <div className="flex items-center space-x-4 space-x-reverse">
                            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                              course.status === 'published' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {course.status === 'published' ? 'منشور' : 'مسودة'}
                            </span>
                            
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <button className="p-2 text-gray-400 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-green-600 rounded-xl hover:bg-green-50 transition-all duration-300">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all duration-300">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
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
              <div className="flex items-center justify-center space-x-2 space-x-reverse pt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center space-x-2 space-x-reverse px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>

                <div className="flex items-center space-x-1 space-x-reverse">
                  {getPaginationRange().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === 'number' && setCurrentPage(page)}
                      disabled={page === '...'}
                      className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                        page === currentPage
                          ? 'bg-blue-600 text-white shadow-lg'
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
                  className="flex items-center space-x-2 space-x-reverse px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <span>التالي</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherCoursesList;