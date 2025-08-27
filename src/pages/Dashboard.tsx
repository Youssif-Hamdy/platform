import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, User, Award, Activity, Settings, LogOut, LayoutDashboard, GraduationCap, FileText, Users, ChevronLeft, Menu } from 'lucide-react';

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

const Dashboard: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(false);

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem('refreshToken');
      if (!refresh) return null;
      
      console.log('=== REFRESH TOKEN REQUEST ===');
      console.log('Request URL:', 'https://educational-platform-qg3zn6tpl-youssefs-projects-e2c35ebf.vercel.app/api/token/refresh/');
      
      const res = await fetch('https://educational-platform-qg3zn6tpl-youssefs-projects-e2c35ebf.vercel.app/api/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh })
      });
      
      console.log('=== REFRESH TOKEN RESPONSE ===');
      console.log('Response Status:', res.status);
      console.log('Response OK:', res.ok);
      
      if (!res.ok) return null;
      
      const data = await res.json();
      if (data.access) localStorage.setItem('accessToken', data.access);
      
      console.log('Token refreshed successfully');
      return data.access as string;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  };

  const authFetch = async (url: string, init?: RequestInit) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      // إذا لم يوجد توكن، توجيه إلى صفحة تسجيل الدخول
      window.location.href = '/signin';
      return new Response(null, { status: 401 });
    }
    
    console.log('=== AUTH FETCH REQUEST ===');
    console.log('Request URL:', url);
    console.log('Request Headers:', {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      ...(init && init.headers ? init.headers : {})
    });
    
    let res = await fetch(url, {
      ...init,
      headers: {
        ...(init && init.headers ? init.headers : {}),
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    console.log('=== AUTH FETCH RESPONSE ===');
    console.log('Response Status:', res.status);
    console.log('Response OK:', res.ok);
    
    if (res.status === 401) {
      console.log('Token expired, attempting refresh...');
      const newToken = await refreshToken();
      if (newToken) {
        console.log('Retrying request with new token...');
        res = await fetch(url, {
          ...init,
          headers: {
            ...(init && init.headers ? init.headers : {}),
            'Authorization': `Bearer ${newToken}`,
            'Accept': 'application/json'
          }
        });
        
        console.log('=== RETRY RESPONSE ===');
        console.log('Response Status:', res.status);
        console.log('Response OK:', res.ok);
      } else {
        // إذا فشل تجديد التوكن، توجيه إلى صفحة تسجيل الدخول
        console.log('Refresh token failed, redirecting to login');
        localStorage.clear();
        window.location.href = '/signin';
        return new Response(null, { status: 401 });
      }
    }
    return res;
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        
        // التحقق من وجود التوكن أولاً
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setError('يجب تسجيل الدخول أولاً');
          setLoading(false);
          window.location.href = '/signin';
          return;
        }

        console.log('=== PROFILE REQUEST ===');
        console.log('Request URL:', 'https://educational-platform-qg3zn6tpl-youssefs-projects-e2c35ebf.vercel.app/user/profile/');
        
        const res = await authFetch('https://educational-platform-qg3zn6tpl-youssefs-projects-e2c35ebf.vercel.app/user/profile/');
        
        if (!res || !res.ok) {
          console.log('Profile request failed');
          setError('تعذر تحميل الملف الشخصي');
          setLoading(false);
          return;
        }
        
        let data;
        try {
          const responseText = await res.text();
          console.log('Response Text:', responseText);

          if (responseText) {
            data = JSON.parse(responseText);
          } else {
            data = {};
          }
        } catch (error) {
          console.error('Error parsing JSON response:', error);
          setError('خطأ في استقبال البيانات من الخادم');
          setLoading(false);
          return;
        }
        
        console.log('=== PROFILE DATA ===');
        console.log('Profile Data:', data);
        
        setProfile(data);
        
        // حفظ بعض البيانات للوصول السريع عبر التطبيق
        if (data) {
          const displayName = data.first_name && data.last_name
            ? `${data.first_name} ${data.last_name}`
            : data.username || '';
          if (displayName) localStorage.setItem('displayName', displayName);
          if (data.user_type) localStorage.setItem('userType', data.user_type);
          if (data.profile_picture) localStorage.setItem('profileImageUrl', data.profile_picture);
        }
      } catch (e) {
        console.error('Unexpected error:', e);
        setError('حدث خطأ غير متوقع');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Track viewport to apply desktop-only margins for content/header
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)');
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener ? mql.addEventListener('change', update) : mql.addListener(update as any);
    return () => {
      mql.removeEventListener ? mql.removeEventListener('change', update) : mql.removeListener(update as any);
    };
  }, []);

  const nameFromStorage = () => {
    return localStorage.getItem('displayName') || profile?.username || 'المستخدم';
  };

  const avatarUrl = () => {
    return (profile && profile.profile_picture) || localStorage.getItem('profileImageUrl') || '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      {/* Top headers */}
      {/* Mobile full-width header */}
      <div className="fixed top-0 inset-x-0 z-50 h-12 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-3 md:hidden">
        <button onClick={() => setMobileSidebarOpen(true)} className="p-2 rounded-md bg-white border border-gray-200 shadow" aria-label="Open sidebar">
          <Menu className="w-5 h-5 text-blue-700" />
        </button>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-blue-50 text-gray-700 shadow" aria-label="Settings">
            <Settings className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-red-50 text-red-600 shadow" onClick={() => { localStorage.clear(); window.location.href = '/signin'; }} aria-label="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Desktop inline header inside content area (no overlap with sidebar) */}
      <div className="hidden md:block" style={{ marginLeft: isDesktop ? (sidebarCollapsed ? 80 : 256) : 0, transition: 'margin-left 300ms ease-in-out' }}>
        <div className="h-14 flex items-center justify-end px-4 border-b border-gray-100 bg-white/70 backdrop-blur-md">
          <button className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-blue-50 text-gray-700 shadow" aria-label="Settings">
            <Settings className="w-4 h-4" />
          </button>
          <button className="ml-2 p-2 rounded-lg bg-white border border-gray-200 hover:bg-red-50 text-red-600 shadow" onClick={() => { localStorage.clear(); window.location.href = '/signin'; }} aria-label="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sidebar (desktop) */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} transition-[width] duration-300 fixed left-0 top-0 bottom-0 bg-white/80 backdrop-blur-xl border-r border-gray-100 z-60 hidden md:flex`}>
        <div className="w-full h-full p-4 overflow-y-auto">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} mb-4`}>
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <span className="text-base font-bold text-gray-900">تعلم</span>
              </div>
            )}
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className={`p-1 rounded-md hover:bg-blue-50 text-blue-700 transition ${sidebarCollapsed ? '' : ''}`} aria-label="Collapse sidebar">
              <ChevronLeft className={`w-5 h-5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>
          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition">
              <LayoutDashboard className="w-5 h-5" />
              {!sidebarCollapsed && <span className="text-sm">لوحة التحكم</span>}
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition">
              <GraduationCap className="w-5 h-5" />
              {!sidebarCollapsed && <span className="text-sm">الدورات</span>}
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition">
              <Users className="w-5 h-5" />
              {!sidebarCollapsed && <span className="text-sm">المعلمون</span>}
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition">
              <FileText className="w-5 h-5" />
              {!sidebarCollapsed && <span className="text-sm">التقارير</span>}
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-700">
              <User className="w-5 h-5" />
              {!sidebarCollapsed && <span className="text-sm">البروفايل</span>}
            </button>
          </nav>
          <div className="pt-3 mt-3 border-t border-gray-100" />
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition">
            <Settings className="w-5 h-5" />
            {!sidebarCollapsed && <span className="text-sm">الإعدادات</span>}
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition" onClick={() => { localStorage.clear(); window.location.href = '/signin'; }}>
            <LogOut className="w-5 h-5" />
            {!sidebarCollapsed && <span className="text-sm">خروج</span>}
          </button>
        </div>
      </aside>

      {/* Sidebar (mobile drawer) */}
      <div className={`fixed inset-0 z-60 md:hidden ${mobileSidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-black/30 transition-opacity ${mobileSidebarOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setMobileSidebarOpen(false)} />
        <div className={`absolute top-0 bottom-0 left-0 w-64 bg-white shadow-xl transition-transform ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-full p-4 overflow-y-auto">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <span className="text-base font-bold text-gray-900">تعلم</span>
            </div>
            <nav className="space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition">
                <LayoutDashboard className="w-5 h-5" />
                <span className="text-sm">لوحة التحكم</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition">
                <GraduationCap className="w-5 h-5" />
                <span className="text-sm">الدورات</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition">
                <Users className="w-5 h-5" />
                <span className="text-sm">المعلمون</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition">
                <FileText className="w-5 h-5" />
                <span className="text-sm">التقارير</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-700">
                <User className="w-5 h-5" />
                <span className="text-sm">البروفايل</span>
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Main */}
      <main
        className={`px-4 sm:px-6 lg:px-8 pt-12 md:pt-6`}
        style={{ marginLeft: isDesktop ? (sidebarCollapsed ? 80 : 256) : 0, transition: 'margin-left 300ms ease-in-out' }}
      >
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 pr-0 md:pr-0">الملف الشخصي</h1>
        </motion.div>

        {loading ? (
          <div className="text-center text-gray-600">...جار التحميل</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10">
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
        )}
      </main>
    </div>
  );
};

export default Dashboard;