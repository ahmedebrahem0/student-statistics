import { BookOpen } from 'lucide-react';
export default function EmptyState({ title = 'لا توجد بيانات بعد', description = 'أضف سنة دراسية لبدء متابعة الأداء.' }: { title?: string; description?: string }) { return <div className="empty-state"><BookOpen size={28} /><h3>{title}</h3><p>{description}</p></div>; }
