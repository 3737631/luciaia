import { redirect } from "next/navigation";

export default function CustomizeIndex() {
  redirect("/customize/luna");
  return null;
}
