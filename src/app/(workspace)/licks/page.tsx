import { LicksView } from "@/components/licks/LicksView";
import { getLocalDateKey } from "@/utils/local-date";

export const dynamic = "force-dynamic";

export default function LicksPage() {
  return <LicksView todayKey={getLocalDateKey(new Date())} />;
}
