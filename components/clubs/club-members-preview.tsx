import Link from 'next/link';
import Image from 'next/image';
import { Crown, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ClubMemberWithUser } from '@/lib/types/club.types';

function MemberAvatar({ member }: { member: ClubMemberWithUser }) {
  const name = member.user.username ?? '?';
  const initials = name.charAt(0).toUpperCase();
  return (
    <Link href={`/u/${member.user.username ?? member.userId}`}>
      <div
        className="relative cursor-pointer"
        title={member.user.username ?? name}
      >
        {member.user.image ? (
          <Image
            src={member.user.image}
            alt={name}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover border-2 border-[#252525]"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#FFC300]/20 flex items-center justify-center border-2 border-[#252525]">
            <span className="text-sm font-semibold text-yellow-500">
              {initials}
            </span>
          </div>
        )}
        {member.role === 'OWNER' && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FFC300] flex items-center justify-center">
            <Crown className="w-2.5 h-2.5 text-black" />
          </div>
        )}
        {member.role === 'MODERATOR' && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
            <Shield className="w-2.5 h-2.5 text-white" />
          </div>
        )}
      </div>
    </Link>
  );
}

interface ClubMembersPreviewProps {
  members: ClubMemberWithUser[];
  clubId: string;
  total: number;
}

export default function ClubMembersPreview({
  members,
  clubId,
  total,
}: ClubMembersPreviewProps) {
  const preview = members.slice(0, 6);
  const extra = total - preview.length;

  return (
    <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-yellow-500">
          Members <span className="font-normal text-white/80">({total})</span>
        </h3>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/clubs/${clubId}/members`}>View all</Link>
        </Button>
      </div>

      {preview.length === 0 ? (
        <div className="py-8 flex flex-col items-center text-center">
          <p className="text-sm font-medium text-white mb-1">No members yet</p>
          <p className="text-sm text-white/80 max-w-xs">
            Share the club link to invite others to join.
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2.5">
            {preview.map((member) => (
              <MemberAvatar key={member.id} member={member} />
            ))}
          </div>
          {extra > 0 && (
            <span className="text-sm text-white/80">+{extra} more</span>
          )}
        </div>
      )}
    </div>
  );
}
