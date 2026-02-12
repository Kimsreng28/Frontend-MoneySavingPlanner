'use client';

import { Button } from "@/components/ui/button";
import { Plus, ArrowUpRight, Target, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

interface QuickActionsProps {
  onAddSaving?: () => void;
  onNewPlan?: () => void;
  onSchedule?: () => void;
  onViewReports?: () => void;
}

export const QuickActions = ({
  onAddSaving,
  onNewPlan,
  onSchedule,
  onViewReports
}: QuickActionsProps) => {
  const router = useRouter();

  const handleAddSaving = () => {
    if (onAddSaving) {
      onAddSaving();
    } else {
      // Default behavior: Navigate to goals page
      router.push('/goals');
    }
  };

  const handleNewPlan = () => {
    if (onNewPlan) {
      onNewPlan();
    } else {
      // Default behavior: Navigate to saving plans page
      router.push('/saving-plans');
    }
  };

  const handleSchedule = () => {
    if (onSchedule) {
      onSchedule();
    } else {
      // Default behavior: Navigate to tasks page
      router.push('/tasks');
    }
  };

  const handleViewReports = () => {
    if (onViewReports) {
      onViewReports();
    } else {
      // Default behavior: Navigate to reports page
      router.push('/reports');
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        className="btn-primary-gradient gap-2"
        onClick={handleAddSaving}
      >
        <Plus className="w-4 h-4" />
        Add Saving
      </Button>
      <Button
        variant="outline"
        className="gap-2 hover:bg-secondary hover:text-secondary-foreground"
        onClick={handleNewPlan}
      >
        <Target className="w-4 h-4" />
        New Plan
      </Button>
      <Button
        variant="outline"
        className="gap-2 hover:bg-secondary hover:text-secondary-foreground"
        onClick={handleSchedule}
      >
        <Calendar className="w-4 h-4" />
        Schedule
      </Button>
      <Button
        variant="ghost"
        className="gap-2 text-muted-foreground hover:text-foreground"
        onClick={handleViewReports}
      >
        <ArrowUpRight className="w-4 h-4" />
        View Reports
      </Button>
    </div>
  );
};