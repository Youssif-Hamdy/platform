import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3,
  CheckCircle,
  Settings,
  Clock,
  AlertTriangle,
  AlertCircle,
  Info,
  Tag,
  User,
  Calendar,
  Ticket,
  FileText,
  Inbox,
  MessageSquare,
  MessageCircle,
  Save,
  RotateCcw
} from 'lucide-react';
import { toast } from 'react-toastify';

const SupportCenter: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [ticketStats, setTicketStats] = useState<any | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  const [editStatus, setEditStatus] = useState<string>('open');
  const [editNotes, setEditNotes] = useState<string>('');
  const [savingTicket, setSavingTicket] = useState(false);

  const [messagesStats, setMessagesStats] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [ticketMessages, setTicketMessages] = useState<any[]>([]);

  const getToken = () => localStorage.getItem('accessToken') || localStorage.getItem('token');

  const fetchTicketStats = async () => {
    const token = getToken();
    if (!token) return;
    const res = await fetch('/support/get/ticket/stats/', {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('ticket-stats');
    const data = await res.json();
    setTicketStats(data);
  };

  const fetchTickets = async () => {
    const token = getToken();
    if (!token) return;
    const res = await fetch('/support/get/tickets/', {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('tickets');
    const data = await res.json();
    setTickets(data);
  };

  const fetchTicketDetails = async (ticketId: string) => {
    const token = getToken();
    if (!token) return;
    const res = await fetch(`/support/get/tickets/${ticketId}/`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('ticket-detail');
    const data = await res.json();
    setSelectedTicket(data);
    setEditStatus(data?.status || 'open');
    setEditNotes(data?.admin_notes || '');
  };

  const updateTicket = async () => {
    if (!selectedTicketId) return;
    try {
      setSavingTicket(true);
      const token = getToken();
      if (!token) return;
      const res = await fetch(`/support/get/tickets/${selectedTicketId}/`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editStatus, admin_notes: editNotes }),
      });
      if (!res.ok) throw new Error('update-ticket');
      let updated: any | null = null;
      try { updated = await res.json(); } catch {}
      const merged = updated || { ...(selectedTicket || {}), status: editStatus, admin_notes: editNotes };
      setSelectedTicket(merged);
      setTickets(prev => prev.map(t => t.ticket_id === selectedTicketId ? { ...t, status: merged.status, admin_notes: merged.admin_notes } : t));
      toast.success('تم حفظ التغييرات بنجاح');
    } catch (e) {
      toast.error('تعذر حفظ التغييرات');
    } finally {
      setSavingTicket(false);
    }
  };

  const fetchMessagesStats = async () => {
    const token = getToken();
    if (!token) return;
    const res = await fetch('/support/messages-stats/', {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('messages-stats');
    const data = await res.json();
    setMessagesStats(data);
  };

  const fetchMessages = async () => {
    const token = getToken();
    if (!token) return;
    const res = await fetch('/support/messages/', {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('messages');
    const data = await res.json();
    setMessages(data);
  };

  const fetchTicketMessages = async (ticketId: string) => {
    const token = getToken();
    if (!token) return;
    const res = await fetch(`/support/messages/${ticketId}/`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('ticket-messages');
    const data = await res.json();
    setTicketMessages(data);
  };


  useEffect(() => {
    const token = getToken();
    if (!token) {
      toast.error('يرجى تسجيل الدخول أولاً');
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all([
      fetchTicketStats(),
      fetchTickets(),
      fetchMessagesStats(),
      fetchMessages(),
    ])
      .catch(() => setError('حدث خطأ أثناء تحميل البيانات'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedTicketId) {
      fetchTicketDetails(selectedTicketId).catch(() => {});
      fetchTicketMessages(selectedTicketId).catch(() => {});
    } else {
      setSelectedTicket(null);
      setTicketMessages([]);
    }
  }, [selectedTicketId]);

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-600 text-white">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">مركز الدعم</h1>
            <p className="text-gray-500">إدارة التذاكر والرسائل</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      ) : error ? (
        <div className="p-6 text-center text-red-600">{error}</div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div whileHover={{ scale: 1.02 }} className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-700">إجمالي التذاكر</span>
                <BarChart3 className="w-4 h-4 text-blue-700" />
              </div>
              <div className="text-3xl font-bold text-blue-900">{ticketStats?.total_tickets ?? 0}</div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-amber-700">مفتوحة</span>
                <Clock className="w-4 h-4 text-amber-700" />
              </div>
              <div className="text-3xl font-bold text-amber-900">{ticketStats?.open_tickets ?? 0}</div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-orange-700">قيد المعالجة</span>
                <Settings className="w-4 h-4 text-orange-700" />
              </div>
              <div className="text-3xl font-bold text-orange-900">{ticketStats?.in_progress_tickets ?? 0}</div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-green-700">تم الحل</span>
                <CheckCircle className="w-4 h-4 text-green-700" />
              </div>
              <div className="text-3xl font-bold text-green-900">{ticketStats?.resolved_tickets ?? 0}</div>
            </motion.div>
          </div>

          {/* Messages Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div whileHover={{ scale: 1.02 }} className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-indigo-700">إجمالي الرسائل</span>
                <MessageSquare className="w-4 h-4 text-indigo-700" />
              </div>
              <div className="text-3xl font-bold text-indigo-900">{messagesStats?.total_messages ?? 0}</div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="bg-sky-50 border border-sky-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-sky-700">رسائل اليوم</span>
                <MessageSquare className="w-4 h-4 text-sky-700" />
              </div>
              <div className="text-3xl font-bold text-sky-900">{messagesStats?.today_messages ?? 0}</div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="bg-teal-50 border border-teal-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-teal-700">رسائل الأسبوع</span>
                <MessageSquare className="w-4 h-4 text-teal-700" />
              </div>
              <div className="text-3xl font-bold text-teal-900">{messagesStats?.week_messages ?? 0}</div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tickets column (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-gray-900">قائمة التذاكر</span>
                </div>
                <div className="max-h-[65vh] overflow-auto">
                  {tickets.length === 0 ? (
                    <div className="p-8 text-center">
                      <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">لا توجد تذاكر حالياً</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {tickets.map((t) => (
                        <button
                          key={t.ticket_id}
                          onClick={() => setSelectedTicketId(t.ticket_id)}
                          className={`w-full text-right p-4 transition-all duration-200 ${selectedTicketId === t.ticket_id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold truncate text-gray-800 text-lg">{t.subject}</div>
                            <div className="flex items-center gap-2">
                              {t.status === 'open' && <Clock className="w-4 h-4 text-amber-500" />}
                              {t.status === 'in_progress' && <Settings className="w-4 h-4 text-orange-500" />}
                              {t.status === 'resolved' && <CheckCircle className="w-4 h-4 text-green-500" />}
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                t.status === 'open' ? 'bg-amber-100 border border-amber-200 text-amber-800' :
                                t.status === 'in_progress' ? 'bg-orange-100 border border-orange-200 text-orange-800' :
                                'bg-green-100 border border-green-200 text-green-800'
                              }`}>
                                {t.status === 'open' ? 'مفتوحة' : t.status === 'in_progress' ? 'جاري المعالجة' : 'تم الحل'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                            <User className="w-4 h-4" />
                            <span>{t.name}</span>
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{new Date(t.created_at).toLocaleString('ar-EG')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              t.priority === 'high' ? 'bg-red-100 text-red-800 border border-red-200' :
                              t.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                              'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}>
                              {t.priority === 'high' && <AlertTriangle className="w-3 h-3 ml-1" />}
                              {t.priority === 'medium' && <AlertCircle className="w-3 h-3 ml-1" />}
                              {t.priority === 'low' && <Info className="w-3 h-3 ml-1" />}
                              {t.priority === 'high' ? 'عالية' : t.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                              <Tag className="w-3 h-3 ml-1" />
                              {t.category}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-gray-900">تفاصيل التذكرة</span>
                </div>
                <div className="p-6 space-y-4">
                  {!selectedTicketId ? (
                    <div className="text-center py-8 text-gray-500">اختر تذكرة لعرض التفاصيل</div>
                  ) : !selectedTicket ? (
                    <div className="text-center py-8 text-gray-600">جاري تحميل التفاصيل...</div>
                  ) : (
                    <div className="space-y-4">
                      <div className="pb-4 border-b border-gray-200">
                        <h4 className="font-bold text-xl text-gray-900 mb-2">{selectedTicket.subject}</h4>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                          <p className="text-gray-700 leading-relaxed">{selectedTicket.description}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600 font-medium">الحالة:</span>
                          <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            selectedTicket.status === 'open' ? 'bg-amber-100 border border-amber-200 text-amber-800' :
                            selectedTicket.status === 'in_progress' ? 'bg-orange-100 border border-orange-200 text-orange-800' :
                            'bg-green-100 border border-green-200 text-green-800'
                          }`}>
                            {selectedTicket.status === 'open' && <Clock className="w-3 h-3" />}
                            {selectedTicket.status === 'in_progress' && <Settings className="w-3 h-3" />}
                            {selectedTicket.status === 'resolved' && <CheckCircle className="w-3 h-3" />}
                            {selectedTicket.status === 'open' ? 'مفتوحة' : selectedTicket.status === 'in_progress' ? 'جاري المعالجة' : 'تم الحل'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600 font-medium">الأولوية:</span>
                          <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            selectedTicket.priority === 'high' ? 'bg-red-100 text-red-800 border border-red-200' :
                            selectedTicket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                            'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            {selectedTicket.priority === 'high' && <AlertTriangle className="w-3 h-3" />}
                            {selectedTicket.priority === 'medium' && <AlertCircle className="w-3 h-3" />}
                            {selectedTicket.priority === 'low' && <Info className="w-3 h-3" />}
                            {selectedTicket.priority === 'high' ? 'عالية' : selectedTicket.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <Tag className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-600 font-medium">الفئة:</span>
                          <span className="text-gray-800">{selectedTicket.category}</span>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <User className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-600 font-medium">الاسم:</span>
                          <span className="text-gray-800">{selectedTicket.name}</span>
                        </div>

                        <div className="col-span-2 flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <Calendar className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-600 font-medium">تاريخ الإنشاء:</span>
                          <span className="text-gray-800">{new Date(selectedTicket.created_at).toLocaleString('ar-EG')}</span>
                        </div>
                      </div>

                      {/* Edit */}
                      <div className="pt-4 mt-4 border-t border-gray-200 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">تغيير الحالة</label>
                            <select
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value)}
                            >
                              <option value="open">مفتوحة</option>
                              <option value="in_progress">قيد المعالجة</option>
                              <option value="resolved">تم الحل</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات الإدارة</label>
                            <textarea
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                              rows={3}
                              placeholder="أضف ملاحظة..."
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-end gap-3">
                          <button
                            onClick={() => {
                              if (!selectedTicket) return;
                              setEditStatus(selectedTicket.status || 'open');
                              setEditNotes(selectedTicket.admin_notes || '');
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                            disabled={savingTicket}
                          >
                            <RotateCcw className="w-4 h-4" />
                            إلغاء التغييرات
                          </button>
                          <button
                            onClick={updateTicket}
                            className="flex items-center gap-2 px-6 py-2 text-sm rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                            disabled={savingTicket}
                          >
                            {savingTicket ? 'جاري الحفظ...' : (<><Save className="w-4 h-4" /> حفظ</>)}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Messages column (1/3) */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-gray-900">أحدث الرسائل</span>
                </div>
                <div className="max-h-[80vh] overflow-auto divide-y divide-gray-100">
                  {messages.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">لا توجد رسائل</div>
                  ) : (
                    messages.map((m, idx) => (
                      <div key={idx} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-gray-800">{m.name || m.email}</div>
                          <div className="text-xs text-gray-500">{new Date(m.created_at).toLocaleString('ar-EG')}</div>
                        </div>
                        <div className="text-sm text-gray-600 mb-1">{m.message}</div>
                       
                      </div>
                    ))
                  )}
                </div>
              </div>

             
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SupportCenter;


