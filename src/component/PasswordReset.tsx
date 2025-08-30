import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';

interface PasswordResetRequest {
  email: string;
}

interface PasswordResetConfirm {
  token: string;
  new_password: string;
  new_password_confirm: string;
}

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
}

const PasswordReset: React.FC = () => {
  const [step, setStep] = useState<'request' | 'confirm'>('request');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const [requestData, setRequestData] = useState<PasswordResetRequest>({
    email: ''
  });
  
  const [confirmData, setConfirmData] = useState<PasswordResetConfirm>({
    token: '',
    new_password: '',
    new_password_confirm: ''
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleRequestInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRequestData(prev => ({ ...prev, [name]: value }));
  };

  const handleConfirmInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfirmData(prev => ({ ...prev, [name]: value }));
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/user/password-reset/request/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      let data;
      try {
        const responseText = await response.text();
        if (responseText) {
          data = JSON.parse(responseText);
        } else {
          data = {};
        }
      } catch (error) {
        console.error('Error parsing JSON response:', error);
        showToast('خطأ في استقبال البيانات من الخادم', 'error');
        setIsLoading(false);
        return;
      }

      if (response.ok) {
        showToast('تم إرسال رمز إعادة تعيين كلمة المرور إلى بريدك الإلكتروني', 'success');
        setStep('confirm');
      } else {
        if (data.email) {
          showToast(`خطأ في البريد الإلكتروني: ${data.email.join(', ')}`, 'error');
        } else if (data.detail) {
          showToast(data.detail, 'error');
        } else {
          showToast('خطأ في طلب إعادة تعيين كلمة المرور', 'error');
        }
      }
    } catch (error) {
      console.error('Error requesting password reset:', error);
      showToast('خطأ في الاتصال بالخادم', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (confirmData.new_password !== confirmData.new_password_confirm) {
      showToast('كلمة المرور الجديدة وتأكيدها غير متطابقين', 'error');
      return;
    }

    if (confirmData.new_password.length < 8) {
      showToast('كلمة المرور يجب أن تكون 8 أحرف على الأقل', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/user/password-reset/confirm/${confirmData.token}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          token: confirmData.token,
          new_password: confirmData.new_password,
          new_password_confirm: confirmData.new_password_confirm
        })
      });

      let data;
      try {
        const responseText = await response.text();
        if (responseText) {
          data = JSON.parse(responseText);
        } else {
          data = {};
        }
      } catch (error) {
        console.error('Error parsing JSON response:', error);
        showToast('خطأ في استقبال البيانات من الخادم', 'error');
        setIsLoading(false);
        return;
      }

      if (response.ok) {
        showToast('تم تغيير كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول', 'success');
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          window.location.href = '/signin';
        }, 2000);
      } else {
        if (data.token) {
          showToast(`خطأ في الرمز: ${data.token.join(', ')}`, 'error');
        } else if (data.new_password) {
          showToast(`خطأ في كلمة المرور الجديدة: ${data.new_password.join(', ')}`, 'error');
        } else if (data.new_password_confirm) {
          showToast(`خطأ في تأكيد كلمة المرور: ${data.new_password_confirm.join(', ')}`, 'error');
        } else if (data.detail) {
          showToast(data.detail, 'error');
        } else {
          showToast('خطأ في تأكيد إعادة تعيين كلمة المرور', 'error');
        }
      }
    } catch (error) {
      console.error('Error confirming password reset:', error);
      showToast('خطأ في الاتصال بالخادم', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const goBackToRequest = () => {
    setStep('request');
    setConfirmData({
      token: '',
      new_password: '',
      new_password_confirm: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="relative w-full max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
            إعادة تعيين كلمة المرور
          </h1>
          <p className="text-gray-600">
            {step === 'request' 
              ? 'أدخل بريدك الإلكتروني لإرسال رمز إعادة تعيين كلمة المرور'
              : 'أدخل الرمز المرسل إلى بريدك الإلكتروني وكلمة المرور الجديدة'
            }
          </p>
        </motion.div>

        {/* Main Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
        >
          <div className="p-8">
            <AnimatePresence mode="wait">
              {step === 'request' ? (
                /* Request Password Reset Form */
                <motion.div
                  key="request"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <form onSubmit={handleRequestSubmit} className="space-y-6">
                    {/* Email Input */}
                    <div className="relative">
                      <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={requestData.email}
                        onChange={handleRequestInputChange}
                        placeholder="البريد الإلكتروني"
                        required
                        className="w-full pr-12 pl-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-right bg-gray-50/50 hover:bg-white"
                      />
                    </div>

                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={{ scale: isLoading ? 1 : 1.02 }}
                      whileTap={{ scale: isLoading ? 1 : 0.98 }}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'جاري الإرسال...' : 'إرسال رمز إعادة التعيين'}
                    </motion.button>
                  </form>
                </motion.div>
              ) : (
                /* Confirm Password Reset Form */
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  {/* Back Button */}
                  <button
                    onClick={goBackToRequest}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    العودة
                  </button>

                  <form onSubmit={handleConfirmSubmit} className="space-y-6">
                    {/* Token Input */}
                    <div className="relative">
                      <input
                        type="text"
                        name="token"
                        value={confirmData.token}
                        onChange={handleConfirmInputChange}
                        placeholder="الرمز المكون من 4 أرقام"
                        required
                        maxLength={4}
                        pattern="[0-9]{4}"
                        className="w-full pr-4 pl-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-center text-lg font-mono bg-gray-50/50 hover:bg-white"
                      />
                    </div>

                    {/* New Password Input */}
                    <div className="relative">
                      <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="new_password"
                        value={confirmData.new_password}
                        onChange={handleConfirmInputChange}
                        placeholder="كلمة المرور الجديدة"
                        required
                        minLength={8}
                        className="w-full pr-12 pl-12 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-right bg-gray-50/50 hover:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    {/* Confirm New Password Input */}
                    <div className="relative">
                      <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="new_password_confirm"
                        value={confirmData.new_password_confirm}
                        onChange={handleConfirmInputChange}
                        placeholder="تأكيد كلمة المرور الجديدة"
                        required
                        minLength={8}
                        className="w-full pr-12 pl-12 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-right bg-gray-50/50 hover:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={{ scale: isLoading ? 1 : 1.02 }}
                      whileTap={{ scale: isLoading ? 1 : 0.98 }}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'جاري التأكيد...' : 'تأكيد كلمة المرور الجديدة'}
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Back to Login Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <a
            href="/signin"
            className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-300 hover:underline"
          >
            العودة إلى تسجيل الدخول
          </a>
        </motion.div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-6 right-6 z-50"
          >
            <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-sm ${toast.type === 'success'
              ? 'bg-green-50/90 border-green-200 text-green-800'
              : toast.type === 'error'
                ? 'bg-red-50/90 border-red-200 text-red-800'
                : 'bg-blue-50/90 border-blue-200 text-blue-800'
              }`}>
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
              {toast.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-600" />}

              <span className="font-medium">{toast.message}</span>

              <button
                onClick={() => setToast(null)}
                className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PasswordReset;
