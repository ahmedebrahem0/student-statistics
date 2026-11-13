import type { Metadata, Viewport } from 'next';
import { Cairo } from 'next/font/google';
import Providers from './providers';
import PwaSupport from '@/shared/components/pwa/PwaSupport';
import { ConnectionLostNotice, DataModeControl } from '@/shared/components/demo/DataModeControl';
import './globals.css';
const cairo = Cairo({ subsets: ['arabic', 'latin'], display: 'swap' });
export const metadata: Metadata = {
  title: 'إحصائيات الطالب | BIG EDUCATION',
  description: 'متابعة تطور الأداء الدراسي والدرجات عبر السنوات — BIG EDUCATION',
  robots: { index: false, follow: false },
  applicationName: 'Big Education',
  manifest: '/pwa-manifest',
  icons: {
    icon: [
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: { capable: true, title: 'Big Education', statusBarStyle: 'black' },
  formatDetection: { telephone: false },
};
export const viewport: Viewport = { themeColor: '#032629', width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="ar" dir="rtl"><body className={cairo.className}><Providers>{children}</Providers><PwaSupport /><ConnectionLostNotice /><DataModeControl /></body></html>; }
