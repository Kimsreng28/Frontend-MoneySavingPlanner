import { Button } from "@/components/ui/button";
import { Plus, ArrowUpRight, Target, Calendar } from "lucide-react";

interface QuickActionsProps {
  onAddSaving: () => void;
  onNewPlan: () => void;
}

export const QuickActions = ({ onAddSaving, onNewPlan }: QuickActionsProps) => {
  return (
    <div className="flex flex-wrap gap-3">
      <Button className="btn-primary-gradient gap-2">
        <Plus className="w-4 h-4" />
        Add Saving
      </Button>
      <Button
        variant="outline"
        className="gap-2 hover:bg-secondary hover:text-secondary-foreground"
      >
        <Target className="w-4 h-4" />
        New Plan
      </Button>
      <Button
        variant="outline"
        className="gap-2 hover:bg-secondary hover:text-secondary-foreground"
      >
        <Calendar className="w-4 h-4" />
        Schedule
      </Button>
      <Button
        variant="ghost"
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowUpRight className="w-4 h-4" />
        View Reports
      </Button>
    </div>
  );
};
