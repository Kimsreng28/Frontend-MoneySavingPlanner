'use client';

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Search,
    Filter,
    Download,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle,
    AlertCircle,
    Calendar,
    FileText,
    Table as TableIcon,
    FileSpreadsheet,
    Loader2,
} from "lucide-react";
import { ExportFormat, SavingPlan, TransactionType } from "@/types/saving-plans";
import apiClient from "@/api/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Transaction {
    id: string;
    amount: number;
    type: TransactionType;
    transactionDate: string;
    note: string;
    isManual: boolean;
    isCatchUp: boolean;
    createdAt: string;
}

interface TransactionHistoryProps {
    plan: SavingPlan;
}

const typeColors = {
    [TransactionType.SAVED]: "bg-green-100 text-green-800",
    [TransactionType.EXTRA]: "bg-blue-100 text-blue-800",
    [TransactionType.PARTIAL]: "bg-yellow-100 text-yellow-800",
    [TransactionType.MISSED]: "bg-red-100 text-red-800",
    [TransactionType.WITHDRAWAL]: "bg-purple-100 text-purple-800",
};

const typeIcons = {
    [TransactionType.SAVED]: <TrendingUp className="h-4 w-4" />,
    [TransactionType.EXTRA]: <TrendingUp className="h-4 w-4" />,
    [TransactionType.PARTIAL]: <TrendingUp className="h-4 w-4" />,
    [TransactionType.MISSED]: <Clock className="h-4 w-4" />,
    [TransactionType.WITHDRAWAL]: <TrendingDown className="h-4 w-4" />,
};

// Helper function to ensure proper number formatting
const ensureNumber = (value: any): number => {
    if (value === null || value === undefined) return 0;
    const num = parseFloat(value);
    return isNaN(num) ? 0 : parseFloat(num.toFixed(2));
};

export function TransactionHistory({ plan }: TransactionHistoryProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [dateFilter, setDateFilter] = useState<string>("all");

    const { toast } = useToast();

    useEffect(() => {
        fetchTransactions();
    }, [plan.id]);

    const fetchTransactions = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get(`/saving-transactions/plan/${plan.id}`);
            console.log('Transaction response:', response.data);

            // Ensure all amounts are numbers
            const processedTransactions = (response.data.transactions || []).map((transaction: any) => ({
                ...transaction,
                amount: ensureNumber(transaction.amount)
            }));

            setTransactions(processedTransactions);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
            toast({
                title: "Error",
                description: "Failed to load transactions",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const exportTransactions = async (format: ExportFormat) => {
        setIsExporting(true);
        try {
            // Prepare export payload with current filters
            const exportPayload: any = {
                format,
                dateFilter: dateFilter !== 'all' ? dateFilter : 'all',
            };

            // Only add type filter if not 'all'
            if (typeFilter !== 'all') {
                exportPayload.type = typeFilter;
            }

            console.log('Export payload:', exportPayload);

            // Make API call with responseType blob for file download
            const response = await apiClient.post(
                `/saving-transactions/plan/${plan.id}/export`,
                exportPayload,
                {
                    responseType: 'blob',
                }
            );

            // Get filename
            let filename = `${plan.name.replace(/\s+/g, '_')}_transactions_${new Date().toISOString().split('T')[0]}`;

            // Set extension based on format
            const extension = format === ExportFormat.EXCEL ? 'xlsx' : format;
            filename = `${filename}.${extension}`;

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);

            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast({
                title: "Export Successful",
                description: `Transactions exported as ${format.toUpperCase()}`,
            });

        } catch (error: any) {
            console.error('Error exporting transactions:', error);

            let errorMessage = "Failed to export transactions";
            if (error.response?.data) {
                try {
                    // For blob responses, we need to read it differently
                    if (error.response.data instanceof Blob) {
                        const errorText = await error.response.data.text();
                        if (errorText) {
                            try {
                                const errorJson = JSON.parse(errorText);
                                errorMessage = errorJson.message || errorMessage;
                            } catch {
                                errorMessage = errorText;
                            }
                        }
                    }
                } catch (parseError) {
                    console.error('Error parsing error response:', parseError);
                }
            }

            toast({
                title: "Export Failed",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsExporting(false);
        }
    };

    // Quick export function
    const quickExport = async (format: ExportFormat) => {
        setIsExporting(true);
        try {
            // Make GET request for quick export 
            const response = await apiClient.get(
                `/saving-transactions/plan/${plan.id}/export?format=${format}`,
                {
                    responseType: 'blob',
                }
            );

            // Create download link
            const filename = `${plan.name.replace(/\s+/g, '_')}_transactions_${new Date().toISOString().split('T')[0]}.${format === ExportFormat.EXCEL ? 'xlsx' : format}`;
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);

            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast({
                title: "Export Successful",
                description: `All transactions exported as ${format.toUpperCase()}`,
            });

        } catch (error) {
            console.error('Error in quick export:', error);
            toast({
                title: "Export Failed",
                description: "Failed to export transactions",
                variant: "destructive",
            });
        } finally {
            setIsExporting(false);
        }
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
            year: 'numeric',
        });
    };

    const getTypeLabel = (type: TransactionType) => {
        const labels = {
            [TransactionType.SAVED]: 'Regular',
            [TransactionType.EXTRA]: 'Extra',
            [TransactionType.PARTIAL]: 'Partial',
            [TransactionType.MISSED]: 'Missed',
            [TransactionType.WITHDRAWAL]: 'Withdrawal',
        };
        return labels[type] || type;
    };

    const filteredTransactions = transactions.filter((transaction) => {
        const matchesSearch =
            searchQuery === "" ||
            transaction.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transaction.amount.toString().includes(searchQuery);

        const matchesType =
            typeFilter === "all" ||
            transaction.type === typeFilter;

        const matchesDate =
            dateFilter === "all" ||
            (dateFilter === "this-month" &&
                new Date(transaction.transactionDate).getMonth() === new Date().getMonth() &&
                new Date(transaction.transactionDate).getFullYear() === new Date().getFullYear()) ||
            (dateFilter === "last-month" &&
                new Date(transaction.transactionDate).getMonth() === new Date().getMonth() - 1);

        return matchesSearch && matchesType && matchesDate;
    });

    const getSummary = () => {
        const summary = {
            totalDeposits: 0,
            totalWithdrawals: 0,
            totalMissed: 0,
            netChange: 0,
        };

        transactions.forEach((transaction) => {
            const amount = ensureNumber(transaction.amount);

            if (transaction.type === TransactionType.WITHDRAWAL) {
                summary.totalWithdrawals += amount;
                summary.netChange -= amount;
            } else if (transaction.type === TransactionType.MISSED) {
                summary.totalMissed += amount;
            } else {
                summary.totalDeposits += amount;
                summary.netChange += amount;
            }
        });

        return summary;
    };

    const summary = getSummary();

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Transaction History</CardTitle>
                        <CardDescription>
                            All transactions for {plan.name}
                        </CardDescription>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" disabled={isExporting}>
                                {isExporting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        <Download className="mr-2 h-4 w-4" />
                                        Export
                                    </>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <div className="px-2 py-1.5 text-sm font-semibold">Export with Filters</div>
                            <DropdownMenuItem
                                onClick={() => exportTransactions(ExportFormat.CSV)}
                                disabled={isExporting || transactions.length === 0}
                            >
                                <TableIcon className="mr-2 h-4 w-4" />
                                Export as CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => exportTransactions(ExportFormat.EXCEL)}
                                disabled={isExporting || transactions.length === 0}
                            >
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                Export as Excel
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => exportTransactions(ExportFormat.PDF)}
                                disabled={isExporting || transactions.length === 0}
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                Export as PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <div className="px-2 py-1.5 text-sm font-semibold">Quick Export (All Data)</div>
                            <DropdownMenuItem
                                onClick={() => quickExport(ExportFormat.CSV)}
                                disabled={isExporting}
                            >
                                <TableIcon className="mr-2 h-4 w-4" />
                                Quick CSV Export
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => quickExport(ExportFormat.EXCEL)}
                                disabled={isExporting}
                            >
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                Quick Excel Export
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-6">
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Deposits</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {formatCurrency(summary.totalDeposits)}
                                    </p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Withdrawals</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {formatCurrency(summary.totalWithdrawals)}
                                    </p>
                                </div>
                                <TrendingDown className="h-8 w-8 text-purple-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Missed</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {formatCurrency(summary.totalMissed)}
                                    </p>
                                </div>
                                <Clock className="h-8 w-8 text-red-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Net Change</p>
                                    <p className={`text-2xl font-bold ${summary.netChange >= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {formatCurrency(summary.netChange)}
                                    </p>
                                </div>
                                {summary.netChange >= 0 ? (
                                    <TrendingUp className="h-8 w-8 text-green-500" />
                                ) : (
                                    <TrendingDown className="h-8 w-8 text-red-500" />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search transactions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[180px]">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value={TransactionType.SAVED}>Regular</SelectItem>
                            <SelectItem value={TransactionType.EXTRA}>Extra</SelectItem>
                            <SelectItem value={TransactionType.PARTIAL}>Partial</SelectItem>
                            <SelectItem value={TransactionType.MISSED}>Missed</SelectItem>
                            <SelectItem value={TransactionType.WITHDRAWAL}>Withdrawal</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger className="w-[180px]">
                            <Calendar className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Filter by date" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="this-month">This Month</SelectItem>
                            <SelectItem value="last-month">Last Month</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Transactions Table */}
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Note</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <TableRow key={index}>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredTransactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">
                                        <div className="flex flex-col items-center gap-2">
                                            <AlertCircle className="h-8 w-8 text-muted-foreground" />
                                            <p className="text-muted-foreground">No transactions found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredTransactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell>
                                            <div className="font-medium">{formatDate(transaction.transactionDate)}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(transaction.createdAt).toLocaleTimeString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`${typeColors[transaction.type]} border-0`}
                                            >
                                                <span className="flex items-center gap-1">
                                                    {typeIcons[transaction.type]}
                                                    {getTypeLabel(transaction.type)}
                                                </span>
                                            </Badge>
                                            {transaction.isCatchUp && (
                                                <Badge variant="outline" className="ml-2 text-xs">
                                                    Catch-up
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`font-medium ${transaction.type === TransactionType.WITHDRAWAL
                                                ? 'text-red-600'
                                                : 'text-green-600'
                                                }`}>
                                                {transaction.type === TransactionType.WITHDRAWAL ? '-' : '+'}
                                                {formatCurrency(transaction.amount)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-[200px] truncate" title={transaction.note}>
                                                {transaction.note || '-'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {transaction.isManual ? (
                                                <Badge variant="outline" className="text-xs">
                                                    Manual
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-xs bg-blue-50">
                                                    Auto
                                                </Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

