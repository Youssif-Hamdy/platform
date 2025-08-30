import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Award, Clock, TrendingUp, Calendar, Target, CheckCircle } from 'lucide-react';

const DashboardHomePage: React.FC = () => {
  // بيانات تجريبية للإحصائيات
  const stats = [
    {
      title: 'الدورات المسجلة',
      value: '8',
      change: '+2',
      trend: 'up',
      icon: BookOpen,
      color: 'blue'
    },
    {
      title: 'ساعات الدراسة',
      value: '24',
      change: '+6',
      trend: 'up',
      icon: Clock,
      color: 'green'
    },
    {
      title: 'الاختبارات المكتملة',
      value: '15',
      change: '+3',
      trend: 'up',
      icon: CheckCircle,
      color: 'purple'
    },
    {
      title: 'متوسط الدرجات',
      value: '87%',
      change: '+5%',
      trend: 'up',
      icon: Award,
      color: 'orange'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      title: 'أكملت درس الرياضيات',
      description: 'تم إكمال الدرس الثالث في الجبر',
      time: 'منذ ساعتين',
      type: 'course'
    },
    {
      id: 2,
      title: 'حصلت على شهادة',
      description: 'شهادة إتمام دورة اللغة العربية',
      time: 'منذ يوم واحد',
      type: 'certificate'
    },
    {
      id: 3,
      title: 'أكملت اختبار',
      description: 'اختبار العلوم - الدرجة: 95%',
      time: 'منذ يومين',
      type: 'exam'
    }
  ];

  const upcomingTasks = [
    {
      id: 1,
      title: 'واجب الرياضيات',
      dueDate: 'غداً',
      priority: 'high'
    },
    {
      id: 2,
      title: 'اختبار اللغة الإنجليزية',
      dueDate: 'بعد يومين',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'مشروع العلوم',
      dueDate: 'الأسبوع القادم',
      priority: 'low'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'عالية';
      case 'medium': return 'متوسطة';
      case 'low': return 'منخفضة';
      default: return 'غير محدد';
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">لوحة التحكم</h1>
      
      {/* الإحصائيات السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>{stat.change}</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.title}</div>
          </motion.div>
        ))}
      </div>

      {/* المحتوى الرئيسي */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* الأنشطة الأخيرة */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">الأنشطة الأخيرة</h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: activity.id * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                    {activity.type === 'course' && <BookOpen className="w-5 h-5" />}
                    {activity.type === 'certificate' && <Award className="w-5 h-5" />}
                    {activity.type === 'exam' && <CheckCircle className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{activity.title}</h4>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* المهام القادمة */}
        <div>
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">المهام القادمة</h3>
            <div className="space-y-4">
              {upcomingTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: task.id * 0.1 }}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {getPriorityText(task.priority)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>موعد التسليم: {task.dueDate}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* التقدم الأسبوعي */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">التقدم الأسبوعي</h3>
            <div className="space-y-4">
              {['الرياضيات', 'اللغة العربية', 'العلوم', 'اللغة الإنجليزية'].map((subject, index) => (
                <div key={subject} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{subject}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${70 + index * 8}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{70 + index * 8}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardHomePage;
