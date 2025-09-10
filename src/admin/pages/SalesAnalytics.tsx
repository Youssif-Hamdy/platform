import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  BookOpen, 
  Star,
  Calendar,
  Download,
  BarChart3,
  Activity,
  Target,
  Clock
} from 'lucide-react';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'admin' | 'teacher' | 'student' | 'parent';
  phone_number: string;
  date_joined: string;
  last_login: string;
  is_active: boolean;
  email_verified: boolean;
  parent: number | null;
}

interface SalesAnalyticsProps {
  users: User[];
}

const SalesAnalytics: React.FC<SalesAnalyticsProps> = ({ users }) => {
  const [timeRange, setTimeRange] = useState('30d');
  const [chartType, setChartType] = useState('bar');

  // Mock data - in real app, this would come from API
  const analyticsData = {
    revenue: {
      total: 125000,
      monthly: 15000,
      weekly: 3500,
      daily: 500,
      growth: 12.5
    },
    users: {
      total: users.length,
      new: users.filter(u => {
        const joinDate = new Date(u.date_joined);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return joinDate > thirtyDaysAgo;
      }).length,
      active: users.filter(u => u.is_active).length,
      growth: 8.3
    },
    courses: {
      total: 45,
      published: 38,
      draft: 7,
      growth: 15.2
    },
    ratings: {
      average: 4.7,
      total: 1250,
      fiveStar: 850,
      fourStar: 300,
      threeStar: 80,
      twoStar: 15,
      oneStar: 5
    }
  };

  // Generate mock chart data
  const generateChartData = () => {
    const data = [];
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }),
        revenue: Math.floor(Math.random() * 2000) + 1000,
        users: Math.floor(Math.random() * 20) + 5,
        courses: Math.floor(Math.random() * 5) + 1
      });
    }
    return data;
  };

  const chartData = generateChartData();

  const getRevenueGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getRevenueGrowthIcon = (growth: number) => {
    return growth >= 0 ? TrendingUp : TrendingDown;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">متابعة المبيعات والإحصائيات</h1>
        <p className="text-gray-600">تحليل شامل لأداء المنصة والإيرادات</p>
      </div>

      {/* Time Range Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-800">الفترة الزمنية:</h3>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">آخر 7 أيام</option>
              <option value="30d">آخر 30 يوم</option>
              <option value="90d">آخر 90 يوم</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              تصدير التقرير
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي الإيرادات</p>
              <p className="text-3xl font-bold text-gray-900">
                {analyticsData.revenue.total.toLocaleString()} ج.م
              </p>
              <div className="flex items-center mt-2">
                {React.createElement(getRevenueGrowthIcon(analyticsData.revenue.growth), {
                  className: `w-4 h-4 ${getRevenueGrowthColor(analyticsData.revenue.growth)}`
                })}
                <span className={`text-sm font-medium ${getRevenueGrowthColor(analyticsData.revenue.growth)}`}>
                  +{analyticsData.revenue.growth}%
                </span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي المستخدمين</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData.users.total}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  +{analyticsData.users.growth}%
                </span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي الكورسات</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData.courses.total}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  +{analyticsData.courses.growth}%
                </span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <BookOpen className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">متوسط التقييم</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData.ratings.average}</p>
              <div className="flex items-center mt-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-600">
                  من {analyticsData.ratings.total} تقييم
                </span>
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">الإيرادات اليومية</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChartType('bar')}
                className={`p-2 rounded-lg transition-colors ${
                  chartType === 'bar' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`p-2 rounded-lg transition-colors ${
                  chartType === 'line' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
                }`}
              >
                <Activity className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {chartData.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-400"
                  style={{ height: `${(item.revenue / 2000) * 200}px` }}
                ></div>
                <span className="text-xs text-gray-600 mt-2">{item.date}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Users Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-6">المستخدمين الجدد</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {chartData.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-green-500 to-green-300 rounded-t-lg transition-all duration-300 hover:from-green-600 hover:to-green-400"
                  style={{ height: `${(item.users / 25) * 200}px` }}
                ></div>
                <span className="text-xs text-gray-600 mt-2">{item.date}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-6">تفصيل الإيرادات</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-medium text-gray-800">الإيرادات الشهرية</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {analyticsData.revenue.monthly.toLocaleString()} ج.م
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-medium text-gray-800">الإيرادات الأسبوعية</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {analyticsData.revenue.weekly.toLocaleString()} ج.م
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <span className="font-medium text-gray-800">الإيرادات اليومية</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {analyticsData.revenue.daily.toLocaleString()} ج.م
              </span>
            </div>
          </div>
        </motion.div>

        {/* Rating Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-6">توزيع التقييمات</h3>
          <div className="space-y-4">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = rating === 5 ? analyticsData.ratings.fiveStar :
                          rating === 4 ? analyticsData.ratings.fourStar :
                          rating === 3 ? analyticsData.ratings.threeStar :
                          rating === 2 ? analyticsData.ratings.twoStar :
                          analyticsData.ratings.oneStar;
              const percentage = (count / analyticsData.ratings.total) * 100;
              
              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-12 text-left">
                    {count} ({percentage.toFixed(1)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SalesAnalytics;
