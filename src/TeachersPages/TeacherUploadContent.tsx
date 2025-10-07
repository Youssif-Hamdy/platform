import React, { useState } from 'react';
import { Upload, FileText, Video, File, Check, AlertCircle, BookOpen, Clock, Eye, CheckCircle2 } from 'lucide-react';

type ContentType = 'text' | 'video' | 'pdf';

const API_BASE = '';

const TeacherUploadContent: React.FC = () => {
  const [courseTitle, setCourseTitle] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [contentType, setContentType] = useState<ContentType>('text');
  const [content, setContent] = useState<string>('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [order, setOrder] = useState<number>(0);
  const [durationMinutes, setDurationMinutes] = useState<number>(0);
  const [totalViews, setTotalViews] = useState<number>(0);
  const [hasQuiz, setHasQuiz] = useState<boolean>(false);
  const [quiz, setQuiz] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');
    
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('يجب تسجيل الدخول أولاً');
        return;
      }

      if (!courseTitle.trim()) {
        setError('من فضلك أدخل عنوان الكورس');
        return;
      }

      if (!title.trim()) {
        setError('العنوان مطلوب');
        return;
      }

      // ابحث عن الكورس بالعنوان لجلب الـ ID
      const listRes = await fetch(`${API_BASE}/teacher/courses/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (!listRes.ok) {
        const t = await listRes.text();
        throw new Error(t || 'تعذر جلب قائمة الدورات');
      }
      const listData = await listRes.json();
      const courses = Array.isArray(listData) ? listData : (listData?.results || []);
      const match = courses.find((c: any) => (c?.title || '').toLowerCase() === courseTitle.trim().toLowerCase());
      if (!match || !match.id) {
        setError('لم يتم العثور على كورس بهذا العنوان');
        return;
      }
      const courseId = String(match.id);

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('content_type', contentType);
      formData.append('content', content);
      if (contentType === 'video' && videoFile) {
        formData.append('video_file', videoFile);
      }
      if (contentType === 'pdf' && pdfFile) {
        formData.append('pdf_file', pdfFile);
      }
      formData.append('order', String(order));
      formData.append('duration_minutes', String(durationMinutes));
      formData.append('total_views', String(totalViews));
      formData.append('has_quiz', String(hasQuiz));
      if (hasQuiz && quiz.trim()) {
        formData.append('quiz', quiz);
      }

      const res = await fetch(`${API_BASE}/teacher/courses/${encodeURIComponent(courseId)}/sections/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const text = await res.text();
      if (!res.ok) {
        throw new Error(text || 'تعذر إنشاء القسم/المحتوى');
      }

      setMessage('تم رفع المحتوى بنجاح');
      setTitle('');
      setDescription('');
      setContent('');
      setVideoFile(null);
      setPdfFile(null);
      setOrder(0);
      setDurationMinutes(0);
      setTotalViews(0);
      setHasQuiz(false);
      setQuiz('');
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ غير متوقع');
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">رفع المحتوى التعليمي</h1>
          <p className="text-blue-600">أضف فيديوهاتك ومحتواك التعليمي بسهولة</p>
        </div>

        {/* Main Content - Horizontal Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side - Image/Illustration */}
          <div className="w-full lg:w-2/5 bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="h-full bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white flex flex-col justify-center items-center">
              <div className="mb-6 bg-white/10 p-6 rounded-full backdrop-blur-sm">
                <BookOpen className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-center">أنشئ محتوى تعليمي متميز</h2>
              <p className="text-blue-100 text-center mb-6">
                يمكنك رفع مختلف أنواع المحتوى التعليمي من فيديوهات، نصوص، وملفات PDF لتقديم تجربة تعليمية شاملة لطلابك.
              </p>
              <div className="bg-white/10 p-4 rounded-xl w-full max-w-xs">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-500 p-2 rounded-lg mr-3">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                  <span>مقاطع فيديو تعليمية</span>
                </div>
                <div className="flex items-center mb-3">
                  <div className="bg-blue-500 p-2 rounded-lg mr-3">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <span>دروس نصية مفصلة</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-500 p-2 rounded-lg mr-3">
                    <File className="w-5 h-5 text-white" />
                  </div>
                  <span>ملفات PDF وموارد قابلة للتنزيل</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full lg:w-3/5">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Success/Error Messages */}
              {message && (
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    {message}
                  </div>
                </div>
              )}
              {error && (
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                  </div>
                </div>
              )}

              <div className="p-6 space-y-6">
                {/* Course Title */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    عنوان الكورس
                  </label>
                  <div className="relative">
                    <input 
                      value={courseTitle} 
                      onChange={(e) => setCourseTitle(e.target.value)} 
                      placeholder="اكتب عنوان الكورس تمامًا" 
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 pr-12 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-blue-300" 
                    />
                    <BookOpen className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {/* Title and Order */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      العنوان
                    </label>
                    <input 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-blue-300" 
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      الترتيب
                    </label>
                    <input 
                      type="number" 
                      value={order} 
                      onChange={(e) => setOrder(Number(e.target.value))} 
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-blue-300" 
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الوصف
                  </label>
                  <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    rows={2} 
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-blue-300 resize-none" 
                  />
                </div>

                {/* Content Type Selection */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">نوع المحتوى</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { value: 'text', label: 'نص', icon: FileText, color: 'blue' },
                      { value: 'video', label: 'فيديو', icon: Video, color: 'blue' },
                      { value: 'pdf', label: 'PDF', icon: File, color: 'blue' }
                    ].map((type) => (
                      <div
                        key={type.value}
                        className={`relative cursor-pointer rounded-xl border-2 p-3 transition-all duration-300 ${
                          contentType === type.value
                            ? `border-blue-500 bg-blue-50 shadow-md`
                            : 'border-gray-200 bg-white hover:border-blue-300'
                        }`}
                        onClick={() => setContentType(type.value as ContentType)}
                      >
                        <input
                          type="radio"
                          value={type.value}
                          checked={contentType === type.value}
                          onChange={() => setContentType(type.value as ContentType)}
                          className="sr-only"
                        />
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${
                            contentType === type.value 
                              ? `bg-blue-500 text-white` 
                              : 'bg-gray-100 text-gray-600'
                          } transition-all duration-300`}>
                            <type.icon className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-gray-700 text-sm">{type.label}</span>
                        </div>
                        {contentType === type.value && (
                          <div className="absolute top-2 left-2">
                            <Check className="w-4 h-4 text-blue-600" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content Input Based on Type */}
                {contentType === 'text' && (
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      المحتوى النصي
                    </label>
                    <textarea 
                      value={content} 
                      onChange={(e) => setContent(e.target.value)} 
                      rows={5} 
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-blue-300 resize-none" 
                      placeholder="اكتب المحتوى النصي هنا..."
                    />
                  </div>
                )}

                {contentType === 'video' && (
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ملف الفيديو
                    </label>
                    <div className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 hover:border-blue-400 ${
                      videoFile ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'
                    }`}>
                      <input 
                        type="file" 
                        accept="video/*" 
                        onChange={(e) => setVideoFile(e.target.files?.[0] || null)} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      />
                      <div className="text-center">
                        <Video className={`w-10 h-10 mx-auto mb-3 ${videoFile ? 'text-blue-600' : 'text-gray-400'}`} />
                        <p className="text-gray-600 font-medium text-sm">
                          {videoFile ? `تم اختيار: ${videoFile.name}` : 'انقر أو اسحب ملف الفيديو هنا'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">MP4, AVI, MOV حتى 500MB</p>
                      </div>
                    </div>
                  </div>
                )}

                {contentType === 'pdf' && (
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ملف PDF
                    </label>
                    <div className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 hover:border-blue-400 ${
                      pdfFile ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'
                    }`}>
                      <input 
                        type="file" 
                        accept="application/pdf" 
                        onChange={(e) => setPdfFile(e.target.files?.[0] || null)} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      />
                      <div className="text-center">
                        <File className={`w-10 h-10 mx-auto mb-3 ${pdfFile ? 'text-blue-600' : 'text-gray-400'}`} />
                        <p className="text-gray-600 font-medium text-sm">
                          {pdfFile ? `تم اختيار: ${pdfFile.name}` : 'انقر أو اسحب ملف PDF هنا'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">PDF حتى 50MB</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      المدة (دقائق)
                    </label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={durationMinutes} 
                        onChange={(e) => setDurationMinutes(Number(e.target.value))} 
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 pr-12 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-blue-300" 
                      />
                      <Clock className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      إجمالي المشاهدات
                    </label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={totalViews} 
                        onChange={(e) => setTotalViews(Number(e.target.value))} 
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 pr-12 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-blue-300" 
                      />
                      <Eye className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Quiz Section */}
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <label className="flex items-center cursor-pointer group">
                      <input 
                        id="hasQuiz" 
                        type="checkbox" 
                        checked={hasQuiz} 
                        onChange={(e) => setHasQuiz(e.target.checked)} 
                        className="sr-only" 
                      />
                      <div className={`w-5 h-5 rounded border-2 transition-all duration-300 flex items-center justify-center ${
                        hasQuiz 
                          ? 'bg-blue-600 border-blue-600 shadow-lg' 
                          : 'border-gray-300 bg-white group-hover:border-blue-400'
                      }`}>
                        {hasQuiz && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="mr-2 font-semibold text-gray-700 text-sm">هل يحتوي على اختبار؟</span>
                    </label>
                  </div>
                  
                  {hasQuiz && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        بيانات الاختبار (اختياري)
                      </label>
                      <textarea 
                        value={quiz} 
                        onChange={(e) => setQuiz(e.target.value)} 
                        rows={3} 
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-blue-300 resize-none" 
                        placeholder="أدخل أسئلة الاختبار كـ JSON أو نص مبدئي..."
                      />
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button 
                    disabled={submitting} 
                    type="button"
                    onClick={handleSubmit}
                    className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-white font-semibold shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-center gap-2">
                      {submitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          جارٍ الرفع...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          حفظ القسم
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherUploadContent;