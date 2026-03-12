import { Badge } from '@/components/ui/badge';

type Role = 'member' | 'moderator' | 'admin';

const CONFIG: Record<Role, { label: string; className: string }> = {
  admin: {
    label: 'Admin',
    className: 'bg-red-500/15 text-red-400 border-transparent',
  },
  moderator: {
    label: 'Moderator',
    className: 'bg-blue-500/15 text-blue-400 border-transparent',
  },
  member: {
    label: 'Member',
    className: 'bg-white/8 text-white/50 border-transparent',
  },
};

export default function RoleBadge({ role }: { role: Role }) {
  const { label, className } = CONFIG[role] ?? CONFIG.member;
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}
