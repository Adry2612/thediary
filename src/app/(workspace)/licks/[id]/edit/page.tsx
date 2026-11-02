import { LickEditorPage } from "@/components/licks/LickEditorPage";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function EditLickPage({ params }: Props) {
  const { id } = await params;
  return <LickEditorPage id={id} />;
}
