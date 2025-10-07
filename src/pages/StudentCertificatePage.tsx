import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, ArrowLeft, Award } from 'lucide-react';

interface CertificatePayload {
  certificate_url: string;
  download_url?: string;
  verification_code: string;
  issued_date: string;
  student_name: string;
  course_title: string;
  message?: string;
  id?: number;
}

const StudentCertificatePage: React.FC = () => {
  const { course_id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [data, setData] = useState<CertificatePayload | null>(null);
  const [downloading, setDownloading] = useState<boolean>(false);

  const authFetch = async (url: string, init?: RequestInit) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/signin');
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
      const refresh = localStorage.getItem('refreshToken');
      if (refresh) {
        const refreshRes = await fetch('/user/token/refresh/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh })
        });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          if (data.access) localStorage.setItem('accessToken', data.access);
          res = await fetch(url, {
            ...init,
            headers: {
              ...(init && init.headers ? init.headers : {}),
              'Authorization': `Bearer ${data.access}`,
              'Accept': 'application/json'
            }
          });
        } else {
          localStorage.clear();
          navigate('/signin');
          return new Response(null, { status: 401 });
        }
      } else {
        localStorage.clear();
        navigate('/signin');
        return new Response(null, { status: 401 });
      }
    }
    return res;
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await authFetch(`/student/certificates/${course_id}/`);
        if (!res || !res.ok) {
          setError('تعذر جلب الشهادة');
          return;
        }
        const json: CertificatePayload = await res.json();
        setData(json);
      } catch (e) {
        setError('حدث خطأ أثناء جلب الشهادة');
      } finally {
        setLoading(false);
      }
    };
    if (course_id) load();
  }, [course_id]);

  const download = async () => {
    if (!data) return;
    try {
      setDownloading(true);
      let dlUrl = data.download_url ? data.download_url : `/student/certificates/download/${data.id ?? data.verification_code}/`;
      if (!/^https?:\/\//.test(dlUrl) && dlUrl.startsWith('/api/')) {
        dlUrl = dlUrl.replace(/^\/api/, '');
      }
      const res = await authFetch(dlUrl, { method: 'GET' });
      if (!res || !res.ok) {
        setError('تعذر تحميل ملف الشهادة');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate_${data.verification_code || course_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e) {
      setError('حدث خطأ أثناء تنزيل الشهادة');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-blue-800">جار تحميل الشهادة...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="bg-white/80 border border-blue-200 rounded-2xl p-6 text-center">
          <div className="text-red-600 mb-2">{error}</div>
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-blue-600 text-white rounded-xl">رجوع</button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden">
        <div className="p-4 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <button onClick={() => navigate(-1)} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="font-bold">شهادة إتمام الكورس</div>
          <div />
        </div>

        <div className="p-10">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Award className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-blue-900">شهادة إتمام</h1>
            <p className="text-blue-600 mt-2">تشهد المنصة بأن</p>
          </div>

          <div className="text-center mb-10">
            <div className="text-2xl font-bold text-blue-900">{data.student_name}</div>
            <div className="mt-2 text-blue-700">قد أتم بنجاح كورس</div>
            <div className="mt-1 text-xl font-semibold text-blue-900">{data.course_title}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-10">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="text-sm text-blue-700">كود التحقق</div>
              <div className="font-bold text-blue-900">{data.verification_code}</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="text-sm text-blue-700">تاريخ الإصدار</div>
              <div className="font-bold text-blue-900">{new Date(data.issued_date).toLocaleString('ar-EG')}</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="text-sm text-blue-700">الحالة</div>
              <div className="font-bold text-green-700 flex items-center justify-center gap-1">
                <CheckCircle className="w-4 h-4" /> صالحة
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button onClick={download} disabled={downloading} className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold disabled:opacity-50">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                {downloading ? 'جار التنزيل...' : 'تنزيل الشهادة'}
              </div>
            </button>
            {data.certificate_url && (
              <a href={data.certificate_url} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-white border border-blue-200 text-blue-700 rounded-xl font-bold">
                فتح الشهادة الأصلية
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCertificatePage;


