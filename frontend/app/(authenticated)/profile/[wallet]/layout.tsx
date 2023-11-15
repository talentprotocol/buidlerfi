"use client";

import { ProfileProvider } from "@/contexts/profileContext";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <ProfileProvider>{children}</ProfileProvider>;
}
