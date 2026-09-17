import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import Providers from './providers';
import './globals.css';
const cairo = Cairo({ subsets: ['arabic', 'latin'], display: 'swap' });
export const metadata: Metadata = { title: 'إحصائيات الطالب | BIG EDUCATION', description: 'متابعة تطور الأداء الدراسي والدرجات عبر السنوات — BIG EDUCATION', robots: { index: false, follow: false } };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="ar" dir="rtl"><body className={cairo.className}><Providers>{children}</Providers></body></html>; }
