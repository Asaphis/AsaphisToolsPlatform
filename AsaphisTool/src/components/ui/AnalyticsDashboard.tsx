'use client';

import { useState, useEffect } from 'react';

interface UsageStats {
  toolsUsed: number;
  filesProcessed: number;
  totalSizeSaved: number; // in MB
  timeSpent: number; // in minutes
  mostUsedTools: Array<{ toolId: string; toolName: string; count: number; icon: string }>;
  recentActivity: Array<{
    date: Date;
    action: string;
    tool: string;
    fileCount: number;
    sizeSaved?: number;
  }>;
  weeklyUsage: Array<{ day: string; count: number }>;
  categoryBreakdown: Array<{ category: string; count: number; percentage: number }>;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: { current: number; target: number };
}

export function AnalyticsDashboard() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | 'all'>('month');
  const [loading, setLoading] = useState(true);

// Load persisted analytics from localStorage (real data only if recorded by app)
  useEffect(() => {
    try {
      const savedStats = localStorage.getItem('usage_stats');
      const savedAchievements = localStorage.getItem('achievements');
      if (savedStats) setStats(JSON.parse(savedStats));
      if (savedAchievements) setAchievements(JSON.parse(savedAchievements));
    } catch {}
    setLoading(false);
  }, [timeRange]);

  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB > 1024) {
      return `${(sizeInMB / 1024).toFixed(1)} GB`;
    }
    return `${sizeInMB.toFixed(1)} MB`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getMaxUsage = () => {
    return Math.max(...(stats?.weeklyUsage.map(d => d.count) || [0]));
  };

if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-card rounded-xl border border-border p-6 text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">No analytics yet</h3>
        <p className="text-foreground/70">Use the tools and we’ll display your usage stats here. Data is stored locally or can be provided by your backend when connected.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">📊 Analytics Dashboard</h2>
          <p className="text-foreground/70 mt-1">Track your productivity and tool usage insights</p>
        </div>
        <div className="flex items-center space-x-2">
          {(['week', 'month', 'year', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-sm rounded-md capitalize transition-colors ${
                  timeRange === range
                    ? 'bg-primary-600 text-white'
                    : 'text-foreground/70 hover:bg-muted'
                }`}
            >
              {range === 'all' ? 'All Time' : `This ${range}`}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Tools Used</p>
              <p className="text-3xl font-bold">{stats.toolsUsed}</p>
            </div>
            <div className="text-4xl opacity-80">🛠️</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Files Processed</p>
              <p className="text-3xl font-bold">{stats.filesProcessed.toLocaleString()}</p>
            </div>
            <div className="text-4xl opacity-80">📁</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Size Saved</p>
              <p className="text-3xl font-bold">{formatFileSize(stats.totalSizeSaved)}</p>
            </div>
            <div className="text-4xl opacity-80">💾</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Time Saved</p>
              <p className="text-3xl font-bold">{formatDuration(stats.timeSpent)}</p>
            </div>
            <div className="text-4xl opacity-80">⏱️</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Usage Chart */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Weekly Usage Pattern</h3>
          <div className="space-y-4">
            {stats.weeklyUsage.map((day) => (
              <div key={day.day} className="flex items-center space-x-4">
                <div className="w-12 text-sm text-foreground/70">{day.day}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(day.count / getMaxUsage()) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-foreground/70 w-8">{day.count}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Tool Categories</h3>
          <div className="space-y-4">
            {stats.categoryBreakdown.map((category) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-lg">
                    {category.category === 'Image' && '🖼️'}
                    {category.category === 'PDF' && '📄'}
                    {category.category === 'Text' && '📝'}
                    {category.category === 'Generator' && '⚡'}
                    {category.category === 'Developer' && '💻'}
                  </div>
                  <span className="text-foreground font-medium">{category.category}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${category.percentage}%` }}></div>
                  </div>
                  <div className="text-sm text-foreground/70 w-12">{category.count}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Most Used Tools */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Most Used Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {stats.mostUsedTools.map((tool, index) => (
            <div key={tool.toolId} className="text-center p-4 bg-card rounded-lg">
              <div className="text-3xl mb-2">{tool.icon}</div>
              <h4 className="font-medium text-foreground text-sm mb-1">{tool.toolName}</h4>
              <p className="text-2xl font-bold text-primary-600">{tool.count}</p>
              <p className="text-xs text-foreground/70">#{index + 1} most used</p>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">🏆 Achievements</h3>
          <div className="text-sm text-foreground/70">{achievements.filter(a => a.unlocked).length} of {achievements.length} unlocked</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border ${achievement.unlocked ? 'bg-green-50 border-green-200' : 'bg-card border-border'}`}>
              <div className="flex items-start justify-between mb-2">
                <div className={`text-2xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>{achievement.icon}</div>
                {achievement.unlocked && <div className="text-green-600 text-sm">✓</div>}
              </div>
              <h4 className="font-medium mb-1 text-foreground">{achievement.title}</h4>
              <p className="text-sm mb-3 text-foreground/80">{achievement.description}</p>
              {achievement.progress && !achievement.unlocked && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-foreground/70">
                    <span>Progress</span>
                    <span>{achievement.progress.current}/{achievement.progress.target}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${(achievement.progress.current / achievement.progress.target) * 100}%` }}></div>
                  </div>
                </div>
              )}
              {achievement.unlocked && achievement.unlockedAt && (
                <div className="text-xs text-green-600">Unlocked {achievement.unlockedAt.toLocaleDateString()}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {stats.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 bg-card rounded-lg">
              <div className="text-2xl">
                {activity.tool === 'Image Compressor' && '🗜️'}
                {activity.tool === 'PDF Merger' && '📄'}
                {activity.tool === 'Password Generator' && '🔑'}
                {activity.tool === 'Word Counter' && '🔢'}
                {activity.tool === 'QR Code Generator' && '📱'}
              </div>
              <div className="flex-1">
                <p className="text-foreground">
                  <span className="font-medium">{activity.action}</span> {activity.fileCount} file{activity.fileCount !== 1 ? 's' : ''}
                  {activity.sizeSaved && ` • Saved ${formatFileSize(activity.sizeSaved)}`}
                </p>
                <p className="text-sm text-foreground/70">{activity.tool} • {activity.date.toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-muted rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Export Your Data</h3>
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">📊 Export as PDF Report</button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">📋 Export as CSV</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">📱 Share Achievements</button>
        </div>
      </div>
    </div>
  );
}
