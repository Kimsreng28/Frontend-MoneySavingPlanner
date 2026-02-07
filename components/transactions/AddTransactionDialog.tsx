'use client';

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Loader2,
    AlertCircle,
    DollarSign,
    Calendar,
    FileText,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle,
    Wallet,
    CircleDollarSign,
    ShieldAlert,
    ArrowDownToLine,
    ArrowUpFromLine,
    Target,
    Plus,
    TriangleAlert
} from "lucide-react";
import { SavingPlan, TransactionType } from "@/types/saving-plans";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface AddTransactionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    plan: SavingPlan;
    onSubmit: (data: TransactionFormData) => Promise<void>;
    isProcessing: boolean;
    defaultType?: TransactionType;
}

export interface TransactionFormData {
    amount: number;
    type: TransactionType;
    transactionDate: string;
    note: string;
    isCatchUp: boolean;
}

const transactionTypeDetails = {
    [TransactionType.SAVED]: {
        label: "Regular Savings",
        description: "Your regular scheduled savings deposit",
        color: "bg-green-50 text-green-700 border-green-200",
        iconColor: "text-green-600",
        borderColor: "border-green-300",
        icon: <CircleDollarSign className="h-5 w-5" />,
        buttonIcon: <ArrowUpFromLine className="h-4 w-4" />
    },
    [TransactionType.EXTRA]: {
        label: "Extra Savings",
        description: "Additional savings beyond your regular amount",
        color: "bg-blue-50 text-blue-700 border-blue-200",
        iconColor: "text-blue-600",
        borderColor: "border-blue-300",
        icon: <TrendingUp className="h-5 w-5" />,
        buttonIcon: <ArrowUpFromLine className="h-4 w-4" />
    },
    [TransactionType.PARTIAL]: {
        label: "Partial Payment",
        description: "Partial savings (less than planned amount)",
        color: "bg-amber-50 text-amber-700 border-amber-200",
        iconColor: "text-amber-600",
        borderColor: "border-amber-300",
        icon: <Wallet className="h-5 w-5" />,
        buttonIcon: <ArrowUpFromLine className="h-4 w-4" />
    },
    [TransactionType.MISSED]: {
        label: "Missed Payment",
        description: "Track when you miss a scheduled savings payment",
        color: "bg-red-50 text-red-700 border-red-200",
        iconColor: "text-red-600",
        borderColor: "border-red-300",
        icon: <Clock className="h-5 w-5" />,
        buttonIcon: <ShieldAlert className="h-4 w-4" />
    },
    [TransactionType.WITHDRAWAL]: {
        label: "Withdrawal",
        description: "Withdraw money from your savings",
        color: "bg-purple-50 text-purple-700 border-purple-200",
        iconColor: "text-purple-600",
        borderColor: "border-purple-300",
        icon: <TrendingDown className="h-5 w-5" />,
        buttonIcon: <ArrowDownToLine className="h-4 w-4" />
    }
};

export function AddTransactionDialog({
    open,
    onOpenChange,
    plan,
    onSubmit,
    isProcessing,
    defaultType = TransactionType.SAVED // Default to SAVED
}: AddTransactionDialogProps) {
    const [formData, setFormData] = useState<TransactionFormData>({
        amount: plan.amountPerPeriod || 0,
        type: defaultType,
        transactionDate: new Date().toISOString().split('T')[0],
        note: "",
        isCatchUp: false
    });

    // Reset form when dialog opens or plan changes
    useEffect(() => {
        if (open) {
            setFormData({
                amount: plan.amountPerPeriod || 0,
                type: defaultType,
                transactionDate: new Date().toISOString().split('T')[0],
                note: "",
                isCatchUp: false
            });
        }
    }, [open, plan, defaultType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitting transaction:', formData);
        await onSubmit(formData);
        if (!isProcessing) {
            onOpenChange(false);
        }
    };

    const handleTypeChange = (type: TransactionType) => {
        console.log('Transaction type changed to:', type);
        setFormData({ ...formData, type });
        // Set default amount based on type
        if (type === TransactionType.SAVED || type === TransactionType.MISSED) {
            setFormData(prev => ({ ...prev, amount: plan.amountPerPeriod || 0 }));
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const getMaxWithdrawal = () => {
        return plan.currentAmount;
    };

    const validateAmount = () => {
        const { type, amount } = formData;

        if (amount <= 0) return "Amount must be greater than 0";

        if (type === TransactionType.WITHDRAWAL && amount > getMaxWithdrawal()) {
            return `Cannot withdraw more than ${formatCurrency(getMaxWithdrawal())}`;
        }

        return null;
    };

    const isToday = () => {
        const today = new Date().toISOString().split('T')[0];
        return formData.transactionDate === today;
    };

    const error = validateAmount();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                        <DollarSign className="h-5 w-5 text-primary" />
                        {defaultType === TransactionType.SAVED ? "Add Savings" : "Add Transaction"}
                    </DialogTitle>
                    <DialogDescription>
                        {defaultType === TransactionType.SAVED
                            ? `Quickly add savings to: ${plan.name}`
                            : `Record a transaction for: ${plan.name}`}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Plan Summary */}
                    <Card className="border border-gray-200 shadow-sm">
                        <CardContent className="p-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                        <Wallet className="h-3.5 w-3.5" />
                                        Current Balance
                                    </div>
                                    <p className="text-xl font-bold text-green-600">{formatCurrency(plan.currentAmount)}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                        <Target className="h-3.5 w-3.5" />
                                        Target Amount
                                    </div>
                                    <p className="text-xl font-bold text-blue-600">{formatCurrency(plan.targetAmount)}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                        <CircleDollarSign className="h-3.5 w-3.5" />
                                        Per Period
                                    </div>
                                    <p className="text-lg font-semibold text-gray-800">{formatCurrency(plan.amountPerPeriod)}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                        <TrendingUp className="h-3.5 w-3.5" />
                                        Progress
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-lg font-bold text-purple-600">
                                            {((plan.currentAmount / plan.targetAmount) * 100).toFixed(1)}%
                                        </p>
                                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                                                style={{ width: `${Math.min(100, (plan.currentAmount / plan.targetAmount) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Transaction Type Selection - Only show if not quick add */}
                    {defaultType === TransactionType.SAVED && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Plus className="h-4 w-4 text-blue-600" />
                                <p className="text-sm font-medium text-blue-700">
                                    Quick Add: Regular Savings
                                </p>
                            </div>
                            <p className="text-xs text-blue-600 mt-1">
                                Pre-filled with your regular savings amount. Change type if needed.
                            </p>
                        </div>
                    )}

                    <div className="space-y-3">
                        <Label className="text-base font-semibold flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Transaction Type
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.values(TransactionType).map((type) => {
                                const details = transactionTypeDetails[type];
                                const isSelected = formData.type === type;

                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => handleTypeChange(type)}
                                        className={`p-3 rounded-lg border text-left transition-all ${isSelected
                                            ? `${details.color} ${details.borderColor} border-2 shadow-sm ring-1 ring-primary/20`
                                            : 'border-gray-200 bg-white hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex flex-col items-start gap-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1.5 rounded-md ${details.iconColor}`}>
                                                    {details.icon}
                                                </div>
                                                <span className={`text-sm font-semibold ${details.color}`}>{details.label}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {details.description}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-3">
                        <Label htmlFor="amount" className="text-base font-semibold flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            {formData.type === TransactionType.WITHDRAWAL ? 'Withdrawal Amount' : 'Deposit Amount'}
                        </Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500">$</span>
                            </div>
                            <Input
                                id="amount"
                                type="number"
                                value={formData.amount}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value) || 0;
                                    console.log('Amount changed:', value);
                                    setFormData({ ...formData, amount: value });
                                }}
                                className="pl-8 h-11 text-base"
                                min="0.01"
                                step="0.01"
                                max={formData.type === TransactionType.WITHDRAWAL ? getMaxWithdrawal() : undefined}
                                placeholder="0.00"
                                required
                            />
                        </div>

                        {/* Amount Information */}
                        <div className={`p-3 rounded-lg flex items-start gap-3 ${formData.type === TransactionType.WITHDRAWAL
                            ? 'bg-blue-50 border border-blue-100'
                            : 'bg-green-50 border border-green-100'}`}>
                            <AlertCircle className={`h-4 w-4 mt-0.5 ${formData.type === TransactionType.WITHDRAWAL ? 'text-blue-600' : 'text-green-600'}`} />
                            <div>
                                <p className={`text-sm font-medium ${formData.type === TransactionType.WITHDRAWAL ? 'text-blue-700' : 'text-green-700'}`}>
                                    {formData.type === TransactionType.WITHDRAWAL
                                        ? `Available to withdraw: ${formatCurrency(getMaxWithdrawal())}`
                                        : `Recommended: ${formatCurrency(plan.amountPerPeriod)} per period`}
                                </p>
                                {formData.type !== TransactionType.WITHDRAWAL && (
                                    <p className="text-xs text-gray-600 mt-1">
                                        This is the amount you planned to save for each {plan.frequency.toLowerCase()} period
                                    </p>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
                                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                                <p className="text-sm font-medium text-red-700">{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Date and Note */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <Label htmlFor="date" className="text-base font-semibold flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Transaction Date
                                {formData.type === TransactionType.SAVED && isToday() && (
                                    <span className="text-xs font-normal text-amber-600">
                                        (Only one per day)
                                    </span>
                                )}
                            </Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.transactionDate}
                                onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                                className="h-11"
                                max={new Date().toISOString().split('T')[0]}
                                min={new Date().toISOString().split('T')[0]}
                                required
                            />
                            {formData.type === TransactionType.SAVED && isToday() && (
                                <p className="text-xs text-amber-600">
                                    <TriangleAlert className="h-4 w-4 inline-block" /> You can only record one Regular Savings per day.
                                    If you've already saved today, use a different date or choose "Extra Savings" type.
                                </p>
                            )}
                            <p className="text-xs text-gray-500">
                                Date when this transaction occurred
                            </p>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="note" className="text-base font-semibold flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Note (Optional)
                            </Label>
                            <Textarea
                                id="note"
                                value={formData.note}
                                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                placeholder={
                                    formData.type === TransactionType.SAVED
                                        ? "e.g., Monthly deposit, Salary savings..."
                                        : formData.type === TransactionType.WITHDRAWAL
                                            ? "e.g., Emergency withdrawal, Purchase..."
                                            : "e.g., Extra bonus, Gift money..."
                                }
                                rows={3}
                                className="resize-none"
                            />
                            <p className="text-xs text-gray-500">
                                Add context to help remember this transaction
                            </p>
                        </div>
                    </div>

                    {/* Catch-up Payment - Only for SAVED type */}
                    {formData.type === TransactionType.SAVED && (
                        <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <input
                                type="checkbox"
                                id="catch-up"
                                checked={formData.isCatchUp}
                                onChange={(e) => setFormData({ ...formData, isCatchUp: e.target.checked })}
                                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                            />
                            <div className="space-y-1">
                                <Label htmlFor="catch-up" className="text-sm font-semibold text-amber-800 flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    Catch-up Payment
                                </Label>
                                <p className="text-xs text-amber-700">
                                    Mark this if you're catching up on a missed payment from a previous period
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Transaction Summary */}
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Transaction Summary
                        </h4>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Type:</span>
                                <Badge variant="outline" className={`${transactionTypeDetails[formData.type].color} font-semibold`}>
                                    {transactionTypeDetails[formData.type].icon}
                                    <span className="ml-1.5">{transactionTypeDetails[formData.type].label}</span>
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Amount:</span>
                                <span className={`text-base font-bold ${formData.type === TransactionType.WITHDRAWAL ? 'text-red-600' : 'text-green-600'}`}>
                                    {formData.type === TransactionType.WITHDRAWAL ? '-' : '+'}{formatCurrency(formData.amount)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Date:</span>
                                <span className="text-sm font-medium">
                                    {new Date(formData.transactionDate).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                            {formData.note && (
                                <div className="flex justify-between items-start">
                                    <span className="text-sm text-gray-600">Note:</span>
                                    <span className="text-sm text-gray-700 text-right max-w-[200px]">{formData.note}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Buttons */}
                    <DialogFooter className="gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                console.log('Dialog cancelled');
                                onOpenChange(false);
                            }}
                            disabled={isProcessing}
                            className="h-10 px-6"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isProcessing || !!error}
                            className={`h-10 px-8 gap-2 ${formData.type === TransactionType.WITHDRAWAL
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'}`}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    {transactionTypeDetails[formData.type].buttonIcon}
                                    {formData.type === TransactionType.WITHDRAWAL ? 'Confirm Withdrawal' :
                                        defaultType === TransactionType.SAVED ? 'Add Savings' : 'Record Transaction'}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}