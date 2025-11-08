import { kv } from "@vercel/kv"

export async function POST() {
  try {
    const current = (await kv.get("visitors")) || 3000
    const updated = current + 1
    await kv.set("visitors", updated)

    return Response.json({ visitors: updated })
  } catch (error) {
    console.error("Error updating visitor count:", error)
    return Response.json({ error: "Failed to update visitor count" }, { status: 500 })
  }
}
