import { kv } from "@vercel/kv"

interface LeaderboardEntry {
  profileUrl: string
  name: string
  points: number
  badges: number
  lastUpdated: string
}

export async function GET() {
  try {
    const leaderboard = ((await kv.get("leaderboard")) as LeaderboardEntry[]) || []

    const sortedLeaderboard = [...leaderboard]
      .sort((a, b) => b.points - a.points)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }))

    return Response.json(sortedLeaderboard)
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return Response.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { profileUrl, name, points, badges } = await request.json()

    if (!profileUrl || !name || points === undefined || badges === undefined) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const leaderboard = ((await kv.get("leaderboard")) as LeaderboardEntry[]) || []
    const existingIndex = leaderboard.findIndex((entry) => entry.profileUrl === profileUrl)

    const newEntry: LeaderboardEntry = {
      profileUrl,
      name,
      points,
      badges,
      lastUpdated: new Date().toISOString(),
    }

    if (existingIndex >= 0) {
      leaderboard[existingIndex] = newEntry
    } else {
      leaderboard.push(newEntry)
    }

    await kv.set("leaderboard", leaderboard)

    const sortedLeaderboard = [...leaderboard]
      .sort((a, b) => b.points - a.points)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }))

    return Response.json(sortedLeaderboard)
  } catch (error) {
    console.error("Error updating leaderboard:", error)
    return Response.json({ error: "Failed to update leaderboard" }, { status: 500 })
  }
}
