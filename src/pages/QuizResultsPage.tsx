import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, AlertTriangle, ArrowLeft, HelpCircle } from 'lucide-react';

interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

const QuizResultsPage: React.FC = () => {
  const { attempt_id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [results, setResults] = useState<any | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: Toast['type'], message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };
  const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

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
    const loadResults = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await authFetch(`/student/quiz-results/${attempt_id}/`);
        if (!res || !res.ok) {
          setError('تعذر تحميل نتيجة الاختبار');
          addToast('error', 'فشل في تحميل نتيجة الاختبار');
          return;
        }
        const data = await res.json();
        setResults(data);
      } catch (e) {
        setError('حدث خطأ أثناء تحميل النتيجة');
        addToast('error', 'حدث خطأ أثناء تحميل النتيجة');
      } finally {
        setLoading(false);
      }
    };
    if (attempt_id) loadResults();
  }, [attempt_id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center text-blue-800">جار تحميل النتيجة...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="bg-white/80 backdrop-blur-sm border rounded-2xl p-6 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <div className="text-blue-900 mb-4">{error}</div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl"
          >
            <div className="flex items-center gap-2"><ArrowLeft className="w-4 h-4" />رجوع</div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-xl hover:bg-blue-50/50 transition-all duration-300 transform hover:scale-105 shadow-lg text-blue-700 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>العودة إلى لوحة التحكم</span>
          </button>
        </div>

        <div className="bg-white/90 backdrop-blur-sm border border-blue-200/50 rounded-3xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-blue-900">نتيجة الاختبار</h1>
          </div>

          {results && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {'score' in results && (
                  <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200/70">
                    <div className="text-2xl font-bold text-blue-900 mb-1">{results.score}</div>
                    <div className="text-sm text-blue-700">النتيجة</div>
                  </div>
                )}
                {'total_points' in results && (
                  <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200/70">
                    <div className="text-2xl font-bold text-blue-900 mb-1">{results.total_points}</div>
                    <div className="text-sm text-blue-700">إجمالي النقاط</div>
                  </div>
                )}
                {'percentage' in results && (
                  <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200/70">
                    <div className="text-2xl font-bold text-blue-900 mb-1">{Math.round(results.percentage)}%</div>
                    <div className="text-sm text-blue-700">النسبة</div>
                  </div>
                )}
              </div>

              {'details' in results && Array.isArray(results.details) && (
                <div className="space-y-4">
                  {results.details.map((d: any, idx: number) => (
                    <div key={idx} className="bg-white/90 p-5 rounded-xl border border-blue-200/70">
                      <div className="flex items-start justify-between">
                        <div className="text-blue-900 font-semibold">{d.question_text || `السؤال ${idx + 1}`}</div>
                        {typeof d.is_correct === 'boolean' && (
                          <div className={`px-3 py-1 rounded-full text-sm font-bold ${d.is_correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {d.is_correct ? 'صحيح' : 'خطأ'}
                          </div>
                        )}
                      </div>
                      {d.correct_answer && (
                        <div className="mt-2 text-sm text-blue-700">الإجابة الصحيحة: {d.correct_answer}</div>
                      )}
                      {d.user_answer && (
                        <div className="mt-1 text-sm text-blue-700">إجابتك: {d.user_answer}</div>
                      )}
                      {'explanation' in d && d.explanation && (
                        <div className="mt-2 text-sm text-blue-700">الشرح: {d.explanation}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Toast Container */}
        <div className="fixed top-4 left-4 z-50 space-y-2 max-w-sm">
          {toasts.map((toast) => (
            <div key={toast.id} className={`flex items-center gap-3 p-4 border rounded-lg shadow-md ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : toast.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
              {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-500" /> : toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-500" /> : toast.type === 'warning' ? <AlertTriangle className="w-5 h-5 text-yellow-500" /> : <HelpCircle className="w-5 h-5 text-blue-500" />}
              <span className="flex-1">{toast.message}</span>
              <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-600 transition">✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizResultsPage;



