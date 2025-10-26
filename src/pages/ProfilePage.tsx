import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User,  Edit3, Save, X, Camera } from 'lucide-react';

interface Profile {
  id?: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
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
  parent_name?: string;
  email_verified?: boolean;
  date_joined?: string;
  last_login?: string;
}

interface ProfilePageProps {
  profile: Profile | null;
  onProfileUpdate?: (updatedProfile: Profile) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ profile, onProfileUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Profile>(profile || {});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [parentData, setParentData] = useState<any>(null);
  const [loadingParentData, setLoadingParentData] = useState(false);

  const nameFromStorage = () => {
    return localStorage.getItem('displayName') || profile?.username || 'المستخدم';
  };

const avatarUrl = () => {
  if (profile?.profile_picture) {
    return `https://res.cloudinary.com/dtoy7z1ou/${profile.profile_picture}`;
  }
  return localStorage.getItem('profileImageUrl') || '';
};

  // جلب بيانات الوالد إذا كان المستخدم والد
  useEffect(() => {
    const fetchParentData = async () => {
      const userType = profile?.user_type || localStorage.getItem('userType');
      if (userType === 'parent') {
        setLoadingParentData(true);
        try {
          const token = localStorage.getItem('accessToken');
          if (!token) return;

          const response = await fetch('/user/profile/parent/', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Parent data received:', data);
            console.log('Children field:', data.children);
            setParentData(data);
          } else {
            console.error('فشل في جلب بيانات الوالد');
          }
        } catch (error) {
          console.error('خطأ في جلب بيانات الوالد:', error);
        } finally {
          setLoadingParentData(false);
        }
      }
    };

    fetchParentData();
  }, [profile?.user_type]);

  const handleEdit = () => {
    setEditedProfile(profile || {});
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedProfile(profile || {});
    setSelectedImage(null);
    setImagePreview(null);
    setIsEditing(false);
  };

  const authFetch = async (url: string, init?: RequestInit) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      window.location.href = '/signin';
      return new Response(null, { status: 401 });
    }

    const response = await fetch(url, {
      ...init,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });

    return response;
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/signin';
        return;
      }

      let response;
      
      if (selectedImage) {
        // إذا كان هناك صورة جديدة، استخدم FormData
        const formData = new FormData();
        formData.append('first_name', editedProfile.first_name || '');
        formData.append('last_name', editedProfile.last_name || '');
        formData.append('phone_number', editedProfile.phone_number || '');
        formData.append('profile_picture', selectedImage);
        formData.append('date_of_birth', editedProfile.date_of_birth || '');
        formData.append('bio', editedProfile.bio || '');
        formData.append('address', editedProfile.address || '');
        formData.append('city', editedProfile.city || '');
        formData.append('country', editedProfile.country || '');

        response = await fetch('/user/profile/', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData
        });
      } else {
        // إذا لم تكن هناك صورة جديدة، استخدم JSON
        response = await authFetch('/user/profile/', {
          method: 'PUT',
          body: JSON.stringify({
            first_name: editedProfile.first_name,
            last_name: editedProfile.last_name,
            phone_number: editedProfile.phone_number,
            profile_picture: editedProfile.profile_picture,
            date_of_birth: editedProfile.date_of_birth,
            bio: editedProfile.bio,
            address: editedProfile.address,
            city: editedProfile.city,
            country: editedProfile.country,
          })
        });
      }

      if (response.ok) {
        const updatedProfile = await response.json();
        // تحديث البيانات المحلية
        localStorage.setItem('displayName', updatedProfile.full_name || updatedProfile.username);
        if (updatedProfile.profile_picture) {
          localStorage.setItem('profileImageUrl', `https://res.cloudinary.com/dtoy7z1ou/${updatedProfile.profile_picture}`);
        }
        // تحديث الـ profile في الـ parent component
        if (onProfileUpdate) {
          onProfileUpdate(updatedProfile);
        }
        // مسح الصورة المحددة والمعاينة
        setSelectedImage(null);
        setImagePreview(null);
        setIsEditing(false);
        // يمكن إضافة إشعار نجاح هنا
      } else {
        console.error('فشل في تحديث الملف الشخصي');
      }
    } catch (error) {
      console.error('خطأ في تحديث الملف الشخصي:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      // إنشاء معاينة للصورة
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setImagePreview(imageUrl);
      };
      reader.readAsDataURL(file);

      // رفع الصورة إلى الخادم
      try {
        setIsLoading(true);
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.error('لا يوجد توكن');
          return;
        }

        const formData = new FormData();
        formData.append('profile_picture', file);

        const response = await fetch('/user/profile/', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData
        });

        if (response.ok) {
          const updatedProfile = await response.json();
          setEditedProfile({ ...editedProfile, profile_picture: updatedProfile.profile_picture });
          // تحديث الـ profile في الـ parent component
          if (onProfileUpdate) {
            onProfileUpdate(updatedProfile);
          }
          // تحديث البيانات المحلية
          if (updatedProfile.profile_picture) {
            localStorage.setItem('profileImageUrl', `https://res.cloudinary.com/dtoy7z1ou/${updatedProfile.profile_picture}`);
          }
        } else {
          console.error('فشل في رفع الصورة');
        }
      } catch (error) {
        console.error('خطأ في رفع الصورة:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };


  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">الملف الشخصي</h1>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            تعديل الملف الشخصي
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'جاري الحفظ...' : 'حفظ'}
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
              إلغاء
            </button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Profile card */}
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="lg:col-span-1">
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-sm p-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-blue-100 shadow mb-4 bg-blue-50 flex items-center justify-center">
                {isEditing ? (
                  <>
                    {imagePreview ? (
                      <img src={imagePreview} alt="avatar preview" className="w-full h-full object-cover" />
                    ) : editedProfile.profile_picture ? (
                      <img src={editedProfile.profile_picture} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-blue-500" />
                    )}
                    <label className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                      <Camera className="w-6 h-6 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isLoading}
                      />
                    </label>
                    {isLoading && (
                      <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                {avatarUrl() ? (
                  <img src={avatarUrl()} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-blue-500" />
                    )}
                  </>
                )}
              </div>
              <div className="text-lg font-bold text-gray-900">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.first_name || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, first_name: e.target.value })}
                    className="text-center bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                    placeholder="الاسم الأول"
                    dir="rtl"
                  />
                ) : (
                  nameFromStorage()
                )}
              </div>
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
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">الاسم الأول</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.first_name || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, first_name: e.target.value })}
                      className="text-right bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none w-32"
                      dir="rtl"
                    />
                  ) : (
                    <span className="text-gray-900">{profile?.first_name || '-'}</span>
                  )}
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">الاسم الأخير</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.last_name || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, last_name: e.target.value })}
                      className="text-right bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none w-32"
                      dir="rtl"
                    />
                  ) : (
                    <span className="text-gray-900">{profile?.last_name || '-'}</span>
                  )}
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">البريد</span>
                  <span className="text-gray-900">{profile?.email || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">النوع</span>
                  <span className="text-gray-900">{profile?.user_type || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">الهاتف</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.phone_number || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, phone_number: e.target.value })}
                      className="text-right bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none w-32"
                      dir="rtl"
                    />
                  ) : (
                    <span className="text-gray-900">{profile?.phone_number || '-'}</span>
                  )}
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">تاريخ الميلاد</span>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editedProfile.date_of_birth || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, date_of_birth: e.target.value })}
                      className="text-right bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none w-32"
                      dir="rtl"
                    />
                  ) : (
                    <span className="text-gray-900">{profile?.date_of_birth || '-'}</span>
                  )}
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">الدولة</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.country || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, country: e.target.value })}
                      className="text-right bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none w-32"
                      dir="rtl"
                    />
                  ) : (
                    <span className="text-gray-900">{profile?.country || '-'}</span>
                  )}
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">المدينة</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.city || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, city: e.target.value })}
                      className="text-right bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none w-32"
                      dir="rtl"
                    />
                  ) : (
                    <span className="text-gray-900">{profile?.city || '-'}</span>
                  )}
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">العنوان</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.address || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, address: e.target.value })}
                      className="text-right bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none w-32"
                      dir="rtl"
                    />
                  ) : (
                    <span className="text-gray-900">{profile?.address || '-'}</span>
                  )}
                </div>
                {/* حقل اسم الابن للوالدين - للعرض فقط */}
                {(profile?.user_type === 'parent' || localStorage.getItem('userType') === 'parent') && (
                  <div className="flex justify-between border-b border-gray-100 pb-2 md:col-span-2">
                    <span className="text-gray-500">اسم الابن/الابنة</span>
                    <span className="text-gray-900">
                      {loadingParentData ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      ) : (
                        Array.isArray(parentData?.children) && parentData.children.length > 0
                          ? parentData.children.map((child: any, index: number) => (
                              <span key={child.id}>
                                {child.first_name} {child.last_name}
                                {index < parentData.children.length - 1 && ', '}
                              </span>
                            ))
                          : '-'
                      )}
                    </span>
                  </div>
                )}
                {/* حقل السيرة الذاتية */}
               <div className="flex flex-col gap-2 md:col-span-2">
                  <span className="text-gray-500">السيرة الذاتية</span>
                  {isEditing ? (
                    <textarea
                      value={editedProfile.bio || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                      rows={3}
                      placeholder="اكتب سيرتك الذاتية هنا..."
                      dir="rtl"   
                    />
                  ) : (
                    <span className="text-gray-900 text-sm" dir="auto">
                      {profile?.bio || '-'}
                    </span>
                  )}
                </div>

              </div>
            </div>

           
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;







