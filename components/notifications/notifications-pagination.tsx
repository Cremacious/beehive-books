'use client';

import { useRouter } from 'next/navigation';
import Pagination from '@/components/shared/pagination';

interface Props {
  page: number;
  totalPages: number;
}

export function NotificationsPagination({ page, totalPages }: Props) {
  const router = useRouter();
  return (
    <Pagination
      page={page}
      totalPages={totalPages}
      onPageChange={(p) => router.push(`/notifications?page=${p}`)}
      className="mt-6"
    />
  );
}
