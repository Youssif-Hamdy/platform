import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Star, 
  ThumbsUp, 
  Flag, 
  Eye, 
  Trash2, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  MessageSquare,
  Award,
  X,
  Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';

interface Course {
  id: number;
  title: string;
  description: string;
  teacher_name: string;
  thumbnail: string;
  status: string;
  difficulty: string;
  price: string;
  duration_hours: number;
  total_sections: number;
  total_quizzes: number;
  total_enrollments: number;
  average_rating: string;
  created_at: string;
  updated_at: string;
}

interface CourseReview {
  id: number;
  user: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface Review {
  id: number;
  user: {
    id: number;
    name: string;
    avatar: string;
    type: 'student' | 'teacher' | 'parent';
  };
  course: {
    id: number;
    title: string;
    instructor: string;
  };
  rating: number;
  comment: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  helpful: number;
  reported: boolean;
  response?: {
    text: string;
    date: string;
    author: string;
  };
}

const ReviewsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      const response = await fetch('/student/get-all-courses/', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('فشل في جلب الكورسات');
      }

      const coursesData = await response.json();
      return coursesData;
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('فشل في جلب الكورسات');
      return [];
    }
  };

  // Fetch reviews for a specific course
  const fetchCourseReviews = async (courseId: number): Promise<CourseReview[]> => {
    try {
      const response = await fetch(`/teacher/courses/${courseId}/reviews/`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return []; // No reviews for this course
        }
        throw new Error('فشل في جلب التقييمات');
      }

      const reviewsData = await response.json();
      return reviewsData;
    } catch (error) {
      console.error(`Error fetching reviews for course ${courseId}:`, error);
      return [];
    }
  };

  // Convert API data to internal Review format
  const convertToReviewFormat = (courseReview: CourseReview, course: Course): Review => {
    // Generate avatar from user name
    const generateAvatar = (name: string) => {
      const words = name.split(' ');
      if (words.length >= 2) {
        return words[0].charAt(0) + words[1].charAt(0);
      }
      return name.substring(0, 2);
    };

    return {
      id: courseReview.id,
      user: {
        id: courseReview.user,
        name: courseReview.user_name,
        avatar: generateAvatar(courseReview.user_name),
        type: 'student' // Default to student, could be enhanced with user type API
      },
      course: {
        id: course.id,
        title: course.title,
        instructor: course.teacher_name
      },
      rating: courseReview.rating,
      comment: courseReview.comment || 'لا يوجد تعليق',
      date: courseReview.created_at,
      status: 'approved', // Default status, could be enhanced with review status API
      helpful: Math.floor(Math.random() * 20), // Mock helpful count
      reported: false // Mock reported status
    };
  };

  // Fetch all reviews from all courses
  const fetchAllReviews = async () => {
    setLoading(true);
    try {
      const coursesData = await fetchCourses();
      const allReviews: Review[] = [];

      // Fetch reviews for each course
      for (const course of coursesData) {
        const courseReviews = await fetchCourseReviews(course.id);
        const convertedReviews = courseReviews.map(review => 
          convertToReviewFormat(review, course)
        );
        allReviews.push(...convertedReviews);
      }

      setReviews(allReviews);
    } catch (error) {
      console.error('Error fetching all reviews:', error);
      toast.error('فشل في جلب التقييمات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReviews();
  }, []);

  // Mock data for fallback - keeping some for demo purposes
 
  // Filter reviews based on search, status, and rating
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' || review.status === filterStatus;
    
    const matchesRating = 
      filterRating === 'all' || 
      (filterRating === '5' && review.rating === 5) ||
      (filterRating === '4' && review.rating === 4) ||
      (filterRating === '3' && review.rating === 3) ||
      (filterRating === '2' && review.rating === 2) ||
      (filterRating === '1' && review.rating === 1);
    
    return matchesSearch && matchesStatus && matchesRating;
  });

  // Handle review actions
  const handleApproveReview = async (reviewId: number) => {
    setActionLoading(reviewId);
    try {
      // Here you would make API call to approve review
      // await approveReview(reviewId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('تم الموافقة على التقييم بنجاح');
    } catch (error) {
      toast.error('حدث خطأ في الموافقة على التقييم');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectReview = async (reviewId: number) => {
    setActionLoading(reviewId);
    try {
      // Here you would make API call to reject review
      // await rejectReview(reviewId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('تم رفض التقييم بنجاح');
    } catch (error) {
      toast.error('حدث خطأ في رفض التقييم');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
      setActionLoading(reviewId);
      try {
        // Here you would make API call to delete review
        // await deleteReview(reviewId);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast.success('تم حذف التقييم بنجاح');
      } catch (error) {
        toast.error('حدث خطأ في حذف التقييم');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleViewReview = (review: Review) => {
    setSelectedReview(review);
    setShowModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            معتمد
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            في الانتظار
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            مرفوض
          </span>
        );
      default:
        return null;
    }
  };

  const getRatingStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Calculate statistics
  const stats = {
    total: reviews.length,
    approved: reviews.filter(r => r.status === 'approved').length,
    pending: reviews.filter(r => r.status === 'pending').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
    averageRating: reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0,
    reported: reviews.filter(r => r.reported).length
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">إدارة التقييمات</h1>
          <p className="text-gray-600">مراجعة وإدارة تقييمات الكورسات</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">جارِ تحميل التقييمات...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">إدارة التقييمات</h1>
          <p className="text-gray-600">مراجعة وإدارة تقييمات الكورسات</p>
        </div>
        <button
          onClick={fetchAllReviews}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : 'hidden'}`} />
          تحديث
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي التقييمات</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <MessageSquare className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">معتمد</p>
              <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">في الانتظار</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">مرفوض</p>
              <p className="text-3xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">متوسط التقييم</p>
              <p className="text-3xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Star className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">مبلغ عنه</p>
              <p className="text-3xl font-bold text-gray-900">{stats.reported}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Flag className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="البحث في التقييمات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الحالات</option>
              <option value="approved">معتمد</option>
              <option value="pending">في الانتظار</option>
              <option value="rejected">مرفوض</option>
            </select>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع التقييمات</option>
              <option value="5">5 نجوم</option>
              <option value="4">4 نجوم</option>
              <option value="3">3 نجوم</option>
              <option value="2">2 نجوم</option>
              <option value="1">1 نجمة</option>
            </select>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Filter className="w-4 h-4" />
              فلتر
            </button>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد تقييمات</h3>
            <p className="text-gray-500">
              {reviews.length === 0 
                ? 'لم يتم العثور على أي تقييمات في النظام'
                : 'لا توجد تقييمات تطابق معايير البحث المحددة'
              }
            </p>
          </div>
        ) : (
          filteredReviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {review.user.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{review.user.name}</h4>
                    <p className="text-sm text-gray-600">
                      {review.user.type === 'student' ? 'طالب' : 
                       review.user.type === 'teacher' ? 'مدرس' : 'ولي أمر'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {getRatingStars(review.rating)}
                    <span className={`text-sm font-medium ${getRatingColor(review.rating)}`}>
                      {review.rating}/5
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <h5 className="font-medium text-gray-800 mb-2">{review.course.title}</h5>
                  <p className="text-gray-600 mb-2">{review.comment}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(review.date).toLocaleDateString('ar-EG')}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      {review.helpful} مفيد
                    </span>
                    {review.reported && (
                      <span className="flex items-center gap-1 text-red-600">
                        <Flag className="w-4 h-4" />
                        مبلغ عنه
                      </span>
                    )}
                  </div>
                </div>

                {review.response && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">رد من {review.response.author}</span>
                    </div>
                    <p className="text-blue-700">{review.response.text}</p>
                    <p className="text-xs text-blue-600 mt-2">
                      {new Date(review.response.date).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-2">
                {getStatusBadge(review.status)}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewReview(review)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="عرض التفاصيل"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {review.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApproveReview(review.id)}
                        disabled={actionLoading === review.id}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="موافقة"
                      >
                        {actionLoading === review.id ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleRejectReview(review.id)}
                        disabled={actionLoading === review.id}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="رفض"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    disabled={actionLoading === review.id}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
          ))
        )}
      </div>

      {/* Review Details Modal */}
      {showModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">تفاصيل التقييم</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {selectedReview.user.avatar}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800">{selectedReview.user.name}</h4>
                    <p className="text-gray-600">
                      {selectedReview.user.type === 'student' ? 'طالب' : 
                       selectedReview.user.type === 'teacher' ? 'مدرس' : 'ولي أمر'}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {getRatingStars(selectedReview.rating)}
                      <span className={`text-sm font-medium ${getRatingColor(selectedReview.rating)}`}>
                        {selectedReview.rating}/5
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">الكورس:</h5>
                  <p className="text-gray-600">{selectedReview.course.title}</p>
                  <p className="text-sm text-gray-500">المدرس: {selectedReview.course.instructor}</p>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">التعليق:</h5>
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{selectedReview.comment}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h6 className="font-medium text-gray-800 mb-2">التاريخ:</h6>
                    <p className="text-gray-600">{new Date(selectedReview.date).toLocaleDateString('ar-EG')}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h6 className="font-medium text-gray-800 mb-2">الحالة:</h6>
                    {getStatusBadge(selectedReview.status)}
                  </div>
                </div>

                {selectedReview.response && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h6 className="font-semibold text-blue-800 mb-2">الرد من {selectedReview.response.author}:</h6>
                    <p className="text-blue-700">{selectedReview.response.text}</p>
                    <p className="text-xs text-blue-600 mt-2">
                      {new Date(selectedReview.response.date).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ReviewsManagement;
