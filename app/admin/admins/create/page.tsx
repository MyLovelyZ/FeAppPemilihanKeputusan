"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminAdminsCreateRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/superadmin/admins/create"); }, [router]);
  return null;
}
