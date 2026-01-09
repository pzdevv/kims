import { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Package,
  DollarSign,
  AlertTriangle,
  ArrowRightLeft,
  BarChart3,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useReports } from '@/hooks/useReports';
import { useCategories } from '@/hooks/useCategories';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  Area,
  AreaChart,
} from 'recharts';

const reportTypes = [
  {
    id: 'inventory',
    title: 'Inventory Report',
    description: 'Complete inventory listing with quantities and values',
    icon: Package,
    color: '#10B981',
  },
  {
    id: 'transactions',
    title: 'Transaction Report',
    description: 'Issue and return history for a date range',
    icon: ArrowRightLeft,
    color: '#F59E0B',
  },
  {
    id: 'low-stock',
    title: 'Low Stock Report',
    description: 'Items below minimum threshold',
    icon: AlertTriangle,
    color: '#EF4444',
  },
  {
    id: 'asset-value',
    title: 'Asset Value Report',
    description: 'Total asset value by category',
    icon: DollarSign,
    color: '#8B5CF6',
  },
];

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

// Custom tooltip component
const CustomTooltip = ({ active, payload, label, formatter }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover/95 backdrop-blur-xl border border-border/50 rounded-xl px-4 py-3 shadow-xl shadow-black/20">
        <p className="text-sm font-medium text-foreground mb-1">{label || payload[0].name}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            <span className="font-semibold">{entry.name}:</span> {formatter ? formatter(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState('inventory');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const {
    loading,
    categoryStats,
    monthlyStats,
    topItems,
    summary,
    fetchReportData,
    exportToCSV
  } = useReports();

  const { categories, fetchCategories } = useCategories();

  useEffect(() => {
    fetchReportData();
    fetchCategories();
  }, [fetchReportData, fetchCategories]);

  const handleExport = (format: 'csv' | 'excel') => {
    exportToCSV(selectedReport);
  };

  const handleSectionExport = (reportType: string) => {
    exportToCSV(reportType);
  };

  // Format currency
  const formatCurrency = (value: number) => {
    if (value >= 100000) {
      return `NPR ${(value / 100000).toFixed(1)}L`;
    }
    if (value >= 1000) {
      return `NPR ${(value / 1000).toFixed(0)}K`;
    }
    return `NPR ${value}`;
  };

  if (loading && categoryStats.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate and export inventory reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => fetchReportData()}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {reportTypes.map((report, index) => (
          <Card
            key={report.id}
            className={`cursor-pointer transition-all duration-300 animate-fade-in opacity-0 group ${selectedReport === report.id
                ? 'ring-2 ring-primary shadow-lg shadow-primary/20'
                : 'hover:shadow-lg hover:-translate-y-1'
              }`}
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => setSelectedReport(report.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300 ${selectedReport === report.id
                      ? 'scale-110'
                      : 'group-hover:scale-105'
                    }`}
                  style={{
                    backgroundColor: selectedReport === report.id ? report.color : `${report.color}20`,
                    color: selectedReport === report.id ? 'white' : report.color
                  }}
                >
                  <report.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{report.title}</h3>
                  <p className="text-xs text-muted-foreground">{report.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card glass>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="space-y-2">
              <Label>Date From</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full md:w-40"
              />
            </div>
            <div className="space-y-2">
              <Label>Date To</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full md:w-40"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="secondary" onClick={() => fetchReportData()}>
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Asset Value by Category */}
        <Card glass className="group hover:shadow-xl transition-all duration-300 animate-fade-in opacity-0" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 bg-violet-500/10 rounded-lg">
                  <DollarSign className="h-4 w-4 text-violet-500" />
                </div>
                Asset Value by Category
              </CardTitle>
              <CardDescription>
                Total {formatCurrency(summary.totalValue)}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleSectionExport('asset-value')}
            >
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] relative">
              {/* Subtle glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-violet-500/5 rounded-xl blur-xl" />
              {categoryStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      {CHART_COLORS.map((color, index) => (
                        <linearGradient key={`gradient-${index}`} id={`reportPieGradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={color} stopOpacity={1} />
                          <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                        </linearGradient>
                      ))}
                      <filter id="reportGlow">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <Pie
                      data={categoryStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                      filter="url(#reportGlow)"
                    >
                      {categoryStats.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`url(#reportPieGradient-${index % CHART_COLORS.length})`}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={<CustomTooltip formatter={formatCurrency} />}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '20px' }}
                      formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Transactions - Changed to Area Chart */}
        <Card glass className="group hover:shadow-xl transition-all duration-300 animate-fade-in opacity-0" style={{ animationDelay: '0.4s' }}>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500/10 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-amber-500" />
                </div>
                Monthly Transactions
              </CardTitle>
              <CardDescription>Issues vs Returns (Last 6 months)</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleSectionExport('transactions')}
            >
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] relative">
              {/* Subtle glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-emerald-500/5 rounded-xl blur-xl" />
              {monthlyStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyStats}>
                    <defs>
                      <linearGradient id="issuesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="returnsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="usesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ paddingTop: '10px' }}
                      formatter={(value) => <span className="text-sm">{value}</span>}
                    />
                    <Area
                      type="monotone"
                      dataKey="issues"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      fill="url(#issuesGradient)"
                      name="Issues"
                    />
                    <Area
                      type="monotone"
                      dataKey="returns"
                      stroke="#10B981"
                      strokeWidth={2}
                      fill="url(#returnsGradient)"
                      name="Returns"
                    />
                    <Area
                      type="monotone"
                      dataKey="uses"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      fill="url(#usesGradient)"
                      name="Uses"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No transaction data
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Borrowed Items */}
        <Card glass className="group hover:shadow-xl transition-all duration-300 animate-fade-in opacity-0" style={{ animationDelay: '0.5s' }}>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                  <BarChart3 className="h-4 w-4 text-emerald-500" />
                </div>
                Most Borrowed Items
              </CardTitle>
              <CardDescription>Top 5 items by transaction count</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleSectionExport('inventory')}
            >
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] relative">
              {/* Subtle glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-emerald-500/5 rounded-xl blur-xl" />
              {topItems.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topItems} layout="vertical" barGap={8}>
                    <defs>
                      {CHART_COLORS.map((color, index) => (
                        <linearGradient key={`bar-${index}`} id={`reportBarGradient-${index}`} x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor={color} stopOpacity={1} />
                          <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                        </linearGradient>
                      ))}
                      <filter id="barGlowReport">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <XAxis
                      type="number"
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={100}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
                    <Bar
                      dataKey="count"
                      radius={[0, 8, 8, 0]}
                      filter="url(#barGlowReport)"
                    >
                      {topItems.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`url(#reportBarGradient-${index % CHART_COLORS.length})`}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No items borrowed yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <Card glass className="group hover:shadow-xl transition-all duration-300 animate-fade-in opacity-0" style={{ animationDelay: '0.6s' }}>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                Summary Statistics
              </CardTitle>
              <CardDescription>Key metrics at a glance</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleSectionExport('inventory')}
            >
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/10 hover:scale-105 transition-transform cursor-pointer">
                <p className="text-2xl font-bold text-primary">{summary.totalItems.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Items</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-violet-500/10 to-violet-500/5 rounded-xl border border-violet-500/10 hover:scale-105 transition-transform cursor-pointer">
                <p className="text-2xl font-bold text-violet-500">{formatCurrency(summary.totalValue)}</p>
                <p className="text-sm text-muted-foreground">Total Value</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-xl border border-amber-500/10 hover:scale-105 transition-transform cursor-pointer">
                <p className="text-2xl font-bold text-amber-500">{summary.lowStockCount}</p>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-xl border border-emerald-500/10 hover:scale-105 transition-transform cursor-pointer">
                <p className="text-2xl font-bold text-emerald-500">{summary.returnRate}%</p>
                <p className="text-sm text-muted-foreground">Return Rate</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-sky-500/10 to-sky-500/5 rounded-xl border border-sky-500/10 hover:scale-105 transition-transform cursor-pointer">
                <p className="text-2xl font-bold text-sky-500">{summary.currentlyIssued}</p>
                <p className="text-sm text-muted-foreground">Currently Issued</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-rose-500/10 to-rose-500/5 rounded-xl border border-rose-500/10 hover:scale-105 transition-transform cursor-pointer">
                <p className="text-2xl font-bold text-rose-500">{summary.overdueCount}</p>
                <p className="text-sm text-muted-foreground">Overdue Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
