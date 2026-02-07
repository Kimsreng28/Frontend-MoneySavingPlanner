'use client';

import { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Target,
    TrendingUp,
    Clock,
    CheckCircle,
    PieChart,
    Edit,
    Trash2,
    DollarSign,
    AlertCircle,
    Loader2,
    Eye
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/api/api-client";
import { Header } from "@/components/dashboard/header";
import { AppSidebar } from "@/components/app-sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { CreatePlanDto, DashboardData, SavingFrequency, SavingPlan, TransactionType } from "@/types/saving-plans";
import { AddTransactionDialog, TransactionFormData } from "@/components/transactions/AddTransactionDialog";
import Link from "next/link";

// Helper function to ensure proper number formatting
const ensureNumber = (value: any): number => {
    if (value === null || value === undefined) return 0;
    const num = parseFloat(value);
    return isNaN(num) ? 0 : parseFloat(num.toFixed(2));
};

export default function SavingPlansPage() {
    const { user, refreshToken } = useAuth();
    const { toast } = useToast();

    // States
    const [isLoading, setIsLoading] = useState(true);
    const [plans, setPlans] = useState<SavingPlan[]>([]);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");

    // Dialog states
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isAddSavingsDialogOpen, setIsAddSavingsDialogOpen] = useState(false);
    const [isUpdateAmountDialogOpen, setIsUpdateAmountDialogOpen] = useState(false);

    // Selected plan for operations
    const [selectedPlan, setSelectedPlan] = useState<SavingPlan | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Form states
    const [addSavingsAmount, setAddSavingsAmount] = useState<number>(0);
    const [addSavingsNote, setAddSavingsNote] = useState<string>("");
    const [updateAmountValue, setUpdateAmountValue] = useState<number>(0);

    // Transaction states
    const [isAddTransactionDialogOpen, setIsAddTransactionDialogOpen] = useState(false);

    const [newPlan, setNewPlan] = useState<CreatePlanDto>({
        name: "",
        description: "",
        targetAmount: 1000,
        startDate: new Date().toISOString().split('T')[0],
        frequency: "MONTHLY",
        amountPerPeriod: 100,
    });

    const [editPlan, setEditPlan] = useState<Partial<SavingPlan>>({
        name: "",
        description: "",
        targetAmount: 0,
        amountPerPeriod: 0,
        isActive: true,
        isCompleted: false,
    });

    // ========== API FUNCTIONS ==========

    const fetchPlans = async () => {
        try {
            setIsLoading(true);
            const [plansResponse, dashboardResponse] = await Promise.all([
                apiClient.get('/saving-plans'),
                apiClient.get('/saving-plans/dashboard')
            ]);

            setPlans(plansResponse.data);
            setDashboardData(dashboardResponse.data);
        } catch (error: any) {
            if (error.response?.status === 401) {
                // Token expired, try to refresh
                try {
                    await refreshToken();
                    // Retry the request
                    const [plansResponse, dashboardResponse] = await Promise.all([
                        apiClient.get('/saving-plans'),
                        apiClient.get('/saving-plans/dashboard')
                    ]);
                    setPlans(plansResponse.data);
                    setDashboardData(dashboardResponse.data);
                } catch (refreshError) {
                    toast({
                        title: "Session Expired",
                        description: "Please login again",
                        variant: "destructive",
                    });
                }
            } else {
                toast({
                    title: "Error",
                    description: "Failed to fetch saving plans",
                    variant: "destructive",
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const createTransaction = async (plan: SavingPlan, amount: number, note: string = "") => {
        try {
            const transactionData = {
                planId: plan.id,
                amount: ensureNumber(amount),
                type: TransactionType.SAVED,
                transactionDate: new Date().toISOString(),
                note: note || `Added savings to ${plan.name}`,
                isManual: true,
                isCatchUp: false,
            };

            await apiClient.post('/saving-transactions', transactionData);
            return true;
        } catch (error: any) {
            console.error('Failed to create transaction:', error);

            if (error.response) {
                console.error('Transaction error details:', {
                    status: error.response.status,
                    data: error.response.data,
                    config: error.response.config
                });
            }

            return false;
        }
    };

    // ========== EVENT HANDLERS ==========

    const handleCreatePlan = async () => {
        if (!newPlan.name.trim() || newPlan.targetAmount <= 0 || newPlan.amountPerPeriod <= 0) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields with valid values",
                variant: "destructive",
            });
            return;
        }

        setIsProcessing(true);
        try {
            const payload = {
                ...newPlan,
                frequency: newPlan.frequency.toLowerCase()
            };

            await apiClient.post('/saving-plans', payload);

            toast({
                title: "Success",
                description: "Saving plan created successfully",
            });

            setIsCreateDialogOpen(false);
            resetNewPlanForm();
            fetchPlans();
        } catch (error: any) {
            if (error.response?.status === 401) {
                try {
                    await refreshToken();
                    const payload = {
                        ...newPlan,
                        frequency: newPlan.frequency.toLowerCase()
                    };
                    await apiClient.post('/saving-plans', payload);
                    toast({
                        title: "Success",
                        description: "Saving plan created successfully",
                    });
                    setIsCreateDialogOpen(false);
                    resetNewPlanForm();
                    fetchPlans();
                } catch (refreshError) {
                    toast({
                        title: "Session Expired",
                        description: "Please login again",
                        variant: "destructive",
                    });
                }
            } else {
                toast({
                    title: "Error",
                    description: error.response?.data?.message || "Failed to create saving plan",
                    variant: "destructive",
                });
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAddTransaction = async (transactionData: TransactionFormData) => {
        if (!selectedPlan) return;

        setIsProcessing(true);
        try {
            const transactionPayload = {
                planId: selectedPlan.id,
                amount: ensureNumber(transactionData.amount),
                type: transactionData.type,
                transactionDate: transactionData.transactionDate,
                note: transactionData.note,
                isManual: true,
                isCatchUp: transactionData.isCatchUp,
            };

            const response = await apiClient.post('/saving-transactions', transactionPayload);

            toast({
                title: "Success",
                description: `Transaction recorded successfully`,
            });

            fetchPlans();
            setIsAddTransactionDialogOpen(false);

        } catch (error: any) {
            console.error('Transaction error:', error.response?.data);

            // Handle duplicate transaction error specifically
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

    const handleUpdateAmount = async () => {
        if (!selectedPlan || updateAmountValue < 0) {
            toast({
                title: "Error",
                description: "Please enter a valid amount",
                variant: "destructive",
            });
            return;
        }

        setIsProcessing(true);
        try {
            await apiClient.patch(`/saving-plans/${selectedPlan.id}/amount`, {
                amount: ensureNumber(updateAmountValue)
            }).catch(async (error) => {
                if (error.response?.status === 401) {
                    await refreshToken();
                    return apiClient.patch(`/saving-plans/${selectedPlan.id}/amount`, {
                        amount: ensureNumber(updateAmountValue)
                    });
                }
                throw error;
            });

            toast({
                title: "Success",
                description: `Amount updated to $${updateAmountValue.toFixed(2)}`,
            });

            // Reset and refresh
            setUpdateAmountValue(0);
            setIsUpdateAmountDialogOpen(false);
            // Force refresh plans
            await fetchPlans();
        } catch (error: any) {
            console.error('Update amount error:', error);
            if (error.response?.status === 401) {
                toast({
                    title: "Session Expired",
                    description: "Please login again",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Error",
                    description: error.response?.data?.message || "Failed to update amount",
                    variant: "destructive",
                });
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUpdatePlan = async () => {
        if (!selectedPlan) return;

        setIsProcessing(true);
        try {
            const updates: any = { ...editPlan };

            if (updates.frequency) {
                updates.frequency = updates.frequency.toLowerCase();
            }

            await apiClient.patch(`/saving-plans/${selectedPlan.id}`, updates)
                .catch(async (error) => {
                    if (error.response?.status === 401) {
                        await refreshToken();
                        return apiClient.patch(`/saving-plans/${selectedPlan.id}`, updates);
                    }
                    throw error;
                });

            toast({
                title: "Success",
                description: "Saving plan updated successfully",
            });

            setIsEditDialogOpen(false);
            fetchPlans();
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

    const handleDeletePlan = async (id: string, planName: string) => {
        if (!confirm(`Delete "${planName}"? This action cannot be undone.`)) return;

        try {
            await apiClient.delete(`/saving-plans/${id}`)
                .catch(async (error) => {
                    if (error.response?.status === 401) {
                        await refreshToken();
                        return apiClient.delete(`/saving-plans/${id}`);
                    }
                    throw error;
                });

            toast({
                title: "Success",
                description: "Plan deleted successfully",
            });
            fetchPlans();
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
                    description: error.response?.data?.message || "Failed to delete plan",
                    variant: "destructive",
                });
            }
        }
    };

    // ========== HELPER FUNCTIONS ==========

    const openUpdateAmountDialog = (plan: SavingPlan) => {
        setSelectedPlan(plan);
        setUpdateAmountValue(ensureNumber(plan.currentAmount));
        setIsUpdateAmountDialogOpen(true);
    };

    const openEditDialog = (plan: SavingPlan) => {
        setSelectedPlan(plan);

        const frequency = (plan.frequency.toUpperCase() || "MONTHLY") as SavingFrequency;

        setEditPlan({
            name: plan.name,
            description: plan.description || "",
            targetAmount: ensureNumber(plan.targetAmount),
            amountPerPeriod: ensureNumber(plan.amountPerPeriod),
            isActive: plan.isActive,
            isCompleted: plan.isCompleted,
            frequency: frequency,
        });
        setIsEditDialogOpen(true);
    };

    const resetNewPlanForm = () => {
        setNewPlan({
            name: "",
            description: "",
            targetAmount: 1000,
            startDate: new Date().toISOString().split('T')[0],
            frequency: "MONTHLY",
            amountPerPeriod: 100,
        });
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

    const getMaxAddAmount = (plan: SavingPlan | null | undefined) => {
        if (!plan) return 0;
        return Math.max(0, ensureNumber(plan.targetAmount) - ensureNumber(plan.currentAmount));
    };

    // ========== FILTERING ==========

    const filteredPlans = plans.filter(plan => {
        const matchesSearch = plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            plan.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = filterStatus === "all" ||
            (filterStatus === "active" && plan.isActive) ||
            (filterStatus === "completed" && plan.isCompleted) ||
            (filterStatus === "inactive" && !plan.isActive);

        return matchesSearch && matchesStatus;
    });

    // ========== EFFECTS ==========

    useEffect(() => {
        if (user) {
            fetchPlans();
        }
    }, [user]);

    // ========== RENDER COMPONENTS ==========

    const renderDashboardStats = () => {
        if (!dashboardData) return null;

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData.summary.totalPlans}</div>
                        <p className="text-xs text-muted-foreground">
                            {dashboardData.summary.activePlans} active, {dashboardData.summary.completedPlans} completed
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Target</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(dashboardData.summary.totalTarget)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
                        <PieChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(dashboardData.summary.totalCurrent)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {formatCurrency(dashboardData.summary.totalTarget - dashboardData.summary.totalCurrent)} to go
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Progress</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {dashboardData.summary.overallProgress.toFixed(1)}%
                        </div>
                        <Progress value={dashboardData.summary.overallProgress} className="mt-2" />
                    </CardContent>
                </Card>
            </div>
        );
    };

    const renderPlanCard = (plan: SavingPlan) => {
        const progress = (ensureNumber(plan.currentAmount) / ensureNumber(plan.targetAmount)) * 100;

        return (
            <Card key={plan.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div>
                            <Link href={`/saving-plans/${plan.id}`} className="hover:underline">
                                <CardTitle className="flex items-center gap-2">
                                    {plan.name}
                                    {plan.isCompleted ? (
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Completed
                                        </Badge>
                                    ) : plan.isActive ? (
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                            Active
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                            Inactive
                                        </Badge>
                                    )}
                                </CardTitle>
                            </Link>
                            <CardDescription>
                                {plan.description || "No description"}
                            </CardDescription>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                    <Link href={`/saving-plans/${plan.id}`}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Details
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEditDialog(plan)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Plan
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => {
                                    setSelectedPlan(plan);
                                    setIsAddTransactionDialogOpen(true);
                                }}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Quick Add (Regular)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openUpdateAmountDialog(plan)}>
                                    <Target className="h-4 w-4 mr-2" />
                                    Set Manual Amount
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => handleDeletePlan(plan.id, plan.name)}
                                >
                                    <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                                    Delete Plan
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium">
                                    {formatCurrency(plan.currentAmount)} of {formatCurrency(plan.targetAmount)}
                                </span>
                                <span className="font-semibold">{progress.toFixed(1)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Frequency</p>
                                <p className="font-medium">{getFrequencyLabel(plan.frequency)}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Per Period</p>
                                <p className="font-medium">{formatCurrency(plan.amountPerPeriod)}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Started</p>
                                <p className="font-medium">{formatDate(plan.startDate)}</p>
                            </div>
                            {plan.endDate && (
                                <div>
                                    <p className="text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        End Date
                                    </p>
                                    <p className="font-medium">{formatDate(plan.endDate)}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex gap-2 pt-0">
                    <Button
                        variant="outline"
                        className="flex-1"
                        asChild
                    >
                        <Link href={`/saving-plans/${plan.id}`}>
                            View Details
                        </Link>
                    </Button>
                    <Button
                        variant="default"
                        className="flex-1"
                        onClick={() => {
                            setSelectedPlan(plan);
                            setIsAddTransactionDialogOpen(true);
                        }}
                        disabled={plan.isCompleted}
                    >
                        <DollarSign className="mr-2 h-4 w-4" />
                        Add Savings
                    </Button>
                </CardFooter>
            </Card>
        );
    };

    const renderEmptyState = () => (
        <Card>
            <CardContent className="pt-6 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <Target className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No saving plans yet</h3>
                <p className="text-muted-foreground mt-2 mb-4">
                    Create your first saving plan to track your financial goals
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Plan
                </Button>
            </CardContent>
        </Card>
    );

    const renderLoadingSkeletons = () => (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <Card key={i}>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-3 w-60" />
                            </div>
                            <Skeleton className="h-8 w-20" />
                        </div>
                        <div className="mt-4 space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    return (
        <ProtectedRoute>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <Header title="Saving Plans" subtitle="Track and manage your savings goals" />
                    <div className="flex flex-1 flex-col gap-6 p-6">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <Button onClick={() => setIsCreateDialogOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Plan
                                </Button>
                            </div>
                        </div>

                        {/* Dashboard Stats */}
                        {renderDashboardStats()}

                        {/* Search and Filter */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search plans..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-[180px]">
                                    <Filter className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Plans</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Plans List */}
                        <Tabs defaultValue="all" className="w-full">
                            <TabsList>
                                <TabsTrigger value="all">All Plans</TabsTrigger>
                                <TabsTrigger value="active">Active</TabsTrigger>
                                <TabsTrigger value="completed">Completed</TabsTrigger>
                            </TabsList>

                            <TabsContent value="all" className="mt-4">
                                {isLoading ? renderLoadingSkeletons() :
                                    filteredPlans.length > 0 ? (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            {filteredPlans.map(renderPlanCard)}
                                        </div>
                                    ) : renderEmptyState()
                                }
                            </TabsContent>

                            <TabsContent value="active" className="mt-4">
                                {isLoading ? renderLoadingSkeletons() :
                                    filteredPlans.filter(p => p.isActive).length > 0 ? (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            {filteredPlans.filter(p => p.isActive).map(renderPlanCard)}
                                        </div>
                                    ) : (
                                        <Card>
                                            <CardContent className="pt-6 text-center">
                                                <p className="text-muted-foreground">No active saving plans found.</p>
                                            </CardContent>
                                        </Card>
                                    )
                                }
                            </TabsContent>

                            <TabsContent value="completed" className="mt-4">
                                {isLoading ? renderLoadingSkeletons() :
                                    filteredPlans.filter(p => p.isCompleted).length > 0 ? (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            {filteredPlans.filter(p => p.isCompleted).map(renderPlanCard)}
                                        </div>
                                    ) : (
                                        <Card>
                                            <CardContent className="pt-6 text-center">
                                                <p className="text-muted-foreground">No completed saving plans found.</p>
                                            </CardContent>
                                        </Card>
                                    )
                                }
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* ========== DIALOGS ========== */}

                    {/* Create Plan Dialog */}
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Create New Saving Plan</DialogTitle>
                                <DialogDescription>
                                    Set up a new savings goal with target amount and frequency.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Plan Name *</Label>
                                    <Input
                                        id="name"
                                        value={newPlan.name}
                                        onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                                        placeholder="e.g., Vacation Fund"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Input
                                        id="description"
                                        value={newPlan.description}
                                        onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                                        placeholder="What are you saving for?"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="targetAmount">Target Amount *</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                                            <Input
                                                id="targetAmount"
                                                type="number"
                                                value={newPlan.targetAmount}
                                                onChange={(e) => setNewPlan({ ...newPlan, targetAmount: ensureNumber(e.target.value) })}
                                                className="pl-8"
                                                min="1"
                                                step="0.01"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="amountPerPeriod">Amount Per Period *</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                                            <Input
                                                id="amountPerPeriod"
                                                type="number"
                                                value={newPlan.amountPerPeriod}
                                                onChange={(e) => setNewPlan({ ...newPlan, amountPerPeriod: ensureNumber(e.target.value) })}
                                                className="pl-8"
                                                min="0.01"
                                                step="0.01"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="frequency">Frequency *</Label>
                                        <Select
                                            value={newPlan.frequency}
                                            onValueChange={(value: any) => setNewPlan({ ...newPlan, frequency: value })}
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
                                        <Label htmlFor="startDate">Start Date *</Label>
                                        <Input
                                            id="startDate"
                                            type="date"
                                            value={newPlan.startDate}
                                            onChange={(e) => setNewPlan({ ...newPlan, startDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreatePlan} disabled={isProcessing}>
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : "Create Plan"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Add Savings Dialog */}
                    <Dialog open={isAddSavingsDialogOpen} onOpenChange={setIsAddSavingsDialogOpen}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add Savings</DialogTitle>
                                <DialogDescription>
                                    Add money to: {selectedPlan?.name}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="add-amount">Amount to Add *</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                                        <Input
                                            id="add-amount"
                                            type="number"
                                            value={addSavingsAmount}
                                            onChange={(e) => setAddSavingsAmount(ensureNumber(e.target.value))}
                                            className="pl-8"
                                            min="0.01"
                                            step="0.01"
                                            max={getMaxAddAmount(selectedPlan)}
                                        />
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Current: {formatCurrency(selectedPlan?.currentAmount || 0)} |
                                        Target: {formatCurrency(selectedPlan?.targetAmount || 0)} |
                                        Remaining: {formatCurrency(getMaxAddAmount(selectedPlan))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="add-note">Note (Optional)</Label>
                                    <Textarea
                                        id="add-note"
                                        value={addSavingsNote}
                                        onChange={(e) => setAddSavingsNote(e.target.value)}
                                        placeholder="Add a note about this deposit..."
                                        rows={3}
                                    />
                                </div>

                                {selectedPlan && addSavingsAmount > getMaxAddAmount(selectedPlan) && (
                                    <div className="flex items-start gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium">Amount exceeds target</p>
                                            <p>This will mark the plan as completed.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Update Amount Dialog */}
                    <Dialog open={isUpdateAmountDialogOpen} onOpenChange={setIsUpdateAmountDialogOpen}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Set Current Amount</DialogTitle>
                                <DialogDescription>
                                    Update amount for: {selectedPlan?.name}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="update-amount">Current Amount *</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                                        <Input
                                            id="update-amount"
                                            type="number"
                                            value={updateAmountValue}
                                            onChange={(e) => setUpdateAmountValue(ensureNumber(e.target.value))}
                                            className="pl-8"
                                            min="0"
                                            step="0.01"
                                            max={selectedPlan?.targetAmount}
                                        />
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Target: {formatCurrency(selectedPlan?.targetAmount || 0)}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsUpdateAmountDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleUpdateAmount} disabled={isProcessing || updateAmountValue < 0}>
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : "Update Amount"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

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
                                    <Input
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
                    {selectedPlan && (
                        <AddTransactionDialog
                            open={isAddTransactionDialogOpen}
                            onOpenChange={setIsAddTransactionDialogOpen}
                            plan={selectedPlan}
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