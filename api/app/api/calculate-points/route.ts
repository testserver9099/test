import axios from "axios"
import * as cheerio from "cheerio"

interface Badge {
  name: string
  type: "game" | "trivia" | "skill" | "completion" | "lab-free"
  earnedDate: string
}

interface Points {
  total: number
  gameBadges: number
  triviaBadges: number
  skillBadges: number
  milestonePoints: number
}

const START_DATE = new Date("2025-07-01")

// Badge lists
const GAME_BADGE_KEYWORDS = [
  "Love Beyond",
  "Arcade Skills Resolve",
  "Arcade Skillsresolve",
  "Color Your Skills",
  "Arcade FutureReady Skills August",
  "Future Ready Skills",
  "FutureReady Skills",
  "ExtraSkillestrial",
  "ExtraSkillesTrail",
  "Skills Scribble",
  "Level 1",
  "Level 2",
  "Base Camp",
  "Arcade Certification Zone",
  "Level 3",
  "Arcade NetworSkills",
  "Arcade TechCare",
]

const SKILL_BADGES = [
  "Analyze BigQuery Data in Connected Sheets",
  "Discover and Protect Sensitive Data Across Your Ecosystem",
  "Protect Cloud Traffic with Chrome Enterprise Premium Security",
  "Explore Generative AI with the Gemini API in Vertex AI",
  "Streaming Analytics into BigQuery",
  "Store, Process, and Manage Data on Google Cloud - Console",
  "Using the Google Cloud Speech API",
  "Analyze Speech and Language with Google APIs",
  "Create a Secure Data Lake on Cloud Storage",
  "Get Started with API Gateway",
  "Get Started with Dataplex",
  "Get Started with Pub/Sub",
  "Get Started with Sensitive Data Protection",
  "Tag and Discover BigLake Data",
  "Use APIs to Work with Cloud Storage",
  "Integrate BigQuery Data and Google Workspace using Apps Script",
  "Configure Service Accounts and IAM Roles for Google Cloud",
  "Prepare Data for Looker Dashboards and Reports",
  "Create and Manage Cloud Spanner Instances",
  "Use Functions, Formulas, and Charts in Google Sheets",
  "Create and Manage AlloyDB Instances",
  "Build Real World AI Applications with Gemini and Imagen",
  "App Engine: 3 Ways",
  "Create a Streaming Data Lake on Cloud Storage",
  "Store, Process, and Manage Data on Google Cloud - Command Line",
  "App Building with AppSheet",
  "Cloud Functions: 3 Ways",
  "Cloud Run Functions: 3 Ways",
  "Get Started with Cloud Storage",
  "Get Started with Looker",
  "The Basics of Google Cloud Compute",
  "Analyze Images with the Cloud Vision API",
  "Analyze Sentiment with Natural Language API",
  "Cloud Speech API: 3 Ways",
  "Monitor and Manage Google Cloud Resources",
  "Protect Sensitive Data with Data Loss Prevention",
  "Secure BigLake Data",
  "Get Started with Eventarc",
  "Implement Load Balancing on Compute Engine",
  "Monitoring in Google Cloud",
  "Automate Data Capture at Scale with Document AI",
  "Develop Serverless Apps with Firebase",
  "Develop with Apps Script and AppSheet",
  "Networking Fundamentals on Google Cloud",
  "Build Google Cloud Infrastructure for Azure Professionals",
  "Engineer Data for Predictive Modeling with BigQuery ML",
  "Deploy Kubernetes Applications on Google Cloud",
  "Explore Generative AI with the Vertex AI Gemini API",
  "Implement CI/CD Pipelines on Google Cloud",
  "Implement DevOps Workflows in Google Cloud",
  "Build Google Cloud Infrastructure for AWS Professionals",
  "Inspect Rich Documents with Gemini Multimodality and Multimodal RAG",
  "Manage Kubernetes in Google Cloud",
  "Prompt Design in Vertex AI",
  "Protect Cloud Traffic with BeyondCorp Enterprise (BCE) Security",
  "Build LangChain Applications using Vertex AI",
  "Create and Manage Cloud SQL for PostgreSQL Instances",
  "Build a Data Warehouse with BigQuery",
  "Build a Data Mesh with Dataplex",
  "Migrate MySQL data to Cloud SQL using Database Migration Service",
  "Share Data Using Google Data Cloud",
  "Monitor and Log with Google Cloud Observability",
  "Perform Predictive Data Analysis in BigQuery",
  "Build Infrastructure with Terraform on Google Cloud",
  "Build LookML Objects in Looker",
  "Develop Serverless Applications on Cloud Run",
  "Build a Website on Google Cloud",
  "Create ML Models with BigQuery ML",
  "Mitigate Threats and Vulnerabilities with Security Command Center",
  "Develop GenAI Apps with Gemini and Streamlit",
  "Monitor Environments with Google Cloud Managed Service for Prometheus",
  "Create and Manage Bigtable Instances",
  "Detect Manufacturing Defects using Visual Inspection AI",
  "Optimize Costs for Google Kubernetes Engine",
  "Build and Deploy Machine Learning Solutions on Vertex AI",
  "Deploy and Manage Apigee X",
  "Set Up an App Dev Environment on Google Cloud",
  "Derive Insights from BigQuery Data",
  "Develop and Secure APIs with Apigee X",
  "Set Up a Google Cloud Network",
  "Implement Cloud Security Fundamentals on Google Cloud",
  "Develop your Google Cloud Network",
  "Build Custom Processors with Document AI",
  "Cloud Architecture: Design, Implement, and Manage",
  "Build a Secure Google Cloud Network",
  "Manage Data Models in Looker",
  "Classify Images with TensorFlow on Google Cloud",
  "Get Started with Google Workspace Tools",
  "Use Machine Learning APIs on Google Cloud",
  "Prepare Data for ML APIs on Google Cloud",
  "Implementing Cloud Load Balancing for Compute Engine",
  "Privileged Access with IAM",
  "Enhance Gemini Model Capabilities",
  "Modernize .Net Applications",
  "Build generative virtual agents with API integrations",
  "Edit images with Imagen",
  "Configure your Workplace: Google Workspace for IT Admins",
  "Connecting Cloud Networks with NCC",
  "Implement Multimodal Vector Search with BigQuery",
  "Secure Software Delivery",
  "Analyze and Reason on Multimodal Data with Gemini",
  "Designing Network Security in Google Cloud",
]

const LAB_FREE_BADGES = [
  "Digital Transformation with Google Cloud",
  "Exploring Data Transformation with Google Cloud",
  "Infrastructure and Application Modernization with Google Cloud",
  "Modernize Infrastructure and Applications with Google Cloud",
  "Scaling with Google Cloud Operations",
  "Innovating with Google Cloud Artificial Intelligence",
  "Trust and Security with Google Cloud",
  "Responsible AI: Applying AI Principles with Google Cloud",
  "Responsible AI for Digital Leaders with Google Cloud",
  "Customer Experience with Google AI Architecture",
  "Machine Learning Operations (MLOps) with Vertex AI: Model Evaluation",
  "Conversational AI on Vertex AI and Dialogflow CX",
  "Building Complex End to End Self-Service Experiences in Dialogflow CX",
  "Google Drive",
  "Google Docs",
  "Google Sheets",
  "Google Slides",
  "Google Meet",
  "Google Calendar",
  "Gen AI: Beyond the Chatbot",
  "Gen AI: Unlock Foundational Concepts",
  "Gen AI: Navigate the Landscape",
  "Gen AI Apps: Transform Your Work",
  "Introduction to Large Language Models",
  "Gen AI Agents: Transform Your Organization",
  "AI Infrastructure: Introduction to AI Hypercomputer",
]

const MILESTONE_POINTS = { 1: 2, 2: 8, 3: 15, 4: 25 }

// Utility functions
function normalizeBadgeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/^skills boost\s+/i, "")
    .replace(/^skill badge\s*:\s*/i, "")
    .replace(/^lab[- ]?free\s*:\s*/i, "")
    .replace(/^deprecated\s+/i, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function badgeNamesMatch(name1: string, name2: string): boolean {
  const n1 = normalizeBadgeName(name1)
  const n2 = normalizeBadgeName(name2)
  if (!n1 || !n2) return false
  if (n1 === n2) return true

  const minLength = Math.min(n1.length, n2.length)
  const maxLength = Math.max(n1.length, n2.length)
  if (minLength / maxLength < 0.6) {
    // Continue to word overlap check
  } else {
    if (n1.includes(n2) || n2.includes(n1)) return true
  }

  if (n1.length > 10 && n2.length > 10) {
    const words1 = n1.split(" ").filter((w) => w.length > 2)
    const words2 = n2.split(" ").filter((w) => w.length > 2)
    if (words1.length === 0 || words2.length === 0) return false
    const matching = words1.filter((w) => words2.includes(w)).length
    const ratio = matching / Math.min(words1.length, words2.length)
    if (ratio >= 0.7) return true
  }

  return false
}

function determineBadgeType(badgeName: string): Badge["type"] {
  const cleanedName = badgeName
    .replace(/^Skills Boost\s+/, "")
    .toLowerCase()
    .trim()

  if (cleanedName.includes("trivia")) return "trivia"
  if (
    cleanedName.includes("extraskillestrial") ||
    cleanedName.includes("extraskillestrail") ||
    cleanedName.includes("skills scribble") ||
    cleanedName.includes("futureready") ||
    cleanedName.includes("future ready") ||
    cleanedName.includes("diwali") ||
    cleanedName.includes("lights") ||
    cleanedName.includes("banking with empathy") ||
    cleanedName.includes("faster finance") ||
    cleanedName.includes("scaling success") ||
    cleanedName.includes("ai assured")
  ) {
    return "game"
  }

  for (const keyword of GAME_BADGE_KEYWORDS) {
    if (cleanedName.includes(keyword.toLowerCase())) return "game"
  }

  for (const labFreeBadge of LAB_FREE_BADGES) {
    if (normalizeBadgeName(badgeName) === normalizeBadgeName(labFreeBadge)) return "lab-free"
  }

  for (const skillBadge of SKILL_BADGES) {
    if (badgeNamesMatch(badgeName, skillBadge)) return "skill"
  }

  return "completion"
}

function calculatePoints(badges: Badge[]): Points {
  let gamePoints = 0,
    triviaPoints = 0,
    skillPoints = 0

  const retypedBadges = badges.map((b) => ({
    ...b,
    type: determineBadgeType(b.name),
  }))

  const seen = new Set<string>()
  const dedupedBadges: Badge[] = []
  for (const badge of retypedBadges) {
    const earned = new Date(badge.earnedDate)
    if (isNaN(earned.getTime())) continue
    const normalized = normalizeBadgeName(badge.name)
    const day = earned.toISOString().slice(0, 10)
    const key =
      badge.type === "skill" || badge.type === "lab-free" ? `name:${normalized}` : `name:${normalized}|day:${day}`
    if (seen.has(key)) continue
    seen.add(key)
    dedupedBadges.push({ ...badge, type: badge.type })
  }

  const recentBadges = dedupedBadges.filter((badge) => new Date(badge.earnedDate) >= START_DATE)

  for (const badge of recentBadges) {
    const badgeNameLower = badge.name.toLowerCase().trim()
    switch (badge.type) {
      case "game":
        if (badgeNameLower.includes("diwali") || badgeNameLower.includes("lights")) {
          gamePoints += 3
        } else if (
          badgeNameLower.includes("love beyond") ||
          badgeNameLower.includes("arcade skills resolve") ||
          badgeNameLower.includes("color your skills") ||
          badgeNameLower.includes("futureready") ||
          badgeNameLower.includes("future ready") ||
          badgeNameLower.includes("extraskillestrial") ||
          badgeNameLower.includes("skills scribble") ||
          badgeNameLower.includes("arcade networskills") ||
          badgeNameLower.includes("arcade techcare")
        ) {
          gamePoints += 2
        } else {
          gamePoints += 1
        }
        break
      case "trivia":
        triviaPoints += 1
        break
      case "skill":
        skillPoints += 0.5
        break
    }
  }

  return {
    total: gamePoints + triviaPoints + skillPoints,
    gameBadges: gamePoints,
    triviaBadges: triviaPoints,
    skillBadges: skillPoints,
    milestonePoints: 0,
  }
}

function calculateMilestonePoints(progress: number) {
  if (progress >= 100) return { milestonePoints: MILESTONE_POINTS[4], currentMilestone: 4 }
  if (progress >= 75) return { milestonePoints: MILESTONE_POINTS[3], currentMilestone: 3 }
  if (progress >= 50) return { milestonePoints: MILESTONE_POINTS[2], currentMilestone: 2 }
  if (progress >= 25) return { milestonePoints: MILESTONE_POINTS[1], currentMilestone: 1 }
  return { milestonePoints: 0, currentMilestone: 0 }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const profileUrl = searchParams.get("profileUrl")
    const isFacilitator = searchParams.get("isFacilitator")

    if (!profileUrl) {
      return Response.json({ error: "Profile URL is required" }, { status: 400 })
    }

    const response = await axios.get(profileUrl, {
      timeout: 15000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept-Encoding": "gzip, deflate",
      },
      maxRedirects: 5,
    })

    const $ = cheerio.load(response.data)
    const badges: Badge[] = []

    let profileName = $("h1.ql-headline-1").first().text().trim()
    if (!profileName) profileName = $('h1[class*="headline"]').first().text().trim()
    if (!profileName) profileName = $("h1").first().text().trim()
    if (!profileName) profileName = $(".profile-header h1").first().text().trim()
    if (!profileName) profileName = $('meta[property="og:title"]').attr("content")?.trim() || ""
    if (!profileName) profileName = "Unknown User"

    const memberSinceText = $(".ql-subhead-1.l-mbs").text().trim()
    let memberSince = "2025"
    const memberSinceMatch = memberSinceText.match(/Member since (\d{4})/i)
    if (memberSinceMatch) {
      memberSince = memberSinceMatch[1]
    } else {
      const yearMatch = memberSinceText.match(/(\d{4})/)
      if (yearMatch) memberSince = yearMatch[1]
    }

    $(".profile-badge").each((_, element) => {
      const $element = $(element)
      const name = $element.find(".ql-title-medium.l-mts").text().trim()
      const dateText = $element.find(".ql-body-medium.l-mbs").text().trim()
      const dateMatch = dateText.match(/Earned (.+?) (?:EST|EDT|PST|PDT)/)

      if (dateMatch) {
        const earnedDate = new Date(dateMatch[1])
        if (name && !isNaN(earnedDate.getTime())) {
          badges.push({
            name,
            type: determineBadgeType(name),
            earnedDate: earnedDate.toISOString(),
          })
        }
      }
    })

    const points = calculatePoints(badges)

    if (isFacilitator === "true") {
      const facilitatorStart = new Date("2025-08-04")
      const facilitatorEnd = new Date("2025-10-13T23:59:59.999Z")
      const facilitatorBadges = badges.filter((b) => {
        const date = new Date(b.earnedDate)
        return date >= facilitatorStart && date <= facilitatorEnd
      })

      const gameBadgeCount = facilitatorBadges.filter((b) => determineBadgeType(b.name) === "game").length
      const triviaBadgeCount = facilitatorBadges.filter((b) => determineBadgeType(b.name) === "trivia").length
      const skillBadgeCount = facilitatorBadges.filter((b) => determineBadgeType(b.name) === "skill").length
      const labFreeBadgeCount = facilitatorBadges.filter((b) => determineBadgeType(b.name) === "lab-free").length

      let currentMilestone = 0,
        progress = 0

      if (gameBadgeCount >= 12 && triviaBadgeCount >= 8 && skillBadgeCount >= 52 && labFreeBadgeCount >= 24) {
        currentMilestone = 4
        progress = 100
      } else if (gameBadgeCount >= 10 && triviaBadgeCount >= 7 && skillBadgeCount >= 38 && labFreeBadgeCount >= 18) {
        currentMilestone = 3
        progress = 75
      } else if (gameBadgeCount >= 8 && triviaBadgeCount >= 6 && skillBadgeCount >= 28 && labFreeBadgeCount >= 12) {
        currentMilestone = 2
        progress = 50
      } else if (gameBadgeCount >= 6 && triviaBadgeCount >= 5 && skillBadgeCount >= 14 && labFreeBadgeCount >= 6) {
        currentMilestone = 1
        progress = 25
      }

      const { milestonePoints } = calculateMilestonePoints(progress)
      points.milestonePoints = milestonePoints
      points.total = points.gameBadges + points.triviaBadges + points.skillBadges + milestonePoints

      return Response.json({
        badges,
        points,
        profileData: { name: profileName, memberSince },
        milestoneProgress: { currentMilestone, progress },
      })
    }

    points.milestonePoints = 0
    points.total = points.gameBadges + points.triviaBadges + points.skillBadges

    return Response.json({
      badges,
      points,
      profileData: { name: profileName, memberSince },
    })
  } catch (error) {
    console.error("Error calculating points:", error)
    return Response.json({ error: "Failed to calculate points" }, { status: 500 })
  }
}
