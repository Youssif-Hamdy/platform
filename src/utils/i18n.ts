import { useEffect, useMemo, useState } from 'react';
import i18next from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

type SupportedLang = 'ar' | 'en';

const STORAGE_KEY = 'uiLang';
const EVENT_KEY = 'uiLangChanged';

const DICT: Record<SupportedLang, Record<string, string>> = {
  ar: {
    appName: 'تعلم',
    dashboard: 'لوحة التحكم',
    loading: '...جار التحميل',
    profile: 'الملف الشخصي',
    settings: 'الإعدادات',
    logout: 'خروج',
    // DashboardHomePage
    quickStats: 'الإحصائيات السريعة',
    coursesInProgress: 'الدورات قيد التقدم',
    studyHours: 'ساعات الدراسة',
    quizzesCompleted: 'الاختبارات المكتملة',
    avgScore: 'متوسط الدرجات',
    coursesCompleted: 'الدورات المكتملة',
    streakDays: 'أيام متتالية',
    greetingSubtitle: 'نتمنى لك يوماً موفقاً. يمكنك إدارة مهامك من القائمة.'
  },
  en: {
    appName: 'Learn',
    dashboard: 'Dashboard',
    loading: 'Loading...',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',
    // DashboardHomePage
    quickStats: 'Quick Stats',
    coursesInProgress: 'Courses In Progress',
    studyHours: 'Study Hours',
    quizzesCompleted: 'Quizzes Completed',
    avgScore: 'Average Score',
    coursesCompleted: 'Courses Completed',
    streakDays: 'Streak Days',
    greetingSubtitle: 'Have a productive day. Manage tasks from the menu.'
  }
};

// Initialize i18next once
let i18nInitialized = false;
function ensureI18nInitialized(defaultLang: SupportedLang) {
  if (i18nInitialized) return;
  i18next
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        ar: { translation: DICT.ar },
        en: { translation: DICT.en },
      },
      fallbackLng: defaultLang,
      lng: localStorage.getItem(STORAGE_KEY) || defaultLang,
      interpolation: { escapeValue: false },
      detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] },
    });
  i18nInitialized = true;
}

export function useUiLang() {
  ensureI18nInitialized('ar');
  const [uiLang, setUiLang] = useState<SupportedLang>(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) || 'ar') as SupportedLang;
    return saved === 'en' ? 'en' : 'ar';
  });

  const isRTL = uiLang === 'ar';

  useEffect(() => {
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', uiLang);
    localStorage.setItem(STORAGE_KEY, uiLang);
    i18next.changeLanguage(uiLang);
    window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: { uiLang } }));
  }, [uiLang, isRTL]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const val = e.newValue as SupportedLang;
        setUiLang(val === 'en' ? 'en' : 'ar');
      }
    };
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.uiLang) {
        setUiLang(detail.uiLang);
      }
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener(EVENT_KEY, onCustom as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(EVENT_KEY, onCustom as EventListener);
    };
  }, []);

  const { t: tHook } = useTranslation();
  const t = useMemo(() => {
    return (key: string): string => tHook(key) || key;
  }, [tHook]);

  const toggle = () => setUiLang(prev => (prev === 'ar' ? 'en' : 'ar'));

  return { uiLang, isRTL, t, setUiLang, toggle };
}


