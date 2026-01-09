import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions, TransactionWithDetails } from '@/hooks/useTransactions';
import { format, formatDistanceToNow } from 'date-fns';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-warning text-warning-foreground', icon: Clock },
  returned: { label: 'Returned', color: 'bg-success text-success-foreground', icon: CheckCircle },
  overdue: { label: 'Overdue', color: 'bg-destructive text-destructive-foreground', icon: AlertCircle },
  cancelled: { label: 'Cancelled', color: 'bg-muted text-muted-foreground', icon: AlertCircle },
};

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithDetails | null>(null);
  const [returnNotes, setReturnNotes] = useState('');
  const [returning, setReturning] = useState(false);

  const { hasRole } = useAuth();
  const { transactions, loading, fetchTransactions, returnItem } = useTransactions();

  useEffect(() => {
    fetchTransactions({ limit: 100 });
  }, [fetchTransactions]);

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      (t.item?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesTab = activeTab === 'all' || t.transaction_type === activeTab;
    return matchesSearch && matchesStatus && matchesTab;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const pendingCount = transactions.filter((t) => t.status === 'pending').length;
  const overdueCount = transactions.filter((t) => t.status === 'overdue').length;
  const returnedCount = transactions.filter((t) => t.status === 'returned').length;

  const handleReturnClick = (transaction: TransactionWithDetails) => {
    setSelectedTransaction(transaction);
    setReturnNotes('');
    setReturnDialogOpen(true);
  };

  const handleReturnSubmit = async () => {
    if (!selectedTransaction) return;

    setReturning(true);
    try {
      await returnItem(selectedTransaction.id, returnNotes || undefined);
      setReturnDialogOpen(false);
      fetchTransactions({ limit: 100 });
    } finally {
      setReturning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Transactions</h1>
          <p className="text-muted-foreground">
            {loading ? 'Loading...' : `${pendingCount} pending · ${overdueCount} overdue`}
          </p>
        </div>
        {hasRole(['admin', 'general_manager', 'manager']) && (
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/transactions/issue">
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Issue Item
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card glass className="animate-fade-in opacity-0" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Pending Returns</p>
            </div>
          </CardContent>
        </Card>
        <Card glass className="animate-fade-in opacity-0" style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500/20 to-rose-500/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-rose-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{overdueCount}</p>
              <p className="text-sm text-muted-foreground">Overdue</p>
            </div>
          </CardContent>
        </Card>
        <Card glass className="animate-fade-in opacity-0" style={{ animationDelay: '0.3s' }}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{returnedCount}</p>
              <p className="text-sm text-muted-foreground">Returned</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Filters */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">All</TabsTrigger>
            <TabsTrigger value="issue" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Issues</TabsTrigger>
            <TabsTrigger value="return" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Returns</TabsTrigger>
          </TabsList>

          <div className="flex gap-3">
            <div className="relative flex-1 md:w-64 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary/30 transition-all"
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

        <TabsContent value={activeTab} className="mt-4 animate-fade-in">
          {loading ? (
            <Card className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading transactions...</p>
            </Card>
          ) : (
            <Card glass>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-4 font-medium">Type</th>
                      <th className="text-left p-4 font-medium">Item</th>
                      <th className="text-left p-4 font-medium">User</th>
                      <th className="text-left p-4 font-medium">Qty</th>
                      <th className="text-left p-4 font-medium">Issue Date</th>
                      <th className="text-left p-4 font-medium">Return Date</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction, index) => {
                      const config = statusConfig[transaction.status as keyof typeof statusConfig] || statusConfig.pending;
                      const StatusIcon = config.icon;
                      return (
                        <tr
                          key={transaction.id}
                          className="border-b hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-4">
                            <div
                              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${transaction.transaction_type === 'issue'
                                ? 'bg-warning/10 text-warning'
                                : 'bg-success/10 text-success'
                                }`}
                            >
                              {transaction.transaction_type === 'issue' ? (
                                <ArrowUpRight className="h-3 w-3" />
                              ) : (
                                <ArrowDownLeft className="h-3 w-3" />
                              )}
                              {transaction.transaction_type.charAt(0).toUpperCase() +
                                transaction.transaction_type.slice(1)}
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{transaction.item?.name || 'Unknown Item'}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{transaction.recipient_name || transaction.user?.name || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground">{transaction.purpose || transaction.recipient_department || ''}</p>
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
                            <Badge className={config.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {config.label}
                            </Badge>
                          </td>
                          <td className="p-4">
                            {transaction.status === 'pending' && hasRole(['admin', 'manager']) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReturnClick(transaction)}
                              >
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Return
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {!loading && filteredTransactions.length === 0 && (
        <Card className="p-12 text-center">
          <ArrowUpRight className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Issue your first item to see transactions here'}
          </p>
        </Card>
      )}

      {/* Return Dialog */}
      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Item</DialogTitle>
            <DialogDescription>
              Mark this item as returned
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedTransaction.item?.name}</p>
                <p className="text-sm text-muted-foreground">
                  Issued to: {selectedTransaction.user?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Quantity: {selectedTransaction.quantity}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="returnNotes">Notes (optional)</Label>
                <Textarea
                  id="returnNotes"
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="Add any notes about the condition or return..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReturnSubmit} disabled={returning}>
              {returning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Return'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
