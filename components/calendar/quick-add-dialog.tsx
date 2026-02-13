'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Target, SquareCheckBig, Goal, Bell } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { calendarService } from '@/api/calendar';

const formSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    type: z.enum(['task', 'goal', 'plan', 'reminder']),
    date: z.date(),
    priority: z.number().min(1).max(5).optional(),
    amount: z.number().positive().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface QuickAddDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedDate: Date;
    onSuccess: () => void;
}

const typeIcons = {
    task: SquareCheckBig,
    goal: Target,
    plan: Goal,
    reminder: Bell,
};

export function QuickAddDialog({
    open,
    onOpenChange,
    selectedDate,
    onSuccess,
}: QuickAddDialogProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            description: '',
            type: 'task',
            date: selectedDate,
            priority: 3,
        },
    });

    const onSubmit = async (data: FormValues) => {
        setLoading(true);
        try {
            await calendarService.quickAddEvent(data);
            toast({
                title: 'Success',
                description: 'Event added successfully',
            });
            form.reset();
            onOpenChange(false);
            onSuccess();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to add event',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Quick Add Event</DialogTitle>
                    <DialogDescription>
                        Add a new task, goal, plan, or reminder to your calendar.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Event Type</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="task">
                                                <div className="flex items-center gap-2">
                                                    <SquareCheckBig className="h-4 w-4" />
                                                    Task
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="goal">
                                                <div className="flex items-center gap-2">
                                                    <Target className="h-4 w-4" />
                                                    Goal
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="plan">
                                                <div className="flex items-center gap-2">
                                                    <Goal className="h-4 w-4" />
                                                    Saving Plan
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="reminder">
                                                <div className="flex items-center gap-2">
                                                    <Bell className="h-4 w-4" />
                                                    Reminder
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter event title" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Add more details..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        'w-full pl-3 text-left font-normal',
                                                        !field.value && 'text-muted-foreground'
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, 'PPP')
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(parseInt(value))}
                                            defaultValue={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {[1, 2, 3, 4, 5].map((priority) => (
                                                    <SelectItem key={priority} value={priority.toString()}>
                                                        Priority {priority}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount (Optional)</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                    $
                                                </span>
                                                <Input
                                                    type="number"
                                                    placeholder="0.00"
                                                    className="pl-7"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Adding...' : 'Add Event'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}