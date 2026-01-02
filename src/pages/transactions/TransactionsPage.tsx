import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';

// Demo transactions data
const demoTransactions = [
  {
    id: '1',
    type: 'issue',
    item: { name: 'HP ProBook 450 G8 Laptop', item_id: 'ITM-001' },
    user: { name: 'Sunita Sharma', email: 'sunita@kavyaschool.edu.np' },
    issued_by: { name: 'Admin User' },
    quantity: 1,
    issue_date: '2025-12-28T10:30:00',
    expected_return_date: '2026-01-10',
    status: 'pending',
    purpose: 'Science fair project',
  },
  {
    id: '2',
    type: 'return',
    item: { name: 'Projector Epson EB-X51', item_id: 'ITM-003' },
    user: { name: 'Amit Thapa', email: 'amit@kavyaschool.edu.np' },
    issued_by: { name: 'Manager User' },
    quantity: 1,
    issue_date: '2025-12-20T14:00:00',
    expected_return_date: '2025-12-27',
    actual_return_date: '2025-12-27T16:30:00',
    status: 'returned',
    purpose: 'Parent meeting presentation',
  },
  {
    id: '3',
    type: 'issue',
    item: { name: 'Digital Microscope 1000x', item_id: 'ITM-002' },
    user: { name: 'Rita Gurung', email: 'rita@kavyaschool.edu.np' },
    issued_by: { name: 'Admin User' },
    quantity: 2,
    issue_date: '2025-12-15T09:00:00',
    expected_return_date: '2025-12-22',
    status: 'overdue',
    purpose: 'Biology practical class',
  },
  {
    id: '4',
    type: 'issue',
    item: { name: 'Basketball (Official Size)', item_id: 'ITM-006' },
    user: { name: 'Rajesh Kumar', email: 'rajesh@kavyaschool.edu.np' },
    issued_by: { name: 'Staff User' },
    quantity: 5,
    issue_date: '2025-12-30T08:00:00',
    expected_return_date: '2025-12-30',
    status: 'pending',
    purpose: 'Inter-house tournament',
  },
  {
    id: '5',
    type: 'return',
    item: { name: 'Chemistry Lab Set (Advanced)', item_id: 'ITM-004' },
    user: { name: 'Priya Maharjan', email: 'priya@kavyaschool.edu.np' },
    issued_by: { name: 'Manager User' },
    quantity: 3,
    issue_date: '2025-12-10T11:00:00',
    expected_return_date: '2025-12-24',
    actual_return_date: '2025-12-23T15:00:00',
    status: 'returned',
    purpose: 'Grade 10 chemistry practicals',
  },
];

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-warning text-warning-foreground', icon: Clock },
  returned: { label: 'Returned', color: 'bg-success text-success-foreground', icon: CheckCircle },
  overdue: { label: 'Overdue', color: 'bg-destructive text-destructive-foreground', icon: AlertCircle },
};

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const { hasRole } = useAuth();

  const filteredTransactions = demoTransactions.filter((t) => {
    const matchesSearch =
      t.item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.item.item_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesTab = activeTab === 'all' || t.type === activeTab;
    return matchesSearch && matchesStatus && matchesTab;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const pendingCount = demoTransactions.filter(t => t.status === 'pending').length;
  const overdueCount = demoTransactions.filter(t => t.status === 'overdue').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground">
            {pendingCount} pending · {overdueCount} overdue
          </p>
        </div>
        {hasRole(['admin', 'manager', 'staff']) && (
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/transactions/issue">
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Issue Item
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/transactions/return">
                <ArrowDownLeft className="mr-2 h-4 w-4" />
                Return Item
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Pending Returns</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{overdueCount}</p>
              <p className="text-sm text-muted-foreground">Overdue</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {demoTransactions.filter(t => t.status === 'returned').length}
              </p>
              <p className="text-sm text-muted-foreground">Returned This Month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Filters */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="issue">Issues</TabsTrigger>
            <TabsTrigger value="return">Returns</TabsTrigger>
          </TabsList>

          <div className="flex gap-3">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">Type</th>
                    <th className="text-left p-4 font-medium">Item</th>
                    <th className="text-left p-4 font-medium">User</th>
                    <th className="text-left p-4 font-medium">Qty</th>
                    <th className="text-left p-4 font-medium">Issue Date</th>
                    <th className="text-left p-4 font-medium">Return Date</th>
                    <th className="text-left p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => {
                    const StatusIcon = statusConfig[transaction.status as keyof typeof statusConfig].icon;
                    return (
                      <tr key={transaction.id} className="border-b hover:bg-muted/30">
                        <td className="p-4">
                          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.type === 'issue' 
                              ? 'bg-warning/10 text-warning' 
                              : 'bg-success/10 text-success'
                          }`}>
                            {transaction.type === 'issue' ? (
                              <ArrowUpRight className="h-3 w-3" />
                            ) : (
                              <ArrowDownLeft className="h-3 w-3" />
                            )}
                            {transaction.type === 'issue' ? 'Issue' : 'Return'}
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{transaction.item.name}</p>
                            <p className="text-xs text-muted-foreground">{transaction.item.item_id}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{transaction.user.name}</p>
                            <p className="text-xs text-muted-foreground">{transaction.purpose}</p>
                          </div>
                        </td>
                        <td className="p-4 font-medium">{transaction.quantity}</td>
                        <td className="p-4 text-muted-foreground">
                          {formatDate(transaction.issue_date)}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {transaction.actual_return_date
                            ? formatDate(transaction.actual_return_date)
                            : transaction.expected_return_date
                            ? formatDate(transaction.expected_return_date)
                            : '-'}
                        </td>
                        <td className="p-4">
                          <Badge className={statusConfig[transaction.status as keyof typeof statusConfig].color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[transaction.status as keyof typeof statusConfig].label}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {filteredTransactions.length === 0 && (
        <Card className="p-12 text-center">
          <ArrowUpRight className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
        </Card>
      )}
    </div>
  );
}
