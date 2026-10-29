import { ToolsView } from "@/components/tools/ToolsView";
import { getLocalDateKey } from "@/utils/local-date";

export const dynamic = "force-dynamic";

export default function ToolsPage() {
  return <ToolsView todayKey={getLocalDateKey(new Date())} />;
}
