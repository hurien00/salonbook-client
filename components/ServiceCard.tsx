import Link from 'next/link';
import { Clock, Sparkles, ArrowRight } from 'lucide-react';
import { Service } from '@/types';
import { formatPrice } from '@/lib/utils';

type ServiceCardProps = {
  service: Service;
};

export default function ServiceCard({ service }: ServiceCardProps) {
  const href = `/services/${service._id ?? service.id ?? ''}`;
  const isInactive = service.status === 'inactive';

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-2xs transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
        {service.image ? (
          <img
            src={service.image}
            alt={service.serviceName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-stone-400">
            <Sparkles className="h-10 w-10" />
          </div>
        )}

        {service.category && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#1f140f]/85 px-3 py-1 text-[11px] font-semibold text-amber-300 backdrop-blur-md">
            <Sparkles className="h-3 w-3" />
            {service.category}
          </span>
        )}

        {isInactive && (
          <span className="absolute right-3 top-3 rounded-full bg-rose-600 px-2.5 py-1 text-[10px] font-bold uppercase text-white">
            Inactive
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="font-serif text-lg font-bold text-[#422719]">{service.serviceName}</h3>
          {service.description && (
            <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-stone-600">
              {service.description}
            </p>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-4">
          <div className="flex flex-col gap-1">
            <span className="font-serif text-xl font-bold text-[#c56117]">
              {formatPrice(service.price)}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-stone-500">
              <Clock className="h-3.5 w-3.5" />
              {service.duration ?? 0} mins
            </span>
          </div>

          <Link
            href={href}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#422719] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#331d12]"
          >
            <span>View Details</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
