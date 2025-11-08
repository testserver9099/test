import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const app = express();

app.use(cors());
app.use(express.json());

// File path for persisting stats in a writable directory
const STATS_FILE = path.join('/tmp', 'stats.json');

// Ensure data directory exists
if (!fs.existsSync('/tmp')) {
  fs.mkdirSync('/tmp', { recursive: true });
}

// Load stats from file or initialize with default values
function loadStats() {
  try {
    if (fs.existsSync(STATS_FILE)) {
      const data = fs.readFileSync(STATS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
  // Default values if file doesn't exist or error occurs
  return { visitors: 3000, profilesAnalyzed: 2800 };
}

// Save stats to file
function saveStats() {
  try {
    fs.writeFileSync(STATS_FILE, JSON.stringify({
      visitors: globalVisitorCount,
      profilesAnalyzed: globalProfilesAnalyzed
    }, null, 2));
  } catch (error) {
    console.error('Error saving stats:', error);
  }
}

// Global counters - loaded from file
const initialStats = loadStats();
let globalVisitorCount = initialStats.visitors;
let globalProfilesAnalyzed = initialStats.profilesAnalyzed;


// Global leaderboard storage (in-memory)
interface LeaderboardEntry {
  profileUrl: string;
  name: string;
  points: number;
  badges: number;
  lastUpdated: string;
}

let globalLeaderboard: LeaderboardEntry[] = [];

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Get global stats
app.get('/stats', (req, res) => {
  res.json({
    visitors: globalVisitorCount,
    profilesAnalyzed: globalProfilesAnalyzed
  });
});

// Increment visitor count
app.post('/stats/visitor', (req, res) => {
  globalVisitorCount++;
  saveStats(); // Persist to file
  res.json({ visitors: globalVisitorCount });
});

// Increment profiles analyzed count
app.post('/stats/profile-analyzed', (req, res) => {
  globalProfilesAnalyzed++;
  saveStats(); // Persist to file
  res.json({ profilesAnalyzed: globalProfilesAnalyzed });
});

// Get global leaderboard
app.get('/leaderboard', (req, res) => {
  // Sort by points descending and add ranks
  const sortedLeaderboard = [...globalLeaderboard]
    .sort((a, b) => b.points - a.points)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  
  res.json(sortedLeaderboard);
});

// Update or add leaderboard entry
app.post('/leaderboard', (req, res) => {
  const { profileUrl, name, points, badges } = req.body;
  
  if (!profileUrl || !name || points === undefined || badges === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const existingIndex = globalLeaderboard.findIndex(entry => entry.profileUrl === profileUrl);
  
  const newEntry: LeaderboardEntry = {
    profileUrl,
    name,
    points,
    badges,
    lastUpdated: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    // Update existing entry
    globalLeaderboard[existingIndex] = newEntry;
  } else {
    // Add new entry
    globalLeaderboard.push(newEntry);
  }

  // Return sorted leaderboard with ranks
  const sortedLeaderboard = [...globalLeaderboard]
    .sort((a, b) => b.points - a.points)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

  res.json(sortedLeaderboard);
});

interface Badge {
  name: string;
  type: 'game' | 'trivia' | 'skill' | 'completion' | 'lab-free';
  earnedDate: string;
}

interface Points {
  total: number;
  gameBadges: number;  // Points from game badges
  triviaBadges: number;  // Points from trivia badges
  skillBadges: number;  // Points from skill badges
  milestonePoints: number;  // Points from highest completed milestone
}

interface ScrapedData {
  badges: Badge[];
  points: Points;
  profileData: {
    name: string;
    memberSince: string;
  };
  milestoneProgress?: {
    currentMilestone: number;
    progress: number;
  };
}

const START_DATE = new Date('2025-07-01');

/**
 * Normalize badge name for matching and deduping
 */
function normalizeBadgeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/^skills boost\s+/i, '')
    .replace(/^skill badge\s*:\s*/i, '')
    .replace(/^lab[- ]?free\s*:\s*/i, '')
    .replace(/^deprecated\s+/i, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Fuzzy match two badge names
 */
function badgeNamesMatch(name1: string, name2: string): boolean {
  const n1 = normalizeBadgeName(name1);
  const n2 = normalizeBadgeName(name2);
  if (!n1 || !n2) return false;
  if (n1 === n2) return true;
  
  // Prevent short names from matching longer names (e.g., "Google Sheets" shouldn't match "Use Functions in Google Sheets")
  // Only allow substring matching if the shorter name is at least 60% of the longer name's length
  const minLength = Math.min(n1.length, n2.length);
  const maxLength = Math.max(n1.length, n2.length);
  if (minLength / maxLength < 0.6) {
    // Too different in length, skip substring matching
    // Fall through to word overlap check
  } else {
    // Similar enough in length, allow substring matching
    if (n1.includes(n2) || n2.includes(n1)) return true;
  }

  if (n1.length > 10 && n2.length > 10) {
    const words1 = n1.split(' ').filter(w => w.length > 2);
    const words2 = n2.split(' ').filter(w => w.length > 2);
    if (words1.length === 0 || words2.length === 0) return false;
    const matching = words1.filter(w => words2.includes(w)).length;
    const ratio = matching / Math.min(words1.length, words2.length);
    if (ratio >= 0.7) return true;
  }

  return false;
}

// Game badge keywords
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
  "Arcade TechCare"
];

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
  "Designing Network Security in Google Cloud"
];

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
  "AI Infrastructure: Introduction to AI Hypercomputer"
];

type BadgeType = 'game' | 'trivia' | 'skill' | 'completion' | 'lab-free';

function determineBadgeType(badgeName: string): BadgeType {
  // Remove "Skills Boost" prefix and clean the name
  const cleanedName = badgeName.replace(/^Skills Boost\s+/, '').toLowerCase().trim();
  
  // Check for trivia badges first
  if (cleanedName.includes('trivia')) {
    return 'trivia';
  }

  // Check for special game badges (these are often misclassified as completion)
  if (cleanedName.includes('extraskillestrial') || 
      cleanedName.includes('extraskillestrail') ||
      cleanedName.includes('skills scribble') ||
      cleanedName.includes('futureready') ||
      cleanedName.includes('future ready') ||
      cleanedName.includes('diwali') ||
      cleanedName.includes('lights') ||
      cleanedName.includes('banking with empathy') ||
      cleanedName.includes('faster finance') ||
      cleanedName.includes('scaling success') ||
      cleanedName.includes('ai assured')) {
    return 'game';
  }

  // Check for game badges
  for (const keyword of GAME_BADGE_KEYWORDS) {
    if (cleanedName.includes(keyword.toLowerCase())) {
      return 'game';
    }
  }

  // CHECK LAB-FREE FIRST (before skill badges) to avoid conflicts
  // Use exact matching for lab-free to prevent "Google Sheets" matching skill badges
  for (const labFreeBadge of LAB_FREE_BADGES) {
    const normalized1 = normalizeBadgeName(badgeName);
    const normalized2 = normalizeBadgeName(labFreeBadge);
    if (normalized1 === normalized2) return 'lab-free';
  }

  // Check for skill badges with fuzzy matching
  for (const skillBadge of SKILL_BADGES) {
    if (badgeNamesMatch(badgeName, skillBadge)) return 'skill';
  }

  // If none of the above, it's a completion badge
  return 'completion';
}

function calculatePoints(badges: Badge[]): Points {
  let totalPoints = 0;
  let gamePoints = 0;
  let triviaPoints = 0;
  let skillPoints = 0;
  let skillBadgeCount = 0;

  // Re-type all badges first (in case scraper got it wrong)
  const retypedBadges = badges.map(b => ({
    ...b,
    type: determineBadgeType(b.name)
  }));

  // Deduplicate badges to avoid double-counting
  const seen = new Set<string>();
  const dedupedBadges: Badge[] = [];
  for (const badge of retypedBadges) {
    // Validate and normalize
    const earned = new Date(badge.earnedDate);
    if (isNaN(earned.getTime())) continue;
    const normalized = normalizeBadgeName(badge.name);
    const day = earned.toISOString().slice(0, 10);
    const key = (badge.type === 'skill' || badge.type === 'lab-free')
      ? `name:${normalized}`
      : `name:${normalized}|day:${day}`;
    if (seen.has(key)) continue;
    seen.add(key);
    dedupedBadges.push({ ...badge, name: badge.name, type: badge.type, earnedDate: earned.toISOString() });
  }

  // Filter badges earned after START_DATE
  const recentBadges = dedupedBadges.filter(badge => new Date(badge.earnedDate) >= START_DATE);

  // Calculate points for each badge type
  for (const badge of recentBadges) {
    const badgeNameLower = badge.name.toLowerCase().trim();
    
    switch (badge.type) {
      case 'game':
        // Special 3-point game badges (Diwali special badges)
        if (
          badgeNameLower.includes('diwali') ||
          badgeNameLower.includes('lights')
        ) {
          gamePoints += 3;
        }
        // Special 2-point game badges
        else if (
          badgeNameLower.includes('love beyond') ||
          badgeNameLower.includes('arcade skills resolve') ||
          badgeNameLower.includes('arcade skillsresolve') ||
          badgeNameLower.includes('color your skills') ||
          badgeNameLower.includes('futureready') ||
          badgeNameLower.includes('future ready') ||
          badgeNameLower.includes('extraskillestrial') ||
          badgeNameLower.includes('extraskillestrail') ||
          badgeNameLower.includes('skills scribble') ||
          badgeNameLower.includes('arcade networskills') ||
          badgeNameLower.includes('arcade techcare')
        ) {
          gamePoints += 2;
        } else {
          gamePoints += 1; // Regular game badges = 1 point
        }
        break;
      case 'trivia':
        triviaPoints += 1; // All trivia badges = 1 point
        break;
      case 'skill':
        skillPoints += 0.5; // Each skill badge = 0.5 points
        skillBadgeCount++; // Count for tracking
        break;
      // No points for completion or lab-free badges
      case 'completion':
        break;
      case 'lab-free':
        break;
    }
  }

  // Skill points are already calculated above (0.5 per badge)
  // No need to recalculate

  // Calculate total points
  totalPoints = gamePoints + triviaPoints + skillPoints;

  return {
    total: totalPoints,
    gameBadges: gamePoints,
    triviaBadges: triviaPoints,
    skillBadges: skillPoints,
    milestonePoints: 0 // Initialize milestonePoints to 0
  };
}

// Milestone points configuration
const MILESTONE_POINTS = {
  1: 2,   // Milestone 1: +2 points
  2: 8,   // Milestone 2: +8 points
  3: 15,  // Milestone 3: +15 points
  4: 25   // Milestone 4: +25 points
};

// Function to calculate milestone points based on progress
function calculateMilestonePoints(progress: number): { milestonePoints: number; currentMilestone: number } {
  if (progress >= 100) return { milestonePoints: MILESTONE_POINTS[4], currentMilestone: 4 };
  if (progress >= 75) return { milestonePoints: MILESTONE_POINTS[3], currentMilestone: 3 };
  if (progress >= 50) return { milestonePoints: MILESTONE_POINTS[2], currentMilestone: 2 };
  if (progress >= 25) return { milestonePoints: MILESTONE_POINTS[1], currentMilestone: 1 };
  return { milestonePoints: 0, currentMilestone: 0 };
}

app.get('/calculate-points', async (req, res) => {
  try {
    const { profileUrl, isFacilitator } = req.query;
    console.log(`Processing profile: ${profileUrl}`);

    if (!profileUrl || typeof profileUrl !== 'string') {
      return res.status(400).json({ error: 'Profile URL is required' });
    }

    // Optimized axios request with timeout
    const response = await axios.get(profileUrl, {
      timeout: 15000, // 15 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Encoding': 'gzip, deflate',
      },
      maxRedirects: 5
    });
    
    const $ = cheerio.load(response.data);
    const badges: Badge[] = [];

    // Scrape profile data with multiple selector attempts
    let profileName = $('h1.ql-headline-1').first().text().trim();
    
    // Try alternative selectors if first one fails
    if (!profileName) {
      profileName = $('h1[class*="headline"]').first().text().trim();
    }
    if (!profileName) {
      profileName = $('h1').first().text().trim();
    }
    if (!profileName) {
      profileName = $('.profile-header h1').first().text().trim();
    }
    if (!profileName) {
      // Try getting from meta tags
      profileName = $('meta[property="og:title"]').attr('content')?.trim() || '';
    }
    
    // Default if still not found
    if (!profileName) {
      profileName = 'Unknown User';
    }
    
    const memberSinceText = $('.ql-subhead-1.l-mbs').text().trim();
    let memberSince = '2025';
    
    // Try to extract year from member since text
    const memberSinceMatch = memberSinceText.match(/Member since (\d{4})/i);
    if (memberSinceMatch) {
      memberSince = memberSinceMatch[1];
    } else {
      // Try alternative patterns
      const yearMatch = memberSinceText.match(/(\d{4})/);
      if (yearMatch) {
        memberSince = yearMatch[1];
      }
    }

    // Find all profile badges - optimized selector
    $('.profile-badge').each((_, element) => {
      const $element = $(element);
      
      // Get badge name
      const name = $element.find('.ql-title-medium.l-mts').text().trim();
      
      // Get earned date
      const dateText = $element.find('.ql-body-medium.l-mbs').text().trim();
      
      // Extract date
      const dateMatch = dateText.match(/Earned (.+?) (?:EST|EDT|PST|PDT)/);
      if (dateMatch) {
        const dateStr = dateMatch[1];
        const earnedDate = new Date(dateStr);
        
        if (name && !isNaN(earnedDate.getTime())) {
          const type = determineBadgeType(name);
          badges.push({
            name,
            type,
            earnedDate: earnedDate.toISOString()
          });
        }
      }
    });

    console.log(`Found ${badges.length} badges on the page.`);

    // Calculate points and get the breakdown
    const points = calculatePoints(badges);

    // Calculate milestone progress if user is a facilitator
    if (isFacilitator === 'true') {
      // Re-type and dedupe badges for milestone calculation
      const retypedBadgesForMilestone = badges.map(b => ({
        ...b,
        type: determineBadgeType(b.name)
      }));

      const seenMilestone = new Set<string>();
      const dedupedMilestoneBadges: Badge[] = [];
      for (const badge of retypedBadgesForMilestone) {
        const earned = new Date(badge.earnedDate);
        if (isNaN(earned.getTime())) continue;
        const normalized = normalizeBadgeName(badge.name);
        const day = earned.toISOString().slice(0, 10);
        const key = (badge.type === 'skill' || badge.type === 'lab-free')
          ? `name:${normalized}`
          : `name:${normalized}|day:${day}`;
        if (seenMilestone.has(key)) continue;
        seenMilestone.add(key);
        dedupedMilestoneBadges.push({ ...badge, name: badge.name, type: badge.type, earnedDate: earned.toISOString() });
      }
      
      // Filter badges earned during facilitator program (August 4 - October 13, 2025)
      const facilitatorStart = new Date('2025-08-04');
      const facilitatorEnd = new Date('2025-10-13T23:59:59.999Z'); // End of October 13
      const milestoneBadges = dedupedMilestoneBadges.filter(badge => {
        const earnedDate = new Date(badge.earnedDate);
        return earnedDate >= facilitatorStart && earnedDate <= facilitatorEnd;
      });
      
      // Count badges by type
      const gameBadgeCount = milestoneBadges.filter((b: Badge) => b.type === 'game').length;
      const triviaBadgeCount = milestoneBadges.filter((b: Badge) => b.type === 'trivia').length;
      const skillBadgeCount = milestoneBadges.filter((b: Badge) => b.type === 'skill').length;
      const labFreeBadgeCount = milestoneBadges.filter((b: Badge) => b.type === 'lab-free').length;




      // Calculate progress based on milestone requirements
      let currentMilestone = 0;
      let progress = 0;

      // Check milestones in descending order (badge counts only, no point threshold)
      // Milestone 4 (100 points) - 12 Arcade Games, 8 Trivia & 52 Skill Badges + Any 24 Lab-free courses
      if (gameBadgeCount >= 12 && triviaBadgeCount >= 8 && skillBadgeCount >= 52 && labFreeBadgeCount >= 24) {
        currentMilestone = 4;
        progress = 100;
      }
      // Milestone 3 (75 points) - 10 Arcade Games, 7 Trivia & 38 Skill Badges + Any 18 Lab-free courses
      else if (gameBadgeCount >= 10 && triviaBadgeCount >= 7 && skillBadgeCount >= 38 && labFreeBadgeCount >= 18) {
        currentMilestone = 3;
        progress = 75;
      }
      // Milestone 2 (50 points) - 8 Arcade Games, 6 Trivia & 28 Skill Badges + Any 12 Lab-free courses
      else if (gameBadgeCount >= 8 && triviaBadgeCount >= 6 && skillBadgeCount >= 28 && labFreeBadgeCount >= 12) {
        currentMilestone = 2;
        progress = 50;
      }
      // Milestone 1 (25 points) - 6 Arcade Games, 5 Trivia & 14 Skill Badges + Any 6 Lab-free courses
      else if (gameBadgeCount >= 6 && triviaBadgeCount >= 5 && skillBadgeCount >= 14 && labFreeBadgeCount >= 6) {
        currentMilestone = 1;
        progress = 25;
      }

      // Calculate milestone points
      const { milestonePoints } = calculateMilestonePoints(progress);
      
      // Update points with milestone points
      points.milestonePoints = milestonePoints;
      points.total = points.gameBadges + points.triviaBadges + points.skillBadges + milestonePoints;

      // Return the scraped data with milestone progress
      const scrapedData: ScrapedData = {
        badges,
        points,
        profileData: {
          name: profileName,
          memberSince: memberSince
        },
        milestoneProgress: {
          currentMilestone,
          progress
        }
      };

      res.json(scrapedData);
    } else {
      // Reset milestone points when not a facilitator
      points.milestonePoints = 0;
      points.total = points.gameBadges + points.triviaBadges + points.skillBadges;

      // Return the scraped data without milestone progress
      const scrapedData: ScrapedData = {
        badges,
        points,
        profileData: {
          name: profileName,
          memberSince: memberSince
        },
        milestoneProgress: undefined
      };

      res.json(scrapedData);
    }
  } catch (error: any) {
    console.error('Error calculating points:', error.message);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    res.status(500).json({ error: 'Failed to calculate points. The scraper might be blocked or the profile page structure may have changed.' });
  }
});

export default app;
