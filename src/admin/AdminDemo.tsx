import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Users, BarChart3, Star, BookOpen, Settings } from 'lucide-react';

const AdminDemo: React.FC = () => {
  const features = [
    {
      icon: Users,
      title: 'إدارة المدرسين',
      description: 'إدارة شاملة لجميع المدرسين في المنصة',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: Users,
      title: 'إدارة الطلاب',
      description: 'متابعة وإدارة جميع الطلاب',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: BarChart3,
      title: 'الإحصائيات والمبيعات',
      description: 'تحليل شامل لأداء المنصة والإيرادات',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: Star,
      title: 'إدارة التقييمات',
      description: 'مراجعة وإدارة تقييمات الكورسات',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      icon: BookOpen,
      title: 'إدارة الأقسام',
      description: 'تنظيم وإدارة أقسام الكورسات',
      color: 'from-indigo-500 to-purple-600'
    },
    {
      icon: Settings,
      title: 'نظام الصلاحيات',
      description: 'إدارة صلاحيات المستخدمين',
      color: 'from-red-500 to-pink-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">لوحة التحكم الإدارية</h1>
                <p className="text-sm text-gray-600">منصة إدارة شاملة</p>
              </div>
            </div>
            <Link
              to="/admin-dashboard"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              دخول اللوحة
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            لوحة تحكم <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">احترافية</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            إدارة شاملة ومتقدمة لمنصتك التعليمية مع واجهة مستخدم حديثة وتقنيات متطورة
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/admin-dashboard"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Shield className="w-5 h-5" />
              دخول لوحة التحكم
            </Link>
            <Link
              to="/admin-signin"
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-blue-500 hover:text-blue-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              إنشاء حساب أدمن
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">إحصائيات المنصة</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">1,250+</div>
              <div className="text-gray-600">مستخدم نشط</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">45+</div>
              <div className="text-gray-600">كورس متاح</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">25+</div>
              <div className="text-gray-600">مدرس محترف</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">98%</div>
              <div className="text-gray-600">معدل الرضا</div>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">التقنيات المستخدمة</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">R</span>
              </div>
              <div className="font-semibold text-gray-800">React 19</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">TS</span>
              </div>
              <div className="font-semibold text-gray-800">TypeScript</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-cyan-600">T</span>
              </div>
              <div className="font-semibold text-gray-800">Tailwind CSS</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">F</span>
              </div>
              <div className="font-semibold text-gray-800">Framer Motion</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">لوحة التحكم الإدارية</span>
            </div>
            <p className="text-gray-400 mb-6">
              منصة إدارة شاملة ومتقدمة للمنصات التعليمية
            </p>
            <div className="flex justify-center gap-6">
              <Link
                to="/admin-dashboard"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                دخول اللوحة
              </Link>
              <Link
                to="/admin-signin"
                className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:border-gray-500 hover:text-white transition-colors"
              >
                إنشاء حساب
              </Link>
            </div>
            <p className="text-gray-500 text-sm mt-6">
              © 2024 المنصة التعليمية - جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDemo;
