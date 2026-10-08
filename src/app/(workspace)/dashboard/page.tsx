import { DashboardView } from "@/components/dashboard/DashboardView";
import { getLocalDateKey } from "@/lib/local-date";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return <DashboardView todayKey={getLocalDateKey(new Date())} />;
}
