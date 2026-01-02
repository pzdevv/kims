import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, Search, Package } from 'lucide-react';
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

const issueSchema = z.object({
  item_id: z.string().min(1, 'Please select an item'),
  user_id: z.string().min(1, 'Please select a user'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  expected_return_date: z.string().min(1, 'Return date is required'),
  purpose: z.string().max(500, 'Purpose is too long').optional(),
  notes: z.string().max(500, 'Notes are too long').optional(),
});

type IssueFormValues = z.infer<typeof issueSchema>;

// Demo data
const availableItems = [
  { id: '1', item_id: 'ITM-001', name: 'HP ProBook 450 G8 Laptop', available: 25, area: 'Computer Lab' },
  { id: '2', item_id: 'ITM-002', name: 'Digital Microscope 1000x', available: 15, area: 'Biology Lab' },
  { id: '4', item_id: 'ITM-004', name: 'Chemistry Lab Set (Advanced)', available: 8, area: 'Chemistry Lab' },
  { id: '5', item_id: 'ITM-005', name: 'Office Chair (Ergonomic)', available: 50, area: 'Admin Office' },
  { id: '6', item_id: 'ITM-006', name: 'Basketball (Official Size)', available: 4, area: 'Sports Room' },
];

const users = [
  { id: '1', name: 'Sunita Sharma', email: 'sunita@kavyaschool.edu.np', department: 'Science' },
  { id: '2', name: 'Amit Thapa', email: 'amit@kavyaschool.edu.np', department: 'Administration' },
  { id: '3', name: 'Rita Gurung', email: 'rita@kavyaschool.edu.np', department: 'Biology' },
  { id: '4', name: 'Priya Maharjan', email: 'priya@kavyaschool.edu.np', department: 'Chemistry' },
  { id: '5', name: 'Rajesh Kumar', email: 'rajesh@kavyaschool.edu.np', department: 'Sports' },
];

export default function IssueItemPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<typeof availableItems[0] | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

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
      user_id: '',
      quantity: 1,
      expected_return_date: '',
      purpose: '',
      notes: '',
    },
  });

  const handleItemSelect = (itemId: string) => {
    setValue('item_id', itemId);
    const item = availableItems.find(i => i.id === itemId);
    setSelectedItem(item || null);
  };

  const onSubmit = async (data: IssueFormValues) => {
    if (selectedItem && data.quantity > selectedItem.available) {
      toast({
        title: 'Error',
        description: `Only ${selectedItem.available} items available`,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Item Issued',
        description: 'Transaction recorded successfully.',
      });
      navigate('/transactions');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to issue item. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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
        <Button variant="ghost" size="icon" asChild>
          <Link to="/transactions">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Issue Item</h1>
          <p className="text-muted-foreground">Create a new checkout transaction</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Select Item */}
          <Card>
            <CardHeader>
              <CardTitle>Select Item</CardTitle>
              <CardDescription>Choose an item to issue</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Item *</Label>
                <Select
                  value={watch('item_id')}
                  onValueChange={handleItemSelect}
                >
                  <SelectTrigger className={errors.item_id ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select an item" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        <div className="flex items-center gap-2">
                          <span>{item.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({item.available} available)
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.item_id && (
                  <p className="text-sm text-destructive">{errors.item_id.message}</p>
                )}
              </div>

              {selectedItem && (
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{selectedItem.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedItem.item_id}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Area:</span>{' '}
                      <span>{selectedItem.area}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Available:</span>{' '}
                      <span className="text-success font-medium">{selectedItem.available}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={selectedItem?.available || 999}
                  {...register('quantity')}
                  className={errors.quantity ? 'border-destructive' : ''}
                />
                {errors.quantity && (
                  <p className="text-sm text-destructive">{errors.quantity.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Select User */}
          <Card>
            <CardHeader>
              <CardTitle>Recipient Details</CardTitle>
              <CardDescription>Who is borrowing this item?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Recipient *</Label>
                <Select
                  value={watch('user_id')}
                  onValueChange={(value) => setValue('user_id', value)}
                >
                  <SelectTrigger className={errors.user_id ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div>
                          <span>{user.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({user.department})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.user_id && (
                  <p className="text-sm text-destructive">{errors.user_id.message}</p>
                )}
              </div>

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
                  <p className="text-sm text-destructive">{errors.expected_return_date.message}</p>
                )}
              </div>

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
                  rows={3}
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
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Issue Item'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
