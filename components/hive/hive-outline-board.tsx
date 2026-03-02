'use client';

import { useState, useTransition } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getOutlineItemsAction,
  createOutlineItemAction,
  updateOutlineItemAction,
  reorderOutlineItemsAction,
  deleteOutlineItemAction,
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
}[] = [
  {
    value: 'CHAPTER',
    label: 'Chapter',
    Icon: BookOpen,
    color: 'text-[#FFC300]',
  },
  { value: 'SCENE', label: 'Scene', Icon: Film, color: 'text-blue-400' },
  { value: 'BEAT', label: 'Beat', Icon: Zap, color: 'text-green-400' },
  { value: 'NOTE', label: 'Note', Icon: StickyNote, color: 'text-purple-400' },
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
  return ITEM_TYPES.find((t) => t.value === type) ?? ITEM_TYPES[0];
}

function InlineForm({
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
      <div className="flex gap-1.5 flex-wrap">
        {ITEM_TYPES.map(({ value, label, Icon, color: col }) => (
          <button
            key={value}
            type="button"
            onClick={() => setType(value)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
              type === value
                ? 'border-[#FFC300]/50 bg-[#FFC300]/10 text-[#FFC300]'
                : 'border-[#3a3a3a] bg-[#1e1e1e] text-white/90 hover:border-white/20'
            }`}
          >
            <Icon
              className={`w-3 h-3 ${type === value ? 'text-[#FFC300]' : col}`}
            />
            {label}
          </button>
        ))}
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
        className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/75 focus:outline-none focus:border-[#FFC300]/40 transition-all"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Optional description or notes…"
        maxLength={1000}
        rows={2}
        className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/75 focus:outline-none focus:border-[#FFC300]/40 transition-all resize-none"
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

function SortableRow({
  item,
  currentUserId,
  myRole,
  onEdit,
  onDelete,
}: {
  item: OutlineItem;
  currentUserId: string;
  myRole: HiveRole;
  onEdit: (item: OutlineItem) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const [deleting, setDeleting] = useState(false);
  const conf = typeConfig(item.type);
  const Icon = conf.Icon;

  const canEdit =
    item.createdById === currentUserId ||
    myRole === 'OWNER' ||
    myRole === 'MODERATOR';

  const handleDelete = async () => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    setDeleting(true);
    await deleteOutlineItemAction(item.id);
    onDelete(item.id);
    setDeleting(false);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-3 rounded-2xl bg-[#252525] border border-[#2a2a2a] p-3 group"
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-0.5 p-1 text-white hover:text-white/50 cursor-grab active:cursor-grabbing transition-colors shrink-0"
      >
        <GripVertical className="w-6 h-6 " />
      </button>

      <div
        className="w-3 h-3 rounded-full shrink-0 mt-1"
        style={{ backgroundColor: item.color }}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1 text-sm font-medium shrink-0 ${conf.color}`}
          >
            <Icon className="w-4 h-4" />
            {conf.label}
          </span>
          <p className="text-sm font-medium text-white truncate">
            {item.title}
          </p>
        </div>
        {item.description && (
          <p className="text-xs text-white/90 mt-0.5 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      {canEdit && (
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Button size={'sm'} onClick={() => onEdit(item)}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleting}
            variant={'destructive'}
            size={'sm'}
          >
            {deleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
          </Button>
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
  const [showCreate, setShowCreate] = useState(false);
  const [editingItem, setEditingItem] = useState<OutlineItem | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);

    startTransition(async () => {
      await reorderOutlineItemsAction(
        hiveId,
        reordered.map((i) => i.id),
      );
    });
  };

  const handleCreate = async (data: {
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

  const handleUpdate = async (data: {
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white">
          {items.length} item{items.length !== 1 ? 's' : ''}
          {' · '}drag to reorder
        </p>
        {!showCreate && !editingItem && (
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="w-3.5 h-3.5" />
            Add Item
          </Button>
        )}
      </div>

      {showCreate && (
        <InlineForm
          onSave={handleCreate}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {items.length === 0 && !showCreate ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#252525] flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-[#FFC300]/40" />
          </div>
          <p className="text-sm text-white/40">
            No outline items yet. Start building your story structure!
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {items.map((item) =>
                editingItem?.id === item.id ? (
                  <InlineForm
                    key={item.id}
                    initial={item}
                    onSave={handleUpdate}
                    onCancel={() => setEditingItem(null)}
                  />
                ) : (
                  <SortableRow
                    key={item.id}
                    item={item}
                    currentUserId={currentUserId}
                    myRole={myRole}
                    onEdit={setEditingItem}
                    onDelete={(id) =>
                      setItems((prev) => prev.filter((i) => i.id !== id))
                    }
                  />
                ),
              )}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
