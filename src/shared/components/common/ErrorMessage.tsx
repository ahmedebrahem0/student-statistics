import { WifiOff, RotateCcw, Eye } from 'lucide-react';

interface ErrorMessageProps { retry: () => void; preview?: () => void; busy?: boolean; title?: string; description?: string }

export default function ErrorMessage({ retry, preview, busy, title = 'تعذر تحميل بيانات الطالب', description = 'خدمة البيانات غير متاحة حاليًا. حاول مرة أخرى بعد قليل.' }: ErrorMessageProps) { return <section className="state-card panel" role="alert"><span className="state-icon"><WifiOff size={32} /></span><h2>{title}</h2><p>{description}</p><button className="primary-button" onClick={retry} disabled={busy}><RotateCcw size={17} />{busy ? 'جاري المحاولة…' : 'إعادة المحاولة'}</button>{preview && <><button className="text-button" onClick={preview}><Eye size={17} />عرض بيانات تجريبية</button><small>العرض التجريبي للمعاينة فقط، ولا يمثل بيانات من الخدمة.</small></>}</section>; }
