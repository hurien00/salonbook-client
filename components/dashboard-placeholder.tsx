import { Sparkles } from 'lucide-react';

export default function DashboardPlaceholder({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
        <Sparkles className="h-6 w-6" />
      </div>
      <h1 className="mt-4 font-serif text-2xl font-bold text-[#422719]">{title}</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-stone-500">
        {description ?? 'This page is under construction.'}
      </p>
    </div>
  );
}
