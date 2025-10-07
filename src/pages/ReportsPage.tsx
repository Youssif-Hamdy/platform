import React from 'react';
import { motion } from 'framer-motion';
import { FileText, TrendingUp, TrendingDown,  BookOpen, Award, Clock } from 'lucide-react';

const ReportsPage: React.FC = () => {
  // بيانات تجريبية للتقارير
  const reports = [
    {
      id: 1,
      title: 'تقرير الأداء الشهري',
      description: 'تقرير شامل عن أداء الطالب خلال الشهر الماضي',
      date: '2024-01-15',
      type: 'monthly',
      status: 'completed'
    },
    {
      id: 2,
      title: 'تقرير التقدم في الدورات',
      description: 'متابعة التقدم في جميع الدورات المسجلة',
      date: '2024-01-10',
      type: 'progress',
      status: 'completed'
    },
    {
      id: 3,
      title: 'تقرير الاختبارات',
      description: 'نتائج جميع الاختبارات والواجبات',
      date: '2024-01-08',
      type: 'exams',
      status: 'pending'
    }
  ];

  const stats = [
    {
      title: 'إجمالي الدورات المكتملة',
      value: '12',
      change: '+2',
      trend: 'up',
      icon: BookOpen,
      color: 'blue'
    },
    {
      title: 'متوسط الدرجات',
      value: '85%',
      change: '+5%',
      trend: 'up',
      icon: Award,
      color: 'green'
    },
    {
      title: 'ساعات الدراسة',
      value: '48',
      change: '+8',
      trend: 'up',
      icon: Clock,
      color: 'purple'
    },
    {
      title: 'الاختبارات المكتملة',
      value: '25',
      change: '-2',
      trend: 'down',
      icon: FileText,
      color: 'orange'
    }
  ];

  const getStatusColor = (status: string) => {
    return status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (status: string) => {
    return status === 'completed' ? 'مكتمل' : 'قيد المعالجة';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">التقارير والإحصائيات</h1>
      
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
              <div className={`flex items-center gap-1 text-sm ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{stat.change}</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.title}</div>
          </motion.div>
        ))}
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">التقدم الأسبوعي</h3>
          <div className="space-y-4">
            {['الرياضيات', 'اللغة العربية', 'العلوم', 'اللغة الإنجليزية'].map((subject, index) => (
              <div key={subject} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{subject}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${75 + index * 5}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{75 + index * 5}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">ساعات الدراسة اليومية</h3>
          <div className="space-y-4">
            
            {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map((day,  // @ts-ignore

            index) => (
              <div key={day} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{day}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${60 + Math.random() * 40}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{Math.floor(2 + Math.random() * 4)}h</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* قائمة التقارير */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">التقارير المتاحة</h3>
        <div className="space-y-4">
          {reports.map((report) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: report.id * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{report.title}</h4>
                  <p className="text-sm text-gray-600">{report.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{report.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                  {getStatusText(report.status)}
                </span>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                  عرض التقرير
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ReportsPage;







