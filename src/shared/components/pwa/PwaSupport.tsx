'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import { Download, Share, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'big-install-dismissed';
const noopSubscribe = () => () => {};

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function isIos() {
  const ua = navigator.userAgent;
  return /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function wasDismissed() {
  try { return localStorage.getItem(DISMISS_KEY) === '1'; } catch { return false; }
}

export default function PwaSupport() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [closed, setClosed] = useState(false);
  const showIosHint = useSyncExternalStore(noopSubscribe, () => isIos() && !isStandalone() && !wasDismissed(), () => false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).catch(() => {});
    }
    const onPrompt = (event: Event) => {
      event.preventDefault();
      if (!wasDismissed()) setInstallEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstallEvent(null);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, '1'); } catch { /* storage unavailable */ }
    setClosed(true);
    setInstallEvent(null);
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  };

  if (closed || (!installEvent && !showIosHint)) return null;

  return (
    <div className="install-banner" role="dialog" aria-label="تثبيت التطبيق">
      <Image src="/icons/icon-192.png" alt="" width={40} height={40} />
      <div className="install-text">
        <strong>ثبّت تطبيق Big Education</strong>
        {installEvent
          ? <span>افتحه من الشاشة الرئيسية مثل أي تطبيق.</span>
          : <span>اضغط <Share size={13} aria-label="مشاركة" /> ثم «إضافة إلى الشاشة الرئيسية».</span>}
      </div>
      {installEvent && <button type="button" className="install-action" onClick={install}><Download size={15} />تثبيت</button>}
      <button type="button" className="install-close" onClick={dismiss} aria-label="إغلاق"><X size={16} /></button>
    </div>
  );
}
