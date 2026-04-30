import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Calendar, Clock, Link as LinkIcon, User, Plus, Loader2,
  CheckCircle, XCircle, ChevronRight, Trophy, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';

// ── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ toasts }) => (
  <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
    <AnimatePresence>
      {toasts.map(t => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white
            ${t.type === 'success' ? 'bg-emerald-600' : t.type === 'error' ? 'bg-rose-600' : 'bg-sky-600'}`}
        >
          {t.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
          {t.message}
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

/**
 * Fetches all applicants across ALL company jobs then filters to those
 * who are SHORTLISTED or INTERVIEW_SCHEDULED (eligible for a new round).
 * Returns flat list: [{ id, studentName, rollNumber, jobTitle }, ...]
 */
const useEligibleApplicants = () => {
  const [applicants, setApplicants] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const jobsRes = await axiosInstance.get('/api/jobs/my');
        const all = await Promise.all(
          jobsRes.data.map(j =>
            axiosInstance.get(`/api/jobs/${j.id}/applicants`).then(r =>
              r.data
                .filter(a => a.status === 'SHORTLISTED' || a.status === 'INTERVIEW_SCHEDULED')
                .map(a => ({ id: a.id, label: `${a.studentName} (${a.rollNumber}) — ${a.jobTitle}` }))
            )
          )
        );
        setApplicants(all.flat());
      } catch { /* silent */ }
    })();
  }, []);
  return applicants;
};

// ── Main Component ────────────────────────────────────────────────────────────
const Interviews = () => {
  const location = useLocation();

  const eligibleApplicants = useEligibleApplicants();

  // State
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Schedule-interview modal (new interview)
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newInterview, setNewInterview] = useState({
    applicationId: location.state?.appId || '',
    scheduledAt: '',
    mode: 'ONLINE',
    venueOrLink: '',
    round: 1
  });

  // Round-result modal (pass / fail / select)
  const [resultModal, setResultModal] = useState(null);
  // resultModal shape: { interviewId, round, studentName, jobTitle, step: 'choose'|'next-round' }
  const [nextRoundForm, setNextRoundForm] = useState({ scheduledAt: '', mode: 'ONLINE', venueOrLink: '' });
  const [submitting, setSubmitting] = useState(false);

  // ── helpers ────────────────────────────────────────────────────────────────
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const fetchInterviews = async () => {
    try {
      const res = await axiosInstance.get('/api/company/interviews');
      setInterviews(res.data);
    } catch {
      addToast('Failed to load interviews', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInterviews(); }, []);
  useEffect(() => {
    if (location.state?.appId) setShowScheduleModal(true);
  }, [location.state]);

  // ── Schedule new interview ─────────────────────────────────────────────────
  const handleSchedule = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axiosInstance.post('/api/interviews', {
        applicationId: newInterview.applicationId,
        scheduledAt: newInterview.scheduledAt,
        mode: newInterview.mode,
        venueOrLink: newInterview.venueOrLink,
        round: newInterview.round
      });
      addToast('Interview scheduled! Student notified.', 'success');
      setShowScheduleModal(false);
      fetchInterviews();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to schedule interview', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // rejection reason state
  const [rejectionReason, setRejectionReason] = useState('');

  // ── Round result: open modal ───────────────────────────────────────────────
  const openResultModal = (interview) => {
    setNextRoundForm({ scheduledAt: '', mode: 'ONLINE', venueOrLink: '' });
    setRejectionReason('');
    setResultModal({
      interviewId: interview.id,
      round: interview.round,
      studentName: interview.studentName,
      jobTitle: interview.jobTitle,
      step: 'choose'
    });
  };

  // ── Round result: submit ───────────────────────────────────────────────────
  const submitRoundResult = async (action) => {
    setSubmitting(true);
    try {
      const payload = { action };
      if (action === 'NEXT_ROUND') {
        payload.scheduledAt = nextRoundForm.scheduledAt;
        payload.mode = nextRoundForm.mode;
        payload.venueOrLink = nextRoundForm.venueOrLink;
      }
      if (action === 'FAIL') {
        payload.rejectionReason = rejectionReason.trim();
      }
      await axiosInstance.put(`/api/interviews/${resultModal.interviewId}/round-result`, payload);

      const messages = {
        FAIL: `${resultModal.studentName} rejected. Student notified with reason. Admins alerted.`,
        NEXT_ROUND: `Round ${resultModal.round + 1} scheduled! Student notified of Round ${resultModal.round} result.`,
        SELECT: `🎉 ${resultModal.studentName} SELECTED! Student & admins notified.`
      };
      addToast(messages[action], 'success');
      setResultModal(null);
      fetchInterviews();
    } catch (err) {
      addToast(err.response?.data?.message || 'Action failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  // Upcoming: Only those in the future AND still PENDING
  const upcoming = interviews.filter(i => new Date(i.scheduledAt) > new Date() && i.result === 'PENDING');
  // Past / Needs Result: Anything that is NOT PENDING, OR the date has passed
  const past     = interviews.filter(i => new Date(i.scheduledAt) <= new Date() || i.result !== 'PENDING');

  const resultBadge = (result) => {
    if (result === 'PASSED') return 'text-emerald-600 bg-emerald-50 border border-emerald-200';
    if (result === 'FAILED') return 'text-rose-600 bg-rose-50 border border-rose-200';
    return 'text-amber-600 bg-amber-50 border border-amber-200';
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Toast toasts={toasts} />

      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Interview Management</h1>
          <p className="text-slate-500 mt-1">Schedule rounds, record results & notify candidates</p>
        </div>
        <button
          onClick={() => { setNewInterview({ applicationId: '', scheduledAt: '', mode: 'ONLINE', venueOrLink: '', round: 1 }); setShowScheduleModal(true); }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> Schedule Interview
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── Upcoming ── */}
        <div>
          <h2 className="text-xl font-bold mb-4">Upcoming Interviews</h2>
          {loading ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary-600" /></div>
          ) : upcoming.length > 0 ? (
            <div className="space-y-4">
              {upcoming.map(iv => (
                <motion.div
                  key={iv.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="card p-5 border-l-4 border-primary-500"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="font-bold">{iv.studentName}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-slate-500">{iv.rollNumber} · {iv.jobTitle}</p>
                          {iv.round > 1 && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                              <CheckCircle size={10} /> Cleared Round {iv.round - 1}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-200">
                      ROUND {iv.round}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400" />
                      {new Date(iv.scheduledAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-400" />
                      {new Date(iv.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center text-sm text-primary-600 font-medium gap-1">
                      <LinkIcon size={14} />
                      {iv.mode === 'ONLINE'
                        ? <a href={iv.venueOrLink} target="_blank" rel="noopener noreferrer" className="hover:underline">Join Meeting</a>
                        : <span>{iv.venueOrLink}</span>}
                    </div>
                    
                    <button
                      onClick={() => openResultModal(iv)}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-sm"
                    >
                      <CheckCircle size={14} /> Record Result
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="card p-10 text-center text-slate-500">No upcoming interviews.</div>
          )}
        </div>

        {/* ── Past / Results ── */}
        <div>
          <h2 className="text-xl font-bold mb-4">Past Interviews & Results</h2>
          <div className="card divide-y divide-slate-100 dark:divide-slate-800">
            {past.length > 0 ? past.map(iv => (
              <div key={iv.id} className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    <User size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{iv.studentName}</p>
                    <p className="text-xs text-slate-500">{iv.jobTitle} · Round {iv.round}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {iv.result === 'PENDING' ? (
                    <button
                      onClick={() => openResultModal(iv)}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors border border-primary-200"
                    >
                      Record Result <ChevronRight size={14} />
                    </button>
                  ) : (
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${resultBadge(iv.result)}`}>
                      {iv.result}
                    </span>
                  )}
                </div>
              </div>
            )) : (
              <div className="p-10 text-center text-slate-500 text-sm">No past interviews found.</div>
            )}
          </div>
        </div>
      </div>

      {/* ────────────────── Schedule Modal ────────────────── */}
      <AnimatePresence>
        {showScheduleModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
              className="card max-w-md w-full p-8"
            >
              <h2 className="text-2xl font-bold mb-6">Schedule Interview</h2>
              <form onSubmit={handleSchedule} className="space-y-4">
                {/* If appId was pre-filled from navigation state, show read-only info;
                    otherwise show a searchable dropdown of eligible applicants */}
                <div>
                  <label className="block text-sm font-bold mb-1">Applicant</label>
                  {location.state?.appId ? (
                    <div className="input bg-slate-50 text-slate-500 cursor-not-allowed">
                      Application #{newInterview.applicationId} (pre-selected)
                    </div>
                  ) : (
                    <select
                      className="input"
                      required
                      value={newInterview.applicationId}
                      onChange={e => setNewInterview({ ...newInterview, applicationId: e.target.value })}
                    >
                      <option value="">— Select a shortlisted applicant —</option>
                      {eligibleApplicants.map(a => (
                        <option key={a.id} value={a.id}>{a.label}</option>
                      ))}
                    </select>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    Only SHORTLISTED or already-scheduled applicants appear here.
                    To shortlist a student, go to <strong>Manage Jobs → View Applicants</strong>.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Round Number</label>
                  <input type="number" min="1" className="input" required value={newInterview.round}
                    onChange={e => setNewInterview({ ...newInterview, round: parseInt(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Date &amp; Time</label>
                  <input type="datetime-local" className="input" required value={newInterview.scheduledAt}
                    onChange={e => setNewInterview({ ...newInterview, scheduledAt: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Mode</label>
                  <select className="input" value={newInterview.mode}
                    onChange={e => setNewInterview({ ...newInterview, mode: e.target.value })}>
                    <option value="ONLINE">Online</option>
                    <option value="OFFLINE">Offline</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">
                    {newInterview.mode === 'ONLINE' ? 'Meeting Link' : 'Venue'}
                  </label>
                  <input type="text" className="input" required value={newInterview.venueOrLink}
                    placeholder={newInterview.mode === 'ONLINE' ? 'https://zoom.us/j/...' : 'Conference Room A'}
                    onChange={e => setNewInterview({ ...newInterview, venueOrLink: e.target.value })} />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowScheduleModal(false)} className="btn btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
                    {submitting && <Loader2 size={16} className="animate-spin" />} Confirm
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ────────────────── Round Result Modal ────────────────── */}
      <AnimatePresence>
        {resultModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
              className="card max-w-lg w-full p-8"
            >
              {/* Header */}
              <div className="mb-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Round {resultModal.round} Result</p>
                <h2 className="text-2xl font-bold">{resultModal.studentName}</h2>
                <p className="text-slate-500 text-sm mt-1">{resultModal.jobTitle}</p>
              </div>

              {/* Step 1: Choose outcome */}
              {resultModal.step === 'choose' && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-600 mb-4">What was the outcome of this round?</p>

                  {/* Pass → next round */}
                  <button
                    onClick={() => setResultModal({ ...resultModal, step: 'next-round' })}
                    className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-primary-200 bg-primary-50 hover:border-primary-400 hover:bg-primary-100 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-200 text-primary-700 flex items-center justify-center">
                        <ArrowRight size={18} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-primary-700">Passed — Schedule Next Round</p>
                        <p className="text-xs text-primary-500">Student clears this round; move to Round {resultModal.round + 1}</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-primary-400 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Pass → final selection */}
                  <button
                    onClick={() => submitRoundResult('SELECT')}
                    disabled={submitting}
                    className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50 hover:border-emerald-400 hover:bg-emerald-100 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center">
                        <Trophy size={18} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-emerald-700">Passed — Mark as Finally Selected</p>
                        <p className="text-xs text-emerald-500">Student is selected; application marked SELECTED</p>
                      </div>
                    </div>
                    {submitting
                      ? <Loader2 size={18} className="text-emerald-400 animate-spin" />
                      : <ChevronRight size={20} className="text-emerald-400 group-hover:translate-x-1 transition-transform" />}
                  </button>

                  {/* Fail → go to reject step to collect reason */}
                  <button
                    onClick={() => setResultModal({ ...resultModal, step: 'reject' })}
                    className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-rose-200 bg-rose-50 hover:border-rose-400 hover:bg-rose-100 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center">
                        <XCircle size={18} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-rose-700">Failed — Reject Application</p>
                        <p className="text-xs text-rose-500">Provide a rejection reason before notifying the student</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-rose-400 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button onClick={() => setResultModal(null)} className="btn btn-secondary w-full mt-2">Cancel</button>
                </div>
              )}

              {/* Step 2: Rejection reason */}
              {resultModal.step === 'reject' && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                      <XCircle size={16} />
                    </div>
                    <p className="text-sm font-semibold text-rose-700">
                      Rejecting {resultModal.studentName} after Round {resultModal.round}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold mb-1">
                        Reason for Rejection <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        className="input resize-none"
                        rows={4}
                        required
                        placeholder="e.g. Communication skills need improvement, technical knowledge insufficient for the role, did not meet the required score in the aptitude round..."
                        value={rejectionReason}
                        onChange={e => setRejectionReason(e.target.value)}
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        This reason will be included in the notification sent to the student.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
                      <strong>Notification preview:</strong><br />
                      "❌ Result for Round {resultModal.round} — {resultModal.jobTitle}: Unfortunately, you did not clear this round.
                      {rejectionReason.trim() ? ` Reason: ${rejectionReason.trim()}` : ' (No reason provided)'}
                      We appreciate your participation and wish you the best!"
                    </div>

                    <div className="flex gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setResultModal({ ...resultModal, step: 'choose' })}
                        className="btn btn-secondary flex-1"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        disabled={submitting || !rejectionReason.trim()}
                        onClick={() => submitRoundResult('FAIL')}
                        className="btn flex-1 flex items-center justify-center gap-2
                          bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting && <Loader2 size={16} className="animate-spin" />}
                        Reject &amp; Notify
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Next round details */}
              {resultModal.step === 'next-round' && (
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-4">
                    Schedule Round <span className="font-bold text-primary-600">{resultModal.round + 1}</span> details:
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold mb-1">Date &amp; Time</label>
                      <input type="datetime-local" className="input" required value={nextRoundForm.scheduledAt}
                        onChange={e => setNextRoundForm({ ...nextRoundForm, scheduledAt: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1">Mode</label>
                      <select className="input" value={nextRoundForm.mode}
                        onChange={e => setNextRoundForm({ ...nextRoundForm, mode: e.target.value })}>
                        <option value="ONLINE">Online</option>
                        <option value="OFFLINE">Offline</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1">
                        {nextRoundForm.mode === 'ONLINE' ? 'Meeting Link' : 'Venue'}
                      </label>
                      <input type="text" className="input" required value={nextRoundForm.venueOrLink}
                        placeholder={nextRoundForm.mode === 'ONLINE' ? 'https://zoom.us/j/...' : 'Conference Room B'}
                        onChange={e => setNextRoundForm({ ...nextRoundForm, venueOrLink: e.target.value })} />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setResultModal({ ...resultModal, step: 'choose' })}
                        className="btn btn-secondary flex-1"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        disabled={submitting || !nextRoundForm.scheduledAt || !nextRoundForm.venueOrLink}
                        onClick={() => submitRoundResult('NEXT_ROUND')}
                        className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                      >
                        {submitting && <Loader2 size={16} className="animate-spin" />}
                        Schedule &amp; Notify
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Interviews;
