import React from 'react';
import { motion } from 'framer-motion';
import { User, Activity, Award, BookOpen } from 'lucide-react';

interface Profile {
  id?: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  user_type?: string;
  phone_number?: string;
  date_of_birth?: string;
  bio?: string;
  address?: string;
  city?: string;
  country?: string;
  profile_picture?: string;
  level?: number;
  skills?: string[];
}

interface ProfilePageProps {
  profile: Profile | null;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ profile }) => {
  const nameFromStorage = () => {
    return localStorage.getItem('displayName') || profile?.username || 'المستخدم';
  };

  const avatarUrl = () => {
    return (profile && profile.profile_picture) || localStorage.getItem('profileImageUrl') || '';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">الملف الشخصي</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Profile card */}
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="lg:col-span-1">
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-sm p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-blue-100 shadow mb-4 bg-blue-50 flex items-center justify-center">
                {avatarUrl() ? (
                  <img src={avatarUrl()} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-blue-500" />
                )}
              </div>
              <div className="text-lg font-bold text-gray-900">{nameFromStorage()}</div>
              <div className="text-sm text-gray-500 mt-1">{profile?.user_type || localStorage.getItem('userType') || 'مستخدم'}</div>
              <div className="flex flex-wrap gap-2 mt-4">
                {(profile?.skills || []).map((s, idx) => (
                  <span key={idx} className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-100">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right column: Info + Activities */}
        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="lg:col-span-2">
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">المعلومات العامة</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">الاسم</span><span className="text-gray-900">{nameFromStorage()}</span></div>
                <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">البريد</span><span className="text-gray-900">{profile?.email || '-'}</span></div>
                <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">النوع</span><span className="text-gray-900">{profile?.user_type || '-'}</span></div>
                <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">الهاتف</span><span className="text-gray-900">{profile?.phone_number || '-'}</span></div>
                <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">تاريخ الميلاد</span><span className="text-gray-900">{profile?.date_of_birth || '-'}</span></div>
                <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">الدولة</span><span className="text-gray-900">{profile?.country || '-'}</span></div>
                <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">المدينة</span><span className="text-gray-900">{profile?.city || '-'}</span></div>
                <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">العنوان</span><span className="text-gray-900">{profile?.address || '-'}</span></div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">آخر الأنشطة</h2>
              <div className="space-y-4">
                {[1,2,3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                        {i === 1 ? <Activity className="w-5 h-5" /> : i === 2 ? <Award className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">نشاط {i}</div>
                        <div className="text-xs text-gray-500">وصف موجز للنشاط</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">اليوم</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;







