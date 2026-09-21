'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BarChart3, House, Menu, UserRound, X } from 'lucide-react';
import { Wordmark } from '@/shared/components/layout/Navbar';
export default function TeacherNavigation() {
  const [open, setOpen] = useState(false);
  return <><header className="mobile-header"><button className="icon-button" aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button><Wordmark /><span className="profile-icon"><UserRound size={18} /></span></header><aside className={`sidebar ${open ? 'is-open' : ''}`}><div className="side-brand"><Wordmark /></div><nav aria-label="القائمة الرئيسية"><Link className="nav-link" href="/" onClick={() => setOpen(false)}><House size={19} />إحصائيات الطالب</Link><Link className="nav-link nav-active" href="/teachers" onClick={() => setOpen(false)}><BarChart3 size={19} />تحليلات المعلمين</Link></nav><div className="sidebar-bottom"><Image src="/image/under.png" alt="BIG EDUCATION" width={1671} height={941} priority /></div></aside>{open && <button className="nav-backdrop" onClick={() => setOpen(false)} aria-label="إغلاق القائمة" />}</>;
}
