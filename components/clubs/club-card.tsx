import Link from 'next/link';
import { Users, Globe, Lock, Crown, Shield, Check } from 'lucide-react';
import type { ClubWithMembership } from '@/lib/types/club.types';

export default function ClubCard({ club }: { club: ClubWithMembership }) {
  return (
    <Link
      href={`/clubs/${club.id}`}
      className="group flex flex-col rounded-xl bg-[#202020] border border-[#2a2a2a] p-4 hover:border-[#FFC300]/30 hover:bg-[#232323] transition-all duration-200"
    >
    
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate group-hover:text-[#FFC300] transition-colors">
            {club.name}
          </h3>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {club.privacy === 'PUBLIC' ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-green-400 bg-green-400/10 rounded-full px-2 py-0.5">
                <Globe className="w-3 h-3" />
                Public
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] text-white/80 bg-white/10 rounded-full px-2 py-0.5">
                <Lock className="w-3 h-3" />
                Private
              </span>
            )}

   
            {club.isMember && club.myRole === 'OWNER' && (
              <span className="inline-flex items-center gap-1 text-[11px] text-[#FFC300] bg-[#FFC300]/10 rounded-full px-2 py-0.5">
                <Crown className="w-3 h-3" />
                Owner
              </span>
            )}
            {club.isMember && club.myRole === 'MODERATOR' && (
              <span className="inline-flex items-center gap-1 text-[11px] text-blue-400 bg-blue-400/10 rounded-full px-2 py-0.5">
                <Shield className="w-3 h-3" />
                Mod
              </span>
            )}
            {club.isMember && club.myRole === 'MEMBER' && (
              <span className="inline-flex items-center gap-1 text-[11px] text-green-400 bg-green-400/10 rounded-full px-2 py-0.5">
                <Check className="w-3 h-3" />
                Member
              </span>
            )}
          </div>
        </div>
      </div>

  
      {club.description && (
        <p className="text-xs text-white/80 line-clamp-2 mb-3 leading-relaxed">
          {club.description}
        </p>
      )}


      {club.tags && club.tags.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-3">
          {club.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[11px] text-white/80 bg-[#2a2a2a] rounded-full px-2 py-0.5"
            >
              {tag}
            </span>
          ))}
          {club.tags.length > 3 && (
            <span className="text-[11px] text-white/80 bg-[#2a2a2a] rounded-full px-2 py-0.5">
              +{club.tags.length - 3}
            </span>
          )}
        </div>
      )}


      <div className="mt-auto flex items-center justify-between text-[12px] text-white/80">
        <div className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          <span>
            {club.memberCount} member{club.memberCount !== 1 ? 's' : ''}
          </span>
        </div>
        {club.currentBook && (
          <span className="truncate max-w-30 text-[#FFC300]/80">
            {club.currentBook}
          </span>
        )}
      </div>
    </Link>
  );
}
