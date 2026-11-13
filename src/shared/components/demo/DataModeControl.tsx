'use client';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { CloudOff, RotateCcw, Wifi, X } from 'lucide-react';
import { CONNECTION_LOST_EVENT, getResolvedMode, resolveDataMode, setDataMode, subscribeToMode } from '@/demo/mode';

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

function useResolvedMode() {
  const mode = useSyncExternalStore(subscribeToMode, getResolvedMode, () => null);
  useEffect(() => { void resolveDataMode(); }, []);
  return mode;
}

/** Small corner button showing live/demo; opens a compact menu with switch + reset. */
export function DataModeControl() {
  const mode = useResolvedMode();
  const [open, setOpen] = useState(false);
  const [capturedAt, setCapturedAt] = useState<string | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode !== 'demo') return;
    let active = true;
    void import('@/demo/engine').then(engine => { if (active) setCapturedAt(engine.snapshotCapturedAt); });
    return () => { active = false; };
  }, [mode]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onPointer); document.removeEventListener('keydown', onKey); };
  }, [open]);

  if (!mode) return null;
  const demo = mode === 'demo';
  const label = demo ? 'وضع العرض بدون إنترنت' : 'متصل بالخادم';

  const reset = async () => {
    if (!confirmingReset) { setConfirmingReset(true); return; }
    const engine = await import('@/demo/engine');
    engine.resetDemoData();
    window.location.reload();
  };

  return (
    <div className={`data-mode ${demo ? 'is-demo' : 'is-live'}`} ref={root}>
      {open && (
        <div className="data-mode-menu" role="dialog" aria-label="مصدر البيانات">
          <span className="data-mode-status">{demo ? <CloudOff size={14} /> : <Wifi size={14} />}{label}</span>
          {demo && capturedAt && <small>بيانات بتاريخ {formatDate(capturedAt)}</small>}
          {demo && (
            <button type="button" className={`data-mode-action ${confirmingReset ? 'is-confirming' : ''}`} onClick={() => void reset()}>
              <RotateCcw size={13} />{confirmingReset ? 'اضغط مرة أخرى للتأكيد' : 'إعادة ضبط بيانات العرض'}
            </button>
          )}
          <button type="button" className="data-mode-action" onClick={() => setDataMode(demo ? 'live' : 'demo')}>
            {demo ? <Wifi size={13} /> : <CloudOff size={13} />}{demo ? 'استخدام البيانات المباشرة' : 'وضع العرض بدون إنترنت'}
          </button>
        </div>
      )}
      <button
        type="button"
        className="data-mode-toggle"
        onClick={() => { setOpen(value => !value); setConfirmingReset(false); }}
        aria-label={label}
        aria-expanded={open}
        title={label}
      >
        {demo ? <CloudOff size={14} /> : <Wifi size={14} />}
      </button>
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
