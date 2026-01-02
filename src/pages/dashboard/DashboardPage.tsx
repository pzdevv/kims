import {
  Package,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  ArrowRightLeft,
  FileText,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

// Demo data
const stats = {
  totalItems: 1247,
  totalValue: 2450000,
  lowStockCount: 23,
  checkedOutCount: 89,
};

const categoryData = [
  { name: 'Electronics', count: 342, color: 'hsl(93, 54%, 51%)' },
  { name: 'Furniture', count: 256, color: 'hsl(199, 89%, 48%)' },
  { name: 'Lab Equipment', count: 198, color: 'hsl(45, 93%, 47%)' },
  { name: 'Books', count: 451, color: 'hsl(280, 65%, 60%)' },
];

const stockStatusData = [
  { status: 'Available', count: 1056 },
  { status: 'Checked Out', count: 89 },
  { status: 'Maintenance', count: 67 },
  { status: 'Retired', count: 35 },
];

const recentActivity = [
  { id: 1, action: 'Issued', item: 'HP Laptop #23', user: 'Sunita Sharma', time: '10 mins ago' },
  { id: 2, action: 'Returned', item: 'Projector #5', user: 'Amit Thapa', time: '25 mins ago' },
  { id: 3, action: 'Added', item: 'Chemistry Set x10', user: 'Admin', time: '1 hour ago' },
  { id: 4, action: 'Issued', item: 'Microscope #12', user: 'Rita Gurung', time: '2 hours ago' },
  { id: 5, action: 'Maintenance', item: 'Printer #3', user: 'System', time: '3 hours ago' },
];

const lowStockItems = [
  { name: 'Lab Coats (M)', current: 5, minimum: 20 },
  { name: 'Petri Dishes', current: 12, minimum: 50 },
  { name: 'Whiteboard Markers', current: 8, minimum: 30 },
  { name: 'Safety Goggles', current: 10, minimum: 25 },
];

export default function DashboardPage() {
  const { user, hasRole, userAreas } = useAuth();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name?.split(' ')[0]}!{' '}
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Items
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-success" />
              <span className="text-success">+12</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              NPR {(stats.totalValue / 100000).toFixed(1)}L
            </div>
            <p className="text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Low Stock Items
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.lowStockCount}</div>
            <p className="text-xs text-muted-foreground">
              Below minimum threshold
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Checked Out
            </CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.checkedOutCount}</div>
            <p className="text-xs text-muted-foreground">
              Currently with staff
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Items by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="count"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {categoryData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                  <span className="ml-auto text-sm font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stock Status */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Status</CardTitle>
            <CardDescription>Current inventory status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockStatusData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="status" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(93, 54%, 51%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

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
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      activity.action === 'Issued'
                        ? 'bg-warning'
                        : activity.action === 'Returned'
                        ? 'bg-success'
                        : activity.action === 'Maintenance'
                        ? 'bg-info'
                        : 'bg-primary'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {activity.action}: {activity.item}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      by {activity.user}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
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
              <Link to="/reports/low-stock">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-destructive">
                      {item.current} / {item.minimum}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-destructive transition-all"
                      style={{ width: `${(item.current / item.minimum) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
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
