"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminAdminsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/superadmin/admins"); }, [router]);
  return null;
}
