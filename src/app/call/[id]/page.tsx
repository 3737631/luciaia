import { notFound } from "next/navigation";
import { girls, getGirlById } from "@/data/girls";
import CallScreen from "@/components/CallScreen";

export function generateStaticParams() {
  return girls.map((g) => ({ id: g.id }));
}

export default function CallPage({ params }: { params: { id: string } }) {
  const girl = getGirlById(params.id);
  if (!girl) return notFound();
  return <CallScreen girl={girl} />;
}
