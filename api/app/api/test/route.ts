import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    status: "success",
    message: "API routes are working!",
    endpoints: {
      health: "/api/health",
      stats: "/api/stats",
      visitor: "/api/stats/visitor",
      profileAnalyzed: "/api/stats/profile-analyzed",
      leaderboard: "/api/leaderboard",
      calculatePoints: "/api/calculate-points?profileUrl=YOUR_PROFILE_URL",
    },
    note: "All serverless functions are deployed and ready to use",
  })
}
