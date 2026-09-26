import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { homePathForRole } from "@/lib/auth/permissions";
import { RoleEntryScreen } from "@/components/entry/role-entry-screen";

export default async function HomePage() {
  const session = await getSession();
  if (session) {
    redirect(homePathForRole(session.role));
  }
  return <RoleEntryScreen />;
}
