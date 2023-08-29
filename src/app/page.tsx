import { EmptyMemories } from "@/components/EmptyMemories";
import { cookies } from "next/headers";
import { FilterMemoriesForm } from "@/components/FilterMemoriesForm";

export default async function Home() {
  const isAuthenticated = cookies().has("token");

  if (!isAuthenticated) return <EmptyMemories />;

  return (
    <div className="flex flex-col gap-10 p-8">
      <FilterMemoriesForm />
    </div>
  );
}
