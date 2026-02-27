import Link from 'next/link';
import { Users, Globe, Lock, Crown, Shield, Pencil, Eye, CheckCircle2 } from 'lucide-react';
import type { HiveWithMembership } from '@/lib/types/hive.types';

export default function HiveCard({ hive }: { hive: HiveWithMembership }) {
  return (
    <Link
      href={`/hive/${hive.id}`}
      className="group flex flex-col rounded-xl bg-[#202020] border border-[#2a2a2a] p-4 hover:border-[#FFC300]/30 hover:bg-[#232323] transition-all duration-200"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">🐝</span>
            <h3 className="text-base font-semibold text-white truncate group-hover:text-[#FFC300] transition-colors">
              {hive.name}
            </h3>
          </div>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {hive.privacy === 'PUBLIC' ? (
              <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-400/10 rounded-full px-2 py-0.5">
                <Globe className="w-3 h-3" />
                Public
              </span>
            ) : hive.privacy === 'FRIENDS' ? (
              <span className="inline-flex items-center gap-1 text-xs text-blue-400 bg-blue-400/10 rounded-full px-2 py-0.5">
                <Users className="w-3 h-3" />
                Friends
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-white/60 bg-white/10 rounded-full px-2 py-0.5">
                <Lock className="w-3 h-3" />
                Private
              </span>
            )}

            {hive.status === 'COMPLETED' && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 rounded-full px-2 py-0.5">
                <CheckCircle2 className="w-3 h-3" />
                Complete
              </span>
            )}

            {hive.isMember && hive.myRole === 'OWNER' && (
              <span className="inline-flex items-center gap-1 text-xs text-[#FFC300] bg-[#FFC300]/10 rounded-full px-2 py-0.5">
                <Crown className="w-3 h-3" />
                Owner
              </span>
            )}
            {hive.isMember && hive.myRole === 'MODERATOR' && (
              <span className="inline-flex items-center gap-1 text-xs text-blue-400 bg-blue-400/10 rounded-full px-2 py-0.5">
                <Shield className="w-3 h-3" />
                Mod
              </span>
            )}
            {hive.isMember && hive.myRole === 'CONTRIBUTOR' && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 rounded-full px-2 py-0.5">
                <Pencil className="w-3 h-3" />
                Contributor
              </span>
            )}
            {hive.isMember && hive.myRole === 'BETA_READER' && (
              <span className="inline-flex items-center gap-1 text-xs text-purple-400 bg-purple-400/10 rounded-full px-2 py-0.5">
                <Eye className="w-3 h-3" />
                Beta Reader
              </span>
            )}
          </div>
        </div>
      </div>

      {hive.description && (
        <p className="text-sm text-white/80 line-clamp-2 mb-3 leading-relaxed">
          {hive.description}
        </p>
      )}

      {hive.genre && (
        <span className="inline-block text-xs text-[#FFC300]/70 bg-[#FFC300]/8 rounded-full px-2 py-0.5 mb-3 w-fit">
          {hive.genre}
        </span>
      )}

      {hive.tags && hive.tags.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-3">
          {hive.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs text-white/60 bg-[#2a2a2a] rounded-full px-2 py-0.5"
            >
              {tag}
            </span>
          ))}
          {hive.tags.length > 3 && (
            <span className="text-xs text-white/60 bg-[#2a2a2a] rounded-full px-2 py-0.5">
              +{hive.tags.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between text-sm text-white/80">
        <div className="flex items-center gap-1">
          <Users className="w-5 h-5" />
          <span>
            {hive.memberCount} member{hive.memberCount !== 1 ? 's' : ''}
          </span>
        </div>
        {hive.totalWordCount > 0 && (
          <span className="text-[#FFC300]/60">
            {hive.totalWordCount.toLocaleString()} words
          </span>
        )}
      </div>
    </Link>
  );
}
