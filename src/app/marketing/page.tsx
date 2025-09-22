import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { MarketingLanding } from "@/components/marketing-landing";

export default async function MarketingPage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/");
  }
  return <MarketingLanding />;
}


