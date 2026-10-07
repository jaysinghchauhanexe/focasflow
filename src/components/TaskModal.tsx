import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Category, Priority, Subtask } from '../types';
import { X, Sprout, Calendar, Clock, Briefcase, Flag, GripVertical, Trash2, Plus, RefreshCw, Archive, Link as LinkIcon, FileText, Info, Circle } from 'lucide-react';
import { CustomTimePicker } from './CustomTimePicker';
import { CustomSelect } from './CustomSelect';

export const TaskModal: React.FC = () => {
  const { isTaskModalOpen, closeTaskModal, editingTask, addTask, updateTask, selectedDate, settings } = useAppStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(45);
  const [category, setCategory] = useState<Category>('Work');
  const [priority, setPriority] = useState<Priority>('important');
  const [scheduledStart, setScheduledStart] = useState('');
  const [taskDate, setTaskDate] = useState<string>(selectedDate || new Date().toISOString().split('T')[0]);

  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [customDurationValue, setCustomDurationValue] = useState('45');

  const [renderOpen, setRenderOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const [showChecklist, setShowChecklist] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setDuration(editingTask.duration || 45);
      setCategory(editingTask.category || 'Work');
      setPriority(editingTask.priority || 'important');
      setScheduledStart(editingTask.scheduledStart || '');
      setTaskDate(editingTask.scheduledDate || selectedDate || new Date().toISOString().split('T')[0]);
      if (editingTask.subtasks && editingTask.subtasks.length > 0) {
        setShowChecklist(true);
        setSubtasks(editingTask.subtasks);
      } else {
        setShowChecklist(false);
        setSubtasks([]);
      }
    } else if (isTaskModalOpen) {
      const saved = localStorage.getItem('taskModalDraft');
      if (saved) {
        try {
          const draft = JSON.parse(saved);
          setTitle(draft.title !== undefined ? draft.title : '');
          setDescription(draft.description !== undefined ? draft.description : '');
          setDuration(draft.duration !== undefined ? draft.duration : 45);
          setCategory(draft.category !== undefined ? draft.category : 'Work');
          setPriority(draft.priority !== undefined ? draft.priority : 'important');
          setScheduledStart(draft.scheduledStart !== undefined ? draft.scheduledStart : '00:00');
          setTaskDate(draft.taskDate !== undefined ? draft.taskDate : (selectedDate || new Date().toISOString().split('T')[0]));
          setShowChecklist(draft.showChecklist !== undefined ? draft.showChecklist : false);
          setSubtasks(draft.subtasks !== undefined ? draft.subtasks : []);
          setIsCustomDuration(draft.isCustomDuration !== undefined ? draft.isCustomDuration : false);
          return;
        } catch(e) {}
      }
      setTitle('');
      setDescription('');
      setDuration(45);
      setCategory('Work');
      setPriority('important');
      setScheduledStart('00:00');
      setTaskDate(selectedDate || new Date().toISOString().split('T')[0]);
      setShowChecklist(false);
      setSubtasks([]);
      setIsCustomDuration(false);
    }
  }, [editingTask, isTaskModalOpen, selectedDate]);

  useEffect(() => {
    if (!editingTask && isTaskModalOpen) {
      const draft = { title, description, duration, category, priority, scheduledStart, taskDate, showChecklist, subtasks, isCustomDuration };
      localStorage.setItem('taskModalDraft', JSON.stringify(draft));
    }
  }, [title, description, duration, category, priority, scheduledStart, taskDate, showChecklist, subtasks, isCustomDuration, editingTask, isTaskModalOpen]);

  useEffect(() => {
    if (isTaskModalOpen) {
      setRenderOpen(true);
      setIsClosing(false);
    } else if (renderOpen) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setRenderOpen(false);
        setIsClosing(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isTaskModalOpen, renderOpen]);

  if (!renderOpen) return null;

  const calculateEndTime = () => {
    if (!scheduledStart) return null;
    const [sh, sm] = scheduledStart.split(':').map(Number);
    const totalMins = sh * 60 + sm + Number(duration);
    const eh = Math.floor(totalMins / 60) % 24;
    const em = totalMins % 60;

    const d = new Date();
    d.setHours(eh);
    d.setMinutes(em);

    const formattedH = eh % 12 || 12;
    const formattedM = em < 10 ? `0${em}` : em;
    const ampm = eh >= 12 ? 'PM' : 'AM';
    return `${formattedH}:${formattedM} ${ampm}`;
  };

  const getStartTimeFormatted = () => {
    if (!scheduledStart) return null;
    const [sh, sm] = scheduledStart.split(':').map(Number);
    const formattedH = sh % 12 || 12;
    const formattedM = sm < 10 ? `0${sm}` : sm;
    const ampm = sh >= 12 ? 'PM' : 'AM';
    return `${formattedH}:${formattedM} ${ampm}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let finalStart = scheduledStart || undefined;
    let finalEnd = undefined;

    if (finalStart) {
      const [sh, sm] = finalStart.split(':').map(Number);
      const totalMins = sh * 60 + sm + Number(duration);
      const eh = Math.floor(totalMins / 60) % 24;
      const em = totalMins % 60;
      finalEnd = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
    }

    const calculatedTimeMode = finalStart ? 'scheduled' : 'duration';
    const finalSubtasks = showChecklist ? subtasks.filter(s => s.title.trim()) : [];

    if (editingTask) {
      updateTask({
        ...editingTask,
        title,
        description,
        duration: Number(duration),
        category,
        priority,
        scheduledDate: taskDate,
        scheduledStart: finalStart,
        scheduledEnd: finalEnd,
        timeMode: calculatedTimeMode,
        flexibility: calculatedTimeMode === 'scheduled' ? 'fixed' : 'flexible',
        subtasks: finalSubtasks
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
        scheduledStart: finalStart,
        scheduledEnd: finalEnd,
        timeMode: calculatedTimeMode,
        flexibility: calculatedTimeMode === 'scheduled' ? 'fixed' : 'flexible',
        subtasks: finalSubtasks
      });
      localStorage.removeItem('taskModalDraft');
    }
  };

  const handleAddSubtask = () => {
    setSubtasks([...subtasks, { id: Date.now().toString(), title: '', completed: false }]);
  };

  const handleSubtaskChange = (id: string, value: string) => {
    setSubtasks(subtasks.map(s => s.id === id ? { ...s, title: value } : s));
  };

  const handleDeleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const handleDragStart = (index: number, e: React.DragEvent) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const newSubtasks = [...subtasks];
    const item = newSubtasks.splice(draggedIndex, 1)[0];
    newSubtasks.splice(index, 0, item);
    setDraggedIndex(index);
    setSubtasks(newSubtasks);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Build categories and priorities
  const defaultCategories: Category[] = ['Health', 'Work', 'Personal', 'Learning', 'Neutral'];
  const deletedCatSet = new Set((settings?.deletedCategories || []).map(c => c.toLowerCase()));
  const customCatLabels = (settings?.customCategories || []).map(c => c.label);
  const categories: Category[] = Array.from(new Set([...defaultCategories, ...customCatLabels]))
    .filter(c => !deletedCatSet.has(c.toLowerCase())) as Category[];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 select-none ${isClosing ? 'animate-fade-out' : 'animate-fade-in'
        }`}
      onClick={closeTaskModal}
    >
      <div
        className={`bg-card w-full max-w-[850px] rounded-3xl shadow-2xl transition-colors cursor-default flex flex-col max-h-[95vh] overflow-hidden border border-borderToken ${isClosing ? 'animate-popup-exit' : 'animate-popup-enter'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className="flex items-start justify-between p-6 sm:p-8 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-tag-healthBg text-tag-health flex items-center justify-center flex-shrink-0">
              <Sprout size={24} />
            </div>
            <div>
              <h2 className="text-[22px] font-bold text-foreground leading-tight">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h2>
              <p className="text-[13px] text-mutedText mt-0.5 font-medium">
                Capture your next step and put it on the right day.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeTaskModal}
            className="w-8 h-8 rounded-full bg-card-subtle hover:bg-card-muted text-mutedText hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 pb-6 sm:pb-8 [scrollbar-width:thin]">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-8">

            {/* LEFT COLUMN - FORM */}
            <form id="task-form" onSubmit={handleSubmit} className="space-y-6">

              {/* Title */}
              <div>
                <label className="block text-[13px] font-bold text-foreground mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Finish client authentication module"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-borderToken text-[14px] text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-mutedText/60 shadow-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[13px] font-bold text-foreground mb-1.5">
                  Description <span className="text-mutedText font-normal font-medium">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add more details, notes or checklist..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-borderToken text-[14px] text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none placeholder:text-mutedText/60 shadow-sm"
                />
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-[1fr_auto] gap-6 items-start">
                <div>
                  <label className="block text-[13px] font-bold text-foreground mb-1.5">
                    Category
                  </label>
                  <CustomSelect
                    value={category}
                    onChange={(val) => setCategory(val as Category)}
                    options={categories}
                    buttonClassName="h-[42px] bg-white text-[13px]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-foreground mb-1.5">
                    Priority
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPriority('important')}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all cursor-pointer border shadow-sm ${priority === 'important'
                          ? 'bg-tag-importantBg text-tag-important border-tag-important/30'
                          : 'bg-white text-foreground border-borderToken hover:bg-card-subtle'
                        }`}
                    >
                      <Circle size={8} fill="currentColor" className={priority === 'important' ? 'text-tag-important' : 'text-[#DC2626]'} />
                      Important
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriority('flexible')}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all cursor-pointer border shadow-sm ${priority === 'flexible'
                          ? 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
                          : 'bg-white text-foreground border-borderToken hover:bg-card-subtle'
                        }`}
                    >
                      <Circle size={8} fill="currentColor" className="text-[#D97706]" />
                      Flexible
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriority('optional')}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all cursor-pointer border shadow-sm ${priority === 'optional'
                          ? 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]'
                          : 'bg-white text-foreground border-borderToken hover:bg-card-subtle'
                        }`}
                    >
                      <Circle size={8} fill="currentColor" className="text-[#475569]" />
                      Optional
                    </button>
                  </div>
                </div>
              </div>

              {/* Date & Start Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-foreground mb-1.5">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mutedText" />
                    <input
                      type="date"
                      required
                      value={taskDate}
                      onChange={(e) => setTaskDate(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-borderToken text-[13px] font-medium text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-foreground mb-1.5">
                    Start time <span className="text-red-500">*</span>
                  </label>
                  <CustomTimePicker
                    value={scheduledStart}
                    onChange={(val) => setScheduledStart(val)}
                    placeholder="12:00 AM"
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <label className="block text-[13px] font-bold text-foreground">
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <Info size={14} className="text-mutedText" />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {[15, 30, 45, 60, 90, 120].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => {
                        setDuration(mins);
                        setIsCustomDuration(false);
                      }}
                      className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-all cursor-pointer border shadow-sm ${
                        !isCustomDuration && duration === mins
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-foreground border-borderToken hover:bg-card-subtle'
                      }`}
                    >
                      {mins === 60 ? '1h' : mins === 90 ? '1.5h' : mins === 120 ? '2h' : `${mins}m`}
                    </button>
                  ))}
                  
                  {isCustomDuration ? (
                    <div className="flex items-center gap-1.5 bg-white border border-primary rounded-xl px-2 py-1.5 shadow-sm">
                      <input
                        type="number"
                        min="1"
                        autoFocus
                        value={customDurationValue}
                        onChange={(e) => {
                          setCustomDurationValue(e.target.value);
                          setDuration(Number(e.target.value) || 0);
                        }}
                        className="w-12 text-[13px] font-medium text-center focus:outline-none"
                      />
                      <span className="text-[13px] font-medium text-foreground pr-2">m</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomDuration(true);
                        setCustomDurationValue(duration.toString());
                      }}
                      className="px-4 py-2 rounded-xl text-[13px] font-medium transition-all cursor-pointer border bg-white text-foreground border-borderToken hover:bg-card-subtle shadow-sm"
                    >
                      Custom
                    </button>
                  )}
                </div>

                {scheduledStart && (
                  <div className="mt-3 flex items-center gap-2 bg-primary-soft text-primary px-4 py-2.5 rounded-xl text-[13px] font-medium border border-borderToken">
                    <Clock size={15} />
                    <span>Ends at <strong className="font-bold">{calculateEndTime()}</strong> ({duration} minutes)</span>
                  </div>
                )}
              </div>

              {/* Checklist */}
              <div className="bg-white border border-borderToken rounded-2xl p-4 shadow-sm">
                <label className="flex items-center gap-2.5 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={showChecklist}
                    onChange={(e) => setShowChecklist(e.target.checked)}
                    className="w-4 h-4 rounded border-borderToken text-primary focus:ring-primary"
                  />
                  <span className="text-[13px] font-bold text-foreground">Add subtasks <span className="font-medium text-mutedText">(optional)</span></span>
                </label>

                {showChecklist && (
                  <div className="mt-4 space-y-2.5">
                    {subtasks.map((st, index) => (
                      <div 
                        key={st.id} 
                        className={`flex items-center gap-2 ${draggedIndex === index ? 'opacity-50' : 'opacity-100'}`}
                        draggable
                        onDragStart={(e) => handleDragStart(index, e)}
                        onDragEnter={() => handleDragEnter(index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                      >
                        <GripVertical size={14} className="text-mutedText/50 cursor-grab active:cursor-grabbing" />
                        <div className="w-4 h-4 rounded border border-borderToken flex-shrink-0" />
                        <input
                          type="text"
                          value={st.title}
                          onChange={(e) => handleSubtaskChange(st.id, e.target.value)}
                          placeholder="e.g. Write initial draft"
                          className="flex-1 bg-white border border-borderToken rounded-lg px-3 py-1.5 text-[13px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-sm"
                          autoFocus={index === subtasks.length - 1}
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteSubtask(st.id)}
                          className="p-1.5 text-mutedText hover:text-red-500 rounded-md hover:bg-card-subtle transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddSubtask}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-foreground border border-borderToken bg-white rounded-lg hover:bg-card-subtle transition-colors mt-2 shadow-sm ml-6"
                    >
                      <Plus size={14} /> Add item
                    </button>
                  </div>
                )}
              </div>
            </form>

            {/* RIGHT COLUMN - PREVIEW & OPTIONS */}
            <div className="space-y-6">

              {/* Task Preview */}
              <div>
                <h4 className="text-[14px] font-bold text-foreground mb-1">Task Preview</h4>
                <p className="text-[12px] text-mutedText mb-3">Here's how it will look in your schedule.</p>

                <div className="bg-white border border-borderToken rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start mb-3">
                    <div className="w-2 h-2 rounded-full bg-[#F97316] mt-[5px] ml-[3.5px] mr-[11.5px] flex-shrink-0" />
                    <h5 className="text-[14px] font-bold text-foreground leading-snug">
                      {title || 'Task title'}
                    </h5>
                  </div>
                  
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-[12px] font-medium text-foreground">
                      <Calendar size={15} className="text-mutedText" />
                      <span>
                        {new Date(taskDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] font-medium text-foreground">
                      <Clock size={15} className="text-mutedText" />
                      <span>
                        {scheduledStart ? `${getStartTimeFormatted()} - ${calculateEndTime()}` : 'No time set'} ({duration}m)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] font-medium text-foreground">
                      <Briefcase size={15} className="text-mutedText" />
                      <span>{category}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] font-medium text-foreground">
                      <Circle size={8} fill="currentColor" className={priority === 'important' ? 'text-tag-important' : priority === 'flexible' ? 'text-[#D97706]' : 'text-[#475569]'} />
                      <span className="capitalize">{priority}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 border-t border-borderToken flex items-center justify-end gap-3 bg-white mt-auto rounded-b-3xl">
          <button
            type="button"
            onClick={closeTaskModal}
            className="px-5 py-2.5 rounded-full text-[14px] font-semibold text-mutedText hover:text-foreground hover:bg-card-subtle transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="task-form"
            className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white text-[14px] font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} strokeWidth={3} /> {editingTask ? 'Save Changes' : 'Add to Schedule'}
          </button>
        </div>

      </div>
    </div>
  );
};
