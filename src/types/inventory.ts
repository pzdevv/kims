export type ItemStatus = 'available' | 'checked_out' | 'maintenance' | 'retired';
export type ItemCondition = 'new' | 'good' | 'fair' | 'poor';
export type TransactionType = 'issue' | 'return';
export type TransactionStatus = 'pending' | 'returned' | 'overdue';

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  item_count?: number;
  created_at: string;
}

export interface Item {
  id: string;
  item_id: string;
  name: string;
  description?: string;
  category_id: string;
  category?: Category;
  area_id: string;
  area?: { id: string; name: string };
  quantity: number;
  unit_price: number;
  total_value: number;
  location: string;
  condition: ItemCondition;
  status: ItemStatus;
  image_url?: string;
  manufacturer?: string;
  purchase_date?: string;
  warranty_expiry?: string;
  min_stock_level: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  transaction_type: TransactionType;
  item_id: string;
  item?: Item;
  user_id: string;
  user?: { id: string; name: string; email: string };
  issued_by: string;
  issued_by_user?: { id: string; name: string };
  quantity: number;
  issue_date: string;
  expected_return_date?: string;
  actual_return_date?: string;
  status: TransactionStatus;
  purpose?: string;
  notes?: string;
  created_at: string;
}

export interface DashboardStats {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  checkedOutCount: number;
  recentTransactions: Transaction[];
  categoryDistribution: { name: string; count: number; color: string }[];
  stockLevelBreakdown: { status: string; count: number }[];
}

export const ITEM_CONDITIONS: { value: ItemCondition; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

export const ITEM_STATUSES: { value: ItemStatus; label: string; color: string }[] = [
  { value: 'available', label: 'Available', color: 'bg-success' },
  { value: 'checked_out', label: 'Checked Out', color: 'bg-warning' },
  { value: 'maintenance', label: 'Maintenance', color: 'bg-info' },
  { value: 'retired', label: 'Retired', color: 'bg-muted' },
];
