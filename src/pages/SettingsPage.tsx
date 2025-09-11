import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X, CheckCircle, Activity, MessageCircle, Send, Mail, Phone } from 'lucide-react';

interface SettingsPageProps {
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ showToast }) => {
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string>('');
  
  // Support ticket modal states
  const [showSupportModal, setShowSupportModal] = useState<boolean>(false);
  const [supportLoading, setSupportLoading] = useState<boolean>(false);
  const [supportError, setSupportError] = useState<string>('');
  const [ticketData, setTicketData] = useState({
    name: '',
    email: '',
    phone_number: '',
    subject: '',
    category: 'technical',
    priority: 'low',
    description: ''
  });

  // Contact support modal states
  const [showContactModal, setShowContactModal] = useState<boolean>(false);
  const [contactLoading, setContactLoading] = useState<boolean>(false);
  const [contactError, setContactError] = useState<string>('');
  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    message: ''
  });

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

  const handleSupportTicket = async () => {
    try {
      setSupportLoading(true);
      setSupportError('');
      
      // Validate required fields
      if (!ticketData.name || !ticketData.email || !ticketData.subject || !ticketData.description) {
        setSupportError('يرجى ملء جميع الحقول المطلوبة');
        return;
      }
      
      const res = await authFetch('/support/tickets/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ticketData)
      });
      
      if (res.ok) {
        const data = await res.json();
        showToast('success', 'تم الارسال الي الدعم بنجاح');
        setShowSupportModal(false);
        // Reset form
        setTicketData({
          name: '',
          email: '',
          phone_number: '',
          subject: '',
          category: 'technical',
          priority: 'low',
          description: ''
        });
      } else {
        const errorData = await res.json().catch(() => ({}));
        setSupportError(errorData.message || `حدث خطأ أثناء إنشاء التيكت (${res.status})`);
      }
    } catch (error) {
      console.error('Error creating support ticket:', error);
      setSupportError('حدث خطأ غير متوقع');
    } finally {
      setSupportLoading(false);
    }
  };

  const handleContactSupport = async () => {
    try {
      setContactLoading(true);
      setContactError('');
      
      // Validate required fields
      if (!contactData.name || !contactData.email || !contactData.message) {
        setContactError('يرجى ملء جميع الحقول المطلوبة');
        return;
      }
      
      const res = await authFetch('/support/contact/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactData)
      });
      
      if (res.ok) {
        const data = await res.json();
        showToast('success', 'تم إرسال رسالتك بنجاح');
        setShowContactModal(false);
        // Reset form
        setContactData({
          name: '',
          email: '',
          message: ''
        });
      } else {
        const errorData = await res.json().catch(() => ({}));
        setContactError(errorData.message || `حدث خطأ أثناء إرسال الرسالة (${res.status})`);
      }
    } catch (error) {
      console.error('Error sending contact message:', error);
      setContactError('حدث خطأ غير متوقع');
    } finally {
      setContactLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setTicketData(prev => ({ ...prev, [field]: value }));
  };

  const handleContactInputChange = (field: string, value: string) => {
    setContactData(prev => ({ ...prev, [field]: value }));
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
                onClick={() => setShowSupportModal(true)}
                className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition"
              >
                <div className="font-medium text-green-900 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  الدعم الفني
                </div>
                <div className="text-sm text-green-700">إرسال تذكرة دعم فني مفصلة</div>
              </button>

              <button 
                onClick={() => setShowContactModal(true)}
                className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
              >
                <div className="font-medium text-purple-900 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  اتصل بنا
                </div>
                <div className="text-sm text-purple-700">إرسال رسالة سريعة للدعم</div>
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

      {/* Contact Support Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowContactModal(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">اتصل بنا</h3>
              </div>
              <button 
                onClick={() => setShowContactModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم *</label>
                <input
                  type="text"
                  value={contactData.name}
                  onChange={(e) => handleContactInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="أدخل اسمك الكامل"
                />
              </div>
              
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني *</label>
                <input
                  type="email"
                  value={contactData.email}
                  onChange={(e) => handleContactInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="example@email.com"
                />
              </div>
              
              {/* Message Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الرسالة *</label>
                <textarea
                  value={contactData.message}
                  onChange={(e) => handleContactInputChange('message', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                  placeholder="اكتب رسالتك هنا..."
                />
              </div>
            </div>
            
            {contactError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{contactError}</p>
              </div>
            )}
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowContactModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                disabled={contactLoading}
              >
                إلغاء
              </button>
              <button
                onClick={handleContactSupport}
                disabled={contactLoading}
                className="flex-1 px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {contactLoading ? (
                  'جاري الإرسال...'
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    إرسال الرسالة
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Support Ticket Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSupportModal(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">تذكرة دعم فني</h3>
              </div>
              <button 
                onClick={() => setShowSupportModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم *</label>
                <input
                  type="text"
                  value={ticketData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="أدخل اسمك الكامل"
                />
              </div>
              
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني *</label>
                <input
                  type="email"
                  value={ticketData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="example@email.com"
                />
              </div>
              
              {/* Phone Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                <input
                  type="tel"
                  value={ticketData.phone_number}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+20 1XX XXX XXXX"
                />
              </div>
              
              {/* Subject Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الموضوع *</label>
                <input
                  type="text"
                  value={ticketData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="موضوع المشكلة أو الاستفسار"
                />
              </div>
              
              {/* Category Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
                <select
                  value={ticketData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="technical">مشكلة تقنية</option>
                  <option value="billing">فواتير ومدفوعات</option>
                  <option value="general">استفسار عام</option>
                  <option value="account">مشكلة في الحساب</option>
                </select>
              </div>
              
              {/* Priority Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الأولوية</label>
                <select
                  value={ticketData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">منخفضة</option>
                  <option value="medium">متوسطة</option>
                  <option value="high">عالية</option>
                  <option value="urgent">عاجلة</option>
                </select>
              </div>
              
              {/* Description Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف *</label>
                <textarea
                  value={ticketData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="اشرح المشكلة أو الاستفسار بالتفصيل..."
                />
              </div>
            </div>
            
            {supportError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{supportError}</p>
              </div>
            )}
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSupportModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                disabled={supportLoading}
              >
                إلغاء
              </button>
              <button
                onClick={handleSupportTicket}
                disabled={supportLoading}
                className="flex-1 px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {supportLoading ? (
                  'جاري الإرسال...'
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    إرسال التذكرة
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

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