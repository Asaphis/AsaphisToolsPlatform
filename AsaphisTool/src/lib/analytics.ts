import { implementedTools } from '@/data/tools';

export type UsageStats = {
  toolsUsed: number;
  filesProcessed: number;
  totalSizeSaved: number; // MB
  timeSpent: number; // minutes (approximate)
  mostUsedTools: Array<{ toolId: string; toolName: string; count: number; icon: string }>;
  recentActivity: Array<{ date: string; action: string; tool: string; fileCount: number; sizeSaved?: number }>;
  weeklyUsage: Array<{ day: string; count: number }>;
  categoryBreakdown: Array<{ category: string; count: number; percentage: number }>;
};

const STATS_KEY = 'usage_stats';
const ACHIEVEMENTS_KEY = 'achievements';

function loadStats(): UsageStats | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveStats(stats: UsageStats) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {}
}

function ensureStats(): UsageStats {
  const existing = loadStats();
  if (existing) return existing;
  const init: UsageStats = {
    toolsUsed: 0,
    filesProcessed: 0,
    totalSizeSaved: 0,
    timeSpent: 0,
    mostUsedTools: [],
    recentActivity: [],
    weeklyUsage: [
      { day: 'Mon', count: 0 },
      { day: 'Tue', count: 0 },
      { day: 'Wed', count: 0 },
      { day: 'Thu', count: 0 },
      { day: 'Fri', count: 0 },
      { day: 'Sat', count: 0 },
      { day: 'Sun', count: 0 },
    ],
    categoryBreakdown: [],
  };
  saveStats(init);
  return init;
}

function dayIndex(): number {
  const d = new Date().getDay(); // 0..6 Sun..Sat
  return (d + 6) % 7; // 0 => Mon
}

export function recordToolUsage(toolId: string, payload?: { action?: string; fileCount?: number; sizeSavedBytes?: number }) {
  if (typeof window === 'undefined') return;
  const stats = ensureStats();

  const toolMeta = implementedTools.find(t => t.id === toolId || t.slug === toolId);
  const toolName = toolMeta?.name || toolId;
  const icon = (toolMeta?.icon as string) || '🛠️';
  const category = toolMeta?.category || 'other';

  // files processed and size saved
  const fileCount = payload?.fileCount ?? 1;
  const sizeSavedMB = payload?.sizeSavedBytes ? payload.sizeSavedBytes / (1024 * 1024) : 0;

  stats.filesProcessed += fileCount;
  stats.totalSizeSaved = Number((stats.totalSizeSaved + sizeSavedMB).toFixed(2));

  // most used tools list
  const entry = stats.mostUsedTools.find(m => m.toolId === (toolMeta?.id || toolId));
  if (entry) entry.count += 1;
  else stats.mostUsedTools.push({ toolId: toolMeta?.id || toolId, toolName, count: 1, icon });

  // toolsUsed as unique count
  const uniqueToolIds = new Set(stats.mostUsedTools.map(m => m.toolId));
  stats.toolsUsed = uniqueToolIds.size;

  // recent activity (keep last 20)
  stats.recentActivity.unshift({
    date: new Date().toISOString(),
    action: payload?.action || 'Used',
    tool: toolName,
    fileCount,
    sizeSaved: sizeSavedMB > 0 ? Number(sizeSavedMB.toFixed(2)) : undefined,
  });
  stats.recentActivity = stats.recentActivity.slice(0, 20);

  // weekly usage bump
  stats.weeklyUsage[dayIndex()].count += 1;

  // category breakdown
  const catEntry = stats.categoryBreakdown.find(c => c.category === category);
  if (catEntry) catEntry.count += 1; else stats.categoryBreakdown.push({ category, count: 1, percentage: 0 });
  const totalCat = stats.categoryBreakdown.reduce((s, c) => s + c.count, 0);
  stats.categoryBreakdown = stats.categoryBreakdown.map(c => ({ ...c, percentage: Math.round((c.count / totalCat) * 100) }));

  saveStats(stats);
}
