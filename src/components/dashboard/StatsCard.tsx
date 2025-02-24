
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend: string;
  trendUp: boolean;
  alert?: boolean;
}

export function StatsCard({ title, value, icon: Icon, trend, trendUp, alert }: StatsCardProps) {
  return (
    <Card 
      className={cn(
        "hover:shadow-lg transition-shadow duration-200",
        alert && value > 5 ? "border-red-500" : ""
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <Icon className={cn(
          "w-5 h-5",
          alert && value > 5 ? "text-red-500" : "text-gray-400"
        )} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className={cn(
          "text-xs font-medium mt-2",
          trendUp ? "text-green-600" : "text-red-600"
        )}>
          {trend} from last month
        </div>
      </CardContent>
    </Card>
  );
}
