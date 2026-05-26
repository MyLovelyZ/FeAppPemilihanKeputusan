"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function AdminAdminDetailRedirect() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  useEffect(() => { router.replace(`/superadmin/admins/${id}`); }, [router, id]);
  return null;
}
