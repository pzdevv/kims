import { useEffect } from 'react';
import {
  Package,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  ArrowRightLeft,
  FileText,
  Loader2,
  BarChart3,
  MapPin,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/hooks/useDashboard';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { formatDistanceToNow } from 'date-fns';

const actionColors: Record<string, string> = {
  issue: 'bg-amber-500',
  return: 'bg-emerald-500',
  maintenance: 'bg-sky-500',
  add: 'bg-primary',
  remove: 'bg-rose-500',
  adjust: 'bg-violet-500',
  audit: 'bg-slate-500',
};

// Vibrant chart color palette
const CHART_COLORS = [
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
];

// Status colors for bar chart
const STATUS_COLORS: Record<string, string> = {
  'Available': '#10B981',
  'Checked Out': '#F59E0B',
  'Maintenance': '#3B82F6',
  'Retired': '#6B7280',
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover/95 backdrop-blur-xl border border-border/50 rounded-xl px-4 py-3 shadow-xl shadow-black/20">
        <p className="text-sm font-medium text-foreground">{payload[0].name || label}</p>
        <p className="text-lg font-bold text-primary">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { user, hasRole, userAreas } = useAuth();
  const {
    stats,
    categoryDistribution,
    areaDistribution,
    lowStockItems,
    recentActivity,
    loading,
    fetchAllDashboardData,
    setupRealtimeSubscriptions,
    getStockStatusData,
  } = useDashboard();

  useEffect(() => {
    fetchAllDashboardData();
    const cleanup = setupRealtimeSubscriptions();
    return cleanup;
  }, [fetchAllDashboardData, setupRealtimeSubscriptions]);

  const stockStatusData = getStockStatusData();

  const formatCurrency = (value: number) => {
    if (value >= 100000) {
      return `NPR ${(value / 100000).toFixed(1)}L`;
    }
    return `NPR ${value.toLocaleString()}`;
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, <span className="font-medium text-foreground">{user?.name?.split(' ')[0]}</span>!{' '}
            {userAreas.length > 0 && userAreas.length < 8 && (
              <span className="text-sm">
                Managing {userAreas.length} area{userAreas.length > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        {hasRole(['admin', 'manager']) && (
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/inventory/add">
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/transactions/issue">
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Issue Item
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card glass className="animate-fade-in opacity-0" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Items
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {stats?.uniqueItemCount?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalItems?.toLocaleString() || 0} total quantity
            </p>
          </CardContent>
        </Card>

        <Card glass className="animate-fade-in opacity-0" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Value
            </CardTitle>
            <div className="p-2 bg-success/10 rounded-lg">
              <DollarSign className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {formatCurrency(stats?.totalValue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>

        <Card glass className="animate-fade-in opacity-0" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Low Stock Items
            </CardTitle>
            <div className="p-2 bg-warning/10 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {stats?.lowStockCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">Below minimum threshold</p>
          </CardContent>
        </Card>

        <Card glass className="animate-fade-in opacity-0" style={{ animationDelay: '0.4s' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Checked Out
            </CardTitle>
            <div className="p-2 bg-info/10 rounded-lg">
              <ArrowRightLeft className="h-4 w-4 text-info" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">{stats?.checkedOutCount || 0}</div>
            <p className="text-xs text-muted-foreground">Currently with staff</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Category Distribution */}
        <Card glass className="animate-fade-in opacity-0" style={{ animationDelay: '0.5s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Package className="h-4 w-4 text-primary" />
              </div>
              Category Distribution
            </CardTitle>
            <CardDescription>Items by category</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryDistribution.length > 0 ? (
              <>
                <div className="h-[220px] relative">
                  {/* Subtle glow behind chart */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-xl blur-xl" />
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        {CHART_COLORS.map((color, index) => (
                          <linearGradient key={`gradient-${index}`} id={`pieGradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={1} />
                            <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                          </linearGradient>
                        ))}
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                          <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="count"
                        stroke="none"
                        filter="url(#glow)"
                      >
                        {categoryDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={`url(#pieGradient-${index % CHART_COLORS.length})`}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {categoryDistribution.slice(0, 6).map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div
                        className="h-3 w-3 rounded-full shadow-sm"
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <span className="text-sm text-muted-foreground truncate flex-1">
                        {item.name}
                      </span>
                      <span className="text-sm font-semibold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No category data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock Status */}
        <Card glass className="animate-fade-in opacity-0" style={{ animationDelay: '0.6s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 bg-success/10 rounded-lg">
                <BarChart3 className="h-4 w-4 text-success" />
              </div>
              Stock Status
            </CardTitle>
            <CardDescription>Current inventory status</CardDescription>
          </CardHeader>
          <CardContent>
            {stockStatusData.some((d) => d.count > 0) ? (
              <div className="h-[220px] relative">
                {/* Subtle glow behind chart */}
                <div className="absolute inset-0 bg-gradient-to-r from-success/5 via-transparent to-success/5 rounded-xl blur-xl" />
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stockStatusData} layout="vertical" barGap={8}>
                    <defs>
                      {Object.entries(STATUS_COLORS).map(([status, color]) => (
                        <linearGradient key={status} id={`barGradient-${status.replace(/\s/g, '')}`} x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor={color} stopOpacity={1} />
                          <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                        </linearGradient>
                      ))}
                      <filter id="barGlow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="status"
                      width={90}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
                    <Bar
                      dataKey="count"
                      radius={[0, 8, 8, 0]}
                      filter="url(#barGlow)"
                    >
                      {stockStatusData.map((entry) => (
                        <Cell
                          key={entry.status}
                          fill={`url(#barGradient-${entry.status.replace(/\s/g, '')})`}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No status data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Area Distribution Row */}
      {areaDistribution.length > 0 && (
        <Card glass className="animate-fade-in opacity-0" style={{ animationDelay: '0.7s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 bg-violet-500/10 rounded-lg">
                <MapPin className="h-4 w-4 text-violet-500" />
              </div>
              Items by Area
            </CardTitle>
            <CardDescription>Inventory distribution across locations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[180px] relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-violet-500/5 rounded-xl blur-xl" />
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={areaDistribution} layout="vertical" barGap={6}>
                  <defs>
                    <linearGradient id="areaBarGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity={1} />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.5} />
                    </linearGradient>
                  </defs>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
                  <Bar dataKey="count" fill="url(#areaBarGradient)" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bottom Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest inventory transactions</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/transactions">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4">
                    <div
                      className={`h-2 w-2 rounded-full ${actionColors[activity.action] || 'bg-primary'
                        }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {activity.action.charAt(0).toUpperCase() + activity.action.slice(1)}:{' '}
                        {activity.item_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        by {activity.user_name}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimeAgo(activity.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No recent activity
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Low Stock Alert
              </CardTitle>
              <CardDescription>Items that need restocking</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/inventory?filter=low-stock">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {lowStockItems.length > 0 ? (
              <div className="space-y-4">
                {lowStockItems.slice(0, 4).map((item) => (
                  <div key={item.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate">{item.name}</span>
                      <span className="text-destructive">
                        {item.current} / {item.minimum}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-destructive transition-all"
                        style={{
                          width: `${Math.min((item.current / item.minimum) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                All items are well stocked!
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions for Managers */}
      {hasRole(['admin', 'manager']) && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link to="/inventory/add">
                  <Plus className="h-5 w-5" />
                  <span>Add Item</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link to="/transactions/issue">
                  <ArrowRightLeft className="h-5 w-5" />
                  <span>Issue Item</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link to="/reports">
                  <FileText className="h-5 w-5" />
                  <span>Generate Report</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link to="/categories">
                  <Package className="h-5 w-5" />
                  <span>Manage Categories</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
