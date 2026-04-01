'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  GripVertical,
  Pencil,
  Trash2,
  Loader2,
  Check,
  BookOpen,
  Film,
  Zap,
  StickyNote,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  Bookmark,
  GitFork,
  TrendingUp,
  Flag,
  AlertTriangle,
  Eye,
  Globe,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeleteDialog } from '@/components/shared/delete-dialog';
import {
  getOutlineItemsAction,
  createOutlineItemAction,
  updateOutlineItemAction,
  reorderOutlineItemsAction,
  deleteOutlineItemAction,
  createGroupAction,
  moveItemToGroupAction,
  deleteGroupAction,
} from '@/lib/actions/hive-outline.actions';
import type {
  OutlineItem,
  OutlineItemType,
  HiveRole,
} from '@/lib/types/hive.types';

interface HiveOutlineBoardProps {
  hiveId: string;
  initialItems: OutlineItem[];
  currentUserId: string;
  myRole: HiveRole;
}

const ITEM_TYPES: {
  value: OutlineItemType;
  label: string;
  Icon: React.ElementType;
  color: string;
  tooltip: string;
}[] = [
  { value: 'CHAPTER',       label: 'Chapter',           Icon: BookOpen,      color: 'text-[#FFC300]',  tooltip: 'A major narrative division of the story' },
  { value: 'ACT',           label: 'Act',               Icon: Bookmark,      color: 'text-amber-400',  tooltip: 'A top-level story segment (e.g. Act 1, Act 2, Act 3)' },
  { value: 'SCENE',         label: 'Scene',             Icon: Film,          color: 'text-blue-400',   tooltip: 'A self-contained unit of action in a single location' },
  { value: 'BEAT',          label: 'Beat',              Icon: Zap,           color: 'text-green-400',  tooltip: 'A small unit of action or reaction within a scene' },
  { value: 'PLOT_POINT',    label: 'Plot Point',        Icon: Flag,          color: 'text-orange-400', tooltip: 'An inciting incident, turning point, or climactic moment' },
  { value: 'SUBPLOT',       label: 'Subplot',           Icon: GitFork,       color: 'text-cyan-400',   tooltip: 'A secondary storyline running parallel to the main plot' },
  { value: 'CHARACTER_ARC', label: 'Character Arc',     Icon: TrendingUp,    color: 'text-rose-400',   tooltip: 'Character milestones and growth throughout the story' },
  { value: 'CONFLICT',      label: 'Conflict',          Icon: AlertTriangle, color: 'text-red-400',    tooltip: 'An internal or external struggle driving narrative tension' },
  { value: 'THEME',         label: 'Theme',             Icon: Eye,           color: 'text-sky-400',    tooltip: 'A recurring idea, symbol, or motif for thematic consistency' },
  { value: 'WORLD_BUILDING',label: 'World-Building',    Icon: Globe,         color: 'text-emerald-400',tooltip: 'Important setting or lore details for the story world' },
  { value: 'DIALOGUE',      label: 'Dialogue Block',    Icon: MessageCircle, color: 'text-violet-400', tooltip: 'A planned key conversation or exchange between characters' },
  { value: 'NOTE',          label: 'Note',              Icon: StickyNote,    color: 'text-purple-400', tooltip: 'A freeform note or reminder about any story element' },
];

const PRESET_COLORS = [
  '#FFC300',
  '#8B5CF6',
  '#10B981',
  '#3B82F6',
  '#F97316',
  '#EC4899',
  '#EF4444',
  '#06B6D4',
  '#84CC16',
  '#F59E0B',
];

function typeConfig(type: OutlineItemType) {
  if (type === 'GROUP')
    return {
      value: 'GROUP' as OutlineItemType,
      label: 'Group',
      Icon: FolderOpen,
      color: 'text-[#FFC300]',
    };
  return ITEM_TYPES.find((t) => t.value === type) ?? ITEM_TYPES[0];
}

function GroupForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: { title: string; color: string };
  onSave: (name: string, color: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.title ?? '');
  const [color, setColor] = useState(initial?.color ?? '#FFC300');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    await onSave(name, color);
    setSaving(false);
  };

  return (
    <div className="rounded-2xl bg-[#2a2a2a] border border-[#FFC300]/20 p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-[#FFC300]">
        <FolderPlus className="w-4 h-4" />
        {initial ? 'Rename group' : 'New group'}
      </div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
          if (e.key === 'Escape') onCancel();
        }}
        placeholder="Group name…"
        maxLength={100}
        autoFocus
        className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/40 transition-all"
      />
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/90">Color:</span>
        <div className="flex gap-1.5 flex-wrap">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-5 h-5 rounded-full border-2 transition-all"
              style={{
                backgroundColor: c,
                borderColor: color === c ? 'white' : 'transparent',
              }}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving || !name.trim()}
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
          {initial ? 'Save' : 'Create'}
        </Button>
      </div>
    </div>
  );
}

function ItemForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: OutlineItem;
  onSave: (data: {
    title: string;
    description: string;
    type: OutlineItemType;
    color: string;
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [type, setType] = useState<OutlineItemType>(initial?.type ?? 'CHAPTER');
  const [color, setColor] = useState(initial?.color ?? '#FFC300');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    await onSave({ title, description, type, color });
    setSaving(false);
  };

  return (
    <div className="rounded-2xl bg-[#2a2a2a] border border-[#FFC300]/20 p-4 space-y-3">
      <div className="relative">
        {(() => {
          const selected = ITEM_TYPES.find((t) => t.value === type) ?? ITEM_TYPES[0];
          const SelectedIcon = selected.Icon;
          return (
            <>
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <SelectedIcon className={`w-3.5 h-3.5 ${selected.color}`} />
              </div>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as OutlineItemType)}
                title={selected.tooltip}
                className="w-full appearance-none pl-8 pr-8 py-2 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] text-sm font-medium text-white focus:outline-none focus:border-[#FFC300]/40 cursor-pointer transition-colors"
              >
                {ITEM_TYPES.map(({ value, label }) => (
                  <option key={value} value={value} className="bg-[#1e1e1e]">
                    {label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg className="w-3.5 h-3.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </>
          );
        })()}
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
          if (e.key === 'Escape') onCancel();
        }}
        placeholder="Title…"
        maxLength={200}
        autoFocus
        className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/40 transition-all"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Optional description or notes…"
        maxLength={1000}
        rows={2}
        className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/40 transition-all resize-none"
      />

      <div className="flex items-center gap-2">
        <span className="text-xs text-white/90">Color:</span>
        <div className="flex gap-1.5 flex-wrap">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-5 h-5 rounded-full border-2 transition-all"
              style={{
                backgroundColor: c,
                borderColor: color === c ? 'white' : 'transparent',
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving || !title.trim()}
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
          {initial ? 'Save' : 'Add'}
        </Button>
      </div>
    </div>
  );
}

function SortableItemRow({
  item,
  currentUserId,
  myRole,
  onEdit,
  onDelete,
  compact,
}: {
  item: OutlineItem;
  currentUserId: string;
  myRole: HiveRole;
  onEdit: (item: OutlineItem) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, data: { parentId: item.parentId } });

  const conf = typeConfig(item.type);
  const Icon = conf.Icon;

  const canEdit =
    item.createdById === currentUserId ||
    myRole === 'OWNER' ||
    myRole === 'MODERATOR';

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className={`flex items-start gap-3 rounded-2xl bg-[#252525] border border-[#2a2a2a] group ${compact ? 'p-2.5' : 'p-3'}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-0.5 p-1 text-white hover:text-white/80 cursor-grab active:cursor-grabbing transition-colors shrink-0"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      <div
        className="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5"
        style={{ backgroundColor: item.color }}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1 text-xs font-medium shrink-0 ${conf.color}`}
          >
            <Icon className="w-3.5 h-3.5" />
            {conf.label}
          </span>
          <p className="text-sm font-medium text-white truncate">
            {item.title}
          </p>
        </div>
        {item.description && (
          <p className="text-xs text-white/80 mt-0.5 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      {canEdit && (
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Button size="sm" onClick={() => onEdit(item)}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <DeleteDialog
            itemType="item"
            itemName={item.title}
            onDelete={async () => {
              await deleteOutlineItemAction(item.id);
              onDelete(item.id);
            }}
            trigger={
              <Button variant="destructive" size="sm" type="button">
                <Trash2 className="w-4 h-4" />
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}

function DragGhost({ item }: { item: OutlineItem }) {
  const conf = typeConfig(item.type);
  const Icon = conf.Icon;
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#252525] border border-[#FFC300]/40 p-3 shadow-2xl opacity-95 w-full">
      <GripVertical className="w-5 h-5 text-white/80 shrink-0" />
      <div
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: item.color }}
      />
      <span
        className={`flex items-center gap-1 text-xs font-medium shrink-0 ${conf.color}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {conf.label}
      </span>
      <p className="text-sm font-medium text-white truncate">{item.title}</p>
    </div>
  );
}

function SortableGroupCard({
  group,
  children: childItems,
  currentUserId,
  myRole,
  editingItemId,
  onEditItem,
  onDeleteItem,
  onEditGroup,
  onDeleteGroup,
  addingInGroup,
  setAddingInGroup,
  onSaveNewItem,
}: {
  group: OutlineItem;
  children: OutlineItem[];
  currentUserId: string;
  myRole: HiveRole;
  editingItemId: string | null;
  onEditItem: (item: OutlineItem) => void;
  onDeleteItem: (id: string) => void;
  onEditGroup: (group: OutlineItem) => void;
  onDeleteGroup: (id: string) => void;
  addingInGroup: string | null;
  setAddingInGroup: (id: string | null) => void;
  onSaveNewItem: (
    groupId: string,
    data: {
      title: string;
      description: string;
      type: OutlineItemType;
      color: string;
    },
  ) => Promise<void>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group.id, data: { parentId: null, isGroup: true } });

  const [collapsed, setCollapsed] = useState(false);

  const canEdit =
    group.createdById === currentUserId ||
    myRole === 'OWNER' ||
    myRole === 'MODERATOR';

  const childIds = childItems.map((c) => c.id);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="rounded-2xl border border-[#2a2a2a] bg-[#1e1e1e] overflow-hidden"
    >
      <div className="flex items-center gap-2 px-3 py-2.5 bg-[#252525] group">
        <button
          {...attributes}
          {...listeners}
          className="p-1 text-white/80 hover:text-white/80 cursor-grab active:cursor-grabbing transition-colors shrink-0"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: group.color }}
        />

        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center gap-1.5 flex-1 min-w-0 text-left"
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5 text-white/80 shrink-0" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-white/80 shrink-0" />
          )}
          <span className="text-sm font-semibold text-white truncate">
            {group.title}
          </span>
          <span className="text-xs text-white/80 shrink-0 ml-1">
            {childItems.length} item{childItems.length !== 1 ? 's' : ''}
          </span>
        </button>

        {canEdit && (
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <Button size="sm" onClick={() => onEditGroup(group)}>
              <Pencil className="w-3 h-3" />
            </Button>
            <DeleteDialog
              itemType="group"
              itemName={group.title}
              onDelete={async () => { onDeleteGroup(group.id); }}
              trigger={
                <Button variant="destructive" size="sm" type="button">
                  <Trash2 className="w-3 h-3" />
                </Button>
              }
            />
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="p-2 space-y-2">
          <SortableContext
            items={childIds}
            strategy={verticalListSortingStrategy}
          >
            {childItems.map((item) =>
              editingItemId === item.id ? (
                <div key={item.id} className="px-1"></div>
              ) : (
                <SortableItemRow
                  key={item.id}
                  item={item}
                  currentUserId={currentUserId}
                  myRole={myRole}
                  onEdit={onEditItem}
                  onDelete={onDeleteItem}
                  compact
                />
              ),
            )}
          </SortableContext>

          {addingInGroup === group.id ? (
            <ItemForm
              onSave={(data) => onSaveNewItem(group.id, data)}
              onCancel={() => setAddingInGroup(null)}
            />
          ) : (
            <button
              onClick={() => setAddingInGroup(group.id)}
              className="w-full flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-white/80 hover:text-white/80 hover:bg-white/5 transition-colors border border-dashed border-[#2a2a2a] hover:border-white/20"
            >
              <Plus className="w-3.5 h-3.5" />
              Add item to group, or drag item in/out of group
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function HiveOutlineBoard({
  hiveId,
  initialItems,
  currentUserId,
  myRole,
}: HiveOutlineBoardProps) {
  const [items, setItems] = useState<OutlineItem[]>(initialItems);
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const [showCreate, setShowCreate] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [editingItem, setEditingItem] = useState<OutlineItem | null>(null);
  const [editingGroup, setEditingGroup] = useState<OutlineItem | null>(null);
  const [addingInGroup, setAddingInGroup] = useState<string | null>(null);

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const dragStartParentIdRef = useRef<string | null | undefined>(undefined);

  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const groups = items.filter((i) => i.type === 'GROUP');
  const ungrouped = items.filter(
    (i) => i.type !== 'GROUP' && i.parentId === null,
  );
  const activeItem = activeId
    ? (items.find((i) => i.id === activeId) ?? null)
    : null;

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    const item = itemsRef.current.find((i) => i.id === id);
    setActiveId(id);
    dragStartParentIdRef.current = item?.parentId;
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeItem = itemsRef.current.find((i) => i.id === active.id);
    if (!activeItem || activeItem.type === 'GROUP') return;

    const overId = over.id as string;
    const overItem = itemsRef.current.find((i) => i.id === overId);

    let targetParentId: string | null = null;

    if (overItem?.type === 'GROUP') {
      targetParentId = overItem.id;
    } else if (overItem) {
      targetParentId = overItem.parentId;
    }

    if (activeItem.parentId === targetParentId) return;

    setItems((prev) => {
      const next = prev.map((i) =>
        i.id === active.id ? { ...i, parentId: targetParentId } : i,
      );
      itemsRef.current = next;
      return next;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const current = itemsRef.current;
    const activeItem = current.find((i) => i.id === active.id);
    if (!activeItem) return;

    const newParentId = activeItem.parentId;
    const originalParentId = dragStartParentIdRef.current;

    if (activeItem.type === 'GROUP') {
      const topLevel = current.filter(
        (i) => i.type === 'GROUP' || i.parentId === null,
      );
      const oldIdx = topLevel.findIndex((i) => i.id === active.id);
      const newIdx = topLevel.findIndex((i) => i.id === over.id);
      if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return;

      const reordered = arrayMove(topLevel, oldIdx, newIdx);
      setItems((prev) => {
        const grouped = prev.filter(
          (i) => i.type !== 'GROUP' && i.parentId !== null,
        );
        return [...reordered, ...grouped];
      });

      startTransition(async () => {
        await reorderOutlineItemsAction(
          hiveId,
          reordered.map((i) => i.id),
        );
      });
      return;
    }

    const container = current.filter(
      (i) => i.type !== 'GROUP' && i.parentId === newParentId,
    );
    const oldIdx = container.findIndex((i) => i.id === active.id);
    const overInContainer = container.findIndex((i) => i.id === over.id);

    const reordered =
      overInContainer !== -1
        ? arrayMove(container, oldIdx, overInContainer)
        : container;

    setItems((prev) => {
      const others = prev.filter(
        (i) => !(i.type !== 'GROUP' && i.parentId === newParentId),
      );
      return [...others, ...reordered];
    });

    const parentChanged = newParentId !== originalParentId;

    startTransition(async () => {
      const ops: Promise<unknown>[] = [
        reorderOutlineItemsAction(
          hiveId,
          reordered.map((i) => i.id),
        ),
      ];
      if (parentChanged) {
        ops.push(moveItemToGroupAction(hiveId, activeItem.id, newParentId));
      }
      await Promise.all(ops);
    });
  };

  const handleCreateItem = async (data: {
    title: string;
    description: string;
    type: OutlineItemType;
    color: string;
  }) => {
    const result = await createOutlineItemAction(
      hiveId,
      data.title,
      data.description,
      data.type,
      data.color,
    );
    if (result.success) {
      setShowCreate(false);
      startTransition(async () => {
        const fresh = await getOutlineItemsAction(hiveId);
        setItems(fresh);
      });
    }
  };

  const handleCreateItemInGroup = async (
    groupId: string,
    data: {
      title: string;
      description: string;
      type: OutlineItemType;
      color: string;
    },
  ) => {
    const result = await createOutlineItemAction(
      hiveId,
      data.title,
      data.description,
      data.type,
      data.color,
      groupId,
    );
    if (result.success) {
      setAddingInGroup(null);
      startTransition(async () => {
        const fresh = await getOutlineItemsAction(hiveId);
        setItems(fresh);
      });
    }
  };

  const handleUpdateItem = async (data: {
    title: string;
    description: string;
    type: OutlineItemType;
    color: string;
  }) => {
    if (!editingItem) return;
    await updateOutlineItemAction(editingItem.id, data);
    setItems((prev) =>
      prev.map((i) => (i.id === editingItem.id ? { ...i, ...data } : i)),
    );
    setEditingItem(null);
  };

  const handleCreateGroup = async (name: string, color: string) => {
    const result = await createGroupAction(hiveId, name, color);
    if (result.success) {
      setShowCreateGroup(false);
      startTransition(async () => {
        const fresh = await getOutlineItemsAction(hiveId);
        setItems(fresh);
      });
    }
  };

  const handleUpdateGroup = async (name: string, color: string) => {
    if (!editingGroup) return;
    await updateOutlineItemAction(editingGroup.id, { title: name, color });
    setItems((prev) =>
      prev.map((i) =>
        i.id === editingGroup.id ? { ...i, title: name, color } : i,
      ),
    );
    setEditingGroup(null);
  };

  const handleDeleteGroup = async (id: string) => {
    const result = await deleteGroupAction(id);
    if (result.success) {
      startTransition(async () => {
        const fresh = await getOutlineItemsAction(hiveId);
        setItems(fresh);
      });
    }
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const topLevelIds = [
    ...groups.map((g) => g.id),
    ...ungrouped.map((u) => u.id),
  ];

  const totalItems = items.filter((i) => i.type !== 'GROUP').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-white/80">
          {totalItems} item{totalItems !== 1 ? 's' : ''} · {groups.length} group
          {groups.length !== 1 ? 's' : ''} · drag{' '}
          <span>
            <GripVertical className="w-3 h-3 inline-block" />
          </span>{' '}
          to reorder
        </p>
        <div className="flex items-center gap-2">
          {!showCreateGroup && !editingGroup && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCreateGroup(true)}
            >
              <FolderPlus className="w-3.5 h-3.5" />
              New Group
            </Button>
          )}
          {!showCreate && !editingItem && (
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="w-3.5 h-3.5" />
              Add Item
            </Button>
          )}
        </div>
      </div>

      {showCreateGroup && (
        <GroupForm
          onSave={handleCreateGroup}
          onCancel={() => setShowCreateGroup(false)}
        />
      )}
      {editingGroup && (
        <GroupForm
          initial={{ title: editingGroup.title, color: editingGroup.color }}
          onSave={handleUpdateGroup}
          onCancel={() => setEditingGroup(null)}
        />
      )}

      {showCreate && (
        <ItemForm
          onSave={handleCreateItem}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {items.length === 0 && !showCreate && !showCreateGroup ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-xl border-2 border-dashed border-[#FFC300]/20 bg-[#FFC300]/5 flex items-center justify-center mb-8">
            <BookOpen className="w-8 h-8 text-[#FFC300]/20" />
          </div>
          <h2 className="text-2xl font-bold text-[#FFC300] mb-2 mainFont">
            No outline items yet!
          </h2>
          <p className="text-white/80 mb-8 max-w-sm">
            Start building your story structure by adding chapters, scenes, and
            beats.
          </p>
          <Button size="lg" onClick={() => setShowCreate(true)}>
            <Plus className="w-5 h-5" />
            Add your first item
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={topLevelIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {topLevelIds.map((id) => {
                const item = items.find((i) => i.id === id);
                if (!item) return null;

                if (item.type === 'GROUP') {
                  const groupChildren = items
                    .filter((i) => i.type !== 'GROUP' && i.parentId === item.id)
                    .sort((a, b) => a.order - b.order);

                  if (editingGroup?.id === item.id) return null;

                  return (
                    <SortableGroupCard
                      key={item.id}
                      group={item}
                      currentUserId={currentUserId}
                      myRole={myRole}
                      editingItemId={editingItem?.id ?? null}
                      onEditItem={setEditingItem}
                      onDeleteItem={handleDeleteItem}
                      onEditGroup={setEditingGroup}
                      onDeleteGroup={handleDeleteGroup}
                      addingInGroup={addingInGroup}
                      setAddingInGroup={setAddingInGroup}
                      onSaveNewItem={handleCreateItemInGroup}
                    >
                      {groupChildren}
                    </SortableGroupCard>
                  );
                }

                if (editingItem?.id === item.id) {
                  return (
                    <ItemForm
                      key={item.id}
                      initial={item}
                      onSave={handleUpdateItem}
                      onCancel={() => setEditingItem(null)}
                    />
                  );
                }

                return (
                  <SortableItemRow
                    key={item.id}
                    item={item}
                    currentUserId={currentUserId}
                    myRole={myRole}
                    onEdit={setEditingItem}
                    onDelete={handleDeleteItem}
                  />
                );
              })}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeItem ? <DragGhost item={activeItem} /> : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
