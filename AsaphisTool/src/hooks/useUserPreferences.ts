'use client';

import { useState, useEffect } from 'react';
import { UserPreferences } from '@/types';

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  favoriteTools: [],
  recentTools: [],
  language: 'en'
};

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('asaphistool-preferences');
        if (saved) {
          const parsedPreferences = JSON.parse(saved);
          setPreferences({ ...DEFAULT_PREFERENCES, ...parsedPreferences });
        }
      } catch (error) {
        console.error('Failed to load user preferences:', error);
      }
      setIsLoaded(true);
    }
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      try {
        localStorage.setItem('asaphistool-preferences', JSON.stringify(preferences));
      } catch (error) {
        console.error('Failed to save user preferences:', error);
      }
    }
  }, [preferences, isLoaded]);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  const addToFavorites = (toolId: string) => {
    setPreferences(prev => ({
      ...prev,
      favoriteTools: Array.from(new Set([...prev.favoriteTools, toolId]))
    }));
  };

  const removeFromFavorites = (toolId: string) => {
    setPreferences(prev => ({
      ...prev,
      favoriteTools: prev.favoriteTools.filter(id => id !== toolId)
    }));
  };

  const toggleFavorite = (toolId: string) => {
    if (preferences.favoriteTools.includes(toolId)) {
      removeFromFavorites(toolId);
    } else {
      addToFavorites(toolId);
    }
  };

  const addToRecentTools = (toolId: string) => {
    setPreferences(prev => {
      const filtered = prev.recentTools.filter(id => id !== toolId);
      return {
        ...prev,
        recentTools: [toolId, ...filtered].slice(0, 10) // Keep only last 10
      };
    });
  };

  const clearRecentTools = () => {
    setPreferences(prev => ({
      ...prev,
      recentTools: []
    }));
  };

  const isFavorite = (toolId: string) => preferences.favoriteTools.includes(toolId);

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('asaphistool-preferences');
    }
  };

  return {
    preferences,
    isLoaded,
    updatePreferences,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    addToRecentTools,
    clearRecentTools,
    isFavorite,
    resetPreferences
  };
}

// Analytics tracking hook
export function useAnalyticsTracking() {
  const [analytics, setAnalytics] = useState<{
    toolsUsed: Record<string, number>;
    sessionsCount: number;
    firstVisit: Date | null;
    lastVisit: Date | null;
    totalTimeSpent: number;
  }>({
    toolsUsed: {},
    sessionsCount: 0,
    firstVisit: null,
    lastVisit: null,
    totalTimeSpent: 0
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('asaphistool-analytics');
        if (saved) {
          const parsedAnalytics = JSON.parse(saved);
          // Parse dates
          if (parsedAnalytics.firstVisit) {
            parsedAnalytics.firstVisit = new Date(parsedAnalytics.firstVisit);
          }
          if (parsedAnalytics.lastVisit) {
            parsedAnalytics.lastVisit = new Date(parsedAnalytics.lastVisit);
          }
          setAnalytics(parsedAnalytics);
        } else {
          // First visit
          const now = new Date();
          setAnalytics(prev => ({
            ...prev,
            firstVisit: now,
            lastVisit: now,
            sessionsCount: 1
          }));
        }
      } catch (error) {
        console.error('Failed to load analytics:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && analytics.firstVisit) {
      try {
        localStorage.setItem('asaphistool-analytics', JSON.stringify(analytics));
      } catch (error) {
        console.error('Failed to save analytics:', error);
      }
    }
  }, [analytics]);

  const trackToolUsage = (toolId: string) => {
    setAnalytics(prev => ({
      ...prev,
      toolsUsed: {
        ...prev.toolsUsed,
        [toolId]: (prev.toolsUsed[toolId] || 0) + 1
      },
      lastVisit: new Date()
    }));
  };

  const getUsageStats = () => {
    const totalToolUsage = Object.values(analytics.toolsUsed).reduce((sum, count) => sum + count, 0);
    const mostUsedTool = Object.entries(analytics.toolsUsed).sort(([,a], [,b]) => b - a)[0];
    
    return {
      totalToolUsage,
      uniqueToolsUsed: Object.keys(analytics.toolsUsed).length,
      mostUsedTool: mostUsedTool ? { toolId: mostUsedTool[0], count: mostUsedTool[1] } : null,
      daysSinceFirstVisit: analytics.firstVisit 
        ? Math.floor((new Date().getTime() - analytics.firstVisit.getTime()) / (1000 * 60 * 60 * 24))
        : 0,
      ...analytics
    };
  };

  return {
    analytics,
    trackToolUsage,
    getUsageStats
  };
}

// Workflow persistence hook
export function useWorkflowPersistence() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('asaphistool-workflows');
        if (saved) {
          const parsedWorkflows = JSON.parse(saved);
          // Parse dates
          const workflowsWithDates = parsedWorkflows.map((workflow: any) => ({
            ...workflow,
            createdAt: new Date(workflow.createdAt),
            updatedAt: workflow.updatedAt ? new Date(workflow.updatedAt) : undefined
          }));
          setWorkflows(workflowsWithDates);
        }
      } catch (error) {
        console.error('Failed to load workflows:', error);
      }
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      try {
        localStorage.setItem('asaphistool-workflows', JSON.stringify(workflows));
      } catch (error) {
        console.error('Failed to save workflows:', error);
      }
    }
  }, [workflows, isLoaded]);

  const saveWorkflow = (workflow: any) => {
    const now = new Date();
    const workflowWithTimestamp = {
      ...workflow,
      id: workflow.id || Date.now().toString(),
      createdAt: workflow.createdAt || now,
      updatedAt: now
    };

    setWorkflows(prev => {
      const existing = prev.find(w => w.id === workflowWithTimestamp.id);
      if (existing) {
        return prev.map(w => w.id === workflowWithTimestamp.id ? workflowWithTimestamp : w);
      } else {
        return [...prev, workflowWithTimestamp];
      }
    });

    return workflowWithTimestamp;
  };

  const deleteWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.filter(w => w.id !== workflowId));
  };

  const getWorkflow = (workflowId: string) => {
    return workflows.find(w => w.id === workflowId);
  };

  const clearAllWorkflows = () => {
    setWorkflows([]);
  };

  return {
    workflows,
    isLoaded,
    saveWorkflow,
    deleteWorkflow,
    getWorkflow,
    clearAllWorkflows
  };
}
