import { revalidatePath, revalidateTag } from "next/cache";

export function revalidateVeloraPublic(tags: string[] = []) {
  revalidateTag("velora-public", "max");
  for (const tag of tags) {
    revalidateTag(tag, "max");
  }
  revalidatePath("/");
  revalidatePath("/work");
  revalidatePath("/services");
  revalidatePath("/how-it-works");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/privacy");
  revalidatePath("/terms");
  revalidatePath("/cookies");
}
