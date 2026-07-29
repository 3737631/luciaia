import { notFound } from "next/navigation";
import { girls, getGirlById } from "@/data/girls";
import ChatWindow from "@/components/ChatWindow";
import Header from "@/components/Header";

export function generateStaticParams() {
  return girls.map((g) => ({ id: g.id }));
}

export default function ChatPage({ params }: { params: { id: string } }) {
  const girl = getGirlById(params.id);
  if (!girl) return notFound();
  return (
    <>
      <Header />
      <ChatWindow girl={girl} />
    </>
  );
}
