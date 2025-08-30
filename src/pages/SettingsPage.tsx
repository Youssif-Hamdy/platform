import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X, CheckCircle, Activity } from 'lucide-react';

interface SettingsPageProps {
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ showToast }) => {
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string>('');

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem('refreshToken');
      if (!refresh) return null;
      
      const res = await fetch('/user/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh })
      });
      
      if (!res.ok) return null;
      
      const data = await res.json();
      if (data.access) localStorage.setItem('accessToken', data.access);
      
      return data.access as string;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  };

  const authFetch = async (url: string, init?: RequestInit) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      window.location.href = '/signin';
      return new Response(null, { status: 401 });
    }
    
    let res = await fetch(url, {
      ...init,
      headers: {
        ...(init && init.headers ? init.headers : {}),
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    if (res.status === 401) {
      const newToken = await refreshToken();
      if (newToken) {
        res = await fetch(url, {
          ...init,
          headers: {
            ...(init && init.headers ? init.headers : {}),
            'Authorization': `Bearer ${newToken}`,
            'Accept': 'application/json'
          }
        });
      } else {
        localStorage.clear();
        window.location.href = '/signin';
        return new Response(null, { status: 401 });
      }
    }
    return res;
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleteLoading(true);
      setDeleteError('');
      
      const res = await authFetch('/user/delete-account/', {
        method: 'POST'
      });
      
      if (res.ok) {
        const data = await res.json();
        
        if (data.message === 'Account deleted successfully') {
          showToast('success', 'تم حذف الحساب بنجاح');
          setTimeout(() => {
            localStorage.clear();
            window.location.href = '/signin';
          }, 2000);
        } else {
          setDeleteError('حدث خطأ في استجابة الخادم');
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        setDeleteError(errorData.message || `حدث خطأ أثناء حذف الحساب (${res.status})`);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setDeleteError('حدث خطأ غير متوقع');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">الإعدادات</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Settings */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">الإعدادات العامة</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">الإشعارات</div>
                  <div className="text-sm text-gray-500">استلام إشعارات البريد الإلكتروني</div>
                </div>
                <button className="w-12 h-6 bg-blue-600 rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                </button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">الخصوصية</div>
                  <div className="text-sm text-gray-500">إظهار الملف الشخصي للآخرين</div>
                </div>
                <button className="w-12 h-6 bg-gray-300 rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1"></div>
                </button>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">إعدادات الحساب</h2>
            <div className="space-y-4">
              <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
                <div className="font-medium text-blue-900">تغيير كلمة المرور</div>
                <div className="text-sm text-blue-700">تحديث كلمة المرور الخاصة بك</div>
              </button>
              
              <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
                <div className="font-medium text-blue-900">تحديث الملف الشخصي</div>
                <div className="text-sm text-blue-700">تعديل المعلومات الشخصية</div>
              </button>
              
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="w-full text-left p-3 bg-red-50 hover:bg-red-100 rounded-lg transition"
              >
                <div className="font-medium text-red-900">حذف الحساب</div>
                <div className="text-sm text-red-700">حذف الحساب نهائياً</div>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">حذف الحساب</h3>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="flex items-center gap-3 mb-4 p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-700">
                هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك نهائياً.
              </p>
            </div>
            
            <p className="text-gray-600 mb-6 text-sm">
              هل أنت متأكد من أنك تريد حذف حسابك؟ سيتم حذف جميع البيانات والملفات المرتبطة بحسابك.
            </p>
            
            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{deleteError}</p>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                disabled={deleteLoading}
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-50"
              >
                {deleteLoading ? 'جاري الحذف...' : 'حذف الحساب'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default SettingsPage;
