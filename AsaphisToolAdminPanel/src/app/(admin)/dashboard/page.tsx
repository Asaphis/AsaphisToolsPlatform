"use client";

import { StatCard } from "@/components/stat-card";
import { ActivityItem } from "@/components/activity-item";
import { ToolPerformanceItem } from "@/components/tool-performance-item";
import { QuickActionButton } from "@/components/quick-action-button";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Wrench, 
  DollarSign, 
  TrendingUp, 
  Megaphone, 
  CreditCard,
  Plus,
  FileDown,
  Settings,
  UserPlus
} from "lucide-react";

export default function Dashboard() {
  //todo: remove mock functionality
  const handleQuickAction = (action: string) => {
    console.log(`${action} clicked`);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-1">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening with AsaphsTool today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value="12,847"
          change="+5% from last month"
          icon={Users}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          trend="up"
          testId="card-total-users"
        />
        <StatCard
          title="Active Tools"
          value="156"
          change="+3 from last month"
          icon={Wrench}
          iconColor="text-green-600"
          iconBg="bg-green-50"
          trend="up"
          testId="card-active-tools"
        />
        <StatCard
          title="Total Donations"
          value="$8,942"
          change="+8% from last month"
          icon={DollarSign}
          iconColor="text-pink-600"
          iconBg="bg-pink-50"
          trend="up"
          testId="card-total-donations"
        />
        <StatCard
          title="Monthly Revenue"
          value="$24,567"
          change="+23% from last month"
          icon={TrendingUp}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
          trend="up"
          testId="card-monthly-revenue"
        />
        <StatCard
          title="Active Ads"
          value="23"
          change="-6 from last month"
          icon={Megaphone}
          iconColor="text-orange-600"
          iconBg="bg-orange-50"
          trend="down"
          testId="card-active-ads"
        />
        <StatCard
          title="Pending Withdrawals"
          value="7"
          change="+4 from last month"
          icon={CreditCard}
          iconColor="text-gray-600"
          iconBg="bg-gray-50"
          trend="up"
          testId="card-pending-withdrawals"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
            <Button variant="ghost" size="sm" data-testid="button-view-all-activity">
              View all
            </Button>
          </div>
          <div>
            <ActivityItem
              icon={DollarSign}
              iconColor="text-green-600"
              iconBg="bg-green-50"
              title="New donation received from John Doe"
              subtitle="$25.00"
              time="2 min ago"
            />
            <ActivityItem
              icon={UserPlus}
              iconColor="text-blue-600"
              iconBg="bg-blue-50"
              title="New user registration: sarah@example.com"
              subtitle="16 seconds ago"
              time="16 sec ago"
            />
            <ActivityItem
              icon={Wrench}
              iconColor="text-green-600"
              iconBg="bg-green-50"
              title="PDF Converter tool reached 1000+ uses"
              subtitle="1 hour ago"
              time="1 hour ago"
            />
            <ActivityItem
              icon={CreditCard}
              iconColor="text-purple-600"
              iconBg="bg-purple-50"
              title="Withdrawal request submitted by Alex Chen"
              subtitle="$100.00"
              time="3 hours ago"
            />
            <ActivityItem
              icon={Megaphone}
              iconColor="text-orange-600"
              iconBg="bg-orange-50"
              title="Ad campaign 'Summer Tools' went live"
              subtitle="7 hours ago"
              time="7 hours ago"
            />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Top Performing Tools</h2>
            <Button variant="ghost" size="sm" data-testid="button-view-all-tools">
              View all
            </Button>
          </div>
          <div>
            <ToolPerformanceItem
              name="PDF Converter"
              usage={2847}
              change="+15%"
              trend="up"
            />
            <ToolPerformanceItem
              name="Image Compressor"
              usage={1923}
              change="+8%"
              trend="up"
            />
            <ToolPerformanceItem
              name="QR Code Generator"
              usage={1811}
              change="+22%"
              trend="up"
            />
            <ToolPerformanceItem
              name="Password Generator"
              usage={1632}
              change="+3%"
              trend="up"
            />
            <ToolPerformanceItem
              name="URL Shortener"
              usage={1420}
              change="+12%"
              trend="up"
            />
          </div>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionButton
            icon={Plus}
            label="Add New Tool"
            iconColor="text-green-600"
            onClick={() => handleQuickAction('Add New Tool')}
            testId="button-add-tool"
          />
          <QuickActionButton
            icon={Megaphone}
            label="Create Ad"
            iconColor="text-orange-600"
            onClick={() => handleQuickAction('Create Ad')}
            testId="button-create-ad"
          />
          <QuickActionButton
            icon={FileDown}
            label="Export Data"
            iconColor="text-blue-600"
            onClick={() => handleQuickAction('Export Data')}
            testId="button-export-data"
          />
          <QuickActionButton
            icon={Settings}
            label="Site Settings"
            iconColor="text-gray-600"
            onClick={() => handleQuickAction('Site Settings')}
            testId="button-site-settings"
          />
        </div>
      </div>
    </div>
  );
}
