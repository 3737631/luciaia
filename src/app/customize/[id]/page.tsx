import { notFound } from "next/navigation";
import { girls, getGirlById } from "@/data/girls";
import CustomizeClient from "@/components/CustomizeClient";

export function generateStaticParams() {
  return girls.map((g) => ({ id: g.id }));
}

export default function CustomizePage({ params }: { params: { id: string } }) {
  const girl = getGirlById(params.id);
  if (!girl) return notFound();
  return <CustomizeClient girl={girl} />;
}
