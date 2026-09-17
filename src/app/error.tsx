'use client';
import ErrorMessage from '@/shared/components/common/ErrorMessage';
export default function Error({ reset }: { reset: () => void }) { return <main className="route-state"><ErrorMessage retry={reset} /></main>; }
