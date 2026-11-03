import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";

export default async function AdminIndex() {
  redirect((await currentUser()) ? "/admin/updates" : "/admin/login");
}
