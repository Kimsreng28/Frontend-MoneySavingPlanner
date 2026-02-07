'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Edit,
    Plus,
    Target,
    Calendar,
    TrendingUp,
    PieChart,
    Clock,
    DollarSign,
    AlertCircle,
    Loader2,
    CheckCircle
} from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { AppSidebar } from "@/components/app-sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionHistory } from "@/components/transactions/TransactionHistory";
import { AddTransactionDialog, TransactionFormData } from "@/components/transactions/AddTransactionDialog";
import apiClient from "@/api/api-client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { SavingFrequency, SavingPlan, TransactionType } from "@/types/saving-plans";
import Link from "next/link";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Helper function
const ensureNumber = (value: any): number => {
    if (value === null || value === undefined) return 0;
    const num = parseFloat(value);
    return isNaN(num) ? 0 : parseFloat(num.toFixed(2));
};

export default function PlanDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { refreshToken } = useAuth();

    const [plan, setPlan] = useState<SavingPlan | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddTransactionDialogOpen, setIsAddTransactionDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Edit form state
    const [editPlan, setEditPlan] = useState<Partial<SavingPlan>>({
        name: "",
        description: "",
        targetAmount: 0,
        amountPerPeriod: 0,
        isActive: true,
        isCompleted: false,
        frequency: "MONTHLY",
    });

    useEffect(() => {
        if (id) {
            fetchPlanDetails();
        }
    }, [id]);

    const fetchPlanDetails = async () => {
        try {
            setIsLoading(true);
            const response = await apiClient.get(`/saving-plans/${id}`);
            setPlan(response.data);
        } catch (error: any) {
            if (error.response?.status === 401) {
                try {
                    await refreshToken();
                    const response = await apiClient.get(`/saving-plans/${id}`);
                    setPlan(response.data);
                } catch (refreshError) {
                    toast({
                        title: "Error",
                        description: "Failed to load plan details",
                        variant: "destructive",
                    });
                    router.push('/dashboard/saving-plans');
                }
            } else if (error.response?.status === 404) {
                toast({
                    title: "Not Found",
                    description: "Saving plan not found",
                    variant: "destructive",
                });
                router.push('/dashboard/saving-plans');
            } else {
                toast({
                    title: "Error",
                    description: "Failed to load plan details",
                    variant: "destructive",
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddTransaction = async (transactionData: TransactionFormData) => {
        if (!plan) return;

        setIsProcessing(true);
        try {
            const transactionPayload = {
                planId: plan.id,
                amount: ensureNumber(transactionData.amount),
                type: transactionData.type,
                transactionDate: transactionData.transactionDate,
                note: transactionData.note,
                isManual: true,
                isCatchUp: transactionData.isCatchUp,
            };

            await apiClient.post('/saving-transactions', transactionPayload);

            toast({
                title: "Success",
                description: `Transaction recorded successfully`,
            });

            // Refresh plan data
            fetchPlanDetails();
            setIsAddTransactionDialogOpen(false);

        } catch (error: any) {
            console.error('Transaction error:', error.response?.data);

            if (error.response?.data?.message?.includes('already exists for this date')) {
                toast({
                    title: "Duplicate Transaction",
                    description: "You've already recorded a transaction of this type for today. Try a different type or date.",
                    variant: "destructive",
                });
            } else if (error.response?.data?.message?.includes('Insufficient funds')) {
                toast({
                    title: "Insufficient Funds",
                    description: error.response?.data?.message,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Error",
                    description: error.response?.data?.message || "Failed to record transaction",
                    variant: "destructive",
                });
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUpdatePlan = async () => {
        if (!plan) return;

        setIsProcessing(true);
        try {
            const updates: any = { ...editPlan };

            if (updates.frequency) {
                updates.frequency = updates.frequency.toLowerCase();
            }

            await apiClient.patch(`/saving-plans/${plan.id}`, updates)
                .catch(async (error) => {
                    if (error.response?.status === 401) {
                        await refreshToken();
                        return apiClient.patch(`/saving-plans/${plan.id}`, updates);
                    }
                    throw error;
                });

            toast({
                title: "Success",
                description: "Saving plan updated successfully",
            });

            setIsEditDialogOpen(false);
            fetchPlanDetails();
        } catch (error: any) {
            if (error.response?.status === 401) {
                toast({
                    title: "Session Expired",
                    description: "Please login again",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Error",
                    description: error.response?.data?.message || "Failed to update plan",
                    variant: "destructive",
                });
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const openEditDialog = () => {
        if (!plan) return;

        const frequency = plan.frequency.toUpperCase() as SavingFrequency;

        const validFrequencies: SavingFrequency[] = [
            "DAILY", "WEEKLY", "MONTHLY", "YEARLY", "CUSTOM",
            "daily", "weekly", "monthly", "yearly", "custom"
        ];

        const normalizedFrequency = validFrequencies.includes(frequency as SavingFrequency)
            ? frequency as SavingFrequency
            : "MONTHLY";

        setEditPlan({
            name: plan.name,
            description: plan.description || "",
            targetAmount: ensureNumber(plan.targetAmount),
            amountPerPeriod: ensureNumber(plan.amountPerPeriod),
            isActive: plan.isActive,
            isCompleted: plan.isCompleted,
            frequency: normalizedFrequency,
        });
        setIsEditDialogOpen(true);
    };

    const getFrequencyLabel = (frequency: string) => {
        const labels: Record<string, string> = {
            DAILY: 'Daily',
            WEEKLY: 'Weekly',
            MONTHLY: 'Monthly',
            YEARLY: 'Yearly',
            CUSTOM: 'Custom',
            daily: 'Daily',
            weekly: 'Weekly',
            monthly: 'Monthly',
            yearly: 'Yearly',
            custom: 'Custom'
        };
        return labels[frequency] || frequency;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <ProtectedRoute>
                <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                        <Header title="Saving Plan Details" subtitle="Loading plan details..." />
                        <div className="flex flex-1 flex-col gap-6 p-6">
                            <div className="flex items-center justify-center min-h-[400px]">
                                <div className="text-center">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                                    <p className="text-muted-foreground">Loading plan details...</p>
                                </div>
                            </div>
                        </div>
                    </SidebarInset>
                </SidebarProvider>
            </ProtectedRoute>
        );
    }

    if (!plan) {
        return (
            <ProtectedRoute>
                <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                        <Header title="Saving Plan Details" subtitle="Plan not found" />
                        <div className="flex flex-1 flex-col gap-6 p-6">
                            <div className="text-center py-12">
                                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h2 className="text-2xl font-bold mb-2">Plan Not Found</h2>
                                <p className="text-muted-foreground mb-6">The saving plan you're looking for doesn't exist.</p>
                                <Button asChild>
                                    <Link href="/dashboard/saving-plans">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to Saving Plans
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </SidebarInset>
                </SidebarProvider>
            </ProtectedRoute>
        );
    }

    const progress = (ensureNumber(plan.currentAmount) / ensureNumber(plan.targetAmount)) * 100;
    const remainingAmount = Math.max(0, ensureNumber(plan.targetAmount) - ensureNumber(plan.currentAmount));
    const daysSinceStart = Math.floor((new Date().getTime() - new Date(plan.startDate).getTime()) / (1000 * 60 * 60 * 24));
    const estimatedCompletionDays = plan.amountPerPeriod > 0 ? Math.ceil(remainingAmount / plan.amountPerPeriod) : 0;

    return (
        <ProtectedRoute>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <Header
                        title={plan.name}
                        subtitle={plan.description || "Plan details and transaction history"} />

                    <div className="flex flex-1 flex-col gap-6 p-6">
                        {/* Header Actions */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/saving-plans">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to Plans
                                    </Link>
                                </Button>
                                <Badge
                                    variant={plan.isCompleted ? "default" : plan.isActive ? "outline" : "secondary"}
                                    className={plan.isCompleted ? "bg-green-500 hover:bg-green-600" : ""}
                                >
                                    {plan.isCompleted ? (
                                        <>
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Completed
                                        </>
                                    ) : plan.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" onClick={openEditDialog}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Plan
                                </Button>
                                <Button onClick={() => setIsAddTransactionDialogOpen(true)} disabled={plan.isCompleted}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Transaction
                                </Button>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Current Amount</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{formatCurrency(plan.currentAmount)}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {formatCurrency(remainingAmount)} to go
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Target Amount</CardTitle>
                                    <Target className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{formatCurrency(plan.targetAmount)}</div>
                                    <Progress value={progress} className="mt-2" />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Per Period</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{formatCurrency(plan.amountPerPeriod)}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {getFrequencyLabel(plan.frequency)}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Progress</CardTitle>
                                    <PieChart className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{progress.toFixed(1)}%</div>
                                    <p className="text-xs text-muted-foreground">
                                        {formatCurrency(plan.currentAmount)} / {formatCurrency(plan.targetAmount)}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column - Details */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Plan Details Card */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Plan Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Frequency</p>
                                                <p className="font-medium">{getFrequencyLabel(plan.frequency)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Started</p>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    <p className="font-medium">{formatDate(plan.startDate)}</p>
                                                </div>
                                            </div>
                                            {plan.endDate && (
                                                <div>
                                                    <p className="text-sm text-muted-foreground">End Date</p>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4" />
                                                        <p className="font-medium">{formatDate(plan.endDate)}</p>
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm text-muted-foreground">Days Active</p>
                                                <p className="font-medium">{daysSinceStart} days</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Estimated Completion</p>
                                                <p className="font-medium">
                                                    {plan.isCompleted ? "Completed" : `${estimatedCompletionDays} days`}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Created</p>
                                                <p className="font-medium">{formatDate(plan.createdAt)}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Transactions */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Transaction History</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <TransactionHistory plan={plan} />
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column - Insights & Quick Actions */}
                            <div className="space-y-6">
                                {/* Progress Insights */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Progress Insights</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Current Progress</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-2xl font-bold">{progress.toFixed(1)}%</span>
                                                <span className="text-sm text-muted-foreground">
                                                    {formatCurrency(plan.currentAmount)} / {formatCurrency(plan.targetAmount)}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Average Daily Savings</p>
                                            <p className="text-xl font-bold">
                                                {daysSinceStart > 0
                                                    ? formatCurrency(plan.currentAmount / daysSinceStart)
                                                    : formatCurrency(plan.currentAmount)
                                                }
                                            </p>
                                        </div>
                                        {!plan.isCompleted && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">Estimated Completion Date</p>
                                                <p className="font-medium">
                                                    {plan.amountPerPeriod > 0
                                                        ? new Date(
                                                            new Date().getTime() + estimatedCompletionDays * 24 * 60 * 60 * 1000
                                                        ).toLocaleDateString()
                                                        : "Not enough data"
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Quick Actions */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Quick Actions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start"
                                            onClick={() => setIsAddTransactionDialogOpen(true)}
                                            disabled={plan.isCompleted}
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Transaction
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start"
                                            onClick={openEditDialog}
                                        >
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit Plan Details
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start"
                                            asChild
                                        >
                                            <Link href="/dashboard/saving-plans">
                                                <ArrowLeft className="mr-2 h-4 w-4" />
                                                Back to All Plans
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>

                    {/* Edit Plan Dialog */}
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Edit Saving Plan</DialogTitle>
                                <DialogDescription>
                                    Update your savings goal details.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-name">Plan Name *</Label>
                                    <Input
                                        id="edit-name"
                                        value={editPlan.name || ""}
                                        onChange={(e) => setEditPlan({ ...editPlan, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-description">Description (Optional)</Label>
                                    <Textarea
                                        id="edit-description"
                                        value={editPlan.description || ""}
                                        onChange={(e) => setEditPlan({ ...editPlan, description: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-targetAmount">Target Amount *</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                                            <Input
                                                id="edit-targetAmount"
                                                type="number"
                                                value={editPlan.targetAmount || 0}
                                                onChange={(e) => setEditPlan({ ...editPlan, targetAmount: ensureNumber(e.target.value) })}
                                                className="pl-8"
                                                min="1"
                                                step="0.01"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-amountPerPeriod">Amount Per Period *</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                                            <Input
                                                id="edit-amountPerPeriod"
                                                type="number"
                                                value={editPlan.amountPerPeriod || 0}
                                                onChange={(e) => setEditPlan({ ...editPlan, amountPerPeriod: ensureNumber(e.target.value) })}
                                                className="pl-8"
                                                min="0.01"
                                                step="0.01"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-frequency">Frequency *</Label>
                                        <Select
                                            value={editPlan.frequency || "MONTHLY"}
                                            onValueChange={(value: any) => setEditPlan({ ...editPlan, frequency: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select frequency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="DAILY">Daily</SelectItem>
                                                <SelectItem value="WEEKLY">Weekly</SelectItem>
                                                <SelectItem value="MONTHLY">Monthly</SelectItem>
                                                <SelectItem value="YEARLY">Yearly</SelectItem>
                                                <SelectItem value="CUSTOM">Custom</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-isActive">Status</Label>
                                        <Select
                                            value={editPlan.isActive ? "active" : "inactive"}
                                            onValueChange={(value) => setEditPlan({ ...editPlan, isActive: value === "active" })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleUpdatePlan} disabled={isProcessing}>
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : "Update Plan"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Add Transaction Dialog */}
                    {plan && (
                        <AddTransactionDialog
                            open={isAddTransactionDialogOpen}
                            onOpenChange={setIsAddTransactionDialogOpen}
                            plan={plan}
                            onSubmit={handleAddTransaction}
                            isProcessing={isProcessing}
                            defaultType={TransactionType.SAVED}
                        />
                    )}
                </SidebarInset>
            </SidebarProvider>
        </ProtectedRoute>
    );
}