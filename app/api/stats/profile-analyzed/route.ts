import { kv } from "@vercel/kv"

export async function POST() {
  try {
    const current = (await kv.get("profilesAnalyzed")) || 2800
    const updated = current + 1
    await kv.set("profilesAnalyzed", updated)

    return Response.json({ profilesAnalyzed: updated })
  } catch (error) {
    console.error("Error updating profile count:", error)
    return Response.json({ error: "Failed to update profile count" }, { status: 500 })
  }
}
