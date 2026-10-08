import { HomeView } from "@/components/home/HomeView";
import { getLocalDateKey } from "@/lib/local-date";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return <HomeView todayKey={getLocalDateKey(new Date())} />;
}
