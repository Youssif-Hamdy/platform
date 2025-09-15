import { useCallback, useEffect, useState } from 'react';
import {
  FaGraduationCap,
  FaChalkboardTeacher,
  FaBook,
  FaStar,
  FaQuestionCircle,
  FaSearch,
  FaLaptopCode,
  FaChartLine,
  FaLanguage,
  FaUsers,
  FaNewspaper,
  FaBriefcase,
  FaPhoneAlt,
  FaFileContract,
  FaShieldAlt,
  FaHandsHelping,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaPlay,
  FaClock,
  FaChevronDown,
  FaChevronRight,
  FaChevronLeft,
  FaUser,
  FaHeart,
  FaShoppingCart,
  FaTimes,
  FaCheck,
  
} from 'react-icons/fa';
import Navbar from '../component/Navbar';
import { motion, useScroll, useTransform } from 'framer-motion';

// Images array for slider
const sliderImages = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
  "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
];

const sliderContent = [
  {
    title: "منصة تعلم",
    subtitle: "رحلتك نحو الإحتراف تبدأ من هنا",
    description: "اكتشف عالمًا من المعرفة مع أفضل الكورسات التعليمية في العالم العربي"
  },
  {
    title: "تعلم مع الخبراء",
    subtitle: "من أفضل المدرسين في المنطقة",
    description: "احصل على شهادات معتمدة وطور مهاراتك مع نخبة من المتخصصين"
  },
  {
    title: "مرونة كاملة",
    subtitle: "تعلم في أي وقت ومن أي مكان",
    description: "استمتع بتجربة تعليمية مخصصة تناسب نمط حياتك وأهدافك المهنية"
  },
  {
    title: "نجح مع آلاف الطلاب",
    subtitle: "انضم إلى مجتمع من المتعلمين",
    description: "أكثر من 50 ألف طالب حققوا أهدافهم التعليمية والمهنية معنا"
  }
];

// Responsive Navbar Component


interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface StatItem {
  number: string;
  label: string;
}

interface CourseItem {
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
  average_rating: number;
  review_count?: number;
  created_at: string;
  updated_at: string;
}

interface TeacherItem {
  id: number;
  full_name: string;
  email: string;
  date_joined: string;
  pic: string | null;
}

interface LinkItem {
  icon: React.ReactNode;
  text: string;
}

interface FooterColumn {
  title: string;
  links: LinkItem[];
}

const LearningPlatform: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [slideDirection, setSlideDirection] = useState('next');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const coursesPerPage = 4;
  // Atropos will handle 3D interactions; no manual tilt state needed

  // Teachers
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [teachersError, setTeachersError] = useState<string | null>(null);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch teachers from API
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setTeachersLoading(true);
        setTeachersError(null);
        const res = await fetch('/teacher/get_teachers/');
        if (!res.ok) {
          throw new Error('Failed to fetch teachers');
        }
        const data = await res.json();
        const list: TeacherItem[] = (Array.isArray(data) ? data : (data?.results || [data])) as TeacherItem[];
        setTeachers(list);
      } catch (err) {
        setTeachersError(err instanceof Error ? err.message : 'تعذر تحميل بيانات المدرسين');
      } finally {
        setTeachersLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  // Fetch courses from API
  useEffect(() => {
  const fetchCourses = async () => {
  try {
    setLoading(true);
    const response = await fetch('/student/get-all-courses/');
    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }
    const data = await response.json();
    const list: CourseItem[] = (data?.results || data || []) as CourseItem[];

    const withRatings = await Promise.all(
      list.map(async (course) => {
        try {
          // التأكد من وجود token صالح
          const accessToken = localStorage.getItem('accessToken');
          if (!accessToken) {
            console.warn('No access token available, fetching without authentication');
            return { ...course, average_rating: 0, review_count: 0 };
          }

          // استخدام endpoint مختلف - جرب هذه الخيارات
          const reviewUrl = `/teacher/courses/${course.id}/reviews/`;
          // أو: `/courses/${course.id}/reviews/`;
          // أو: `/student/courses/${course.id}/reviews/`;

          const r = await fetch(reviewUrl, { 
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            }
          });

          if (r.status === 403) {
            console.warn('Access forbidden, trying without authentication');
            // محاولة بدون token إذا كان المسموح
            const rWithoutAuth = await fetch(reviewUrl, {
              headers: { 'Accept': 'application/json' }
            });
            
            if (rWithoutAuth.ok) {
              const reviews = await rWithoutAuth.json();
              const ratings: number[] = Array.isArray(reviews) ? reviews.map((rev: any) => Number(rev.rating) || 0) : [];
              const avgRaw = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : 0;
              const avg = Number(Math.min(5, Math.max(0, avgRaw)).toFixed(1));
              return { ...course, average_rating: avg, review_count: ratings.length };
            }
          }

          if (r.ok) {
            const reviews = await r.json();
            const ratings: number[] = Array.isArray(reviews) ? reviews.map((rev: any) => Number(rev.rating) || 0) : [];
            const avgRaw = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : 0;
            const avg = Number(Math.min(5, Math.max(0, avgRaw)).toFixed(1));
            return { ...course, average_rating: avg, review_count: ratings.length };
          }
        } catch (e) {
          console.error('Error fetching reviews:', e);
        }
        return { ...course, average_rating: 0, review_count: 0 };
      })
    );

    setCourses(withRatings);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'حدث خطأ في تحميل الكورسات');
    console.error('Error fetching courses:', err);
  } finally {
    setLoading(false);
  }
};

    fetchCourses();
  }, []);

  // Auto-play slider
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentSlide, isAutoPlaying]);

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSlideDirection('next');
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    setTimeout(() => setIsAnimating(false), 800);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSlideDirection('prev');
    setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
    setTimeout(() => setIsAnimating(false), 800);
  };

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentSlide) return;
    setIsAnimating(true);
    setSlideDirection(index > currentSlide ? 'next' : 'prev');
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), 800);
  };

  // Removed manual tilt handlers; Atropos manages mouse/parallax

  const features: FeatureItem[] = [
    {
      icon: <FaChalkboardTeacher className="text-2xl lg:text-3xl" />,
      title: "خبراء متخصصون",
      description: "تعلم من أفضل المدرسين والخبراء في العالم العربي"
    },
    {
      icon: <FaBook className="text-2xl lg:text-3xl" />,
      title: "آلاف الكورسات",
      description: "أكثر من 5000 كورس في مختلف المجالات والتخصصات"
    },
    {
      icon: <FaStar className="text-2xl lg:text-3xl" />,
      title: "تعلم في أي وقت",
      description: "الدراسة في الوقت الذي يناسبك وبالسرعة التي تفضلها"
    },
    {
      icon: <FaQuestionCircle className="text-2xl lg:text-3xl" />,
      title: "دعم فني دائم",
      description: "فريق دعم فني متاح على مدار الساعة لمساعدتك"
    }
  ];

  const stats: StatItem[] = [
    { number: "50,000+", label: "طالب مسجل" },
    { number: "5,000+", label: "كورس متاح" },
    { number: "500+", label: "خبير ومدرس" },
    { number: "98%", label: "رضى العملاء" }
  ];

  // Helper function to get category icon based on title
  const getCategoryIcon = (title: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('web') || titleLower.includes('angular') || titleLower.includes('react') || titleLower.includes('javascript')) {
      return <FaLaptopCode className="text-xl lg:text-2xl" />;
    } else if (titleLower.includes('data') || titleLower.includes('python') || titleLower.includes('analysis')) {
      return <FaChartLine className="text-xl lg:text-2xl" />;
    } else if (titleLower.includes('language') || titleLower.includes('english') || titleLower.includes('arabic')) {
      return <FaLanguage className="text-xl lg:text-2xl" />;
    } else {
      return <FaBook className="text-xl lg:text-2xl" />;
    }
  };

  // Helper function to get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Helper function to format price
  const formatPrice = (price: string) => {
    const priceNum = parseFloat(price);
    return priceNum === 0 ? 'مجاني' : `${priceNum} ج.م`;
  };

  // Helper function to format duration
  const formatDuration = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} دقيقة`;
    } else if (hours === 1) {
      return 'ساعة واحدة';
    } else {
      return `${hours} ساعات`;
    }
  };

  // عرض نجوم التقييم (5 نجوم بأسلوب يودِمي)
  const renderStars = (avg: number) => {
    const fullStars = Math.floor(avg);
    const hasHalf = avg - fullStars >= 0.5;
    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }, (_, i) => {
          const filled = i < fullStars || (i === fullStars && hasHalf);
          return (
            <FaStar
              key={i}
              className={`${filled ? 'text-amber-400' : 'text-gray-300'} w-4 h-4 ml-0.5`}
            />
          );
        })}
      </div>
    );
  };

  // Navigation functions
  const nextPage = () => {
    const maxPage = Math.ceil(courses.length / coursesPerPage) - 1;
    setCurrentPage(prev => prev < maxPage ? prev + 1 : 0);
  };

  const prevPage = () => {
    const maxPage = Math.ceil(courses.length / coursesPerPage) - 1;
    setCurrentPage(prev => prev > 0 ? prev - 1 : maxPage);
  };

  // Modal functions
  const openModal = (course: CourseItem) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };


  const footerColumns: FooterColumn[] = [
    {
      title: "الكورسات",
      links: [
        { icon: <FaLaptopCode className="ml-2 text-sm" />, text: "البرمجة" },
        { icon: <FaChartLine className="ml-2 text-sm" />, text: "التصميم" },
        { icon: <FaBook className="ml-2 text-sm" />, text: "التسويق" },
        { icon: <FaLanguage className="ml-2 text-sm" />, text: "اللغات" },
        { icon: <FaGraduationCap className="ml-2 text-sm" />, text: "المزيد" }
      ]
    },
    {
      title: "الشركة",
      links: [
        { icon: <FaUsers className="ml-2 text-sm" />, text: "عن المنصة" },
        { icon: <FaChalkboardTeacher className="ml-2 text-sm" />, text: "المدرسون" },
        { icon: <FaBriefcase className="ml-2 text-sm" />, text: "الوظائف" },
        { icon: <FaNewspaper className="ml-2 text-sm" />, text: "الأخبار" },
        { icon: <FaPhoneAlt className="ml-2 text-sm" />, text: "اتصل بنا" }
      ]
    },
    {
      title: "الدعم",
      links: [
        { icon: <FaQuestionCircle className="ml-2 text-sm" />, text: "الأسئلة الشائعة" },
        { icon: <FaFileContract className="ml-2 text-sm" />, text: "الشروط والأحكام" },
        { icon: <FaShieldAlt className="ml-2 text-sm" />, text: "سياسة الخصوصية" },
        { icon: <FaHandsHelping className="ml-2 text-sm" />, text: "المساعدة" },
        { icon: <FaUsers className="ml-2 text-sm" />, text: "المجتمع" }
      ]
    }
  ];

  const { scrollYProgress } = useScroll();
  const heroRotateX = useTransform(scrollYProgress, [0, 0.2], [0, -8]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.96]);
  const statsParallax = useTransform(scrollYProgress, [0.1, 0.35], [0, -60]);
  const coursesParallax = useTransform(scrollYProgress, [0.2, 0.5], [40, -40]);

  // Animation variants for sections and cards
  const sectionVariants = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.45 }
    }
  };

  // 3D tilt state for Services card
  const [tilt, setTilt] = useState<{ rotateX: number; rotateY: number }>({ rotateX: 0, rotateY: 0 });
  const [shinePos, setShinePos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const handleTiltMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width; // 0..1
    const py = (e.clientY - rect.top) / rect.height; // 0..1
    const rotateY = (px - 0.5) * 14; // left/right
    const rotateX = -(py - 0.5) * 14; // up/down
    setTilt({ rotateX, rotateY });
    setShinePos({ x: px * 100, y: py * 100 });
  };
  const handleTiltLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
    setShinePos({ x: 50, y: 50 });
  };
    const scrollToCourses = useCallback(() => {
    const coursesSection = document.getElementById('courses');
    if (coursesSection) {
      coursesSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" dir="rtl">
      <Navbar />

      {/* Hero Slider Section - Responsive */}
      <motion.section className="relative h-screen overflow-hidden" style={{ rotateX: heroRotateX, scale: heroScale }}>
        {/* Slider Container */}
        <div className="relative w-full h-full">
          {sliderImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentSlide
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-110'
                }`}
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-gray-900/90"></div>
              </div>

              {/* Slide Content - Responsive */}
              <div className="relative z-10 h-full flex items-center justify-center">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                  <div className="max-w-5xl mx-auto">
                    {/* Animated Title - Responsive */}
                    <div className={`transform transition-all duration-1000 delay-300 ${index === currentSlide
                        ? 'translate-y-0 opacity-100'
                        : slideDirection === 'next'
                          ? 'translate-y-10 opacity-0'
                          : '-translate-y-10 opacity-0'
                      }`}>
                      <h1 data-atropos-offset="8" className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                        <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent">
                          {sliderContent[currentSlide].title}
                        </span>
                      </h1>
                    </div>

                    {/* Animated Subtitle - Responsive */}
                    <div className={`transform transition-all duration-1000 delay-500 ${index === currentSlide
                        ? 'translate-y-0 opacity-100'
                        : slideDirection === 'next'
                          ? 'translate-y-10 opacity-0'
                          : '-translate-y-10 opacity-0'
                      }`}>
                      <h2 data-atropos-offset="6" className="text-xl sm:text-2xl md:text-3xl lg:text-5xl xl:text-6xl text-white/90 mb-4 sm:mb-6 lg:mb-8 font-light">
                        {sliderContent[currentSlide].subtitle}
                      </h2>
                    </div>

                    {/* Animated Description - Responsive */}
                    <div className={`transform transition-all duration-1000 delay-700 ${index === currentSlide
                        ? 'translate-y-0 opacity-100'
                        : slideDirection === 'next'
                          ? 'translate-y-10 opacity-0'
                          : '-translate-y-10 opacity-0'
                      }`}>
                      <p data-atropos-offset="4" className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 sm:mb-10 lg:mb-12 max-w-4xl mx-auto leading-relaxed px-4">
                        {sliderContent[currentSlide].description}
                      </p>
                    </div>

                    {/* Animated Buttons - Responsive */}
                    <div className={`transform transition-all duration-1000 delay-1000 ${index === currentSlide
                        ? 'translate-y-0 opacity-100'
                        : slideDirection === 'next'
                          ? 'translate-y-10 opacity-0'
                          : '-translate-y-10 opacity-0'
                      }`}>
                      <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 px-4">
                        <button data-atropos-offset="12" className="group px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl sm:rounded-2xl hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-blue-500/30 font-medium text-base sm:text-lg flex items-center justify-center space-x-3 space-x-reverse backdrop-blur-sm">
                          <FaPlay className="text-sm group-hover:scale-110 transition-transform duration-300" />
                          <span>ابدأ التعلم الآن</span>
                        </button>
                        <button data-atropos-offset="10" className="group px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 bg-white/10 text-white border border-white/30 rounded-xl sm:rounded-2xl hover:bg-white/20 backdrop-blur-md transform hover:scale-105 transition-all duration-300 font-medium text-base sm:text-lg flex items-center justify-center space-x-3 space-x-reverse shadow-lg hover:shadow-2xl">
                          <FaSearch className="text-sm group-hover:scale-110 transition-transform duration-300" />
                          <span>تصفح الكورسات</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows - Hidden on mobile */}
        {!isMobile && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 lg:left-8 top-1/2 transform -translate-y-1/2 z-20 w-14 h-14 lg:w-16 lg:h-16 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white hover:bg-white/30 transition-all duration-300 flex items-center justify-center group hover:scale-110 shadow-lg"
              disabled={isAnimating}
            >
              <FaChevronRight className="text-xl group-hover:translate-x-1 transition-transform duration-300" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-4 lg:right-8 top-1/2 transform -translate-y-1/2 z-20 w-14 h-14 lg:w-16 lg:h-16 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white hover:bg-white/30 transition-all duration-300 flex items-center justify-center group hover:scale-110 shadow-lg"
              disabled={isAnimating}
            >
              <FaChevronRight className="text-xl rotate-180 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </>
        )}

        {/* Slide Indicators - Responsive and centered properly */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex justify-center items-center space-x-2 sm:space-x-3 space-x-reverse bg-black/30 backdrop-blur-md rounded-full px-4 py-3 border border-white/20">
            {sliderImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'w-3 h-3 bg-blue-400 scale-125 shadow-lg'
                    : 'w-2 h-2 bg-white/60 hover:bg-blue-300 hover:scale-110'
                } ${isMobile ? 'active:bg-blue-400' : ''}`}
                disabled={isAnimating}
              />
            ))}
          </div>
        </div>

        {/* Progress Bar - Blue theme */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-5000 ease-linear"
            style={{
              width: isAutoPlaying ? '100%' : '0%',
              animation: isAutoPlaying ? 'progress 5s linear infinite' : 'none'
            }}
          />
        </div>

        {/* Floating Elements - Hidden on mobile for performance */}
        {!isMobile && (
          <>
            <div className="absolute top-20 right-10 w-20 h-20 bg-blue-500/20 rounded-full animate-bounce opacity-60"></div>
            <div className="absolute bottom-32 left-16 w-16 h-16 bg-blue-400/20 rounded-full animate-pulse opacity-60"></div>
            <div className="absolute top-1/2 left-10 w-12 h-12 bg-white/10 rounded-full animate-ping opacity-60"></div>
            <div className="absolute top-1/4 right-1/4 w-8 h-8 bg-blue-300/30 rounded-full animate-bounce delay-1000 opacity-60"></div>
          </>
        )}

        {/* Pause/Play Button - Responsive */}
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className={`absolute top-4 sm:top-6 lg:top-8 right-4 sm:right-6 lg:right-8 z-20 ${
            isMobile ? 'w-10 h-10' : 'w-12 h-12'
          } bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white hover:bg-white/30 transition-all duration-300 flex items-center justify-center hover:scale-110 shadow-lg`}
        >
          {isAutoPlaying ? (
            <div className={`${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-white rounded-full`}></div>
          ) : (
            <FaPlay className={`${isMobile ? 'text-xs' : 'text-sm'} ml-0.5`} />
          )}
        </button>
      </motion.section>

      {/* قسم الميزات - Responsive */}
      <motion.section
        id="about"
        className="py-12 sm:py-16 lg:py-24 bg-gradient-to-b from-white to-blue-50 relative overflow-hidden"
        style={{ y: statsParallax }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-blue-100/30"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div variants={sectionVariants} className="text-center mb-12 sm:mb-16 lg:mb-20">
            <div className="inline-block px-4 sm:px-6 py-2 bg-blue-100 rounded-full text-blue-600 font-medium mb-4 sm:mb-6 text-sm sm:text-base">
              لماذا نحن مختلفون؟
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
              لماذا تختار <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">منصة تعلم</span>؟
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              نقدم لك تجربة تعليمية فريدة تجمع بين الجودة والمرونة والتفاعل
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
            variants={staggerContainer}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="group bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-100 hover:border-blue-200 hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
                variants={cardVariants}
                whileHover={{ y: -8 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-blue-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-16 h-16 lg:w-20 lg:h-20 rounded-2xl lg:rounded-3xl flex items-center justify-center mb-4 lg:mb-6 mx-auto text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-2xl">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 lg:mb-4 text-center group-hover:text-blue-600 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-sm lg:text-base text-gray-600 text-center leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* قسم المدرسين - بسيط يعرض نبذة */}
   <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-blue-50 to-white">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-14">
      <h2 className="text-4xl font-extrabold text-blue-900">مدرسونا</h2>
      <p className="text-blue-600 mt-3 text-lg">تعرف على نخبة من أفضل المدرسين</p>
    </div>

    {teachersLoading ? (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-300 border-t-blue-600"></div>
      </div>
    ) : teachersError ? (
      <div className="text-center text-red-600 py-12 text-lg font-semibold">{teachersError}</div>
    ) : teachers.length === 0 ? (
      <div className="text-center text-blue-500 py-12 text-lg">لا توجد بيانات متاحة حالياً</div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
        {teachers.slice(0, 10).map((t) => (
          <div
            key={t.id}
            className="bg-white border border-blue-200 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer flex flex-col items-center text-center"
          >
            <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-blue-400 mb-5">
              {t.pic ? (
                <img
                  src={t.pic}
                  alt={t.full_name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <FaChalkboardTeacher className="w-12 h-12" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-blue-900 mb-2">{t.full_name}</h3>
            <p className="text-sm text-blue-600 mb-3">انضم: {new Date(t.date_joined).toLocaleDateString('ar-EG')}</p>
          </div>
        ))}
      </div>
    )}
  </div>
</section>


      {/* قسم الإحصاءات - Responsive */}
      <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
          {!isMobile && (
            <>
              <div className="absolute top-10 right-10 w-32 h-32 bg-white/5 rounded-full animate-pulse"></div>
              <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full animate-bounce"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full animate-spin-slow"></div>
            </>
          )}
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">أرقام تتحدث عن نفسها</h2>
            <p className="text-base sm:text-lg lg:text-xl text-blue-100 max-w-2xl mx-auto px-4">نفخر بالإنجازات التي حققناها مع طلابنا</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="p-4 sm:p-6 lg:p-8 group relative">
                <div className="absolute inset-0 bg-white/10 rounded-2xl lg:rounded-3xl backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105"></div>
                <div className="relative z-10">
                  <p className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-2 sm:mb-3 lg:mb-4 group-hover:scale-110 transition-transform duration-300 bg-gradient-to-r from-white to-blue-200 bg-clip-text">
                    {stat.number}
                  </p>
                  <p className="text-sm sm:text-base lg:text-xl opacity-90 font-medium">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* قسم الخدمات - بطاقة 3D واحدة */}
      <motion.section
        id="services"
        className="py-16 sm:py-20 lg:py-24 bg-white relative overflow-hidden"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-100 rounded-full blur-3xl opacity-50"></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div variants={sectionVariants} className="text-center mb-10 sm:mb-14">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">خدماتنا</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mt-4 text-base sm:text-lg">منصة تعليمية حديثة تجمع بين التفاعل، الجودة، والمرونة لتمنحك أفضل تجربة تعلم.</p>
          </motion.div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* الكارد (الصورة) */}
            <motion.div
              variants={cardVariants}
              className="relative"
              style={{ perspective: 1000 }}
            >
              <div
                onMouseMove={handleTiltMove}
                onMouseLeave={handleTiltLeave}
                className="relative rounded-3xl border border-gray-100 bg-white shadow-xl overflow-hidden transition-transform duration-200"
                style={{
                  transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* صورة/خلفية */}
                <div
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1673724534205-c1cc5519a26b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transform: 'translateZ(25px)'
                  }}
                ></div>
                {/* Overlay تدرّجي */}
                <div
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(2,6,23,0.15) 0%, rgba(2,6,23,0.45) 100%)',
                    transform: 'translateZ(35px)'
                  }}
                ></div>
                {/* لمعان ديناميكي */}
                <div
                  className="pointer-events-none absolute -inset-1 rounded-[28px] opacity-60"
                  style={{
                    background: `radial-gradient(600px circle at ${shinePos.x}% ${shinePos.y}%, rgba(59,130,246,0.22), transparent 40%)`,
                    transform: 'translateZ(45px)'
                  }}
                ></div>
                {/* شارة */}
                <div className="absolute top-4 left-4 z-10" style={{ transform: 'translateZ(55px)' }}>
                  <div className="px-3 py-1 rounded-full bg-white/80 backdrop-blur text-blue-700 text-xs font-semibold border border-white/60">
                    تجربة تعليمية عصرية
                  </div>
                </div>
                {/* نص قصير على الصورة */}
                <div className="absolute bottom-5 right-5 left-5 z-10 text-white" style={{ transform: 'translateZ(55px)' }}>
                  <div className="text-sm opacity-90">سلاسة • مرونة • جودة</div>
                  <div className="text-xl font-bold">تعلم بذكاء وبأسلوب حديث</div>
                </div>
                <div className="relative pt-[58%]"></div>
              </div>
            </motion.div>

            {/* النص (عن المنصة) */}
            <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}>
              <motion.div variants={sectionVariants} className="mb-4">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold">
                  عن منصتنا
                </div>
              </motion.div>
              <motion.h3 variants={sectionVariants} className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                منصة متكاملة للتعلّم الحديث
              </motion.h3>
              <motion.p variants={sectionVariants} className="text-gray-600 text-base leading-7 mb-6">
                نقدّم لك تجربة تعلم سلسة وسريعة مع محتوى مُنتقى بعناية، ومشاريع عملية، ومجتمع داعم. تتبع تقدّمك خطوة بخطوة، وارجع للدروس في أي وقت ومن أي جهاز.
              </motion.p>
              <motion.div variants={staggerContainer} className="grid grid-cols-2 gap-3 mb-6">
                <motion.div variants={cardVariants} className="rounded-xl bg-blue-50 text-blue-700 px-3 py-2 text-xs font-semibold text-center">دعم فوري</motion.div>
                <motion.div variants={cardVariants} className="rounded-xl bg-emerald-50 text-emerald-700 px-3 py-2 text-xs font-semibold text-center">شهادات</motion.div>
                <motion.div variants={cardVariants} className="rounded-xl bg-purple-50 text-purple-700 px-3 py-2 text-xs font-semibold text-center">مسارات</motion.div>
                <motion.div variants={cardVariants} className="rounded-xl bg-amber-50 text-amber-700 px-3 py-2 text-xs font-semibold text-center">وصول دائم</motion.div>
              </motion.div>
              <motion.div variants={sectionVariants} className="flex items-center gap-6 text-sm">
                <div className="text-gray-700"><span className="font-bold text-gray-900">+50K</span> طالب</div>
                <div className="text-gray-700"><span className="font-bold text-gray-900">+5K</span> كورس</div>
                <div className="text-gray-700"><span className="font-bold text-gray-900">4.9/5</span> تقييم</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* قسم الكورسات - سكشن منفصل مع تصميم محسن */}
      <motion.section id="courses" className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-blue-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-white/50"></div>
        <motion.div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10" style={{ y: coursesParallax }}>
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <div className="inline-block px-6 py-3 bg-blue-100 rounded-full text-blue-600 font-semibold mb-6 text-sm sm:text-base shadow-sm">
              🎓 الكورسات المتاحة
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 px-4">
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">اكتشف</span> أفضل الكورسات
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-4">
              تعلم من أفضل الخبراء وطور مهاراتك مع كورسات عالية الجودة
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-6"></div>
              <p className="text-gray-600 text-xl font-medium">جاري تحميل الكورسات...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="text-red-600 text-xl mb-6 font-medium">{error}</div>
              <button 
                onClick={() => window.location.reload()} 
                className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-gray-500 text-xl mb-4 font-medium">لا توجد كورسات متاحة حالياً</div>
              <p className="text-gray-400 text-lg">تحقق مرة أخرى لاحقاً للاطلاع على الكورسات الجديدة</p>
            </div>
          ) : (
            <div className="relative">
              {/* Navigation Arrows - Udemy Style */}
              {courses.length > coursesPerPage && (
                <>
                  <button
                    onClick={prevPage}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-6 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-all duration-200 hover:shadow-xl"
                  >
                    <FaChevronRight className="text-sm" />
                  </button>
                  <button
                    onClick={nextPage}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-6 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-all duration-200 hover:shadow-xl"
                  >
                    <FaChevronLeft className="text-sm" />
                  </button>
                </>
              )}

              {/* Courses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {courses.slice(currentPage * coursesPerPage, (currentPage + 1) * coursesPerPage).map((course, index) => (
                  <motion.div
                    key={course.id}
                    className="group bg-white rounded-xl overflow-hidden shadow-md border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300 relative cursor-pointer"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    onClick={() => openModal(course)}
                  >
                    {/* Course Thumbnail */}
                    <div className="relative h-40 bg-gradient-to-br from-blue-500 to-blue-600 overflow-hidden">
                      {course.thumbnail ? (
                        <img 
                          src={course.thumbnail} 
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white">
                          <div className="bg-white/20 p-6 rounded-full group-hover:scale-110 transition-all duration-300">
                            {getCategoryIcon(course.title)}
                          </div>
                        </div>
                      )}
                      
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-blue-600 hover:bg-white transition-all duration-300">
                          <FaPlay className="text-sm ml-0.5" />
                        </button>
                      </div>
                      {/* Badge: Average Rating */}
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold text-gray-800 shadow">
                        ⭐ {course.average_rating ? course.average_rating.toFixed(1) : 'جديد'}
                      </div>
                    </div>

                    <div className="p-4">
                      {/* Course Title */}
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
                        {course.title}
                      </h3>
                      
                      {/* Instructor */}
                      <div className="flex items-center mb-2 text-sm text-gray-600">
                        <FaUser className="text-blue-500 ml-1" />
                        <span>{course.teacher_name}</span>
                      </div>

                      {/* Rating Stars + count */}
                      <div className="flex items-center mb-3">
                        <span className="text-amber-500 font-semibold text-sm ml-2">
                          {course.average_rating ? course.average_rating.toFixed(1) : 'جديد'}
                        </span>
                        {renderStars(course.average_rating || 0)}
                        <span className="text-xs text-gray-500 mr-2">({course.review_count ?? 0})</span>
                      </div>

                      {/* Price and Action */}
                      <div className="flex items-center justify-between">
                        <div className="text-xl font-bold text-blue-600">
                          {formatPrice(course.price)}
                        </div>
                        <button 
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center space-x-1 space-x-reverse"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Enroll logic here
                          }}
                        >
                          <FaShoppingCart className="text-xs" />
                          <span>اشترك الآن</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Page Indicators */}
              {courses.length > coursesPerPage && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center justify-center bg-white rounded-full px-6 py-3 shadow-lg border border-gray-200">
                    {Array.from({ length: Math.ceil(courses.length / coursesPerPage) }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === currentPage 
                            ? 'bg-blue-600 scale-125 shadow-md' 
                            : 'bg-gray-300 hover:bg-blue-400 hover:scale-110'
                        } ${index > 0 ? 'mr-4' : ''}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!loading && !error && courses.length > coursesPerPage && (
            <div className="text-center mt-16">
              <button className="group px-10 py-4 bg-white text-blue-600 rounded-2xl border-2 border-blue-600 hover:bg-blue-600 hover:text-white font-bold transition-all duration-300 flex items-center justify-center mx-auto space-x-3 space-x-reverse shadow-xl hover:shadow-2xl transform hover:scale-105 text-lg">
                <span>عرض جميع الكورسات</span>
                <FaChevronDown className="text-lg group-hover:translate-y-1 transition-transform duration-300" />
              </button>
            </div>
          )}
        </motion.div>
      </motion.section>

    {/* قسم دعوة للعمل - تصميم جديد مع خلفية رمادية */}
<section className="py-16 sm:py-24 lg:py-32 bg-gray-50 relative overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-r from-gray-100/50 to-gray-200/30"></div>
  
  {/* عناصر زخرفية */}
  <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
  <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
  
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div className="bg-white rounded-2xl lg:rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-lg flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
      
      {/* الصورة الجانبية */}
      <div className="lg:w-2/5 relative">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1522881193457-37ae97c905bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
              alt="طالب يدرس على الكمبيوتر" 
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 to-transparent"></div>
            
            {/* شارة على الصورة */}
            <div className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
              <FaStar className="ml-1 text-xs" />
              <span>الأكثر إقبالاً</span>
            </div>
          </div>
          
          {/* عناصر عائمة تفاعلية حول الصورة */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -top-4 -right-4 bg-blue-600 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
          >
            <FaGraduationCap className="text-white text-xl" />
          </motion.div>
          
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
            className="absolute -bottom-4 -left-4 bg-green-600 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
          >
            <FaBook className="text-white text-lg" />
          </motion.div>
        </motion.div>
      </div>
      
      {/* المحتوى النصي مع أيقونات */}
      <div className="lg:w-3/5">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium mb-6 sm:mb-8 text-sm sm:text-base"
        >
          <FaPlay className="ml-2 text-xs" />
          ابدأ رحلتك التعليمية اليوم
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight"
        >
          انطلق نحو مستقبل أفضل 
          <span className="block mt-2 text-blue-600">بمعرفة لا حدود لها</span>
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-base sm:text-lg text-gray-600 mb-8 sm:mb-10 lg:mb-12 leading-relaxed"
        >
          انضم إلى <span className="font-semibold text-blue-600">50,000+</span> طالب وطالبة بدأوا رحلتهم نحو التميز المهني واكتساب المهارات التي تفتح الأبواب لأفضل الفرص الوظيفية في السوق.
        </motion.p>
        
        {/* ميزات مع أيقونات */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
        >
          {[
            { icon: <FaUsers className="text-xl" />, text: "مجتمع نشط من المتعلمين", color: "text-blue-600" },
            { icon: <FaStar className="text-xl" />, text: "جودة عالية في المحتوى", color: "text-amber-600" },
            { icon: <FaClock className="text-xl" />, text: "مرونة في الوقت والمكان", color: "text-green-600" },
            { icon: <FaChartLine className="text-xl" />, text: "تقدم مستمر نحو أهدافك", color: "text-purple-600" }
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ x: 5 }}
              className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer"
            >
              <div className={`${item.color} bg-white p-2 rounded-lg shadow-sm`}>
                {item.icon}
              </div>
              <div className="text-gray-700 font-medium">{item.text}</div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* إحصائيات */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-wrap gap-6 mb-8"
        >
          {[
            { number: "98%", text: "رضى الطلاب", icon: <FaStar className="text-amber-500" /> },
            { number: "+5K", text: "كورس متاح", icon: <FaBook className="text-blue-500" /> },
            { number: "500+", text: "خبير متخصص", icon: <FaUsers className="text-green-500" /> }
          ].map((stat, index) => (
            <div key={index} className="flex items-center space-x-2 space-x-reverse">
              <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
              <div className="text-gray-600">{stat.text}</div>
              <div>{stat.icon}</div>
            </div>
          ))}
        </motion.div>
        
        {/* مؤشر تفاعلي */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          viewport={{ once: true }}
          className="flex items-center space-x-4 space-x-reverse"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-3 h-3 rounded-full bg-blue-600"
          ></motion.div>
          
        <motion.div 
            whileHover={{ x: -5 }}
            className="group flex items-center text-blue-600 hover:text-blue-700 cursor-pointer transition-all duration-300 font-medium"
            onClick={scrollToCourses} // أضف هذا السطر
          >
            <span className="text-lg mr-2 group-hover:mr-3 transition-all">اكتشف الكورسات المتاحة</span>
            <FaChevronLeft className="group-hover:translate-x-1 transition-transform" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  </div>
</section>

      {/* تذييل الصفحة - Responsive */}
      <footer className="bg-gray-900 text-white pt-12 sm:pt-16 lg:pt-20 pb-6 sm:pb-8 lg:pb-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-3 space-x-reverse mb-6 sm:mb-8">
                <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl lg:rounded-2xl shadow-lg">
                  <FaGraduationCap className="text-white text-xl sm:text-2xl" />
                </div>
                <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                  تعلم
                </span>
              </div>
              <p className="text-gray-400 mb-6 sm:mb-8 leading-relaxed text-base sm:text-lg">
                منصة تعليمية رائدة تهدف إلى تمكين الأفراد عبر التعليم الإلكتروني التفاعلي والمبتكر.
              </p>
              <div className="flex space-x-3 sm:space-x-4 space-x-reverse">
                {[
                  { icon: <FaFacebookF />, color: 'hover:bg-blue-600', shadow: 'hover:shadow-blue-500/30' },
                  { icon: <FaTwitter />, color: 'hover:bg-blue-400', shadow: 'hover:shadow-blue-400/30' },
                  { icon: <FaInstagram />, color: 'hover:bg-pink-600', shadow: 'hover:shadow-pink-500/30' },
                  { icon: <FaYoutube />, color: 'hover:bg-red-600', shadow: 'hover:shadow-red-500/30' }
                ].map((social, index) => (
                  <a
                    key={index}
                    href="#"
                    className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gray-800 rounded-xl lg:rounded-2xl flex items-center justify-center text-gray-300 hover:text-white ${social.color} ${social.shadow} transition-all duration-300 hover:scale-110 transform shadow-lg`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {footerColumns.map((column, index) => (
              <div key={index} className="sm:col-span-1">
                <h4 className="text-lg sm:text-xl font-bold mb-6 sm:mb-8 text-white relative">
                  {column.title}
                  <div className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                </h4>
                <ul className="space-y-3 sm:space-y-4">
                  {column.links.map((link, i) => (
                    <li key={i}>
                      <a href="#" className="text-gray-400 hover:text-blue-400 transition-all duration-300 flex items-center space-x-3 space-x-reverse hover:translate-x-2 transform group text-sm sm:text-base">
                        <div className="text-blue-400 group-hover:scale-110 transition-transform duration-300">
                          {link.icon}
                        </div>
                        <span className="group-hover:text-white">{link.text}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 mt-12 sm:mt-16 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500 text-base sm:text-lg text-center md:text-right">
              © {new Date().getFullYear()} منصة تعلم. جميع الحقوق محفوظة.
            </p>
            <div className="flex space-x-6 sm:space-x-8 space-x-reverse">
              <a href="#" className="text-gray-500 hover:text-white transition-colors duration-300 hover:scale-105 transform text-sm sm:text-base">
                الشروط والأحكام
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors duration-300 hover:scale-105 transform text-sm sm:text-base">
                سياسة الخصوصية
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Course Details Modal */}
      {isModalOpen && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Modal Header */}
            <div className="relative">
              <div className="h-64 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 relative overflow-hidden">
                {selectedCourse.thumbnail ? (
                  <img 
                    src={selectedCourse.thumbnail} 
                    alt={selectedCourse.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <div className="bg-white/20 p-12 rounded-full backdrop-blur-sm shadow-2xl">
                      {getCategoryIcon(selectedCourse.title)}
                    </div>
                  </div>
                )}
                
                {/* Close Button */}
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-gray-600 hover:text-red-500 transition-colors hover:scale-110"
                >
                  <FaTimes className="text-lg" />
                </button>
                
                {/* Difficulty Badge */}
                <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-sm font-bold ${getDifficultyColor(selectedCourse.difficulty)} shadow-lg`}>
                  {selectedCourse.difficulty === 'beginner' ? 'مبتدئ' : 
                   selectedCourse.difficulty === 'intermediate' ? 'متوسط' : 
                   selectedCourse.difficulty === 'advanced' ? 'متقدم' : selectedCourse.difficulty}
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              {/* Course Title and Instructor */}
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">{selectedCourse.title}</h2>
                <div className="flex items-center text-gray-600 mb-4">
                  <FaUser className="text-blue-500 ml-2" />
                  <span className="text-lg font-medium">{selectedCourse.teacher_name}</span>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">{selectedCourse.description}</p>
              </div>

              {/* Course Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-xl text-center">
                  <FaStar className="text-yellow-400 text-2xl mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{selectedCourse.average_rating > 0 ? selectedCourse.average_rating.toFixed(1) : 'جديد'}</div>
                  <div className="text-sm text-gray-600">التقييم</div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl text-center">
                  <FaUsers className="text-green-500 text-2xl mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{selectedCourse.total_enrollments}</div>
                  <div className="text-sm text-gray-600">الطلاب</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl text-center">
                  <FaClock className="text-purple-500 text-2xl mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{formatDuration(selectedCourse.duration_hours)}</div>
                  <div className="text-sm text-gray-600">المدة</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl text-center">
                  <FaBook className="text-orange-500 text-2xl mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{selectedCourse.total_sections}</div>
                  <div className="text-sm text-gray-600">الأقسام</div>
                </div>
              </div>

              {/* Course Details */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">تفاصيل الكورس</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">عدد الأقسام:</span>
                      <span className="font-medium">{selectedCourse.total_sections}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">عدد الاختبارات:</span>
                      <span className="font-medium">{selectedCourse.total_quizzes}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">المدة الإجمالية:</span>
                      <span className="font-medium">{formatDuration(selectedCourse.duration_hours)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">تاريخ الإنشاء:</span>
                      <span className="font-medium">{new Date(selectedCourse.created_at).toLocaleDateString('ar-EG')}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">مميزات الكورس</h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-green-600">
                      <FaCheck className="ml-2" />
                      <span>شهادة إتمام</span>
                    </div>
                    <div className="flex items-center text-green-600">
                      <FaCheck className="ml-2" />
                      <span>وصول مدى الحياة</span>
                    </div>
                    <div className="flex items-center text-green-600">
                      <FaCheck className="ml-2" />
                      <span>دعم فني متاح</span>
                    </div>
                    <div className="flex items-center text-green-600">
                      <FaCheck className="ml-2" />
                      <span>مواد قابلة للتحميل</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex-1 bg-blue-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-3 space-x-reverse shadow-lg hover:shadow-xl">
                  <FaShoppingCart className="text-xl" />
                  <span>اشترك الآن - {formatPrice(selectedCourse.price)}</span>
                </button>
                <button className="flex-1 bg-white text-blue-600 border-2 border-blue-600 py-4 px-8 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors flex items-center justify-center space-x-3 space-x-reverse">
                  <FaHeart className="text-xl" />
                  <span>أضف للمفضلة</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* تم إزالة styled-jsx */}
    </div>
  );
};

export default LearningPlatform;