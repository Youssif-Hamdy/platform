import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Clock, Users, Star } from 'lucide-react';

const CoursesPage: React.FC = () => {
  // بيانات تجريبية للدورات
  const courses = [
    {
      id: 1,
      title: 'الرياضيات الأساسية',
      description: 'دورة شاملة في أساسيات الرياضيات للمبتدئين',
      instructor: 'أحمد محمد',
      duration: '8 أسابيع',
      students: 150,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=250&fit=crop'
    },
    {
      id: 2,
      title: 'اللغة العربية',
      description: 'تعلم قواعد اللغة العربية والكتابة الصحيحة',
      instructor: 'فاطمة علي',
      duration: '6 أسابيع',
      students: 120,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=250&fit=crop'
    },
    {
      id: 3,
      title: 'العلوم الطبيعية',
      description: 'استكشاف عالم العلوم والتجارب العملية',
      instructor: 'محمد أحمد',
      duration: '10 أسابيع',
      students: 200,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=250&fit=crop'
    },
    {
      id: 4,
      title: 'اللغة الإنجليزية',
      description: 'تعلم اللغة الإنجليزية بطريقة تفاعلية',
      instructor: 'سارة خالد',
      duration: '12 أسبوع',
      students: 180,
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=250&fit=crop'
    }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">الدورات التعليمية</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: course.id * 0.1 }}
            className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 relative">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-gray-700 flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                {course.rating}
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{course.students} طالب</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">المعلم: {course.instructor}</span>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                  انضم الآن
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* إحصائيات سريعة */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{courses.length}</div>
          <div className="text-gray-600">إجمالي الدورات</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{courses.reduce((sum, course) => sum + course.students, 0)}</div>
          <div className="text-gray-600">إجمالي الطلاب</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">4</div>
          <div className="text-gray-600">المعلمون</div>
        </div>
      </div>
    </motion.div>
  );
};

export default CoursesPage;
