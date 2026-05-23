import ChatPageClient from "@/components/ChatPageClient";

interface ChatPageProps {
  params: Promise<{ boutiqueId: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { boutiqueId } = await params;
  return <ChatPageClient boutiqueId={boutiqueId} />;
}
