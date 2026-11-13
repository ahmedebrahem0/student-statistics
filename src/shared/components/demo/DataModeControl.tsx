'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { CloudOff, RotateCcw, Wifi, X } from 'lucide-react';
import { CONNECTION_LOST_EVENT, getResolvedMode, resolveDataMode, setDataMode, subscribeToMode } from '@/demo/mode';

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

function useResolvedMode() {
  const mode = useSyncExternalStore(subscribeToMode, getResolvedMode, () => null);
  useEffect(() => { void resolveDataMode(); }, []);
  return mode;
}

/** Sidebar card: shows whether data is live or the offline demo, with switch + reset controls. */
export function DataModeControl() {
  const mode = useResolvedMode();
  const [capturedAt, setCapturedAt] = useState<string | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);

  useEffect(() => {
    if (mode !== 'demo') return;
    let active = true;
    void import('@/demo/engine').then(engine => { if (active) setCapturedAt(engine.snapshotCapturedAt); });
    return () => { active = false; };
  }, [mode]);

  if (!mode) return null;

  const reset = async () => {
    if (!confirmingReset) { setConfirmingReset(true); return; }
    const engine = await import('@/demo/engine');
    engine.resetDemoData();
    window.location.reload();
  };

  if (mode === 'live') {
    return (
      <div className="data-mode is-live">
        <span className="data-mode-status"><Wifi size={14} />متصل بالخادم</span>
        <button type="button" className="data-mode-action" onClick={() => setDataMode('demo')}><CloudOff size={13} />وضع العرض بدون إنترنت</button>
      </div>
    );
  }

  return (
    <div className="data-mode is-demo">
      <span className="data-mode-status"><CloudOff size={14} />وضع العرض بدون إنترنت</span>
      {capturedAt && <small>بيانات بتاريخ {formatDate(capturedAt)}</small>}
      <button type="button" className={`data-mode-action ${confirmingReset ? 'is-confirming' : ''}`} onClick={() => void reset()} onBlur={() => setConfirmingReset(false)}>
        <RotateCcw size={13} />{confirmingReset ? 'اضغط مرة أخرى للتأكيد' : 'إعادة ضبط بيانات العرض'}
      </button>
      <button type="button" className="data-mode-action" onClick={() => setDataMode('live')}><Wifi size={13} />استخدام البيانات المباشرة</button>
    </div>
  );
}

/** Offers switching to the offline demo when the live API stops responding. Never switches on its own. */
export function ConnectionLostNotice() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const show = () => { if (getResolvedMode() === 'live') setVisible(true); };
    window.addEventListener(CONNECTION_LOST_EVENT, show);
    return () => window.removeEventListener(CONNECTION_LOST_EVENT, show);
  }, []);
  if (!visible) return null;
  return (
    <div className="connection-notice" role="alert">
      <CloudOff size={20} />
      <div><strong>تعذر الاتصال بالخادم</strong><span>يمكنك المتابعة فورًا ببيانات العرض المحفوظة على الجهاز.</span></div>
      <button type="button" className="install-action" onClick={() => setDataMode('demo')}>التبديل لوضع العرض</button>
      <button type="button" className="install-close" onClick={() => setVisible(false)} aria-label="إغلاق"><X size={16} /></button>
    </div>
  );
}
