import React, { useState } from 'react';
import Dashboard from './Dashboard';

const ParentDashboard: React.FC = () => {
  const [childName, setChildName] = useState('');
  const [linking, setLinking] = useState(false);
  const [message, setMessage] = useState<string>('');

  const linkChild = async () => {
    setMessage('');
    if (!childName.trim()) {
      setMessage('الرجاء إدخال اسم المستخدم للابن');
      return;
    }
    try {
      setLinking(true);
      // نسخة مطابقة لمنطق Dashboard لتجديد التوكن وإعادة المحاولة
      const refreshToken = async (): Promise<string | null> => {
        try {
          const refresh = localStorage.getItem('refreshToken');
          if (!refresh) return null;
          console.log('=== REFRESH TOKEN REQUEST (Parent) ===');
          console.log('Request URL:', '/user/token/refresh/');
          const r = await fetch('/user/token/refresh/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh })
          });
          console.log('=== REFRESH TOKEN RESPONSE (Parent) ===');
          console.log('Response Status:', r.status);
          console.log('Response OK:', r.ok);
          if (!r.ok) return null;
          const d = await r.json();
          if (d.access) {
            localStorage.setItem('accessToken', d.access);
            return d.access as string;
          }
          return null;
        } catch (e) {
          console.error('Error refreshing token (Parent):', e);
          return null;
        }
      };

      const authFetch = async (url: string, init?: RequestInit) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          window.location.href = '/signin';
          return new Response(null, { status: 401 });
        }
        console.log('=== AUTH FETCH REQUEST (Parent) ===');
        console.log('Request URL:', url);
        let res = await fetch(url, {
          ...init,
          headers: {
            ...(init && init.headers ? init.headers : {}),
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        console.log('=== AUTH FETCH RESPONSE (Parent) ===');
        console.log('Response Status:', res.status);
        console.log('Response OK:', res.ok);
        if (res.status === 401) {
          console.log('Token expired (Parent), attempting refresh...');
          const newToken = await refreshToken();
          if (newToken) {
            console.log('Retrying request with new token (Parent)...');
            res = await fetch(url, {
              ...init,
              headers: {
                ...(init && init.headers ? init.headers : {}),
                'Authorization': `Bearer ${newToken}`,
                'Accept': 'application/json'
              }
            });
            console.log('=== RETRY RESPONSE (Parent) ===');
            console.log('Response Status:', res.status);
            console.log('Response OK:', res.ok);
          } else {
            localStorage.clear();
            window.location.href = '/signin';
            return new Response(null, { status: 401 });
          }
        }
        return res;
      };

      const res = await authFetch('/user/link-child/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ child_username: childName.trim() })
      });

      const text = await res.text();
      let data: any = {};
      try { if (text) data = JSON.parse(text); } catch {}

      if (res.ok) {
        setMessage(data.message || 'تم ربط حساب الابن بنجاح');
        setChildName('');
      } else {
        setMessage(data.detail || data.error || 'تعذّر ربط حساب الابن');
      }
    } catch (e) {
      setMessage('حدث خطأ أثناء الربط');
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Dashboard>
        <div id="link-child" className="max-w-2xl mx-auto bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">ربط حساب الابن</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">ادخل اسم المستخدم للابن ثم اضغط ربط.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="اسم المستخدم للابن"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-1">
              <button
                onClick={linkChild}
                disabled={linking}
                className={`w-full px-4 py-2 rounded-lg font-medium ${linking ? 'bg-gray-200 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {linking ? '...جار الربط' : 'ربط'}
              </button>
            </div>
          </div>
          {message && <div className="mt-4 p-3 rounded-md bg-blue-50 text-blue-700 text-sm">{message}</div>}
        </div>
      </Dashboard>
    </div>
  );
};

export default ParentDashboard;


