// Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Settings, LogOut, User, Key, Lock, XCircle } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState('الرئيسية');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [changePasswordData, setChangePasswordData] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: ''
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if user is logged in
  useEffect(() => {
    const checkLoginStatus = () => {
      const accessToken = localStorage.getItem('accessToken');
      setIsLoggedIn(!!accessToken);
    };

    // Check initial status
    checkLoginStatus();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken') {
        checkLoginStatus();
      }
    };

    // Listen for custom login event
    const handleLoginSuccess = () => {
      checkLoginStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('loginSuccess', handleLoginSuccess);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('loginSuccess', handleLoginSuccess);
    };
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu && !(event.target as Element).closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (accessToken) {
        // Call logout API
        const response = await fetch('/api/logout/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        console.log('Logout API response:', response.status);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear localStorage regardless of API call success
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      setIsLoggedIn(false);
      setShowUserMenu(false);
      window.location.href = '/';
    }
  };

  const handleChangePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setChangePasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (changePasswordData.new_password !== changePasswordData.new_password_confirm) {
      alert('كلمة المرور الجديدة وتأكيدها غير متطابقين');
      return;
    }

    setIsChangingPassword(true);

    try {
      const accessToken = localStorage.getItem('accessToken');
              const response = await fetch('/api/change-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(changePasswordData)
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
        alert('خطأ في استقبال البيانات من الخادم');
        return;
      }

      if (response.ok) {
        alert('تم تغيير كلمة المرور بنجاح!');
        setChangePasswordData({
          old_password: '',
          new_password: '',
          new_password_confirm: ''
        });
        setShowChangePasswordModal(false);
        setShowChangePasswordForm(false);
      } else {
        if (data.old_password) {
          alert(`خطأ في كلمة المرور الحالية: ${data.old_password.join(', ')}`);
        } else if (data.new_password) {
          alert(`خطأ في كلمة المرور الجديدة: ${data.new_password.join(', ')}`);
        } else if (data.new_password_confirm) {
          alert(`خطأ في تأكيد كلمة المرور: ${data.new_password_confirm.join(', ')}`);
        } else if (data.detail) {
          alert(data.detail);
        } else {
          alert('خطأ في تغيير كلمة المرور');
        }
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const openChangePasswordModal = () => {
    setShowUserMenu(false);
    setShowChangePasswordModal(true);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    
    if (!isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  };

  const handleLinkClick = (linkName) => {
    setActiveLink(linkName);
    setIsMenuOpen(false);
    document.body.style.overflow = 'auto'; // إعادة تمكين التمرير
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 px-4 py-4 flex justify-between items-center z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-lg shadow-lg' 
        : 'bg-transparent'
      } ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`} dir="rtl">
        <div className="container mx-auto flex justify-between items-center">
          {/* الشعار */}
          <Link 
            className="text-3xl font-bold leading-none flex items-center" 
            to="/" 
            onClick={() => handleLinkClick('الرئيسية')}
          >
            <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl shadow-lg transition-transform duration-300 hover:scale-105">
              <svg className="text-white text-xl w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className={`mr-2 transition-all duration-300 ${
              isScrolled 
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent' 
                : 'text-white'
            }`}>تعلم</span>
          </Link>
          
          <div className="lg:hidden">
            <button 
              className={`flex items-center p-3 rounded-lg transition-colors ${
                isScrolled 
                  ? 'hover:bg-blue-50 text-blue-600' 
                  : 'hover:bg-white/10 text-white'
              }`}
              onClick={toggleMenu}
              aria-label="تبديل القائمة"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
          
          {/* روابط التنقل (لأجهزة الكمبيوتر) */}
          <ul className="hidden absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 lg:flex lg:mx-auto lg:items-center lg:w-auto lg:space-x-8">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `text-sm flex items-center font-medium transition-all duration-300 hover:scale-105 ${
                    isScrolled 
                      ? (isActive ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-blue-600')
                      : (isActive ? 'text-white font-bold' : 'text-white/90 hover:text-white')
                  }`
                }
                onClick={() => handleLinkClick('الرئيسية')}
              >
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                الرئيسية
              </NavLink>
            </li>
            <li className="text-gray-300">
              <div className="w-1 h-1 bg-current rounded-full"></div>
            </li>
            <li>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `text-sm flex items-center transition-all duration-300 hover:scale-105 ${
                    isScrolled 
                      ? (isActive ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-blue-600')
                      : (isActive ? 'text-white font-bold' : 'text-white/90 hover:text-white')
                  }`
                }
                onClick={() => handleLinkClick('من نحن')}
              >
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                من نحن
              </NavLink>
            </li>
            <li className="text-gray-300">
              <div className="w-1 h-1 bg-current rounded-full"></div>
            </li>
            <li>
              <NavLink
                to="/courses"
                className={({ isActive }) =>
                  `text-sm flex items-center transition-all duration-300 hover:scale-105 ${
                    isScrolled 
                      ? (isActive ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-blue-600')
                      : (isActive ? 'text-white font-bold' : 'text-white/90 hover:text-white')
                  }`
                }
                onClick={() => handleLinkClick('الدورات')}
              >
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                الدورات
              </NavLink>
            </li>
            <li className="text-gray-300">
              <div className="w-1 h-1 bg-current rounded-full"></div>
            </li>
            <li>
              <NavLink
                to="/services"
                className={({ isActive }) =>
                  `text-sm flex items-center transition-all duration-300 hover:scale-105 ${
                    isScrolled 
                      ? (isActive ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-blue-600')
                      : (isActive ? 'text-white font-bold' : 'text-white/90 hover:text-white')
                  }`
                }
                onClick={() => handleLinkClick('الخدمات')}
              >
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
                الخدمات
              </NavLink>
            </li>
            {/* أيقونة السلة */}
            <li>
              <NavLink 
                to="/cart" 
                className={`text-sm hover:text-blue-600 transition-colors flex items-center ${
                  isScrolled 
                    ? 'text-gray-700' 
                    : 'text-white/90'
                }`}
                aria-label="سلة التسوق"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
              </NavLink>
            </li>
          </ul>
          
          {/* زر تسجيل الدخول أو قائمة المستخدم */}
          {isLoggedIn ? (
            <div className="hidden lg:block lg:mr-auto lg:ml-3 relative user-menu-container">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center gap-2 py-2 px-4 backdrop-blur-sm border rounded-xl transition-all duration-300 ${
                  isScrolled 
                    ? 'bg-blue-600 text-white border-blue-500 hover:bg-blue-700' 
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }`}
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">حسابي</span>
                <svg className="w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
                  <button
                    onClick={openChangePasswordModal}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 transition-colors text-right"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">تغيير كلمة المرور</span>
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-right"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">تسجيل الخروج</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              className="hidden lg:inline-block lg:mr-auto lg:ml-3 py-2 px-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-sm text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center" 
              to="/signin"
            >
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              تسجيل الدخول
            </Link>
          )}
        </div>
      </nav>
      
      {/* قائمة الجوال مع تحسينات الرسوم المتحركة */}
      <div className={`fixed inset-0 z-50 transition-all duration-500 ease-in-out ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div 
          className="absolute inset-0 bg-gray-800/70 backdrop-blur-sm transition-opacity duration-500" 
          onClick={toggleMenu}
        ></div>
        <div className={`absolute top-0 right-0 bottom-0 w-4/5 max-w-sm bg-gradient-to-b from-blue-50 to-white transform transition-transform duration-500 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`} dir="rtl">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-6 border-b border-blue-100">
              <Link 
                className="text-2xl font-bold flex items-center" 
                to="/" 
                onClick={() => handleLinkClick('الرئيسية')}
              >
                <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl shadow-lg">
                  <svg className="text-white w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent mr-2">تعلم</span>
              </Link>
              <button 
                className="p-2 rounded-full hover:bg-blue-100 transition-colors" 
                onClick={toggleMenu}
                aria-label="إغلاق القائمة"
              >
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-6 px-4"> 
              <ul className="space-y-2">
                <li>
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      `flex items-center p-4 rounded-xl transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg' 
                          : 'text-blue-800 hover:bg-blue-100'
                      }`
                    }
                    onClick={() => handleLinkClick('الرئيسية')}
                  >
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    الرئيسية
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/about"
                    className={({ isActive }) =>
                      `flex items-center p-4 rounded-xl transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg' 
                          : 'text-blue-800 hover:bg-blue-100'
                      }`
                    }
                    onClick={() => handleLinkClick('من نحن')}
                  >
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    من نحن
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/courses"
                    className={({ isActive }) =>
                      `flex items-center p-4 rounded-xl transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg' 
                          : 'text-blue-800 hover:bg-blue-100'
                      }`
                    }
                    onClick={() => handleLinkClick('الدورات')}
                  >
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    الدورات
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/services"
                    className={({ isActive }) =>
                      `flex items-center p-4 rounded-xl transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg' 
                          : 'text-blue-800 hover:bg-blue-100'
                      }`
                    }
                    onClick={() => handleLinkClick('الخدمات')}
                  >
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    الخدمات
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/cart"
                    className={({ isActive }) =>
                      `flex items-center p-4 rounded-xl transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg' 
                          : 'text-blue-800 hover:bg-blue-100'
                      }`
                    }
                    onClick={toggleMenu}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 ml-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                    سلة التسوق
                  </NavLink>
                </li>
              </ul>
            </div>
            
            {/* القسم السفلي */}
            <div className="p-4 border-t border-blue-100">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => {
                      openChangePasswordModal();
                      toggleMenu();
                    }}
                    className="flex items-center justify-center w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg mb-3"
                  >
                    <Settings className="w-5 h-5 ml-2" />
                    تغيير كلمة المرور
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }}
                    className="flex items-center justify-center w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg mb-4"
                  >
                    <LogOut className="w-5 h-5 ml-2" />
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                <Link 
                  className="flex items-center justify-center w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg mb-4" 
                  to="/signin" 
                  onClick={toggleMenu}
                >
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  تسجيل الدخول
                </Link>
              )}
              <p className="text-xs text-center text-blue-400">
                <span>جميع الحقوق محفوظة © {new Date().getFullYear()}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">تغيير كلمة المرور</h3>
                    <p className="text-blue-100 text-sm">أدخل كلمة المرور الحالية والجديدة</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChangePasswordModal(false)}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {!showChangePasswordForm ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Settings className="w-8 h-8 text-blue-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">إعدادات الحساب</h4>
                    <p className="text-gray-600 text-sm">اختر الإجراء الذي تريد تنفيذه</p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => setShowChangePasswordForm(true)}
                      className="w-full flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
                    >
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <Key className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-right">
                        <h5 className="font-semibold text-gray-800 group-hover:text-blue-600">تغيير كلمة المرور</h5>
                        <p className="text-sm text-gray-600">تحديث كلمة المرور الحالية</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setShowChangePasswordModal(false)}
                      className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
                    >
                      <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-right">
                        <h5 className="font-semibold text-gray-800 group-hover:text-gray-600">إلغاء</h5>
                        <p className="text-sm text-gray-600">العودة للصفحة الرئيسية</p>
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {/* Old Password */}
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      name="old_password"
                      value={changePasswordData.old_password}
                      onChange={handleChangePasswordInputChange}
                      placeholder="كلمة المرور الحالية"
                      required
                      className="w-full pr-10 pl-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-right text-sm bg-gray-50/50 hover:bg-white"
                    />
                  </div>

                  {/* New Password */}
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      name="new_password"
                      value={changePasswordData.new_password}
                      onChange={handleChangePasswordInputChange}
                      placeholder="كلمة المرور الجديدة"
                      required
                      className="w-full pr-10 pl-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-right text-sm bg-gray-50/50 hover:bg-white"
                    />
                  </div>

                  {/* Confirm New Password */}
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      name="new_password_confirm"
                      value={changePasswordData.new_password_confirm}
                      onChange={handleChangePasswordInputChange}
                      placeholder="تأكيد كلمة المرور الجديدة"
                      required
                      className="w-full pr-10 pl-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-right text-sm bg-gray-50/50 hover:bg-white"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowChangePasswordForm(false)}
                      className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                    >
                      رجوع
                    </button>
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isChangingPassword ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;