import Link from 'next/link';
import { Users, Crown, Shield, Check, BookOpen } from 'lucide-react';
import type { ClubWithMembership } from '@/lib/types/club.types';

const ROLE_CONFIG = {
  OWNER: { label: 'Owner', icon: Crown, className: 'text-[#fb923c] bg-[#fb923c]/10' },
  MODERATOR: { label: 'Mod', icon: Shield, className: 'text-blue-400 bg-blue-400/10' },
  MEMBER: { label: 'Member', icon: Check, className: 'text-green-400 bg-green-400/10' },
} as const;

export default function ClubCard({ club }: { club: ClubWithMembership }) {
  const roleConfig =
    club.isMember && club.myRole ? ROLE_CONFIG[club.myRole as keyof typeof ROLE_CONFIG] : null;
  const RoleIcon = roleConfig?.icon;

  return (
    <Link
      href={`/clubs/${club.id}`}
      className="group flex flex-col rounded-2xl bg-[#1c1c1c] border border-[#2a2a2a] overflow-hidden hover:border-[#fb923c]/30 hover:bg-[#1e1e1e] transition-all duration-200"
    >
      <div className="h-0.75 w-full bg-[#fb923c]" />

      <div className="flex flex-col flex-1 gap-2.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-white leading-snug truncate group-hover:text-[#fb923c] transition-colors mainFont">
            {club.name}
          </h3>
          {roleConfig && RoleIcon && (
            <span
              className={`inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5 shrink-0 ${roleConfig.className}`}
            >
              <RoleIcon className="w-3 h-3" />
              {roleConfig.label}
            </span>
          )}
        </div>

        {club.description && (
          <p className="text-sm text-white/80 line-clamp-2 leading-relaxed">
            {club.description}
          </p>
        )}

        {club.currentBook && (
          <div className="flex items-start gap-2 px-2.5 py-2 rounded-lg bg-[#fb923c]/6 border border-[#fb923c]/12">
            <BookOpen className="w-3.5 h-3.5 text-[#fb923c]/80 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#fb923c] uppercase tracking-wider mb-0.5">
                Now Reading
              </p>
              <p className="text-sm text-white truncate">{club.currentBook}</p>
            </div>
          </div>
        )}

        {club.tags && club.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {club.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs text-white/80 bg-white/5 rounded-full px-2 py-0.5">
                {tag}
              </span>
            ))}
            {club.tags.length > 3 && (
              <span className="text-xs text-white/80 bg-white/5 rounded-full px-2 py-0.5">
                +{club.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-[#2a2a2a] mt-auto text-xs text-white/80">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>
              {club.memberCount} member{club.memberCount !== 1 ? 's' : ''}
            </span>
          </div>
          <span className={club.privacy === 'PUBLIC' ? 'text-green-400' : club.privacy === 'FRIENDS' ? 'text-blue-400' : 'text-white/80'}>
            {club.privacy === 'PUBLIC' ? 'Public' : club.privacy === 'FRIENDS' ? 'Friends' : 'Private'}
          </span>
        </div>
      </div>
    </Link>
  );
}
