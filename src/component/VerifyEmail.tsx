import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle, XCircle, Clock, RotateCw, Key } from 'lucide-react';

const VerifyEmail: React.FC = () => {
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error' | 'input'>('input');
  const [countdown, setCountdown] = useState(5);
  const [isResending, setIsResending] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // التحقق من وجود token في localStorage
  useEffect(() => {
    const token = localStorage.getItem('verificationToken');
    console.log('🔍 Checking for verification token in localStorage...');
    console.log('🔍 Token found:', token ? 'YES' : 'NO');

    if (token) {
      console.log('✅ Token value:', token);
      setVerificationStatus('input');
    } else {
      console.log('❌ No token found in localStorage');
      setVerificationStatus('error');
      setErrorMessage('لم يتم العثور على رمز التحقق. الرجاء التسجيل مرة أخرى.');
    }
  }, []);

  // العد التنازلي لإعادة التوجيه
  useEffect(() => {
    if (verificationStatus !== 'pending') {
      const timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [verificationStatus]);

  // وظيفة التحقق من الرمز
  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setErrorMessage('الرجاء إدخال رمز التحقق');
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');

    try {
      const savedToken = localStorage.getItem('verificationToken');
      if (!savedToken) {
        setVerificationStatus('error');
        setErrorMessage('لم يتم العثور على رمز التحقق');
        return;
      }

      console.log('🔍 Comparing codes:');
      console.log('📱 User entered:', verificationCode);
      console.log('💾 Saved token:', savedToken);

      // التحقق من تطابق الرمز المدخل مع الرمز المحفوظ
      if (verificationCode.trim() === savedToken.trim()) {
        console.log('✅ Codes match! Sending verification to API...');
        
        // إرسال طلب POST للـ API للتحقق من البريد الإلكتروني
        try {
          const response = await fetch(`https://educational-platform-qg3zn6tpl-youssefs-projects-e2c35ebf.vercel.app/api/verify-email/${savedToken}/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              token: savedToken,
              verification_code: verificationCode
            })
          });

          console.log('=== VERIFICATION API RESPONSE ===');
          console.log('Response Status:', response.status);
          console.log('Response OK:', response.ok);
          console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

          let data;
          try {
            const responseText = await response.text();
            console.log('Response Text:', responseText);

            if (responseText) {
              data = JSON.parse(responseText);
            } else {
              data = {};
            }
          } catch (error) {
            console.error('Error parsing JSON response:', error);
            data = {};
          }

          if (response.ok) {
            console.log('✅ API verification successful:', data);
            setVerificationStatus('success');

            // حذف token من localStorage بعد التحقق الناجح
            localStorage.removeItem('verificationToken');
            console.log('🗑️ Token removed from localStorage');

            // التوجيه لصفحة تسجيل الدخول بعد 5 ثوان
            setTimeout(() => {
              window.location.href = '/signin';
            }, 5000);
          } else {
            console.log('❌ API verification failed:', data);
            setVerificationStatus('error');
            if (data.detail) {
              setErrorMessage(data.detail);
            } else if (data.verification_code) {
              setErrorMessage(`خطأ في رمز التحقق: ${data.verification_code.join(', ')}`);
            } else {
              setErrorMessage('فشل في التحقق من البريد الإلكتروني. الرجاء المحاولة مرة أخرى.');
            }
          }
        } catch (apiError) {
          console.error('=== API VERIFICATION ERROR ===');
          console.error('Error details:', apiError);
          console.error('==============================');
          
          if (apiError instanceof TypeError && apiError.message.includes('fetch')) {
            console.log('Network error - check if server is running and proxy is configured');
            setErrorMessage('خطأ في الاتصال بالخادم - تأكد من تشغيل الخادم وإعداد الـ proxy');
          } else {
            setErrorMessage('حدث خطأ في الاتصال بالخادم');
          }
          setVerificationStatus('error');
        }
      } else {
        console.log('❌ Codes do not match!');
        setVerificationStatus('error');
        setErrorMessage('رمز التحقق غير صحيح. الرجاء المحاولة مرة أخرى.');
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      setVerificationStatus('error');
      setErrorMessage('حدث خطأ في التحقق من الرمز');
    } finally {
      setIsVerifying(false);
    }
  };

  // محاكاة إعادة إرسال البريد
  const handleResendEmail = () => {
    setIsResending(true);
    setTimeout(() => {
      setIsResending(false);
      setCountdown(60); // إعادة تعيين العد التنازلي للإرسال
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden p-8"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Mail className="w-10 h-10 text-blue-600" />
          </motion.div>

          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-2xl md:text-3xl font-bold text-gray-800 mb-2"
          >
            التحقق من البريد الإلكتروني
          </motion.h2>

          <motion.p
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-gray-600"
          >
            {verificationStatus === 'input'
              ? 'أدخل رمز التحقق المرسل إلى بريدك الإلكتروني'
              : verificationStatus === 'pending'
                ? 'جاري التحقق من بريدك الإلكتروني...'
                : verificationStatus === 'success'
                  ? 'تم التحقق بنجاح!'
                  : 'حدث خطأ في التحقق'}
          </motion.p>
        </div>

        {/* Status Indicator */}
        <div className="mb-8">
          <AnimatePresence mode="wait">
            {verificationStatus === 'input' && (
              <motion.div
                key="input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                <div className="mb-6">
                  <Key className="w-12 h-12 text-blue-500" />
                </div>

                <div className="w-full max-w-xs mb-4">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && verificationCode.trim()) {
                        handleVerifyCode();
                      }
                    }}
                    placeholder="أدخل رمز التحقق"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-center text-lg font-mono bg-gray-50/50 hover:bg-white"
                    maxLength={6}
                    autoFocus
                  />
                </div>

                {errorMessage && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mb-4 text-center"
                  >
                    {errorMessage}
                  </motion.p>
                )}

                <motion.button
                  onClick={handleVerifyCode}
                  disabled={isVerifying || !verificationCode.trim()}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium ${isVerifying || !verificationCode.trim()
                    ? 'bg-gray-200 text-gray-500'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                  {isVerifying ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      جاري التحقق...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      تحقق من الرمز
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}

            {verificationStatus === 'pending' && (
              <motion.div
                key="pending"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="mb-4"
                >
                  <Clock className="w-12 h-12 text-blue-500" />
                </motion.div>
                <p className="text-gray-600">الرجاء الانتظار...</p>
              </motion.div>
            )}

            {verificationStatus === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                <p className="text-gray-600 mb-4">تم التحقق من بريدك الإلكتروني بنجاح!</p>
                <p className="text-sm text-gray-500 mb-4">
                  تم التحقق من الرمز بنجاح. يمكنك الآن تسجيل الدخول بحسابك الجديد
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  سيتم توجيهك تلقائياً خلال {countdown} ثانية...
                </p>
                <motion.button
                  onClick={() => window.location.href = '/signin'}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700"
                >
                  الذهاب لتسجيل الدخول الآن
                </motion.button>
              </motion.div>
            )}

            {verificationStatus === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                <XCircle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-gray-600 mb-4">فشل التحقق من البريد الإلكتروني</p>
                {errorMessage && (
                  <p className="text-sm text-red-500 text-center mb-4">
                    {errorMessage}
                  </p>
                )}
                <p className="text-sm text-gray-500 text-center mb-6">
                  الرابط غير صالح أو منتهي الصلاحية. الرجاء طلب إرسال رابط تحقق جديد.
                </p>

                <div className="flex gap-3">
                  <motion.button
                    onClick={handleResendEmail}
                    disabled={isResending || countdown > 0}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium ${isResending || countdown > 0
                      ? 'bg-gray-200 text-gray-500'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                  >
                    {isResending ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin" />
                        جاري الإرسال...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        {countdown > 0 ? `إعادة الإرسال (${countdown})` : 'إرسال رابط جديد'}
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    onClick={() => window.location.href = '/signin'}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium bg-gray-600 text-white hover:bg-gray-700"
                  >
                    العودة لتسجيل الدخول
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-sm text-gray-500 border-t border-gray-100 pt-6"
        >
          <p>إذا واجهتك أي مشكلة، الرجاء التواصل مع الدعم الفني</p>
          <p className="mt-1">
            <a href="mailto:support@talam.com" className="text-blue-600 hover:underline">
              support@talam.com
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;