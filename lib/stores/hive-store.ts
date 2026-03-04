import { create } from 'zustand';
import {
  createHiveAction,
  updateHiveAction,
  deleteHiveAction,
  joinHiveAction,
  leaveHiveAction,
  inviteMemberAction,
  acceptHiveInviteAction,
  declineHiveInviteAction,
  removeMemberFromHiveAction,
  updateMemberRoleAction,
  completeHiveAction,
} from '@/lib/actions/hive.actions';
import type { HiveFormData, HiveRole, ActionResult } from '@/lib/types/hive.types';

interface HiveStore {
  createHive: (data: HiveFormData) => Promise<ActionResult & { hiveId?: string }>;
  updateHive: (hiveId: string, data: HiveFormData) => Promise<ActionResult>;
  deleteHive: (hiveId: string) => Promise<ActionResult>;

  joinHive: (hiveId: string) => Promise<ActionResult>;
  leaveHive: (hiveId: string) => Promise<ActionResult>;
  completeHive: (hiveId: string) => Promise<ActionResult>;

  inviteMember: (hiveId: string, userId: string, role?: Exclude<HiveRole, 'OWNER'>) => Promise<ActionResult>;
  acceptHiveInvite: (inviteId: string) => Promise<ActionResult & { hiveId?: string }>;
  declineHiveInvite: (inviteId: string) => Promise<ActionResult>;
  removeMember: (hiveId: string, userId: string) => Promise<ActionResult>;
  updateMemberRole: (
    hiveId: string,
    userId: string,
    role: Exclude<HiveRole, 'OWNER'>,
  ) => Promise<ActionResult>;
}

export const useHiveStore = create<HiveStore>(() => ({
  createHive: (data) => createHiveAction(data),
  updateHive: (hiveId, data) => updateHiveAction(hiveId, data),
  deleteHive: (hiveId) => deleteHiveAction(hiveId),

  joinHive: (hiveId) => joinHiveAction(hiveId),
  leaveHive: (hiveId) => leaveHiveAction(hiveId),
  completeHive: (hiveId) => completeHiveAction(hiveId),

  inviteMember: (hiveId, userId, role) => inviteMemberAction(hiveId, userId, role),
  acceptHiveInvite: (inviteId) => acceptHiveInviteAction(inviteId),
  declineHiveInvite: (inviteId) => declineHiveInviteAction(inviteId),
  removeMember: (hiveId, userId) => removeMemberFromHiveAction(hiveId, userId),
  updateMemberRole: (hiveId, userId, role) => updateMemberRoleAction(hiveId, userId, role),
}));
