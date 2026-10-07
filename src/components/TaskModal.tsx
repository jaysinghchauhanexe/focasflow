import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Category, Priority } from '../types';
import { X } from 'lucide-react';
import { CustomSelect } from './CustomSelect';

export const TaskModal: React.FC = () => {
  const { isTaskModalOpen, closeTaskModal, editingTask, addTask, updateTask, selectedDate, settings, addCustomPriority } = useAppStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(45);
  const [category, setCategory] = useState<Category>('Work');
  const [priority, setPriority] = useState<Priority>('important');
  const [deadline, setDeadline] = useState('');
  const [scheduledStart, setScheduledStart] = useState('');
  const [scheduledEnd, setScheduledEnd] = useState('');
  const [flexibility, setFlexibility] = useState<'flexible' | 'fixed'>('flexible');
  const [timeMode, setTimeMode] = useState<'duration' | 'scheduled'>('duration');
  const [taskDate, setTaskDate] = useState<string>(selectedDate || new Date().toISOString().split('T')[0]);

  const [customPriorityInput, setCustomPriorityInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setDuration(editingTask.duration || 45);
      setCategory(editingTask.category || 'Work');
      setPriority(editingTask.priority || 'important');
      setDeadline(editingTask.deadline || '');
      setScheduledStart(editingTask.scheduledStart || '');
      setScheduledEnd(editingTask.scheduledEnd || '');
      setFlexibility(editingTask.flexibility || 'flexible');
      setTimeMode(editingTask.scheduledStart ? 'scheduled' : (editingTask.timeMode || 'duration'));
      setTaskDate(editingTask.scheduledDate || selectedDate || new Date().toISOString().split('T')[0]);
    } else {
      setTitle('');
      setDescription('');
      setDuration(45);
      setCategory('Work');
      setPriority('important');
      setDeadline('');
      setScheduledStart('');
      setScheduledEnd('');
      setFlexibility('flexible');
      setTimeMode('duration');
      setTaskDate(selectedDate || new Date().toISOString().split('T')[0]);
    }
    setShowCustomInput(false);
    setCustomPriorityInput('');
  }, [editingTask, isTaskModalOpen, selectedDate]);

  if (!isTaskModalOpen) return null;

  // Calculate live estimated completion time from now
  const getEstimatedCompletionTime = (mins: number) => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + mins);
    const h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedH = h % 12 || 12;
    const formattedM = m < 10 ? `0${m}` : m;
    return `${formattedH}:${formattedM} ${ampm}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let finalStart = scheduledStart || undefined;
    let finalEnd = scheduledEnd || undefined;
    if (timeMode === 'duration') {
      finalStart = undefined;
      finalEnd = undefined;
    } else if (finalStart && !finalEnd) {
      // Calculate end time from start + duration
      const [sh, sm] = finalStart.split(':').map(Number);
      const totalMins = sh * 60 + sm + Number(duration);
      const eh = Math.floor(totalMins / 60) % 24;
      const em = totalMins % 60;
      finalEnd = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
    }

    if (editingTask) {
      updateTask({
        ...editingTask,
        title,
        description,
        duration: Number(duration),
        category,
        priority,
        scheduledDate: taskDate,
        deadline: deadline || undefined,
        scheduledStart: finalStart,
        scheduledEnd: finalEnd,
        timeMode,
        flexibility: timeMode === 'scheduled' ? flexibility : 'flexible',
      });
    } else {
      addTask({
        title,
        description,
        duration: Number(duration),
        category,
        priority,
        status: 'pending',
        scheduledDate: taskDate,
        deadline: deadline || undefined,
        scheduledStart: finalStart,
        scheduledEnd: finalEnd,
        timeMode,
        flexibility: timeMode === 'scheduled' ? flexibility : 'flexible',
      });
    }
  };

  const saveCustomPriority = (newTag: string) => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    const prioKey = trimmed.toLowerCase().replace(/\s+/g, '-');
    addCustomPriority({
      id: prioKey,
      label: trimmed,
      dotColor: '#0EA5E9',
    });
    setPriority(prioKey);
    setCustomPriorityInput('');
    setShowCustomInput(false);
  };

  const defaultCategories: Category[] = ['Health', 'Work', 'Personal', 'Learning', 'Neutral'];
  const deletedCatSet = new Set((settings?.deletedCategories || []).map(c => c.toLowerCase()));
  const customCatLabels = (settings?.customCategories || []).map(c => c.label);
  const categories: Category[] = Array.from(new Set([...defaultCategories, ...customCatLabels]))
    .filter(c => !deletedCatSet.has(c.toLowerCase())) as Category[];

  const defaultPriorities: {
    id: Priority;
    label: string;
    desc: string;
    activeClass: string;
    inactiveClass: string;
    dotClass: string;
    textClass: string;
  }[] = [
    {
      id: 'important',
      label: 'Important',
      desc: 'Must / should happen today',
      activeClass: 'bg-[#F97316]/15 border-[#F97316]/30',
      inactiveClass: 'bg-[#F97316]/[0.03] border-[#F97316]/10 hover:border-[#F97316]/20 hover:bg-[#F97316]/[0.07]',
      dotClass: 'bg-[#F97316]',
      textClass: 'text-[#EA580C] dark:text-[#FB923C]',
    },
    {
      id: 'regular',
      label: 'Regular',
      desc: 'Standard daily priority',
      activeClass: 'bg-[#D97706]/15 border-[#D97706]/30',
      inactiveClass: 'bg-[#D97706]/[0.03] border-[#D97706]/10 hover:border-[#D97706]/20 hover:bg-[#D97706]/[0.07]',
      dotClass: 'bg-[#D97706]',
      textClass: 'text-[#D97706]',
    },
    {
      id: 'optional',
      label: 'Optional',
      desc: 'Only if extra time permits',
      activeClass: 'bg-[#64748B]/15 border-[#64748B]/30',
      inactiveClass: 'bg-[#64748B]/[0.03] border-[#64748B]/10 hover:border-[#64748B]/20 hover:bg-[#64748B]/[0.07]',
      dotClass: 'bg-[#64748B]',
      textClass: 'text-[#475569] dark:text-[#94A3B8]',
    },
  ];

  const customPrioritiesList = (settings?.customPriorities || []).filter(
    (cp) => !['important', 'regular', 'flexible', 'optional'].includes(cp.id.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-fade-in select-none"
      onClick={closeTaskModal}
    >
      <div 
        className="bg-card w-full max-w-lg rounded-[28px] shadow-2xl p-6 sm:p-7 transition-colors cursor-default border border-borderToken"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-borderToken">
          <h3 className="text-[20px] font-serif font-medium text-foreground">
            {editingTask ? 'Edit Outcome' : 'Add New Outcome'}
          </h3>
          <button
            type="button"
            onClick={closeTaskModal}
            className="w-8 h-8 rounded-full bg-card-subtle hover:bg-card-muted text-mutedText hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={17} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-[12px] font-semibold text-mutedText uppercase tracking-wider mb-1.5">
              Outcome Title
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Finish client authentication module"
              className="w-full px-4 py-2.5 rounded-2xl bg-card-subtle border border-borderToken text-[14px] text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          {/* Date & Category Grid */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[12px] font-semibold text-mutedText uppercase tracking-wider mb-1.5">
                Target Date
              </label>
              <input
                type="date"
                value={taskDate}
                onChange={(e) => setTaskDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-2xl bg-card-subtle border border-borderToken text-[13px] text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-mutedText uppercase tracking-wider mb-1.5">
                Category
              </label>
              <CustomSelect
                value={category}
                onChange={(val) => setCategory(val as Category)}
                options={categories}
              />
            </div>
          </div>

          {/* Time Preference: Estimated Duration vs Scheduled Time Window */}
          <div className="p-3.5 rounded-2xl bg-card-subtle border border-borderToken space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-[12px] font-semibold text-mutedText uppercase tracking-wider">
                Timing & Schedule Mode
              </label>
              <div className="flex items-center bg-card p-0.5 rounded-xl border border-borderToken">
                <button
                  type="button"
                  onClick={() => setTimeMode('duration')}
                  className={`px-3 py-1 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
                    timeMode === 'duration'
                      ? 'bg-primary text-white font-semibold shadow-xs'
                      : 'text-mutedText hover:text-foreground'
                  }`}
                >
                  ⏱️ Estimated Duration
                </button>
                <button
                  type="button"
                  onClick={() => setTimeMode('scheduled')}
                  className={`px-3 py-1 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
                    timeMode === 'scheduled'
                      ? 'bg-primary text-white font-semibold shadow-xs'
                      : 'text-mutedText hover:text-foreground'
                  }`}
                >
                  🗓️ Scheduled Time
                </button>
              </div>
            </div>

            {timeMode === 'duration' ? (
              <div className="space-y-2 animate-fade-in">
                <div className="flex items-center gap-1.5">
                  {[15, 30, 45, 60, 90, 120].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDuration(mins)}
                      className={`flex-1 py-1.5 rounded-xl text-[12px] font-medium transition-all cursor-pointer ${
                        duration === mins
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-card text-textSecondary hover:bg-card-muted border border-borderToken'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
                {/* Live Estimated Completion Hint */}
                <div className="flex items-center justify-between text-[11.5px] text-mutedText px-1 pt-1">
                  <span>Flexible focus block ({duration}m)</span>
                  <span className="text-primary font-medium">
                    ✨ Finishes by ~{getEstimatedCompletionTime(duration)} if started now
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-1 animate-fade-in">
                <div>
                  <label className="block text-[11px] font-medium text-mutedText mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required={timeMode === 'scheduled'}
                    value={scheduledStart}
                    onChange={(e) => setScheduledStart(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-card border border-borderToken text-[13px] text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-mutedText mb-1">
                    End Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={scheduledEnd}
                    onChange={(e) => setScheduledEnd(e.target.value)}
                    placeholder="Auto from duration"
                    className="w-full px-3 py-1.5 rounded-xl bg-card border border-borderToken text-[13px] text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Priority Level */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[12px] font-semibold text-mutedText uppercase tracking-wider">
                Priority Level
              </label>
              {!showCustomInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="text-[11.5px] font-medium text-primary hover:underline cursor-pointer"
                >
                  + Add Custom Tag
                </button>
              ) : null}
            </div>

            {/* Custom Priority Input */}
            {showCustomInput && (
              <div className="flex items-center gap-2 mb-2.5 animate-fade-in">
                <input
                  type="text"
                  value={customPriorityInput}
                  onChange={(e) => setCustomPriorityInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      saveCustomPriority(customPriorityInput);
                    }
                  }}
                  placeholder="Enter custom priority tag..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-card-subtle border border-borderToken text-[13px] text-foreground focus:outline-none focus:border-primary"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => saveCustomPriority(customPriorityInput)}
                  className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors cursor-pointer"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomPriorityInput('');
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-card-subtle text-mutedText hover:text-foreground text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* 3 Default Priority Cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
              {defaultPriorities.map((p) => {
                const isSelected = priority === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id)}
                    className={`p-2.5 sm:p-3 rounded-2xl text-left border transition-all cursor-pointer relative overflow-hidden shadow-none outline-none ${
                      isSelected ? p.activeClass : p.inactiveClass
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${p.dotClass}`} />
                      <span className={`text-[12.5px] sm:text-[13px] font-semibold ${isSelected ? p.textClass : 'text-foreground'}`}>
                        {p.label}
                      </span>
                    </div>
                    <span className={`block text-[10.5px] sm:text-[11px] pl-3.5 leading-tight ${isSelected ? p.textClass + ' opacity-90' : 'text-mutedText'}`}>
                      {p.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Created Priority Badges if any exist */}
            {customPrioritiesList.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mt-2.5 pt-2 border-t border-borderToken/50">
                <span className="text-[11px] text-mutedText font-medium">Custom tags:</span>
                {customPrioritiesList.map((cp) => {
                  const isSel = priority === cp.id || priority === cp.label;
                  return (
                    <button
                      key={cp.id}
                      type="button"
                      onClick={() => setPriority(cp.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11.5px] font-medium transition-all cursor-pointer border ${
                        isSel
                          ? 'bg-primary-soft text-primary border-primary font-semibold'
                          : 'bg-card-subtle text-textSecondary border-borderToken hover:text-foreground'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: cp.dotColor || '#0EA5E9' }} />
                      <span>{cp.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[12px] font-semibold text-mutedText uppercase tracking-wider mb-1.5">
              Notes / Sub-steps (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional context or outcome checklist..."
              className="w-full px-4 py-2 rounded-2xl bg-card-subtle border border-borderToken text-[13px] text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-borderToken">
            <button
              type="button"
              onClick={closeTaskModal}
              className="px-4 py-2 rounded-2xl text-[13px] font-medium text-mutedText hover:text-foreground hover:bg-card-subtle"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary-hover text-white text-[13px] font-semibold transition-all shadow-xs"
            >
              {editingTask ? 'Save Changes' : 'Add to Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
