import React from 'react';
import { useUiLang } from '../utils/i18n';
import { motion } from 'framer-motion';
import { Users, Star, BookOpen, MessageCircle } from 'lucide-react';

const TeachersPage: React.FC = () => {
  // بيانات تجريبية للمعلمين
  const teachers = [
    {
      id: 1,
      name: 'أحمد محمد',
      subject: 'الرياضيات',
      experience: '8 سنوات',
      rating: 4.9,
      students: 250,
      courses: 12,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
      bio: 'معلم رياضيات محترف مع خبرة 8 سنوات في تدريس الرياضيات للمراحل المختلفة'
    },
    {
      id: 2,
      name: 'فاطمة علي',
      subject: 'اللغة العربية',
      experience: '6 سنوات',
      rating: 4.8,
      students: 180,
      courses: 8,
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face',
      bio: 'معلمة لغة عربية متخصصة في تدريس النحو والأدب العربي'
    },
    {
      id: 3,
      name: 'محمد أحمد',
      subject: 'العلوم',
      experience: '10 سنوات',
      rating: 4.7,
      students: 300,
      courses: 15,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
      bio: 'معلم علوم طبيعية مع خبرة في التجارب العملية والعلوم التطبيقية'
    },
    {
      id: 4,
      name: 'سارة خالد',
      subject: 'اللغة الإنجليزية',
      experience: '5 سنوات',
      rating: 4.6,
      students: 200,
      courses: 10,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
      bio: 'معلمة لغة إنجليزية متخصصة في المحادثة والكتابة الإبداعية'
    }
  ];

  const { isRTL } = useUiLang();
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} dir={isRTL ? 'rtl' : 'ltr'}>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">{isRTL ? 'المعلمون' : 'Teachers'}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher) => (
          <motion.div
            key={teacher.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: teacher.id * 0.1 }}
            className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-sm p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                <img
                  src={teacher.image}
                  alt={teacher.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{teacher.name}</h3>
                <p className="text-blue-600 font-medium">{teacher.subject}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm text-gray-600">{teacher.rating}</span>
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{teacher.bio}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <Users className="w-4 h-4" />
                <span>{teacher.students} طالب</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <BookOpen className="w-4 h-4" />
                <span>{teacher.courses} دورة</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">خبرة: {teacher.experience}</span>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                تواصل
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* إحصائيات المعلمين */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{teachers.length}</div>
          <div className="text-gray-600">إجمالي المعلمين</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{teachers.reduce((sum, teacher) => sum + teacher.students, 0)}</div>
          <div className="text-gray-600">إجمالي الطلاب</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{teachers.reduce((sum, teacher) => sum + teacher.courses, 0)}</div>
          <div className="text-gray-600">إجمالي الدورات</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">{(teachers.reduce((sum, teacher) => sum + teacher.rating, 0) / teachers.length).toFixed(1)}</div>
          <div className="text-gray-600">متوسط التقييم</div>
        </div>
      </div>
    </motion.div>
  );
};

export default TeachersPage;





