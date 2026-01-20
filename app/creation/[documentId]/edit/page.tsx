import EditForm from "./EditForm";
import { getContentById } from "@/app/api/[id]/route";

export default async function EditPage(props: {
  params: Promise<{documentId: string}>
}) {
  
  const docId = (await props.params).documentId;
  const data = await getContentById(docId);

  const safeItem = {
    id: data['data'].id,
    slug: data['data'].slug,
    title: data['data'].title,
    description: data['data'].description,
    contentType: data['data'].contentType,
    publishedAt: data['data'].publishedAt?.toISOString?.() ?? null,
    tag: data['data'].tag?.map((t: any) => ({
      id: t.id,
      value: t.value,
    })) ?? [],
  };
  
  return <EditForm slug={docId} item={safeItem} />;
  
}
