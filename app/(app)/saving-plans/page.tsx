'use client';

import { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Filter,
    Download,
    MoreVertical,
    Target,
    TrendingUp,
    Clock,
    CheckCircle,
    PieChart,
    Edit,
    Trash2,
    DollarSign
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
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CreatePlanDto, DashboardData, SavingFrequency, SavingPlan } from "@/types/saving-plans";

export default function SavingPlansPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [plans, setPlans] = useState<SavingPlan[]>([]);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<SavingPlan | null>(null);

    const [newPlan, setNewPlan] = useState<CreatePlanDto>({
        name: "",
        description: "",
        targetAmount: 1000,
        startDate: new Date().toISOString().split('T')[0],
        frequency: "MONTHLY",
        amountPerPeriod: 100,
        category: "general",
        color: "#3b82f6",
    });

    const [editPlan, setEditPlan] = useState<Partial<SavingPlan>>({
        name: "",
        description: "",
        targetAmount: 0,
        amountPerPeriod: 0,
        category: "general",
        color: "#3b82f6",
        isActive: true,
        isCompleted: false,
    });

    // Fetch saving plans
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
            toast({
                title: "Error",
                description: "Failed to fetch saving plans",
                variant: "destructive",
            });
            console.error("Error fetching plans:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchPlans();
        }
    }, [user]);

    // Handle create plan
    const handleCreatePlan = async () => {
        try {
            // Validate required fields
            if (!newPlan.name.trim() || newPlan.targetAmount <= 0 || newPlan.amountPerPeriod <= 0) {
                toast({
                    title: "Validation Error",
                    description: "Please fill in all required fields with valid values",
                    variant: "destructive",
                });
                return;
            }

            // Convert frequency to lowercase to match backend enum
            const payload = {
                ...newPlan,
                frequency: newPlan.frequency.toLowerCase()
            };

            const response = await apiClient.post('/saving-plans', payload);

            toast({
                title: "Success",
                description: "Saving plan created successfully",
            });

            setIsCreateDialogOpen(false);
            resetNewPlanForm();
            fetchPlans(); // Refresh the list
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to create saving plan",
                variant: "destructive",
            });
        }
    };

    // Handle update plan
    const handleUpdatePlan = async () => {
        if (!selectedPlan) return;

        try {
            // Prepare update payload with lowercase frequency
            const updates: any = { ...editPlan };

            // Always convert frequency to lowercase
            if (updates.frequency) {
                updates.frequency = updates.frequency.toLowerCase();
            }

            // If plan was completed and we're changing it to not completed,
            // we need to send both isCompleted and isActive
            if (selectedPlan.isCompleted && updates.isCompleted === false) {
                updates.isCompleted = false;
                updates.isActive = true;
                updates.completedAt = null;
            }

            // If plan was not completed and we're marking it as completed
            if (!selectedPlan.isCompleted && updates.isCompleted === true) {
                updates.isCompleted = true;
                updates.isActive = false;
                // Don't send completedAt, let backend set it
            }

            // If only changing isActive without touching isCompleted
            if (updates.isActive !== undefined && updates.isCompleted === undefined) {
                if (selectedPlan.isCompleted && updates.isActive === true) {
                    // Changing a completed plan back to active
                    updates.isCompleted = false;
                    updates.completedAt = null;
                }
            }

            console.log('Sending update payload:', updates); // For debugging

            await apiClient.patch(`/saving-plans/${selectedPlan.id}`, updates);

            toast({
                title: "Success",
                description: "Saving plan updated successfully",
            });

            setIsEditDialogOpen(false);
            fetchPlans(); // Refresh the list
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Failed to update saving plan";
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
            console.error('Update error:', error);
        }
    };

    // Handle delete plan
    const handleDeletePlan = async (id: string, planName: string) => {
        if (!confirm(`Are you sure you want to delete "${planName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await apiClient.delete(`/saving-plans/${id}`);

            toast({
                title: "Success",
                description: "Saving plan deleted successfully",
            });

            fetchPlans(); // Refresh the list
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Failed to delete saving plan";
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });

            // Handle different error scenarios
            if (errorMessage.includes("Cannot delete a completed plan")) {
                if (confirm("This plan is marked as completed. Would you like to change it to active first?")) {
                    try {
                        // First change it to active, then delete
                        await apiClient.patch(`/saving-plans/${id}`, {
                            isCompleted: false,
                            isActive: true
                        });

                        // Try delete again
                        await apiClient.delete(`/saving-plans/${id}`);

                        toast({
                            title: "Success",
                            description: "Plan deleted successfully",
                        });
                        fetchPlans();
                    } catch (retryError) {
                        toast({
                            title: "Error",
                            description: "Failed to modify and delete plan",
                            variant: "destructive",
                        });
                    }
                }
            } else if (errorMessage.includes("Cannot delete plan with existing savings")) {
                if (confirm("This plan has existing savings. Would you like to archive it instead?")) {
                    try {
                        await apiClient.patch(`/saving-plans/${id}`, { isActive: false });
                        toast({
                            title: "Success",
                            description: "Plan archived successfully",
                        });
                        fetchPlans();
                    } catch (archiveError) {
                        toast({
                            title: "Error",
                            description: "Failed to archive plan",
                            variant: "destructive",
                        });
                    }
                }
            }
        }
    };

    // Handle update amount
    const handleUpdateAmount = async (id: string, amount: number) => {
        try {
            await apiClient.patch(`/saving-plans/${id}/amount`, { amount });

            toast({
                title: "Success",
                description: "Amount updated successfully",
            });

            fetchPlans(); // Refresh the list
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to update amount",
                variant: "destructive",
            });
        }
    };

    // Open edit dialog
    const openEditDialog = (plan: SavingPlan) => {
        setSelectedPlan(plan);
        setEditPlan({
            name: plan.name,
            description: plan.description || "",
            targetAmount: plan.targetAmount,
            amountPerPeriod: plan.amountPerPeriod,
            category: plan.category || "general",
            color: plan.color || "#3b82f6",
            isActive: plan.isActive,
            isCompleted: plan.isCompleted,
            frequency: plan.frequency,
        });
        setIsEditDialogOpen(true);
    };

    // Reset new plan form
    const resetNewPlanForm = () => {
        setNewPlan({
            name: "",
            description: "",
            targetAmount: 1000,
            startDate: new Date().toISOString().split('T')[0],
            frequency: "MONTHLY",
            amountPerPeriod: 100,
            category: "general",
            color: "#3b82f6",
        });
    };

    // Filter plans based on search and status
    const filteredPlans = plans.filter(plan => {
        const matchesSearch = plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            plan.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = filterStatus === "all" ||
            (filterStatus === "active" && plan.isActive) ||
            (filterStatus === "completed" && plan.isCompleted) ||
            (filterStatus === "inactive" && !plan.isActive);

        return matchesSearch && matchesStatus;
    });

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Get frequency label
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

    // Get days remaining
    const getDaysRemaining = (endDate: string) => {
        const today = new Date();
        const end = new Date(endDate);
        const diffTime = end.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    // Render loading skeletons
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

    // Render dashboard stats
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
                        <p className="text-xs text-muted-foreground">
                            Overall savings goal
                        </p>
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
                        <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {dashboardData.summary.overallProgress.toFixed(1)}%
                        </div>
                        <Progress
                            value={dashboardData.summary.overallProgress}
                            className="mt-2"
                        />
                    </CardContent>
                </Card>
            </div>
        );
    };

    // Render plan card
    const renderPlanCard = (plan: SavingPlan) => {
        const progress = (plan.currentAmount / plan.targetAmount) * 100;
        const daysRemaining = plan.endDate ? getDaysRemaining(plan.endDate) : null;

        return (
            <Card key={plan.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                {plan.name}
                                {plan.isCompleted && (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Completed
                                    </Badge>
                                )}
                                {plan.isActive && !plan.isCompleted && (
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                        Active
                                    </Badge>
                                )}
                                {!plan.isActive && !plan.isCompleted && (
                                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                        Inactive
                                    </Badge>
                                )}
                            </CardTitle>
                            <CardDescription>
                                {plan.description || "No description provided"}
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
                                <DropdownMenuItem onClick={() => openEditDialog(plan)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Plan
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                    const newAmount = parseFloat(prompt(`Update amount for ${plan.name} (Current: $${plan.currentAmount})`, plan.currentAmount.toString()) || "0");
                                    if (!isNaN(newAmount) && newAmount >= 0) {
                                        handleUpdateAmount(plan.id, newAmount);
                                    }
                                }}>
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    Update Amount
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleDeletePlan(plan.id, plan.name)}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Plan
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Progress bar */}
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium">
                                    {formatCurrency(plan.currentAmount)} of {formatCurrency(plan.targetAmount)}
                                </span>
                                <span className="font-semibold">{progress.toFixed(1)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>

                        {/* Plan details */}
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
                                        {daysRemaining && daysRemaining > 0 ? `${daysRemaining} days left` : 'Completed'}
                                    </p>
                                    <p className="font-medium">{formatDate(plan.endDate)}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="pt-0">
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                            const amountToAdd = parseFloat(prompt(`How much to add to ${plan.name}?`, plan.amountPerPeriod.toString()) || "0");
                            if (!isNaN(amountToAdd) && amountToAdd > 0) {
                                handleUpdateAmount(plan.id, plan.currentAmount + amountToAdd);
                            }
                        }}
                        disabled={plan.isCompleted}
                    >
                        Add Savings
                    </Button>
                </CardFooter>
            </Card>
        );
    };

    // Render empty state
    const renderEmptyState = () => (
        <Card>
            <CardContent className="pt-6 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <Target className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No saving plans yet</h3>
                <p className="text-muted-foreground mt-2 mb-4">
                    Create your first saving plan to start tracking your financial goals
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Plan
                </Button>
            </CardContent>
        </Card>
    );

    return (
        <ProtectedRoute>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <Header title="Saving Plans" subtitle="Track and manage your savings goals" />
                    <div className="flex flex-1 flex-col gap-6 p-6">
                        {/* Header with actions */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <Button variant="outline">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <Plus className="mr-2 h-4 w-4" />
                                            New Plan
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[500px]">
                                        <DialogHeader>
                                            <DialogTitle>Create New Saving Plan</DialogTitle>
                                            <DialogDescription>
                                                Set up a new savings goal with target amount and frequency.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-2 gap-4">
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
                                                    <Label htmlFor="category">Category</Label>
                                                    <Select
                                                        value={newPlan.category}
                                                        onValueChange={(value) => setNewPlan({ ...newPlan, category: value })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select category" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="general">General</SelectItem>
                                                            <SelectItem value="vacation">Vacation</SelectItem>
                                                            <SelectItem value="emergency">Emergency Fund</SelectItem>
                                                            <SelectItem value="investment">Investment</SelectItem>
                                                            <SelectItem value="education">Education</SelectItem>
                                                            <SelectItem value="car">Car</SelectItem>
                                                            <SelectItem value="house">House</SelectItem>
                                                            <SelectItem value="wedding">Wedding</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
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
                                                            onChange={(e) => setNewPlan({ ...newPlan, targetAmount: parseFloat(e.target.value) || 0 })}
                                                            className="pl-8"
                                                            min="1"
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
                                                            onChange={(e) => setNewPlan({ ...newPlan, amountPerPeriod: parseFloat(e.target.value) || 0 })}
                                                            className="pl-8"
                                                            min="1"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="startDate">Start Date *</Label>
                                                    <Input
                                                        id="startDate"
                                                        type="date"
                                                        value={newPlan.startDate}
                                                        onChange={(e) => setNewPlan({ ...newPlan, startDate: e.target.value })}
                                                    />
                                                </div>
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
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button onClick={handleCreatePlan}>
                                                Create Plan
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
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
                                            placeholder="e.g., Vacation Fund"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="edit-description">Description (Optional)</Label>
                                        <Input
                                            id="edit-description"
                                            value={editPlan.description || ""}
                                            onChange={(e) => setEditPlan({ ...editPlan, description: e.target.value })}
                                            placeholder="What are you saving for?"
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
                                                    onChange={(e) => setEditPlan({ ...editPlan, targetAmount: parseFloat(e.target.value) || 0 })}
                                                    className="pl-8"
                                                    min="1"
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
                                                    onChange={(e) => setEditPlan({ ...editPlan, amountPerPeriod: parseFloat(e.target.value) || 0 })}
                                                    className="pl-8"
                                                    min="1"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-category">Category</Label>
                                            <Select
                                                value={editPlan.category || "general"}
                                                onValueChange={(value) => setEditPlan({ ...editPlan, category: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="general">General</SelectItem>
                                                    <SelectItem value="vacation">Vacation</SelectItem>
                                                    <SelectItem value="emergency">Emergency Fund</SelectItem>
                                                    <SelectItem value="investment">Investment</SelectItem>
                                                    <SelectItem value="education">Education</SelectItem>
                                                    <SelectItem value="car">Car</SelectItem>
                                                    <SelectItem value="house">House</SelectItem>
                                                    <SelectItem value="wedding">Wedding</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
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
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
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
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-isCompleted">Completion</Label>
                                            <Select
                                                value={editPlan.isCompleted ? "completed" : "not-completed"}
                                                onValueChange={(value) => setEditPlan({ ...editPlan, isCompleted: value === "completed" })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select completion" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="not-completed">Not Completed</SelectItem>
                                                    <SelectItem value="completed">Completed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleUpdatePlan}>
                                        Update Plan
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

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
                            <div className="flex gap-2">
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
                        </div>

                        {/* Tabs for different views */}
                        <Tabs defaultValue="all" className="w-full">
                            <TabsList>
                                <TabsTrigger value="all">All Plans</TabsTrigger>
                                <TabsTrigger value="active">Active</TabsTrigger>
                                <TabsTrigger value="completed">Completed</TabsTrigger>
                            </TabsList>
                            <TabsContent value="all" className="mt-4">
                                {isLoading ? (
                                    renderLoadingSkeletons()
                                ) : filteredPlans.length > 0 ? (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {filteredPlans.map(renderPlanCard)}
                                    </div>
                                ) : (
                                    renderEmptyState()
                                )}
                            </TabsContent>
                            <TabsContent value="active" className="mt-4">
                                {isLoading ? (
                                    renderLoadingSkeletons()
                                ) : filteredPlans.filter(p => p.isActive).length > 0 ? (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {filteredPlans.filter(p => p.isActive).map(renderPlanCard)}
                                    </div>
                                ) : (
                                    <Card>
                                        <CardContent className="pt-6 text-center">
                                            <p className="text-muted-foreground">No active saving plans found.</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>
                            <TabsContent value="completed" className="mt-4">
                                {isLoading ? (
                                    renderLoadingSkeletons()
                                ) : filteredPlans.filter(p => p.isCompleted).length > 0 ? (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {filteredPlans.filter(p => p.isCompleted).map(renderPlanCard)}
                                    </div>
                                ) : (
                                    <Card>
                                        <CardContent className="pt-6 text-center">
                                            <p className="text-muted-foreground">No completed saving plans found.</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </ProtectedRoute>
    );
}