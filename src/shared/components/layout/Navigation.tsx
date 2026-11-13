'use client';

import { BarChart3, ChartNoAxesColumnIncreasing, Menu, UserRound, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

function Wordmark() {
  return <span className="wordmark"><Image src="/image/test.png" alt="BIG EDUCATION" width={1672} height={941} priority /></span>;
}

export default function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const teacherActive = pathname === '/' || pathname.startsWith('/teachers');
  const studentActive = pathname.startsWith('/student');

  return <>
    <header className="mobile-header">
      <button className="icon-button" aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      <Wordmark />
      <span className="profile-icon"><UserRound size={18} /></span>
    </header>
    <aside className={`sidebar ${open ? 'is-open' : ''}`}>
      <div className="side-brand"><Wordmark /></div>
      <nav aria-label="القائمة الرئيسية">
        <Link className={`nav-link ${teacherActive ? 'nav-active' : ''}`} href="/" onClick={() => setOpen(false)}><BarChart3 size={19} />تحليلات المعلمين</Link>
        <Link className={`nav-link ${studentActive ? 'nav-active' : ''}`} href="/student" onClick={() => setOpen(false)}><ChartNoAxesColumnIncreasing size={19} />إحصائيات الطلاب</Link>
      </nav>
      <div className="sidebar-bottom"><Image src="/image/under.png" alt="BIG EDUCATION" width={1671} height={941} priority /></div>
    </aside>
    {open && <button className="nav-backdrop" onClick={() => setOpen(false)} aria-label="إغلاق القائمة" />}
  </>;
}
