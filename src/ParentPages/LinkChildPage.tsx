import React, { useState } from 'react';
import { motion } from 'framer-motion';

const LinkChildPage: React.FC = () => {
  const [childName, setChildName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName.trim()) {
      setToast({ type: 'error', message: 'من فضلك أدخل اسم المستخدم للابن' });
      return;
    }
    try {
      setSubmitting(true);
      setToast(null);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/signin';
        return;
      }
      const res = await fetch('/user/link-child/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({ child_username: childName.trim() }),
      });
      if (!res.ok) {
        const text = await res.text();
        setToast({ type: 'error', message: text || 'تعذر ربط الحساب' });
        return;
      }
      setToast({ type: 'success', message: 'تم ربط حساب الابن بنجاح' });
      setChildName('');
    } catch (err) {
      setToast({ type: 'error', message: 'حدث خطأ غير متوقع' });
    } finally {
      setSubmitting(false);
      // Auto-hide toast
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} dir="rtl">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">ربط حساب الابن</h1>
      
      <div className="max-w-xl mx-auto">
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">ربط حساب الابن</h2>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">اسم المستخدم للابن</label>
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                className="w-full rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 px-3 py-2 outline-none bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className={`w-full rounded-lg px-4 py-2 text-white shadow ${submitting ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'} transition`}
            >
              {submitting ? 'جارِ الربط...' : 'ربط'}
            </button>
          </form>
          {toast && (
            <div
              className={`mt-4 rounded-lg px-3 py-2 text-sm ${toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
            >
              {toast.message}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default LinkChildPage;







