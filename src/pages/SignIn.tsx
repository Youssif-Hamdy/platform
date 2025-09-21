import React, { useState} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, BookOpen, Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from "react-router-dom";


interface AuthFormData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  user_type: string;
  phone_number: string;
  date_of_birth: string;
  bio: string;
  address: string;
  city: string;
  country: string;
  profile_picture: File | null;
  parent?: string;
}

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userData: any | null;
  displayName: string | null;
  userType: string | null;
  profileImageUrl: string | null;
  verificationToken?: string | null;
}

const SignIn: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const navigate = useNavigate();

  
  // Auth state management (replaces localStorage)
  const [authState, setAuthState] = useState<AuthState>({
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    userData: localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')!) : null,
    displayName: localStorage.getItem('displayName'),
    userType: localStorage.getItem('userType'),
    profileImageUrl: localStorage.getItem('profileImageUrl'),
    verificationToken: localStorage.getItem('verificationToken')
  });

  const [formData, setFormData] = useState<AuthFormData>({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    user_type: '',
    phone_number: '',
    date_of_birth: '',
    bio: '',
    address: '',
    city: '',
    country: '',
    profile_picture: null,
    parent: ''
  });

  // Function to handle refresh token
  const refreshToken = async () => {
    try {
      const refreshToken = authState.refreshToken;
      if (!refreshToken) return null;

      const response = await fetch('/user/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken })
      });

      if (!response.ok) {
        setAuthState(prev => ({
          ...prev,
          accessToken: null,
          refreshToken: null
        }));
        return null;
      }

      const data = await response.json();
      localStorage.setItem('accessToken', data.access);
      setAuthState(prev => ({
        ...prev,
        accessToken: data.access
      }));
      return data.access;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  };

  // Function to clear auth data from localStorage
  const clearAuthData = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('displayName');
    localStorage.removeItem('userType');
    localStorage.removeItem('profileImageUrl');
    localStorage.removeItem('verificationToken');
    setAuthState({
      accessToken: null,
      refreshToken: null,
      userData: null,
      displayName: null,
      userType: null,
      profileImageUrl: null,
      verificationToken: null
    });
  };

  // Function to make authenticated requests with token refresh
  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    let accessToken = authState.accessToken;
    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });

    // If token is expired, try to refresh it
    if (response.status === 401) {
      const newAccessToken = await refreshToken();
      if (newAccessToken) {
        response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${newAccessToken}`,
            'Content-Type': 'application/json',
          }
        });
      }
    }

    return response;
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setFormData(prev => ({ ...prev, profile_picture: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isLogin) {
        // Login logic
        const loginData = {
          username_or_email: formData.username,
          password: formData.password
        };

        console.log('=== LOGIN REQUEST ===');
        console.log('Request Data:', loginData);
        console.log('Request URL:', '/user/login/');

        const response = await fetch('/user/login/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(loginData)
        });

        console.log('=== LOGIN RESPONSE ===');
        console.log('Response Status:', response.status);
        console.log('Response OK:', response.ok);
        console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
        console.log('========================');

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
          showToast('خطأ في استقبال البيانات من الخادم', 'error');
          return;
        }

        if (response.ok) {
          showToast('تم تسجيل الدخول بنجاح!', 'success');
          console.log('=== LOGIN SUCCESS ===');
          console.log('Response Status:', response.status);
          console.log('Response Data:', data);
          console.log('Response Data Type:', typeof data);
          console.log('Response Data Keys:', Object.keys(data));
          console.log('====================');

          // Store tokens and user data in state and localStorage
          console.log('🔍 Checking for tokens...');
          console.log('data.tokens exists:', !!data.tokens);
          
          if (data.tokens) {
            console.log('data.tokens keys:', Object.keys(data.tokens));
            console.log('data.tokens.access exists:', !!data.tokens.access);
            console.log('data.tokens.refresh exists:', !!data.tokens.refresh);
            
            const newAuthState = {
              accessToken: data.tokens.access || null,
              refreshToken: data.tokens.refresh || null,
              userData: data.user || null,
              displayName: null,
              userType: null,
              profileImageUrl: null
            };

            // Set convenience fields
            if (data.user) {
              newAuthState.displayName = (data.user.first_name && data.user.last_name)
                ? `${data.user.first_name} ${data.user.last_name}`
                : (data.user.username || '');
              newAuthState.userType = data.user.user_type || null;
              newAuthState.profileImageUrl = data.user.profile_picture || null;
            }

            // Save to localStorage
            localStorage.setItem('accessToken', data.tokens.access || '');
            localStorage.setItem('refreshToken', data.tokens.refresh || '');
            localStorage.setItem('userData', JSON.stringify(data.user || {}));
            localStorage.setItem('displayName', newAuthState.displayName || '');
            localStorage.setItem('userType', newAuthState.userType || '');
            localStorage.setItem('profileImageUrl', newAuthState.profileImageUrl || '');

            setAuthState(newAuthState);
            
            console.log('✅ Auth state updated:', {
              hasAccessToken: !!newAuthState.accessToken,
              hasRefreshToken: !!newAuthState.refreshToken,
              displayName: newAuthState.displayName,
              userType: newAuthState.userType
            });
          } else {
            console.log('❌ No tokens object found in response');
            console.log('Available data keys:', Object.keys(data));
            
            // Fallback: check if tokens are at root level
            if (data.access || data.refresh) {
              const newAuthState = {
                accessToken: data.access || null,
                refreshToken: data.refresh || null,
                userData: data.user || null,
                displayName: null,
                userType: null,
                profileImageUrl: null
              };

              if (data.user) {
                newAuthState.displayName = (data.user.first_name && data.user.last_name)
                  ? `${data.user.first_name} ${data.user.last_name}`
                  : (data.user.username || '');
                newAuthState.userType = data.user.user_type || null;
                newAuthState.profileImageUrl = data.user.profile_picture || null;
              }

              // Save to localStorage
              localStorage.setItem('accessToken', data.access || '');
              localStorage.setItem('refreshToken', data.refresh || '');
              localStorage.setItem('userData', JSON.stringify(data.user || {}));
              localStorage.setItem('displayName', newAuthState.displayName || '');
              localStorage.setItem('userType', newAuthState.userType || '');
              localStorage.setItem('profileImageUrl', newAuthState.profileImageUrl || '');

              setAuthState(newAuthState);
              console.log('✅ Auth state updated from root level tokens');
            }
          }

          // Dispatch login success event to update navbar
          window.dispatchEvent(new CustomEvent('loginSuccess', { detail: authState }));

          // Redirect to Home page after successful login
          setTimeout(() => {
navigate('/dashboard');
          }, 1500);
        } else {
          // Show detailed error messages
          if (data.username_or_email) {
            showToast(`خطأ في اسم المستخدم: ${data.username_or_email.join(', ')}`, 'error');
          } else if (data.password) {
            showToast(`خطأ في كلمة المرور: ${data.password.join(', ')}`, 'error');
          } else if (data.detail) {
            showToast(data.detail, 'error');
          } else {
            showToast('خطأ في تسجيل الدخول', 'error');
          }
          console.log('=== LOGIN ERROR ===');
          console.log('Response Status:', response.status);
          console.log('Response Data:', data);
          console.log('===================');
        }
      } else {
        // Register logic
        const registerData = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          password_confirm: formData.password_confirm,
          first_name: formData.first_name,
          last_name: formData.last_name,
          user_type: formData.user_type,
          phone_number: formData.phone_number,
          date_of_birth: formData.date_of_birth,
          bio: formData.bio,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          profile_picture: formData.profile_picture
        };

        console.log('=== REGISTRATION REQUEST ===');
        console.log('Request Data:', registerData);
        console.log('Request URL:', '/user/register/');

        let response;
        if (formData.profile_picture) {
          const multipart = new FormData();
          Object.entries(registerData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              multipart.append(key, String(value));
            }
          });
          multipart.append('profile_picture', formData.profile_picture);

          response = await fetch('/user/register/', {
            method: 'POST',
            body: multipart
          });
        } else {
          response = await fetch('/user/register/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(registerData)
          });
        }

        console.log('=== REGISTRATION RESPONSE ===');
        console.log('Response Status:', response.status);
        console.log('Response OK:', response.ok);
        console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
        console.log('============================');

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
          showToast('خطأ في استقبال البيانات من الخادم', 'error');
          return;
        }

        if (response.ok) {
          if (data.tokens && data.tokens.token_to_verify) {
            showToast('تم إنشاء الحساب بنجاح! تم حفظ رمز التحقق. تحقق من بريدك الإلكتروني', 'success');
            // Store verification token in state and localStorage
            localStorage.setItem('verificationToken', data.tokens.token_to_verify);
            setAuthState(prev => ({
              ...prev,
              verificationToken: data.tokens.token_to_verify
            }));
          } else {
            showToast('تم إنشاء الحساب بنجاح! تحقق من بريدك الإلكتروني', 'success');
          }
          console.log('=== REGISTRATION SUCCESS ===');
          console.log('Response Status:', response.status);
          console.log('Response Data:', data);
          console.log('===========================');

          // Reset form
          setFormData({
            username: '',
            email: '',
            password: '',
            password_confirm: '',
            first_name: '',
            last_name: '',
            user_type: '',
            phone_number: '',
            date_of_birth: '',
            bio: '',
            address: '',
            city: '',
            country: '',
            profile_picture: null,
            parent: ''
          });

          // Redirect to verification page
          setTimeout(() => {
            window.location.href = '/verify-email';
          }, 2000);
        } else {
          // Show detailed error messages
          if (data.username) {
            showToast(`خطأ في اسم المستخدم: ${data.username.join(', ')}`, 'error');
          } else if (data.email) {
            showToast(`خطأ في البريد الإلكتروني: ${data.email.join(', ')}`, 'error');
          } else if (data.password) {
            showToast(`خطأ في كلمة المرور: ${data.password.join(', ')}`, 'error');
          } else if (data.password_confirm) {
            showToast(`خطأ في تأكيد كلمة المرور: ${data.password_confirm.join(', ')}`, 'error');
          } else if (data.first_name) {
            showToast(`خطأ في الاسم الأول: ${data.first_name.join(', ')}`, 'error');
          } else if (data.last_name) {
            showToast(`خطأ في الاسم الأخير: ${data.last_name.join(', ')}`, 'error');
          } else if (data.user_type) {
            showToast(`خطأ في نوع المستخدم: ${data.user_type.join(', ')}`, 'error');
          } else if (data.phone_number) {
            showToast(`خطأ في رقم الهاتف: ${data.phone_number.join(', ')}`, 'error');
          } else if (data.date_of_birth) {
            showToast(`خطأ في تاريخ الميلاد: ${data.date_of_birth.join(', ')}`, 'error');
          } else if (data.bio) {
            showToast(`خطأ في السيرة الذاتية: ${data.bio.join(', ')}`, 'error');
          } else if (data.address) {
            showToast(`خطأ في العنوان: ${data.address.join(', ')}`, 'error');
          } else if (data.city) {
            showToast(`خطأ في المدينة: ${data.city.join(', ')}`, 'error');
          } else if (data.country) {
            showToast(`خطأ في الدولة: ${data.country.join(', ')}`, 'error');
          } else if (data.profile_picture) {
            showToast(`خطأ في صورة الملف الشخصي: ${data.profile_picture.join(', ')}`, 'error');
          } else if (data.detail) {
            showToast(data.detail, 'error');
          } else {
            showToast('خطأ في إنشاء الحساب', 'error');
          }
          console.log('Registration error:', data);
        }
      }
    } catch (error) {
      console.error('=== NETWORK ERROR ===');
      console.error('Error details:', error);
      console.error('Error type:', error instanceof Error ? error.constructor.name : 'Unknown');
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      console.error('=====================');

      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.log('Network error - check if server is running and proxy is configured');
        showToast('خطأ في الاتصال بالخادم - تأكد من تشغيل الخادم وإعداد الـ proxy', 'error');
      } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.log('CORS or network connectivity issue');
        showToast('خطأ في الاتصال بالخادم - مشكلة في الشبكة أو CORS', 'error');
      } else {
        showToast('حدث خطأ غير متوقع', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Light Navbar */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">تعلم</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="min-h-[calc(100vh-128px)] bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
          {/* Background Decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
            <div className="absolute top-40 left-40 w-60 h-60 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
          </div>

          <div className="relative w-full max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-6">
                تعلم
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                منصتك التعليمية المتكاملة للتعلم والتطوير. انضم إلينا اليوم وابدأ رحلتك التعليمية المميزة
              </p>
            </motion.div>

            {/* Main Container - Fixed Size */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-6xl mx-auto h-[700px] bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
            >
              <div className="flex h-full">
                {/* Left Side - Branding & Illustration */}
                <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}></div>
                  </div>

                  <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 text-center">
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                      className="mb-8"
                    >
                      <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-6 mx-auto backdrop-blur-sm border border-white/30">
                        <BookOpen className="w-16 h-16 text-white" />
                      </div>
                      <h2 className="text-4xl font-bold mb-4">مرحباً بك</h2>
                      <p className="text-xl text-blue-100 leading-relaxed max-w-sm">
                        منصة تعليمية حديثة تجمع بين أحدث التقنيات وأفضل المناهج التعليمية
                      </p>
                    </motion.div>
                  </div>
                </div>

                {/* Right Side - Form Container */}
                <div className="w-full lg:w-3/5 flex flex-col">
                  {/* Tab Navigation */}
                  <div className="flex border-b border-gray-100 bg-gray-50/50">
                    <button
                      onClick={() => setIsLogin(true)}
                      className={`flex-1 py-6 px-8 font-semibold text-lg transition-all duration-300 ${isLogin
                        ? 'text-blue-600 border-b-3 border-blue-600 bg-white'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      تسجيل الدخول
                    </button>
                    <button
                      onClick={() => setIsLogin(false)}
                      className={`flex-1 py-6 px-8 font-semibold text-lg transition-all duration-300 ${!isLogin
                        ? 'text-blue-600 border-b-3 border-blue-600 bg-white'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      إنشاء حساب
                    </button>
                  </div>

                  {/* Form Content - Fixed Height Container */}
                  <div className="flex-1 p-4 md:p-8 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                    <div className="h-full flex flex-col">
                      <AnimatePresence mode="wait">
                        {isLogin ? (
                          /* Login Form */
                          <motion.div
                            key="login"
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full"
                          >
                            <div className="text-center mb-8">
                              <h3 className="text-3xl font-bold text-gray-800 mb-2">أهلاً بعودتك</h3>
                              <p className="text-gray-600">قم بتسجيل الدخول للمتابعة</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                              {/* Username or Email */}
                              <div className="relative">
                                <User className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                  type="text"
                                  name="username"
                                  value={formData.username}
                                  onChange={handleInputChange}
                                  placeholder="اسم المستخدم أو البريد الإلكتروني"
                                  required
                                  className="w-full pr-12 pl-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-right bg-gray-50/50 hover:bg-white"
                                />
                              </div>

                              {/* Password */}
                              <div className="relative">
                                <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                  type={showPassword ? "text" : "password"}
                                  name="password"
                                  value={formData.password}
                                  onChange={handleInputChange}
                                  placeholder="كلمة المرور"
                                  required
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

                              <motion.button
                                type="submit"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 mt-8"
                              >
                                تسجيل الدخول
                              </motion.button>
                            </form>
                          </motion.div>
                        ) : (
                          /* Register Form */
                          <motion.div
                            key="register"
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="flex-1 flex flex-col"
                          >
                            <div className="text-center mb-4 md:mb-6">
                              <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">انضم إلينا</h3>
                              <p className="text-sm md:text-base text-gray-600">أنشئ حسابك الجديد وابدأ التعلم</p>
                            </div>

                            {/* Registration Form */}
                            <div className="flex-1 overflow-y-auto">
                              <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Row 1: Username & Email */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="relative">
                                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                      type="text"
                                      name="username"
                                      value={formData.username}
                                      onChange={handleInputChange}
                                      placeholder="اسم المستخدم"
                                      required
                                      className="w-full pr-10 pl-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-right text-sm bg-gray-50/50 hover:bg-white"
                                    />
                                  </div>

                                  <div className="relative">
                                    <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                      type="email"
                                      name="email"
                                      value={formData.email}
                                      onChange={handleInputChange}
                                      placeholder="البريد الإلكتروني"
                                      required
                                      className="w-full pr-10 pl-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-right text-sm bg-gray-50/50 hover:bg-white"
                                    />
                                  </div>
                                </div>

                                {/* Row 2: First Name & Last Name */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="relative">
                                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                      type="text"
                                      name="first_name"
                                      value={formData.first_name}
                                      onChange={handleInputChange}
                                      placeholder="الاسم الأول"
                                      required
                                      className="w-full pr-10 pl-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-right text-sm bg-gray-50/50 hover:bg-white"
                                    />
                                  </div>

                                  <div className="relative">
                                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                      type="text"
                                      name="last_name"
                                      value={formData.last_name}
                                      onChange={handleInputChange}
                                      placeholder="الاسم الأخير"
                                      required
                                      className="w-full pr-10 pl-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-right text-sm bg-gray-50/50 hover:bg-white"
                                    />
                                  </div>
                                </div>

                                {/* Row 3: User Type & Phone */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="relative">
                                    <select
                                      name="user_type"
                                      value={formData.user_type}
                                      onChange={handleInputChange}
                                      required
                                      className="w-full pr-3 pl-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-right text-sm bg-gray-50/50 hover:bg-white"
                                    >
                                      <option value="" disabled>اختر نوع المستخدم</option>
                                      <option value="student">طالب</option>
                                      <option value="teacher">معلم</option>
                                      <option value="parent">ولي أمر</option>


                                    </select>
                                  </div>

                                  <div className="relative">
                                    <input
                                      type="tel"
                                      name="phone_number"
                                      value={formData.phone_number}
                                      onChange={handleInputChange}
                                      placeholder="رقم الهاتف"
                                      required
                                      className="w-full pr-10 pl-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-right text-sm bg-gray-50/50 hover:bg-white"
                                    />
                                  </div>
                                </div>

                                {/* Row 4: Date of Birth & Country */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="relative">
                                    <input
                                      type="date"
                                      name="date_of_birth"
                                      value={formData.date_of_birth}
                                      onChange={handleInputChange}
                                      placeholder="تاريخ الميلاد"
                                      required
                                      className="w-full pr-10 pl-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-right text-sm bg-gray-50/50 hover:bg-white"
                                    />
                                  </div>
                                  <div className="relative">
                                    <input
                                      type="text"
                                      name="country"
                                      value={formData.country}
                                      onChange={handleInputChange}
                                      placeholder="الدولة"
                                      required
                                      className="w-full pr-10 pl-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-right text-sm bg-gray-50/50 hover:bg-white"
                                    />
                                  </div>
                                </div>

                                {/* Row 5: City & Address */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="relative">
                                    <input
                                      type="text"
                                      name="city"
                                      value={formData.city}
                                      onChange={handleInputChange}
                                      placeholder="المدينة"
                                      required
                                      className="w-full pr-10 pl-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-right text-sm bg-gray-50/50 hover:bg-white"
                                    />
                                  </div>
                                  <div className="relative">
                                    <input
                                      type="text"
                                      name="address"
                                      value={formData.address}
                                      onChange={handleInputChange}
                                      placeholder="العنوان"
                                      required
                                      className="w-full pr-10 pl-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-right text-sm bg-gray-50/50 hover:bg-white"
                                    />
                                  </div>
                                </div>

                                {/* Row 6: Bio */}
                                <div className="grid grid-cols-1 gap-4">
                                  <div className="relative">
                                    <textarea
                                      name="bio"
                                      value={formData.bio}
                                      onChange={handleInputChange as any}
                                      placeholder="نبذة مختصرة عنك"
                                      rows={3}
                                      className="w-full pr-10 pl-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-right text-sm bg-gray-50/50 hover:bg-white"
                                    />
                                  </div>
                                </div>

                                {/* Row 7: Profile picture upload */}
                                <div className="grid grid-cols-1 gap-4">
                                  <div className="relative">
                                    <input
                                      type="file"
                                      name="profile_picture"
                                      accept="image/*"
                                      onChange={handleFileChange}
                                      className="w-full pr-3 pl-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-right text-sm bg-gray-50/50 hover:bg-white"
                                    />
                                  </div>
                                </div>

                                {/* Row 8: Password & Password Confirm */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="relative">
                                    <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                      type="password"
                                      name="password"
                                      value={formData.password}
                                      onChange={handleInputChange}
                                      placeholder="كلمة المرور"
                                      required
                                      className="w-full pr-10 pl-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-right text-sm bg-gray-50/50 hover:bg-white"
                                    />
                                  </div>

                                  <div className="relative">
                                    <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                      type="password"
                                      name="password_confirm"
                                      value={formData.password_confirm}
                                      onChange={handleInputChange}
                                      placeholder="تأكيد كلمة المرور"
                                      required
                                      className="w-full pr-10 pl-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-right text-sm bg-gray-50/50 hover:bg-white"
                                    />
                                  </div>
                                </div>

                                <motion.button
                                  type="submit"
                                  whileHover={{ scale: 0.98 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold shadow-sm hover:shadow-sm transition-all duration-300 mt-6"
                                >
                                  إنشاء الحساب
                                </motion.button>
                              </form>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Footer */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center mt-6 text-sm text-gray-600"
                      >
                        {isLogin ? (
                          <p>
                            ليس لديك حساب؟{' '}
                            <button
                              onClick={() => setIsLogin(false)}
                              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-300 hover:underline"
                            >
                              إنشاء حساب جديد
                            </button>
                          </p>
                        ) : (
                          <p>
                            لديك حساب بالفعل؟{' '}
                            <button
                              onClick={() => setIsLogin(true)}
                              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-300 hover:underline"
                            >
                              تسجيل الدخول
                            </button>
                          </p>
                        )}
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500 text-sm">
            <p>© 2023 منصة تعلم. جميع الحقوق محفوظة.</p>
            <p className="mt-2">منصة تعليمية متكاملة لتطوير مهاراتك</p>
          </div>
        </div>
      </footer>

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

export default SignIn;