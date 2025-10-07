import React, { useState } from 'react';
import { Plus, X, Clock, Award, RotateCcw, CheckCircle, AlertCircle, BookOpen, FileText, ChevronDown, ChevronUp, Trash2} from 'lucide-react';

const API_BASE = ''; // تأكد من تعديل هذا حسب حاجتك

interface Choice {
  id: number;
  choice_text: string;
  is_correct: boolean;
  order: number;
}

interface Question {
  id: number;
  question_text: string;
  question_type: 'multiple_choice';
  points: number;
  order: number;
  explanation: string;
  choices: Choice[];
}

interface Props {
  courseTitle?: string;
  sectionTitle?: string;
}

const TeacherAddQuiz: React.FC<Props> = ({ courseTitle, sectionTitle }) => {
  const [courseTitleInput, setCourseTitleInput] = useState<string>(courseTitle || '');
  const [sectionTitleInput, setSectionTitleInput] = useState<string>(sectionTitle || '');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(30);
  const [passingScore, setPassingScore] = useState<number>(70);
  const [maxAttempts, setMaxAttempts] = useState<number>(3);
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(true);
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const [averageScore, setAverageScore] = useState<string>('0.00');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Question builder state
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [currentChoices, setCurrentChoices] = useState<string[]>(['', '']);
  const [correctChoice, setCorrectChoice] = useState<number>(0);
  const [currentPoints, setCurrentPoints] = useState<number>(1);
  const [currentExplanation, setCurrentExplanation] = useState<string>('');

  const addQuestion = () => {
    if (!currentQuestion.trim() || currentChoices.filter(c => c.trim()).length < 2) {
      setError('يرجى إدخال سؤال واختيارين على الأقل');
      return;
    }

    const newQuestion: Question = {
      id: Date.now(), // Temporary ID
      question_text: currentQuestion.trim(),
      question_type: 'multiple_choice',
      points: currentPoints,
      order: questions.length + 1,
      explanation: currentExplanation.trim(),
      choices: currentChoices
        .filter(c => c.trim())
        .map((choice, index) => ({
          id: Date.now() + index, // Temporary ID
          choice_text: choice.trim(),
          is_correct: index === correctChoice,
          order: index + 1
        }))
    };

    setQuestions([...questions, newQuestion]);
    
    // Reset form and close modal
    setCurrentQuestion('');
    setCurrentChoices(['', '']);
    setCorrectChoice(0);
    setCurrentPoints(1);
    setCurrentExplanation('');
    setError('');
    setIsModalOpen(false);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
    if (expandedQuestion === index) {
      setExpandedQuestion(null);
    } else if (expandedQuestion && expandedQuestion > index) {
      setExpandedQuestion(expandedQuestion - 1);
    }
  };

  const addChoice = () => {
    setCurrentChoices([...currentChoices, '']);
  };

  const removeChoice = (index: number) => {
    if (currentChoices.length > 2) {
      const newChoices = currentChoices.filter((_, i) => i !== index);
      setCurrentChoices(newChoices);
      if (correctChoice >= newChoices.length) {
        setCorrectChoice(Math.max(0, newChoices.length - 1));
      }
    }
  };

  const updateChoice = (index: number, value: string) => {
    const newChoices = [...currentChoices];
    newChoices[index] = value;
    setCurrentChoices(newChoices);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('يجب تسجيل الدخول أولاً');
        return;
      }
      if (!courseTitleInput.trim() || !sectionTitleInput.trim()) {
        setError('من فضلك أدخل عنوان الكورس وعنوان القسم');
        return;
      }
      if (!title.trim()) {
        setError('العنوان مطلوب');
        return;
      }
      if (questions.length === 0) {
        setError('يجب إضافة سؤال واحد على الأقل');
        return;
      }

      // Resolve course by title
      const coursesRes = await fetch(`${API_BASE}/teacher/courses/`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (!coursesRes.ok) {
        const t = await coursesRes.text();
        throw new Error(t || 'تعذر جلب قائمة الدورات');
      }
      const coursesData = await coursesRes.json();
      const courses = Array.isArray(coursesData) ? coursesData : (coursesData?.results || []);
      const course = courses.find((c: any) => (c?.title || '').toLowerCase() === courseTitleInput.trim().toLowerCase());
      if (!course || !course.id) {
        setError('لم يتم العثور على كورس بهذا العنوان');
        return;
      }

      // Resolve section by title within course
      const sectionsRes = await fetch(`${API_BASE}/teacher/courses/${encodeURIComponent(String(course.id))}/sections/`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (!sectionsRes.ok) {
        const t = await sectionsRes.text();
        throw new Error(t || 'تعذر جلب أقسام الكورس');
      }
      const sectionsData = await sectionsRes.json();
      const sections = Array.isArray(sectionsData) ? sectionsData : (sectionsData?.results || []);
      const section = sections.find((s: any) => (s?.title || '').toLowerCase() === sectionTitleInput.trim().toLowerCase());
      if (!section || !section.id) {
        setError('لم يتم العثور على قسم بهذا العنوان');
        return;
      }

      // 1. إنشاء اختبار أساسي (بدون أسئلة) للحصول على quiz_id
      const quizPayload = {
        title: title,
        description: description,
        time_limit_minutes: timeLimitMinutes,
        passing_score: passingScore,
        max_attempts: maxAttempts,
        shuffle_questions: shuffleQuestions,
        total_attempts: totalAttempts,
        average_score: averageScore,
        // لاحظ: لا ترسل الأسئلة هنا الآن
      };

      const quizRes = await fetch(`${API_BASE}/teacher/sections/${encodeURIComponent(String(section.id))}/quiz/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(quizPayload),
      });

      const quizText = await quizRes.text();
      if (!quizRes.ok) {
        throw new Error(quizText || 'تعذر إنشاء الاختبار');
      }

      let quizData;
      try {
        quizData = JSON.parse(quizText);
      } catch (parseError) {
        throw new Error('Failed to parse quiz creation response');
      }

      const quizId = quizData.id; // افترض أن الرد يحتوي على معرف الاختبار

      if (!quizId) {
        throw new Error('لم يتم العثور على معرف الاختبار في الرد');
      }

      // 2. إضافة الأسئلة واحدة تلو الأخرى باستخدام API الأسئلة
      for (const question of questions) {
        const questionPayload = {
          question_text: question.question_text,
          question_type: question.question_type,
          points: question.points,
          order: question.order,
          explanation: question.explanation,
          choices: question.choices.map(choice => ({
            choice_text: choice.choice_text,
            is_correct: choice.is_correct,
            order: choice.order
          }))
        };

        const questionRes = await fetch(`${API_BASE}/teacher/quizzes/${encodeURIComponent(String(quizId))}/questions/`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(questionPayload),
        });

        if (!questionRes.ok) {
          const errorText = await questionRes.text();
          throw new Error(`فشل في إضافة السؤال: ${errorText}`);
        }
      }

      setMessage('تم إنشاء الاختبار والأسئلة بنجاح');
      // إعادة تعيين النموذج
      setTitle('');
      setDescription('');
      setTimeLimitMinutes(30);
      setPassingScore(70);
      setMaxAttempts(3);
      setShuffleQuestions(true);
      setTotalAttempts(0);
      setAverageScore('0.00');
      setQuestions([]);
      setExpandedQuestion(null);
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ غير متوقع');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleQuestionExpansion = (index: number) => {
    if (expandedQuestion === index) {
      setExpandedQuestion(null);
    } else {
      setExpandedQuestion(index);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setError('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentQuestion('');
    setCurrentChoices(['', '']);
    setCorrectChoice(0);
    setCurrentPoints(1);
    setCurrentExplanation('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">إنشاء اختبار جديد</h1>
          <p className="text-blue-600">صمم اختبارًا تفاعليًا لقياس فهم الطلاب</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side - Illustration */}
          <div className="w-full lg:w-2/5 bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="h-full bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white flex flex-col justify-center items-center">
              <div className="mb-6 bg-white/10 p-6 rounded-full backdrop-blur-sm">
                <FileText className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-center">أنشئ اختبارات تفاعلية</h2>
              <p className="text-blue-100 text-center mb-6">
                صمم اختبارات تقيس فهم الطلاب بشكل فعال مع تحليل نتائج مفصل وإحصائيات أداء.
              </p>
              <div className="bg-white/10 p-4 rounded-xl w-full max-w-xs">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-500 p-2 rounded-lg mr-3">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <span>تحديد وقت للإختبار</span>
                </div>
                <div className="flex items-center mb-3">
                  <div className="bg-blue-500 p-2 rounded-lg mr-3">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <span>تحديد درجة النجاح</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-500 p-2 rounded-lg mr-3">
                    <RotateCcw className="w-5 h-5 text-white" />
                  </div>
                  <span>تحديد عدد المحاولات</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full lg:w-3/5">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Success/Error Messages */}
              {message && (
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    {message}
                  </div>
                </div>
              )}
              {error && (
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                  </div>
                </div>
              )}

              <div className="p-6 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Course and Section Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">عنوان الكورس</label>
                      <div className="relative">
                        <input 
                          value={courseTitleInput} 
                          onChange={(e) => setCourseTitleInput(e.target.value)} 
                          className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 pr-12 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-blue-300" 
                          placeholder="عنوان الكورس" 
                        />
                        <BookOpen className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">عنوان القسم</label>
                      <div className="relative">
                        <input 
                          value={sectionTitleInput} 
                          onChange={(e) => setSectionTitleInput(e.target.value)} 
                          className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 pr-12 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-blue-300" 
                          placeholder="عنوان القسم" 
                        />
                        <FileText className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Quiz Basic Info */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">عنوان الاختبار</label>
                      <input 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-blue-300" 
                      />
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">الوصف</label>
                      <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        rows={3} 
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-blue-300 resize-none" 
                      />
                    </div>
                  </div>

                  {/* Quiz Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">الحد الزمني (دقائق)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={timeLimitMinutes} 
                          onChange={(e) => setTimeLimitMinutes(Number(e.target.value))} 
                          className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 pr-12 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-blue-300" 
                        />
                        <Clock className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">درجة النجاح</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={passingScore} 
                          onChange={(e) => setPassingScore(Number(e.target.value))} 
                          className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 pr-12 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-blue-300" 
                        />
                        <Award className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">أقصى محاولات</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={maxAttempts} 
                          onChange={(e) => setMaxAttempts(Number(e.target.value))} 
                          className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 pr-12 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-blue-300" 
                        />
                        <RotateCcw className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                    <input 
                      id="shuffle" 
                      type="checkbox" 
                      checked={shuffleQuestions} 
                      onChange={(e) => setShuffleQuestions(e.target.checked)} 
                      className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <label htmlFor="shuffle" className="text-sm font-semibold text-gray-700">ترتيب عشوائي للأسئلة</label>
                  </div>

                  {/* Add Question Button */}
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={openModal}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Plus className="w-5 h-5" />
                      إضافة سؤال جديد
                    </button>
                  </div>

                  {/* Questions List */}
                  {questions.length > 0 && (
                    <div className="border border-gray-200 rounded-xl p-5">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">الأسئلة المضافة ({questions.length})</h3>
                      <div className="space-y-3">
                        {questions.map((question, index) => (
                          <div key={question.id} className="bg-white p-4 rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-md">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-semibold">
                                  {index + 1}
                                </span>
                                <span className="font-medium text-gray-900 line-clamp-1">{question.question_text}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => toggleQuestionExpansion(index)}
                                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors duration-300"
                                  title={expandedQuestion === index ? "إخفاء التفاصيل" : "عرض التفاصيل"}
                                >
                                  {expandedQuestion === index ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeQuestion(index)}
                                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-300"
                                  title="حذف السؤال"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            
                            {expandedQuestion === index && (
                              <div className="mt-4 pl-11 space-y-3 animate-fadeIn">
                                <div className="text-sm text-gray-600">
                                  <span className="font-medium">النقاط: </span>
                                  {question.points}
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium text-gray-600">الخيارات: </span>
                                  <div className="mt-2 space-y-2">
                                    {question.choices.map((c, i) => (
                                      <div 
                                        key={i} 
                                        className={`p-3 rounded-lg border ${c.is_correct ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 border-gray-200'}`}
                                      >
                                        <div className="flex items-center gap-2">
                                          {c.is_correct && <CheckCircle className="w-4 h-4 text-green-600" />}
                                          <span>{c.choice_text}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                {question.explanation && (
                                  <div className="text-sm text-gray-600">
                                    <span className="font-medium">الشرح: </span>
                                    {question.explanation}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4">
                    <button 
                      disabled={submitting || questions.length === 0} 
                      type="submit" 
                      className="w-full px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          جارٍ الحفظ...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          حفظ الاختبار
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Adding Questions */}
      {isModalOpen && (
        <div className="fixed inset-0  bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-lg font-semibold text-blue-800">إضافة سؤال جديد</h3>
              <button 
                onClick={closeModal}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}
              
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">نص السؤال</label>
                <textarea 
                  value={currentQuestion} 
                  onChange={(e) => setCurrentQuestion(e.target.value)} 
                  rows={3} 
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-blue-300 resize-none" 
                  placeholder="اكتب السؤال هنا..." 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">النقاط</label>
                  <input 
                    type="number" 
                    value={currentPoints} 
                    onChange={(e) => setCurrentPoints(Number(e.target.value))} 
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-blue-300" 
                    min="1" 
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">الإجابة الصحيحة</label>
                  <select 
                    value={correctChoice} 
                    onChange={(e) => setCorrectChoice(Number(e.target.value))} 
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-blue-300"
                  >
                    {currentChoices.map((// @ts-ignore

                      choice, index) => (
                      <option key={index} value={index}>الخيار {index + 1}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الخيارات</label>
                <div className="space-y-2">
                  {currentChoices.map((choice, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={choice}
                        onChange={(e) => updateChoice(index, e.target.value)}
                        className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-2 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-blue-300"
                        placeholder={`الخيار ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeChoice(index)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-300"
                        disabled={currentChoices.length <= 2}
                        title="حذف الخيار"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addChoice}
                    className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-100 rounded-xl border border-blue-300 transition-all duration-300 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة خيار
                  </button>
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">شرح الإجابة (اختياري)</label>
                <textarea 
                  value={currentExplanation} 
                  onChange={(e) => setCurrentExplanation(e.target.value)} 
                  rows={2} 
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-blue-300 resize-none" 
                  placeholder="شرح مختصر للإجابة الصحيحة..." 
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300 font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={addQuestion}
                  disabled={!currentQuestion.trim() || currentChoices.filter(c => c.trim()).length < 2}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
                >
                  إضافة السؤال
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add custom animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default TeacherAddQuiz;