import React, { useState, useEffect } from 'react';

const API_BASE = '';

type CourseStatus = 'draft' | 'published';
type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced';

const TeacherCreateCourse: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<CourseStatus>('draft');
  const [difficulty, setDifficulty] = useState<CourseDifficulty>('beginner');
  const [price, setPrice] = useState('5');
  const [durationHours, setDurationHours] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!thumbnail) {
      setThumbnailPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(thumbnail);
    setThumbnailPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [thumbnail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('يجب تسجيل الدخول أولاً');
        setSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }
      formData.append('status', status);
      formData.append('difficulty', difficulty);
      formData.append('price', price);
      formData.append('duration_hours', String(durationHours));

      const res = await fetch(`${API_BASE}/teacher/courses/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'تعذر إنشاء الكورس');
      }

      setMessage('تم إنشاء الكورس بنجاح');
      setTitle('');
      setDescription('');
      setThumbnail(null);
      setStatus('draft');
      setDifficulty('beginner');
      setPrice('5');
      setDurationHours(0);
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ غير متوقع');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-20 flex items-center justify-center p-6">
      <div className="max-w-7xl w-full bg-white rounded-3xl shadow-2xl border border-blue-300 flex flex-col lg:flex-row overflow-hidden">
        {/* قسم الصورة */}
        <div className="lg:w-1/2 bg-blue-100 flex items-center justify-center p-8 min-h-[800px]">
          <div className="text-center space-y-6">
            <img
              src="https://courseapproach.com/wp-content/uploads/2023/12/gif-6.gif"
              alt="Animated course creation"
              className="rounded-2xl shadow-xl max-w-full h-[400px] object-cover mx-auto transition-transform duration-700 hover:scale-105 border-4 border-blue-300"
              loading="lazy"
            />
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-blue-800">ابدأ رحلتك التعليمية</h3>
              <p className="text-blue-700 text-lg">قم بإنشاء كورس مميز وشارك خبراتك مع العالم</p>
            </div>
          </div>
        </div>

        {/* قسم الفورم */}
        <div className="lg:w-1/2 p-8 min-h-[800px] overflow-y-auto">
          <div className="sticky top-0 bg-white pb-4 mb-6 border-b border-blue-300">
            <h2 className="text-3xl font-bold text-blue-900 text-center">
              إنشاء كورس جديد
            </h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto mt-3 rounded-full"></div>
          </div>

          {message && (
            <div className="mb-6 text-green-800 bg-green-100 border-l-4 border-green-400 rounded-lg px-4 py-3 text-center font-medium shadow-sm">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-6 text-red-800 bg-red-100 border-l-4 border-red-400 rounded-lg px-4 py-3 text-center font-medium shadow-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* العنوان والوصف */}
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-blue-900 mb-2">
                  عنوان الكورس <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="أدخل عنوان الكورس"
                  className="w-full rounded-xl border-2 border-blue-300 px-4 py-3 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-300"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-blue-900 mb-2">
                  وصف الكورس <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  placeholder="أدخل وصفًا تفصيليًا للكورس"
                  className="w-full rounded-xl border-2 border-blue-300 px-4 py-3 text-blue-900 placeholder-blue-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-300"
                />
              </div>
            </div>

            {/* الصورة المصغرة */}
           <div>
  <label htmlFor="thumbnail" className="block text-sm font-semibold text-blue-900 mb-2">
    الصورة المصغرة
  </label>
  <input
    id="thumbnail"
    type="file"
    accept="image/*"
    onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
    className="block w-full text-sm text-blue-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition cursor-pointer border-2 border-dashed border-blue-300 rounded-xl p-4"
  />

  {/* المعاينة */}
  {thumbnailPreview && (
    <div className="mt-3 relative w-32 h-32 border border-blue-300 rounded-lg overflow-hidden shadow-sm">
      <img
        src={`https://res.cloudinary.com/dtoy7z1ou/${thumbnailPreview}`}
        alt="معاينة الصورة"
        className="w-full h-full object-cover"
      />
    </div>
  )}
</div>


            {/* الإعدادات */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-semibold text-blue-900 mb-2">
                  حالة النشر
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CourseStatus)}
                  className="w-full rounded-xl border-2 border-blue-300 px-4 py-3 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-300"
                >
                  <option value="draft">مسودة</option>
                  <option value="published">منشور</option>
                </select>
              </div>

              <div>
                <label htmlFor="difficulty" className="block text-sm font-semibold text-blue-900 mb-2">
                  مستوى الصعوبة
                </label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as CourseDifficulty)}
                  className="w-full rounded-xl border-2 border-blue-300 px-4 py-3 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-300"
                >
                  <option value="beginner">مبتدئ</option>
                  <option value="intermediate">متوسط</option>
                  <option value="advanced">متقدم</option>
                </select>
              </div>
            </div>

            {/* السعر والمدة */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-semibold text-blue-900 mb-2">
                  السعر (بالدولار)
                </label>
                <input
                  id="price"
                  type="number"
                  min={0}
                  step={0.01}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="5.00"
                  className="w-full rounded-xl border-2 border-blue-300 px-4 py-3 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-300"
                />
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-semibold text-blue-900 mb-2">
                  المدة (ساعات)
                </label>
                <input
                  id="duration"
                  type="number"
                  min={0}
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  placeholder="0"
                  className="w-full rounded-xl border-2 border-blue-300 px-4 py-3 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-300"
                />
              </div>
            </div>

            {/* زر الإرسال */}
            <div className="pt-4">
              <button
                disabled={submitting}
                type="submit"
                className="w-full py-4 px-6 rounded-xl bg-blue-600 text-white font-bold text-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
              >
                {submitting ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                    جارٍ الحفظ...
                  </div>
                ) : (
                  'إنشاء الكورس'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherCreateCourse;
