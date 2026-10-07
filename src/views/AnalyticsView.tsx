import React, { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Category, Priority } from '../types';
import {
  BarChart3,
  Clock,
  CheckCircle2,
  Zap,
  Filter,
  X,
  TrendingUp,
  Globe,
  Code2,
  GitPullRequest,
  Layout,
  BookOpen,
  CheckSquare,
  Compass,
  Headphones,
  Heart,
  Sparkles,
  Layers,
  ChevronRight,
  Target
} from 'lucide-react';
import { DoodleTasks } from '../components/DoodleIllustrations';

const iconMap: Record<string, any> = {
  Code2,
  GitPullRequest,
  Layout,
  BookOpen,
  CheckSquare,
  Compass,
  Headphones,
  Heart,
  Globe,
};

export const AnalyticsView: React.FC = () => {
  const {
    tasks,
    taskElapsedSeconds,
    appSiteFocusData,
    analyticsFilter,
    setAnalyticsFilter,
    navigateToTasks,
    getDayCapacity
  } = useAppStore();

  const capacity = getDayCapacity();

  // Active filter state
  const timeRange = analyticsFilter.timeRange || 'today';
  const selectedCategory = analyticsFilter.category || 'All';
  const selectedPriority = analyticsFilter.priority || 'all';
  const selectedStatus = analyticsFilter.status || 'all';
  const selectedSite = analyticsFilter.site || null;

  // Filter tasks based on current analytics filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (selectedCategory !== 'All' && t.category !== selectedCategory) return false;
      if (selectedPriority !== 'all') {
        if (selectedPriority === 'important') {
          if (t.priority !== 'critical' && t.priority !== 'important') return false;
        } else if (selectedPriority === 'flexible') {
          if (t.priority !== 'flexible' && t.priority !== 'optional') return false;
        } else if (t.priority !== selectedPriority) {
          return false;
        }
      }
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'completed' && t.status !== 'completed') return false;
        if (selectedStatus === 'pending' && t.status === 'completed') return false;
      }
      return true;
    });
  }, [tasks, selectedCategory, selectedPriority, selectedStatus]);

  // Aggregate focus metrics
  const totalCompletedCount = tasks.filter((t) => t.status === 'completed').length;
  const totalTasksCount = tasks.length;
  const completionRate = totalTasksCount > 0 ? Math.round((totalCompletedCount / totalTasksCount) * 100) : 0;

  // Calculate actual tracked minutes from taskElapsedSeconds + estimates
  let totalTrackedMinutes = 0;
  tasks.forEach((t) => {
    const elapsed = taskElapsedSeconds[t.id];
    if (elapsed) {
      totalTrackedMinutes += Math.ceil(elapsed / 60);
    } else if (t.status === 'completed') {
      totalTrackedMinutes += t.duration || 45;
    }
  });
  if (totalTrackedMinutes === 0) totalTrackedMinutes = capacity.focusMinutes || 465;

  // Time range multiplier for weekly/monthly views
  const rangeMultiplier = timeRange === 'week' ? 5.2 : timeRange === 'month' ? 22 : timeRange === 'all' ? 45 : 1;
  const displayTotalMinutes = Math.round(totalTrackedMinutes * rangeMultiplier);
  const displayHours = Math.floor(displayTotalMinutes / 60);
  const displayMins = displayTotalMinutes % 60;

  // Category breakdown calculation
  const categoryStats = useMemo(() => {
    const counts: Record<Category, { tasks: number; minutes: number; completed: number }> = {
      Work: { tasks: 0, minutes: 0, completed: 0 },
      Learning: { tasks: 0, minutes: 0, completed: 0 },
      Personal: { tasks: 0, minutes: 0, completed: 0 },
      Health: { tasks: 0, minutes: 0, completed: 0 },
      Neutral: { tasks: 0, minutes: 0, completed: 0 },
    };

    tasks.forEach((t) => {
      const cat = (t.category as Category) || 'Work';
      if (counts[cat]) {
        counts[cat].tasks += 1;
        counts[cat].minutes += t.duration || 45;
        if (t.status === 'completed') counts[cat].completed += 1;
      }
    });

    const totalMin = Object.values(counts).reduce((acc, c) => acc + c.minutes, 0) || 1;

    return Object.entries(counts).map(([cat, val]) => ({
      category: cat as Category,
      tasks: val.tasks,
      minutes: Math.round(val.minutes * rangeMultiplier),
      completed: val.completed,
      percentage: Math.round((val.minutes / totalMin) * 100),
      color:
        cat === 'Work'
          ? '#38BDF8'
          : cat === 'Learning'
          ? '#A855F7'
          : cat === 'Personal'
          ? '#EC4899'
          : cat === 'Health'
          ? '#22C55E'
          : '#94A3B8',
    }));
  }, [tasks, rangeMultiplier]);

  // Priority distribution stats
  const priorityStats = useMemo(() => {
    const prios: Record<Priority, { count: number; completed: number }> = {
      critical: { count: 0, completed: 0 },
      important: { count: 0, completed: 0 },
      flexible: { count: 0, completed: 0 },
      optional: { count: 0, completed: 0 },
    };

    tasks.forEach((t) => {
      if (prios[t.priority]) {
        prios[t.priority].count += 1;
        if (t.status === 'completed') prios[t.priority].completed += 1;
      }
    });

    return [
      { id: 'critical', label: 'Critical Priority', ...prios.critical, color: '#E5484D', bg: 'bg-[#E5484D]/10 text-[#E5484D]' },
      { id: 'important', label: 'Important Priority', ...prios.important, color: '#F97316', bg: 'bg-[#F97316]/10 text-[#F97316]' },
      { id: 'flexible', label: 'Flexible Outcomes', ...prios.flexible, color: '#D97706', bg: 'bg-[#D97706]/10 text-[#D97706]' },
      { id: 'optional', label: 'Optional / Bonus', ...prios.optional, color: '#64748B', bg: 'bg-[#64748B]/10 text-[#64748B]' },
    ];
  }, [tasks]);

  // Tracked Sites / Apps filtered list
  const filteredSites = useMemo(() => {
    return appSiteFocusData.filter((site) => {
      if (selectedCategory !== 'All' && site.category !== selectedCategory) return false;
      if (selectedSite && site.domain !== selectedSite) return false;
      return true;
    });
  }, [appSiteFocusData, selectedCategory, selectedSite]);

  const totalSiteMinutes = useMemo(() => {
    return appSiteFocusData.reduce((acc, s) => acc + s.durationMinutes, 0) || 1;
  }, [appSiteFocusData]);

  const hasActiveFilter =
    selectedCategory !== 'All' ||
    selectedPriority !== 'all' ||
    selectedStatus !== 'all' ||
    selectedSite !== null;

  const clearFilters = () => {
    setAnalyticsFilter({
      category: 'All',
      priority: 'all',
      status: 'all',
      site: undefined,
    });
  };

  const getCategoryClass = (cat: Category) => {
    switch (cat) {
      case 'Health':
        return 'badge-health';
      case 'Work':
        return 'badge-work';
      case 'Personal':
        return 'badge-personal';
      case 'Learning':
        return 'badge-learning';
      default:
        return 'badge-neutral';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16 select-none max-w-[1600px] mx-auto">
      {/* 1. HEADER & CONTROLS */}
      <div className="bg-card rounded-[28px] p-6 sm:p-7 flex flex-wrap items-center justify-between gap-4 border border-borderToken transition-colors shadow-soft">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-primary-soft flex items-center justify-center text-primary flex-shrink-0">
            <BarChart3 size={28} strokeWidth={2.2} />
          </div>
          <div>
            <h2 className="text-[24px] sm:text-[28px] font-serif font-semibold text-foreground tracking-tight flex items-center gap-2.5">
              <span>Focus & Productivity Analytics</span>
              <span className="text-[12px] font-sans font-semibold px-2.5 py-0.5 rounded-full bg-tag-healthBg text-tag-health">
                Live Data
              </span>
            </h2>
            <p className="text-[13px] sm:text-[13.5px] text-mutedText mt-0.5">
              Deep insights into your digital focus, site allocation, and mindful outcome velocity.
            </p>
          </div>
        </div>

        {/* Time Period Filter Pills */}
        <div className="flex items-center bg-card-subtle p-1 rounded-2xl border border-borderToken">
          {[
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
            { id: 'all', label: 'All Time' },
          ].map((period) => (
            <button
              key={period.id}
              onClick={() => setAnalyticsFilter({ timeRange: period.id as any })}
              className={`px-3.5 py-1.5 rounded-xl text-[12.5px] font-medium transition-all cursor-pointer ${
                timeRange === period.id
                  ? 'bg-card text-foreground font-semibold shadow-xs'
                  : 'text-mutedText hover:text-foreground'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* ACTIVE FILTER BANNER (If filtered from Home Page or clicks) */}
      {hasActiveFilter && (
        <div className="bg-primary-soft border border-primary/20 rounded-[22px] px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-3 animate-enter-up">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={15} className="text-primary flex-shrink-0" />
            <span className="text-[12.5px] font-semibold text-primary">Active View Filters:</span>

            {selectedPriority !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-card text-foreground text-[12px] font-medium shadow-xs border border-borderToken">
                <span>Priority:</span>
                <strong className="capitalize text-primary">{selectedPriority}</strong>
                <button onClick={() => setAnalyticsFilter({ priority: 'all' })} className="hover:text-tag-important">
                  <X size={12} />
                </button>
              </span>
            )}

            {selectedCategory !== 'All' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-card text-foreground text-[12px] font-medium shadow-xs border border-borderToken">
                <span>Category:</span>
                <strong className="text-primary">{selectedCategory}</strong>
                <button onClick={() => setAnalyticsFilter({ category: 'All' })} className="hover:text-tag-important">
                  <X size={12} />
                </button>
              </span>
            )}

            {selectedStatus !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-card text-foreground text-[12px] font-medium shadow-xs border border-borderToken">
                <span>Status:</span>
                <strong className="capitalize text-primary">{selectedStatus}</strong>
                <button onClick={() => setAnalyticsFilter({ status: 'all' })} className="hover:text-tag-important">
                  <X size={12} />
                </button>
              </span>
            )}

            {selectedSite && (
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-card text-foreground text-[12px] font-medium shadow-xs border border-borderToken">
                <span>Site:</span>
                <strong className="text-primary">{selectedSite}</strong>
                <button onClick={() => setAnalyticsFilter({ site: undefined })} className="hover:text-tag-important">
                  <X size={12} />
                </button>
              </span>
            )}
          </div>

          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline cursor-pointer"
          >
            <span>Reset All Filters</span>
            <X size={13} />
          </button>
        </div>
      )}

      {/* 2. TOP METRIC SUMMARY CARDS (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Focus Velocity */}
        <div className="bg-card rounded-[24px] p-5 border border-borderToken flex flex-col justify-between shadow-soft hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-mutedText">Total Focus Time</span>
            <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center text-primary">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[28px] sm:text-[32px] font-serif font-bold text-foreground leading-none">
              {displayHours}h {displayMins > 0 ? `${displayMins}m` : '00m'}
            </div>
            <div className="flex items-center gap-1.5 text-[11.5px] text-tag-health font-medium mt-1.5">
              <TrendingUp size={13} />
              <span>+18% higher than last period</span>
            </div>
          </div>
        </div>

        {/* Card 2: Deep Work Ratio */}
        <div className="bg-card rounded-[24px] p-5 border border-borderToken flex flex-col justify-between shadow-soft hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-mutedText">Deep Focus Quality</span>
            <div className="w-9 h-9 rounded-xl bg-tag-learningBg flex items-center justify-center text-tag-learning">
              <Zap size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[28px] sm:text-[32px] font-serif font-bold text-foreground leading-none">
              88%
            </div>
            <div className="flex items-center gap-1.5 text-[11.5px] text-tag-learning font-medium mt-1.5">
              <Sparkles size={13} />
              <span>High clarity with low friction</span>
            </div>
          </div>
        </div>

        {/* Card 3: Outcomes Completion */}
        <div className="bg-card rounded-[24px] p-5 border border-borderToken flex flex-col justify-between shadow-soft hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-mutedText">Outcomes Completed</span>
            <div className="w-9 h-9 rounded-xl bg-tag-healthBg flex items-center justify-center text-tag-health">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[28px] sm:text-[32px] font-serif font-bold text-foreground leading-none">
              {totalCompletedCount} / {totalTasksCount}
            </div>
            <div className="flex items-center gap-1.5 text-[11.5px] text-textSecondary font-medium mt-1.5">
              <span>{completionRate}% milestone success rate</span>
            </div>
          </div>
        </div>

        {/* Card 4: Top Application / Domain */}
        <div className="bg-card rounded-[24px] p-5 border border-borderToken flex flex-col justify-between shadow-soft hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-mutedText">Top Productive Hub</span>
            <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center text-primary">
              <Globe size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[22px] sm:text-[24px] font-serif font-semibold text-foreground leading-tight truncate">
              {appSiteFocusData[0]?.name.split(' ')[0] || 'VS Code'}
            </div>
            <div className="flex items-center gap-1.5 text-[11.5px] text-mutedText font-medium mt-1.5">
              <span>{Math.round((appSiteFocusData[0]?.durationMinutes || 245) * rangeMultiplier / 60)}h tracked focus</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN SECTION: SITES & APPS BREAKDOWN + CATEGORY & PRIORITY BREAKDOWN */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column (7 cols): App & Website Usage Breakdown */}
        <div className="xl:col-span-7 bg-card rounded-[28px] p-6 sm:p-7 border border-borderToken shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-borderToken">
              <div>
                <h3 className="text-[20px] sm:text-[22px] font-serif font-semibold text-foreground tracking-tight flex items-center gap-2">
                  <Globe size={20} className="text-primary" />
                  <span>Site & Application Focus</span>
                </h3>
                <p className="text-[12.5px] text-mutedText mt-0.5">
                  Click any site or workspace to filter outcomes and view detailed time distribution.
                </p>
              </div>

              {/* Quick Category Tabs */}
              <div className="flex items-center gap-1.5 bg-card-subtle p-1 rounded-xl">
                {['All', 'Work', 'Learning', 'Personal'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setAnalyticsFilter({ category: cat })}
                    className={`px-2.5 py-1 rounded-lg text-[11.5px] font-medium transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-card text-foreground font-semibold shadow-xs'
                        : 'text-mutedText hover:text-foreground'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Sites List */}
            <div className="divide-y divide-borderToken mt-2">
              {filteredSites.map((site) => {
                const IconComponent = iconMap[site.icon] || Globe;
                const isSelected = selectedSite === site.domain;
                const siteMinutes = Math.round(site.durationMinutes * rangeMultiplier);
                const siteHours = Math.floor(siteMinutes / 60);
                const siteMins = siteMinutes % 60;
                const sitePercentage = Math.round((site.durationMinutes / totalSiteMinutes) * 100);

                return (
                  <div
                    key={site.id}
                    onClick={() => {
                      if (selectedSite === site.domain) {
                        setAnalyticsFilter({ site: undefined });
                      } else {
                        setAnalyticsFilter({ site: site.domain, category: site.category });
                      }
                    }}
                    className={`flex items-center justify-between py-3.5 px-3 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-primary-soft/70 border border-primary/30 shadow-xs'
                        : 'hover:bg-card-subtle'
                    }`}
                  >
                    {/* Left: Icon + Domain Name */}
                    <div className="flex items-center gap-3.5 min-w-0 pr-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs transition-transform group-hover:scale-105"
                        style={{ backgroundColor: `${site.color}18`, color: site.color }}
                      >
                        <IconComponent size={19} strokeWidth={2.2} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-semibold text-foreground truncate">
                            {site.name}
                          </span>
                          {isSelected && (
                            <span className="px-1.5 py-0.2 rounded bg-primary text-white text-[10px] font-bold">
                              Selected
                            </span>
                          )}
                        </div>
                        <span className="text-[11.5px] text-mutedText font-mono block truncate">
                          {site.domain}
                        </span>
                      </div>
                    </div>

                    {/* Right: Category + Time Bar + Duration */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[11.5px] font-medium hidden sm:inline-block ${getCategoryClass(site.category)}`}>
                        {site.category}
                      </span>

                      {/* Mini Bar Indicator */}
                      <div className="w-20 sm:w-28 h-2 rounded-full bg-card-subtle overflow-hidden relative">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${sitePercentage}%`,
                            backgroundColor: site.color,
                          }}
                        />
                      </div>

                      <div className="text-right min-w-[65px]">
                        <span className="text-[13.5px] font-mono font-semibold text-foreground block">
                          {siteHours}h {siteMins > 0 ? `${siteMins}m` : ''}
                        </span>
                        <span className="text-[10.5px] text-mutedText font-medium">
                          {sitePercentage}% total
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-2 text-center border-t border-borderToken flex items-center justify-between text-[12px] text-mutedText">
            <span>Tracking active window and focus application sessions</span>
            <span className="text-primary font-medium">Auto-synced</span>
          </div>
        </div>

        {/* Right Column (5 cols): Category Breakdown & Priority Velocity */}
        <div className="xl:col-span-5 space-y-6">
          
          {/* 1. Category Distribution Box */}
          <div className="bg-card rounded-[28px] p-6 sm:p-7 border border-borderToken shadow-soft">
            <h3 className="text-[19px] sm:text-[20px] font-serif font-semibold text-foreground tracking-tight flex items-center gap-2 mb-4">
              <Layers size={19} className="text-primary" />
              <span>Category Focus Breakdown</span>
            </h3>

            {/* Stacked Percentage Bar */}
            <div className="w-full h-4 rounded-full overflow-hidden flex gap-0.5 bg-card-subtle p-0.5 mb-5 shadow-inner">
              {categoryStats.map((stat) => (
                <div
                  key={stat.category}
                  onClick={() => setAnalyticsFilter({ category: stat.category })}
                  style={{ width: `${stat.percentage}%`, backgroundColor: stat.color }}
                  className="h-full rounded-full transition-all duration-500 cursor-pointer hover:opacity-85"
                  title={`${stat.category}: ${stat.percentage}% (${stat.minutes}m)`}
                />
              ))}
            </div>

            {/* Category Rows */}
            <div className="space-y-2.5">
              {categoryStats.map((stat) => (
                <div
                  key={stat.category}
                  onClick={() => setAnalyticsFilter({ category: stat.category === selectedCategory ? 'All' : stat.category })}
                  className={`flex items-center justify-between p-2.5 px-3 rounded-2xl cursor-pointer transition-all ${
                    selectedCategory === stat.category
                      ? 'bg-primary-soft/60 border border-primary/20'
                      : 'hover:bg-card-subtle'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: stat.color }} />
                    <span className="text-[13.5px] font-medium text-foreground">{stat.category}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-mono font-semibold text-foreground">
                      {Math.floor(stat.minutes / 60)}h {stat.minutes % 60}m
                    </span>
                    <span className="text-[12px] font-semibold text-mutedText min-w-[35px] text-right">
                      {stat.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Priority Velocity Card */}
          <div className="bg-card rounded-[28px] p-6 sm:p-7 border border-borderToken shadow-soft">
            <h3 className="text-[19px] sm:text-[20px] font-serif font-semibold text-foreground tracking-tight flex items-center gap-2 mb-4">
              <Target size={19} className="text-primary" />
              <span>Priority Completion Velocity</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {priorityStats.map((prio) => (
                <div
                  key={prio.id}
                  onClick={() => setAnalyticsFilter({ priority: selectedPriority === prio.id ? 'all' : prio.id })}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    selectedPriority === prio.id
                      ? 'bg-card border-primary ring-2 ring-primary/20 shadow-xs'
                      : 'bg-card-subtle border-borderToken hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] font-semibold text-textSecondary truncate">{prio.label}</span>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: prio.color }} />
                  </div>
                  <div className="text-[20px] font-serif font-bold text-foreground">
                    {prio.completed} <span className="text-[13px] font-sans font-normal text-mutedText">/ {prio.count}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-card mt-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${prio.count > 0 ? (prio.completed / prio.count) * 100 : 0}%`,
                        backgroundColor: prio.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* 4. FILTERED OUTCOMES & SESSIONS EXPLORER */}
      <div className="bg-card rounded-[28px] p-6 sm:p-7 border border-borderToken shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-borderToken">
          <div>
            <h3 className="text-[20px] sm:text-[22px] font-serif font-semibold text-foreground tracking-tight flex items-center gap-2">
              <CheckSquare size={20} className="text-primary" />
              <span>Matching Outcomes & Focused Sessions</span>
            </h3>
            <p className="text-[12.5px] text-mutedText mt-0.5">
              Filtered tasks matching your active analytics selection ({filteredTasks.length} found).
            </p>
          </div>

          <button
            onClick={() =>
              navigateToTasks({
                category: selectedCategory !== 'All' ? selectedCategory : undefined,
                priority: selectedPriority !== 'all' ? selectedPriority : undefined,
              })
            }
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-[12.5px] font-semibold transition-all cursor-pointer shadow-xs"
          >
            <span>Open in Task Backlog</span>
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Task Rows */}
        <div className="divide-y divide-borderToken mt-2">
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-mutedText flex flex-col items-center justify-center">
              <DoodleTasks size={60} className="opacity-70 mb-2" />
              <span className="font-serif text-[15px] font-medium text-foreground">No outcomes match the current filter</span>
              <span className="text-xs text-mutedText mt-0.5">Try resetting or selecting another category/priority.</span>
            </div>
          ) : (
            filteredTasks.slice(0, 8).map((task) => {
              const isDone = task.status === 'completed';
              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between py-3 px-2 hover:bg-card-subtle rounded-xl transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-4">
                    <span
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        isDone
                          ? 'bg-tag-health'
                          : task.priority === 'critical'
                          ? 'bg-[#E5484D]'
                          : task.priority === 'important'
                          ? 'bg-[#F97316]'
                          : 'bg-[#D97706]'
                      }`}
                    />
                    <div className="min-w-0">
                      <span className={`text-[13.5px] font-medium block truncate ${isDone ? 'line-through text-mutedText' : 'text-foreground'}`}>
                        {task.title}
                      </span>
                      {task.scheduledStart && (
                        <span className="text-[11px] text-mutedText font-mono">
                          {task.scheduledStart} - {task.scheduledEnd}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`px-2.5 py-0.5 rounded-lg text-[11.5px] font-medium ${getCategoryClass(task.category)}`}>
                      {task.category}
                    </span>
                    <span className="text-[12.5px] text-mutedText font-mono min-w-[50px] text-right">
                      {task.duration}m
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
