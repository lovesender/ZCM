import { redirect } from "next/navigation"

export default function NoticesPage() {
  redirect("/admin/notices/list")
}
