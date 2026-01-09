import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, Package, } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useInventory, InventoryItemWithRelations } from '@/hooks/useInventory';
import { useTransactions } from '@/hooks/useTransactions';
import { Badge } from '@/components/ui/badge';

// Categories that are consumables (items that are "used" not "issued")
const CONSUMABLE_CATEGORIES = ['consumables', 'consumable', 'supplies', 'office supplies'];

const issueSchema = z.object({
  item_id: z.string().min(1, 'Please select an item'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  recipient_name: z.string().min(1, 'Recipient name is required'),
  recipient_email: z.string().email('Invalid email').optional().or(z.literal('')),
  recipient_department: z.string().optional(),
  expected_return_date: z.string().optional(),
  purpose: z.string().max(500, 'Purpose is too long').optional(),
  notes: z.string().max(500, 'Notes are too long').optional(),
  action_type: z.enum(['issue', 'use']),
});

type IssueFormValues = z.infer<typeof issueSchema>;

export default function IssueItemPage() {
  const [selectedItem, setSelectedItem] = useState<InventoryItemWithRelations | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { items, fetchItems, loading: itemsLoading } = useInventory();
  const { issueItem, loading: issuing } = useTransactions();

  useEffect(() => {
    fetchItems({ status: 'available' });
  }, [fetchItems]);

  const availableItems = items.filter((item) => item.quantity > 0 && item.status === 'available');

  // Check if selected item is a consumable
  const isConsumable = useMemo(() => {
    if (!selectedItem?.category?.name) return false;
    return CONSUMABLE_CATEGORIES.includes(selectedItem.category.name.toLowerCase());
  }, [selectedItem]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<IssueFormValues>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      item_id: '',
      quantity: 1,
      recipient_name: '',
      recipient_email: '',
      recipient_department: '',
      expected_return_date: '',
      purpose: '',
      notes: '',
      action_type: 'issue',
    },
  });

  const actionType = watch('action_type');

  const handleItemSelect = (itemId: string) => {
    setValue('item_id', itemId);
    const item = items.find((i) => i.id === itemId);
    setSelectedItem(item || null);
    setValue('quantity', 1);

    // Auto-set action type based on category
    if (item?.category?.name) {
      const isCons = CONSUMABLE_CATEGORIES.includes(item.category.name.toLowerCase());
      setValue('action_type', isCons ? 'use' : 'issue');
    }
  };

  const onSubmit = async (data: IssueFormValues) => {
    if (selectedItem && data.quantity > selectedItem.quantity) {
      toast({
        title: 'Error',
        description: `Only ${selectedItem.quantity} items available`,
        variant: 'destructive',
      });
      return;
    }

    // Validate return date for issue (non-consumables)
    if (data.action_type === 'issue' && !data.expected_return_date) {
      toast({
        title: 'Error',
        description: 'Return date is required for issued items',
        variant: 'destructive',
      });
      return;
    }

    const result = await issueItem({
      itemId: data.item_id,
      quantity: data.quantity,
      recipientName: data.recipient_name,
      recipientEmail: data.recipient_email || undefined,
      recipientDepartment: data.recipient_department || undefined,
      expectedReturnDate: data.action_type === 'issue' && data.expected_return_date
        ? new Date(data.expected_return_date).toISOString()
        : undefined,
      purpose: data.purpose,
      notes: data.notes,
      transactionType: data.action_type,
    });

    if (result && result.success) {
      navigate('/transactions');
    }
  };

  // Get tomorrow's date for min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="hover:bg-muted/50">
          <Link to="/transactions">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            {actionType === 'use' ? 'Use Item' : 'Issue Item'}
          </h1>
          <p className="text-muted-foreground">
            {actionType === 'use'
              ? 'Record usage of consumable items'
              : 'Create a new checkout transaction'}
          </p>
        </div>
      </div>

      {itemsLoading ? (
        <Card className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading items...</p>
        </Card>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Select Item */}
            <Card glass className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  Select Item
                </CardTitle>
                <CardDescription>Choose an item to {actionType === 'use' ? 'use' : 'issue'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Item *</Label>
                  <Select value={watch('item_id')} onValueChange={handleItemSelect}>
                    <SelectTrigger className={errors.item_id ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select an item" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableItems.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                          No available items
                        </div>
                      ) : (
                        availableItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            <div className="flex items-center gap-2">
                              <span>{item.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({item.quantity} available)
                              </span>
                              {item.category?.name && CONSUMABLE_CATEGORIES.includes(item.category.name.toLowerCase()) && (
                                <Badge variant="outline" className="ml-1 text-xs">Consumable</Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.item_id && (
                    <p className="text-sm text-destructive">{errors.item_id.message}</p>
                  )}
                </div>

                {selectedItem && (
                  <div className="p-4 bg-gradient-to-br from-muted/80 to-muted/40 rounded-xl space-y-2 border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{selectedItem.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedItem.category?.name || 'Uncategorized'}
                          {isConsumable && <Badge variant="secondary" className="ml-2">Consumable</Badge>}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Area:</span>{' '}
                        <span>{selectedItem.area?.name || 'Unknown'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Available:</span>{' '}
                        <span className="text-success font-medium">{selectedItem.quantity}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Type */}
                <div className="space-y-2">
                  <Label>Action *</Label>
                  <Select
                    value={watch('action_type')}
                    onValueChange={(v: 'issue' | 'use') => setValue('action_type', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="issue">Issue (requires return)</SelectItem>
                      <SelectItem value="use">Use (consumable, no return)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {actionType === 'use'
                      ? 'Item will be deducted from inventory permanently'
                      : 'Item will be checked out and expected to be returned'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={selectedItem?.quantity || 999}
                    {...register('quantity')}
                    className={errors.quantity ? 'border-destructive' : ''}
                  />
                  {errors.quantity && (
                    <p className="text-sm text-destructive">{errors.quantity.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recipient Details */}
            <Card glass className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500/10 rounded-lg">
                    <Package className="h-4 w-4 text-amber-500" />
                  </div>
                  Recipient Details
                </CardTitle>
                <CardDescription>Enter the person receiving this item</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient_name">Name *</Label>
                  <Input
                    id="recipient_name"
                    placeholder="e.g., Sunita Sharma"
                    {...register('recipient_name')}
                    className={errors.recipient_name ? 'border-destructive' : ''}
                  />
                  {errors.recipient_name && (
                    <p className="text-sm text-destructive">{errors.recipient_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipient_email">Email</Label>
                  <Input
                    id="recipient_email"
                    type="email"
                    placeholder="e.g., sunita@kavyaschool.edu.np"
                    {...register('recipient_email')}
                    className={errors.recipient_email ? 'border-destructive' : ''}
                  />
                  {errors.recipient_email && (
                    <p className="text-sm text-destructive">{errors.recipient_email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipient_department">Department</Label>
                  <Input
                    id="recipient_department"
                    placeholder="e.g., Science Department"
                    {...register('recipient_department')}
                  />
                </div>

                {/* Only show return date for issue (not use) */}
                {actionType === 'issue' && (
                  <div className="space-y-2">
                    <Label htmlFor="expected_return_date">Expected Return Date *</Label>
                    <Input
                      id="expected_return_date"
                      type="date"
                      min={minDate}
                      {...register('expected_return_date')}
                      className={errors.expected_return_date ? 'border-destructive' : ''}
                    />
                    {errors.expected_return_date && (
                      <p className="text-sm text-destructive">
                        {errors.expected_return_date.message}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose</Label>
                  <Input
                    id="purpose"
                    placeholder="e.g., Science fair project"
                    {...register('purpose')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional notes..."
                    rows={2}
                    {...register('notes')}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" asChild>
              <Link to="/transactions">Cancel</Link>
            </Button>
            <Button type="submit" disabled={issuing}>
              {issuing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : actionType === 'use' ? (
                'Use Item'
              ) : (
                'Issue Item'
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
