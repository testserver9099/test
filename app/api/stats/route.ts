import { kv } from "@vercel/kv"

export async function GET() {
  try {
    const visitors = (await kv.get("visitors")) || 3000
    const profilesAnalyzed = (await kv.get("profilesAnalyzed")) || 2800

    return Response.json({
      visitors,
      profilesAnalyzed,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
