import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Download,
  Package,
  DollarSign,
  AlertTriangle,
  ArrowRightLeft,
  Calendar,
  BarChart3,
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
import { useToast } from '@/hooks/use-toast';
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
} from 'recharts';

const reportTypes = [
  {
    id: 'inventory',
    title: 'Inventory Report',
    description: 'Complete inventory listing with quantities and values',
    icon: Package,
  },
  {
    id: 'transactions',
    title: 'Transaction Report',
    description: 'Issue and return history for a date range',
    icon: ArrowRightLeft,
  },
  {
    id: 'low-stock',
    title: 'Low Stock Report',
    description: 'Items below minimum threshold',
    icon: AlertTriangle,
  },
  {
    id: 'asset-value',
    title: 'Asset Value Report',
    description: 'Total asset value by category',
    icon: DollarSign,
  },
];

// Demo chart data
const categoryValueData = [
  { name: 'Electronics', value: 1250000, color: '#76C044' },
  { name: 'Furniture', value: 450000, color: '#3B82F6' },
  { name: 'Lab Equipment', value: 380000, color: '#F59E0B' },
  { name: 'Books', value: 220000, color: '#8B5CF6' },
  { name: 'Sports', value: 85000, color: '#EC4899' },
  { name: 'Other', value: 65000, color: '#64748B' },
];

const monthlyTransactions = [
  { month: 'Jul', issues: 45, returns: 38 },
  { month: 'Aug', issues: 52, returns: 48 },
  { month: 'Sep', issues: 78, returns: 65 },
  { month: 'Oct', issues: 63, returns: 71 },
  { month: 'Nov', issues: 89, returns: 82 },
  { month: 'Dec', issues: 67, returns: 54 },
];

const topBorrowedItems = [
  { name: 'Laptops', count: 145 },
  { name: 'Projectors', count: 98 },
  { name: 'Microscopes', count: 76 },
  { name: 'Lab Coats', count: 65 },
  { name: 'Basketballs', count: 54 },
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState('inventory');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { toast } = useToast();

  const handleExport = (format: 'pdf' | 'excel') => {
    toast({
      title: 'Export Started',
      description: `Generating ${format.toUpperCase()} report...`,
    });
    // Demo: simulate export
    setTimeout(() => {
      toast({
        title: 'Export Complete',
        description: 'Report has been downloaded.',
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate and export inventory reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button onClick={() => handleExport('pdf')}>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {reportTypes.map((report) => (
          <Card
            key={report.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedReport === report.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedReport(report.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  selectedReport === report.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  <report.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{report.title}</h3>
                  <p className="text-xs text-muted-foreground">{report.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
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
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="furniture">Furniture</SelectItem>
                  <SelectItem value="lab-equipment">Lab Equipment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="secondary">Apply Filters</Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Asset Value by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Asset Value by Category
            </CardTitle>
            <CardDescription>Total NPR 24.5 Lakhs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryValueData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryValueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`NPR ${(value / 1000).toFixed(0)}K`, 'Value']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              Monthly Transactions
            </CardTitle>
            <CardDescription>Issues vs Returns (Last 6 months)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTransactions}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="issues" 
                    stroke="#F59E0B" 
                    strokeWidth={2}
                    name="Issues"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="returns" 
                    stroke="#76C044" 
                    strokeWidth={2}
                    name="Returns"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Borrowed Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Most Borrowed Items
            </CardTitle>
            <CardDescription>Top 5 items by transaction count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topBorrowedItems} layout="vertical">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#76C044" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Summary Statistics</CardTitle>
            <CardDescription>Key metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-primary">1,247</p>
                <p className="text-sm text-muted-foreground">Total Items</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">NPR 24.5L</p>
                <p className="text-sm text-muted-foreground">Total Value</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-warning">23</p>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-success">94%</p>
                <p className="text-sm text-muted-foreground">Return Rate</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">89</p>
                <p className="text-sm text-muted-foreground">Currently Issued</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-destructive">3</p>
                <p className="text-sm text-muted-foreground">Overdue Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
