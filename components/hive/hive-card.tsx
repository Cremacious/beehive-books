import Link from 'next/link';
import { Users, Crown, Shield, Pencil, Eye, BookOpen, Globe, Lock } from 'lucide-react';
import type { HiveWithMembership } from '@/lib/types/hive.types';

const ROLE_CONFIG = {
  OWNER: { label: 'Owner', icon: Crown, className: 'text-[#FFC300] bg-[#FFC300]/10' },
  MODERATOR: { label: 'Mod', icon: Shield, className: 'text-blue-400 bg-blue-400/10' },
  CONTRIBUTOR: { label: 'Contributor', icon: Pencil, className: 'text-amber-400 bg-amber-400/10' },
  BETA_READER: { label: 'Beta Reader', icon: Eye, className: 'text-purple-400 bg-purple-400/10' },
} as const;

const PRIVACY_CONFIG = {
  PUBLIC: { label: 'Public', className: 'text-green-400' },
  FRIENDS: { label: 'Friends', className: 'text-blue-400' },
  PRIVATE: { label: 'Private', className: 'text-white/80' },
} as const;

export default function HiveCard({ hive }: { hive: HiveWithMembership }) {
  const roleConfig =
    hive.isMember && hive.myRole ? ROLE_CONFIG[hive.myRole as keyof typeof ROLE_CONFIG] : null;
  const RoleIcon = roleConfig?.icon;
  const privacy = PRIVACY_CONFIG[hive.privacy as keyof typeof PRIVACY_CONFIG];

  return (
    <Link
      href={`/hive/${hive.id}`}
      className="group flex flex-col rounded-2xl bg-[#1c1c1c] border border-[#2a2a2a] overflow-hidden hover:border-[#FFC300]/30 hover:bg-[#1e1e1e] hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="h-0.75 w-full bg-[#FFC300]" />

      <div className="flex flex-col flex-1 gap-2.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">

            <h3 className="text-base font-semibold text-white leading-snug truncate group-hover:text-[#FFC300] transition-colors mainFont">
              {hive.name}
            </h3>
          </div>
          {roleConfig && RoleIcon && (
            <span
              className={`inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5 shrink-0 ${roleConfig.className}`}
            >
              <RoleIcon className="w-3 h-3" />
              {roleConfig.label}
            </span>
          )}
        </div>

        {hive.description && (
          <p className="text-sm text-white/80 line-clamp-2 leading-relaxed">
            {hive.description}
          </p>
        )}

        {(hive.genre || (hive.tags && hive.tags.length > 0)) && (
          <div className="flex flex-wrap gap-1.5">
            {hive.genre && (
              <span className="text-xs text-[#FFC300]/80 bg-[#FFC300]/8 rounded-full px-2 py-0.5">
                {hive.genre}
              </span>
            )}
            {hive.tags?.slice(0, 2).map((tag) => (
              <span key={tag} className="text-xs text-white/80 bg-white/5 rounded-full px-2 py-0.5">
                {tag}
              </span>
            ))}
            {hive.tags && hive.tags.length > 2 && (
              <span className="text-xs text-white/80 bg-white/5 rounded-full px-2 py-0.5">
                +{hive.tags.length - 2}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-[#2a2a2a] mt-auto text-xs text-white/80">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>
                {hive.memberCount} member{hive.memberCount !== 1 ? 's' : ''}
              </span>
            </div>
            {hive.privacy === 'PUBLIC' ? (
              <span className={`flex items-center gap-1 ${privacy.className}`}>
                <Globe className="w-3 h-3" />
                {privacy.label}
              </span>
            ) : (
              <span className={`flex items-center gap-1 ${privacy.className}`}>
                <Lock className="w-3 h-3" />
                {privacy.label}
              </span>
            )}
          </div>
          {hive.totalWordCount > 0 && (
            <div className="flex items-center gap-1.5 text-[#FFC300]/80">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{hive.totalWordCount.toLocaleString()} words</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
