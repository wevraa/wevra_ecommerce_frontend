import ChatPageClient from "@/components/ChatPageClient";

interface ChatPageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params;
  return <ChatPageClient conversationId={id} />;
}
