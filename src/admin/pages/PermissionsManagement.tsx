import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
 
  Edit, 
  Save, 
  X,
  CheckCircle,
  XCircle,

  UserCheck,
  GraduationCap,
  User,
  Crown
} from 'lucide-react';
import { toast } from 'react-toastify';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: React.ComponentType<any>;
  permissions: string[];
}

const PermissionsManagement: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string>('student');
  const [editingPermissions, setEditingPermissions] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Define all available permissions
  const allPermissions: Permission[] = [
    // Student Permissions
    { id: 'view_courses', name: 'عرض الكورسات', description: 'القدرة على عرض قائمة الكورسات المتاحة', category: 'student' },
    { id: 'enroll_courses', name: 'الالتحاق بالكورسات', description: 'القدرة على الالتحاق بالكورسات', category: 'student' },
    { id: 'view_lessons', name: 'عرض الدروس', description: 'القدرة على عرض دروس الكورسات', category: 'student' },
    { id: 'take_quizzes', name: 'أداء الاختبارات', description: 'القدرة على أداء الاختبارات والامتحانات', category: 'student' },
    { id: 'view_grades', name: 'عرض الدرجات', description: 'القدرة على عرض درجات الاختبارات', category: 'student' },
    { id: 'submit_assignments', name: 'تسليم الواجبات', description: 'القدرة على تسليم الواجبات والمشاريع', category: 'student' },
    { id: 'rate_courses', name: 'تقييم الكورسات', description: 'القدرة على تقييم الكورسات وكتابة المراجعات', category: 'student' },
    { id: 'view_profile', name: 'عرض الملف الشخصي', description: 'القدرة على عرض وتعديل الملف الشخصي', category: 'student' },
    { id: 'view_certificates', name: 'عرض الشهادات', description: 'القدرة على عرض الشهادات المحصل عليها', category: 'student' },

    // Teacher Permissions
    { id: 'create_courses', name: 'إنشاء الكورسات', description: 'القدرة على إنشاء كورسات جديدة', category: 'teacher' },
    { id: 'edit_courses', name: 'تعديل الكورسات', description: 'القدرة على تعديل الكورسات الخاصة به', category: 'teacher' },
    { id: 'delete_courses', name: 'حذف الكورسات', description: 'القدرة على حذف الكورسات الخاصة به', category: 'teacher' },
    { id: 'upload_content', name: 'رفع المحتوى', description: 'القدرة على رفع الفيديوهات والملفات', category: 'teacher' },
    { id: 'create_quizzes', name: 'إنشاء الاختبارات', description: 'القدرة على إنشاء اختبارات جديدة', category: 'teacher' },
    { id: 'grade_assignments', name: 'تصحيح الواجبات', description: 'القدرة على تصحيح واجبات الطلاب', category: 'teacher' },
    { id: 'view_students', name: 'عرض الطلاب', description: 'القدرة على عرض قائمة طلاب الكورسات', category: 'teacher' },
    { id: 'view_analytics', name: 'عرض الإحصائيات', description: 'القدرة على عرض إحصائيات الكورسات', category: 'teacher' },
    { id: 'respond_reviews', name: 'الرد على المراجعات', description: 'القدرة على الرد على مراجعات الطلاب', category: 'teacher' },

    // Parent Permissions
    { id: 'view_child_progress', name: 'متابعة تقدم الطفل', description: 'القدرة على متابعة تقدم الطفل في الكورسات', category: 'parent' },
    { id: 'view_child_grades', name: 'عرض درجات الطفل', description: 'القدرة على عرض درجات الطفل في الاختبارات', category: 'parent' },
    { id: 'view_child_attendance', name: 'عرض حضور الطفل', description: 'القدرة على عرض سجل حضور الطفل', category: 'parent' },
    { id: 'view_child_courses', name: 'عرض كورسات الطفل', description: 'القدرة على عرض الكورسات المسجل بها الطفل', category: 'parent' },
    { id: 'contact_teachers', name: 'التواصل مع المدرسين', description: 'القدرة على التواصل مع مدرسي الطفل', category: 'parent' },
    { id: 'view_reports', name: 'عرض التقارير', description: 'القدرة على عرض تقارير أداء الطفل', category: 'parent' },

    // Admin Permissions
    { id: 'manage_users', name: 'إدارة المستخدمين', description: 'القدرة على إدارة جميع المستخدمين', category: 'admin' },
    { id: 'manage_courses', name: 'إدارة الكورسات', description: 'القدرة على إدارة جميع الكورسات', category: 'admin' },
    { id: 'manage_categories', name: 'إدارة الأقسام', description: 'القدرة على إدارة أقسام الكورسات', category: 'admin' },
    { id: 'view_analytics', name: 'عرض الإحصائيات العامة', description: 'القدرة على عرض إحصائيات المنصة', category: 'admin' },
    { id: 'manage_reviews', name: 'إدارة المراجعات', description: 'القدرة على إدارة مراجعات الكورسات', category: 'admin' },
    { id: 'manage_permissions', name: 'إدارة الصلاحيات', description: 'القدرة على إدارة صلاحيات المستخدمين', category: 'admin' },
    { id: 'view_logs', name: 'عرض السجلات', description: 'القدرة على عرض سجلات النظام', category: 'admin' },
    { id: 'system_settings', name: 'إعدادات النظام', description: 'القدرة على تعديل إعدادات النظام', category: 'admin' }
  ];

  // Define roles with their permissions
  const roles: Role[] = [
    {
      id: 'student',
      name: 'طالب',
      description: 'مستخدم يمكنه الالتحاق بالكورسات وأداء الاختبارات',
      color: 'bg-purple-500',
      icon: GraduationCap,
      permissions: [
        'view_courses', 'enroll_courses', 'view_lessons', 'take_quizzes', 
        'view_grades', 'submit_assignments', 'rate_courses', 'view_profile', 'view_certificates'
      ]
    },
    {
      id: 'teacher',
      name: 'مدرس',
      description: 'مستخدم يمكنه إنشاء وإدارة الكورسات',
      color: 'bg-green-500',
      icon: UserCheck,
      permissions: [
        'view_courses', 'create_courses', 'edit_courses', 'delete_courses', 
        'upload_content', 'create_quizzes', 'grade_assignments', 'view_students', 
        'view_analytics', 'respond_reviews', 'view_profile'
      ]
    },
    {
      id: 'parent',
      name: 'ولي أمر',
      description: 'مستخدم يمكنه متابعة تقدم أطفاله',
      color: 'bg-blue-500',
      icon: User,
      permissions: [
        'view_child_progress', 'view_child_grades', 'view_child_attendance', 
        'view_child_courses', 'contact_teachers', 'view_reports', 'view_profile'
      ]
    },
    {
      id: 'admin',
      name: 'مدير',
      description: 'مستخدم له صلاحيات كاملة في النظام',
      color: 'bg-red-500',
      icon: Crown,
      permissions: allPermissions.map(p => p.id)
    }
  ];

  const currentRole = roles.find(role => role.id === selectedRole);
  const rolePermissions = currentRole?.permissions || [];

  // Handle permission toggle
  const handlePermissionToggle = (permissionId: string) => {
    if (editingPermissions.includes(permissionId)) {
      setEditingPermissions(editingPermissions.filter(id => id !== permissionId));
    } else {
      setEditingPermissions([...editingPermissions, permissionId]);
    }
  };

  // Handle save changes
  const handleSaveChanges = () => {
    // Here you would make API call to update role permissions
    // await updateRolePermissions(selectedRole, editingPermissions);
    
    toast.success('تم حفظ التغييرات بنجاح');
    setIsEditing(false);
    setEditingPermissions([]);
  };

  // Handle cancel editing
  const handleCancelEditing = () => {
    setIsEditing(false);
    setEditingPermissions([]);
  };

  // Get permissions by category
  const getPermissionsByCategory = (category: string) => {
    return allPermissions.filter(permission => permission.category === category);
  };

  // Check if permission is assigned to role
  const isPermissionAssigned = (permissionId: string) => {
    return rolePermissions.includes(permissionId);
  };

  // Check if permission is being edited
  const isPermissionBeingEdited = (permissionId: string) => {
    return editingPermissions.includes(permissionId);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">نظام صلاحيات المستخدمين</h1>
        <p className="text-gray-600">إدارة صلاحيات المستخدمين حسب نوع الحساب</p>
      </div>

      {/* Role Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {roles.map((role, index) => (
          <motion.button
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => {
              setSelectedRole(role.id);
              setIsEditing(false);
              setEditingPermissions([]);
            }}
            className={`p-6 rounded-xl shadow-lg transition-all duration-200 ${
              selectedRole === role.id
                ? 'ring-2 ring-blue-500 bg-white'
                : 'bg-white hover:shadow-xl'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${role.color}`}>
                <role.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <h3 className="font-bold text-gray-800">{role.name}</h3>
                <p className="text-sm text-gray-600">{role.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {role.permissions.length} صلاحية
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Role Details */}
      {currentRole && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${currentRole.color}`}>
                <currentRole.icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{currentRole.name}</h2>
                <p className="text-gray-600">{currentRole.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  تعديل الصلاحيات
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveChanges}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    حفظ التغييرات
                  </button>
                  <button
                    onClick={handleCancelEditing}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    إلغاء
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Permissions by Category */}
          <div className="space-y-8">
            {['student', 'teacher', 'parent', 'admin'].map(category => {
              const categoryPermissions = getPermissionsByCategory(category);
              if (categoryPermissions.length === 0) return null;

              return (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 capitalize">
                    صلاحيات {category === 'student' ? 'الطالب' : 
                             category === 'teacher' ? 'المدرس' : 
                             category === 'parent' ? 'ولي الأمر' : 'المدير'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryPermissions.map((permission, index) => (
                      <motion.div
                        key={permission.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          isPermissionAssigned(permission.id)
                            ? 'border-green-200 bg-green-50'
                            : 'border-gray-200 bg-gray-50'
                        } ${
                          isEditing ? 'cursor-pointer hover:border-blue-300' : ''
                        }`}
                        onClick={() => isEditing && handlePermissionToggle(permission.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-gray-800">{permission.name}</h4>
                              {isPermissionAssigned(permission.id) ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{permission.description}</p>
                          </div>
                          {isEditing && (
                            <div className="ml-4">
                              {isPermissionBeingEdited(permission.id) ? (
                                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                              ) : (
                                <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">ملخص الصلاحيات</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map(role => (
            <div key={role.id} className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${role.color}`}></div>
                <span className="font-medium text-gray-800">{role.name}</span>
              </div>
              <p className="text-sm text-gray-600">
                {role.permissions.length} صلاحية
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PermissionsManagement;
