// Core calculation logic for Google Arcade Points Calculator
// This file contains all the calculation functions without web scraping or server dependencies

export interface Badge {
  name: string;
  type: 'game' | 'trivia' | 'skill' | 'completion' | 'lab-free';
  earnedDate: string;
}

export interface Points {
  total: number;
  gameBadges: number;  // Points from game badges
  triviaBadges: number;  // Points from trivia badges
  skillBadges: number;  // Points from skill badges
  milestonePoints: number;  // Points from highest completed milestone
}

export interface MilestoneProgress {
  currentMilestone: number;
  progress: number;
}

export interface CalculationResult {
  badges: Badge[];
  points: Points;
  milestoneProgress?: MilestoneProgress;
}

export const START_DATE = new Date('2025-01-08');

// Game badge keywords
export const GAME_BADGE_KEYWORDS = [
  "Love Beyond",
  "Arcade Skills Resolve",
  "Arcade Skillsresolve",
  "Color Your Skills",
  "Level 1",
  "Level 2",
  "Base Camp",
  "Arcade Certification Zone",
  "Level 3",
  "Arcade NetworSkills",
  "Arcade TechCare"
];

export const SKILL_BADGES = [
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
  "Implement Multimodal Vector Search with BigQuery",
  "Secure Software Delivery",
  "Analyze and Reason on Multimodal Data with Gemini",
  "Designing Network Security in Google Cloud",
  "Cloud Run Functions: 3 Ways",
  "Discover and Protect Sensitive Data Across Your Ecosystem",
  "Protect Cloud Traffic with Chrome Enterprise Premium Security",
  "Connecting Cloud Networks with NCC",
  "Explore Generative AI with the Gemini API in Vertex AI",
  "Protect Sensitive Data with Data Loss Prevention",
  "Modernize .Net Applications",
  "Build generative virtual agents with API integrations",
  "Edit images with Imagen",
  "Configure your Workplace: Google Workspace for IT Admins"
];

export const LAB_FREE_BADGES = [
  "Digital Transformation with Google Cloud",
  "Exploring Data Transformation with Google Cloud",
  "Infrastructure and Application Modernization with Google Cloud",
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
  "Google Calendar"
];

export type BadgeType = 'game' | 'trivia' | 'skill' | 'completion' | 'lab-free';

/**
 * Determines the type of a badge based on its name
 */
export function determineBadgeType(badgeName: string): BadgeType {
  // Remove "Skills Boost" prefix and clean the name
  const cleanedName = badgeName.replace(/^Skills Boost\s+/, '').toLowerCase().trim();

  // Check for trivia badges first
  if (cleanedName.includes('trivia')) {
    return 'trivia';
  }

  // Check for special game badges first (before checking keywords)
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

  // Check for skill badges (exact match and partial match for variations)
  for (const skillBadge of SKILL_BADGES) {
    const skillBadgeLower = skillBadge.toLowerCase();
    
    // Exact match
    if (cleanedName === skillBadgeLower) {
      return 'skill';
    }
    
    // Handle DEPRECATED prefix
    if (cleanedName.replace(/^deprecated\s+/i, '') === skillBadgeLower) {
      return 'skill';
    }
    
    // Handle "Using" vs "using" variations (after lowercase conversion)
    if (cleanedName === skillBadgeLower) {
      return 'skill';
    }
  }

  // Check for lab-free badges (exact match)
  for (const labFreeBadge of LAB_FREE_BADGES) {
    if (cleanedName === labFreeBadge.toLowerCase()) {
      return 'lab-free';
    }
  }

  // If none of the above, it's a completion badge
  return 'completion';
}

/**
 * Calculates points from a list of badges
 */
export function calculatePoints(badges: Badge[]): Points {
  let totalPoints = 0;
  let gamePoints = 0;
  let triviaPoints = 0;
  let skillPoints = 0;
  let skillBadgeCount = 0;

  // Filter badges earned after START_DATE
  const recentBadges = badges.filter(badge => new Date(badge.earnedDate) >= START_DATE);

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
        skillBadgeCount++; // Count skill badges to calculate points later
        break;
      // No points for completion or lab-free badges
      case 'completion':
      case 'lab-free':
        break;
    }
  }

  // Calculate skill points (1 point per 2 skill badges)
  skillPoints = Math.floor(skillBadgeCount / 2);

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

/**
 * Calculates points for a single badge based on its type.
 */
export function calculateBadgePoints(badge: Badge): number {
  const badgeNameLower = badge.name.toLowerCase().trim();
  
  switch (badge.type) {
    case 'game':
      // Special 3-point game badges (Diwali special badges)
      if (
        badgeNameLower.includes('diwali') ||
        badgeNameLower.includes('lights')
      ) {
        return 3;
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
        return 2;
      } else {
        return 1; // Regular game badges = 1 point
      }
    case 'trivia':
      return 1; // All trivia badges = 1 point
    case 'skill':
      return 0.5; // Skill badges are 0.5 points each, but counted in pairs for 1 point
    default:
      return 0; // No points for completion or lab-free badges
  }
}

// Milestone points configuration
export const MILESTONE_POINTS = {
  1: 2,   // Milestone 1: +2 points
  2: 8,   // Milestone 2: +8 points
  3: 15,  // Milestone 3: +15 points
  4: 25   // Milestone 4: +25 points
};

/**
 * Calculates milestone points based on progress
 */
export function calculateMilestonePoints(progress: number): { milestonePoints: number; currentMilestone: number } {
  if (progress >= 100) return { milestonePoints: MILESTONE_POINTS[4], currentMilestone: 4 };
  if (progress >= 75) return { milestonePoints: MILESTONE_POINTS[3], currentMilestone: 3 };
  if (progress >= 50) return { milestonePoints: MILESTONE_POINTS[2], currentMilestone: 2 };
  if (progress >= 25) return { milestonePoints: MILESTONE_POINTS[1], currentMilestone: 1 };
  return { milestonePoints: 0, currentMilestone: 0 };
}

/**
 * Calculates milestone progress for facilitators
 */
export function calculateMilestoneProgress(badges: Badge[]): MilestoneProgress {
  // Filter badges earned after April 1st, 2025 for milestone calculation
  const milestoneBadges = badges.filter(badge => new Date(badge.earnedDate) >= new Date('2025-04-01'));
  
  // Count badges by type
  const gameBadgeCount = milestoneBadges.filter(b => b.type === 'game').length;
  const triviaBadgeCount = milestoneBadges.filter(b => b.type === 'trivia').length;
  const skillBadgeCount = milestoneBadges.filter(b => b.type === 'skill').length;
  const labFreeBadgeCount = milestoneBadges.filter(b => b.type === 'lab-free').length;

  // Calculate progress based on milestone requirements
  let currentMilestone = 0;
  let progress = 0;

  // Check Milestone 4 (100%)
  if (gameBadgeCount >= 10 && triviaBadgeCount >= 8 && skillBadgeCount >= 44 && labFreeBadgeCount >= 16) {
    currentMilestone = 4;
    progress = 100;
  }
  // Check Milestone 3 (75%)
  else if (gameBadgeCount >= 8 && triviaBadgeCount >= 7 && skillBadgeCount >= 30 && labFreeBadgeCount >= 12) {
    currentMilestone = 3;
    progress = 75;
  }
  // Check Milestone 2 (50%)
  else if (gameBadgeCount >= 6 && triviaBadgeCount >= 6 && skillBadgeCount >= 20 && labFreeBadgeCount >= 8) {
    currentMilestone = 2;
    progress = 50;
  }
  // Check Milestone 1 (25%)
  else if (gameBadgeCount >= 4 && triviaBadgeCount >= 4 && skillBadgeCount >= 10 && labFreeBadgeCount >= 4) {
    currentMilestone = 1;
    progress = 25;
  }

  return { currentMilestone, progress };
}

/**
 * Main calculation function that processes badges and returns complete results
 */
export function calculateArcadePoints(badges: Badge[], isFacilitator: boolean = false): CalculationResult {
  // Calculate base points
  const points = calculatePoints(badges);

  if (isFacilitator) {
    // Calculate milestone progress for facilitators
    const milestoneProgress = calculateMilestoneProgress(badges);
    const { milestonePoints } = calculateMilestonePoints(milestoneProgress.progress);
    
    // Update points with milestone points
    points.milestonePoints = milestonePoints;
    points.total = points.gameBadges + points.triviaBadges + points.skillBadges + milestonePoints;

    return {
      badges,
      points,
      milestoneProgress
    };
  } else {
    // Reset milestone points when not a facilitator
    points.milestonePoints = 0;
    points.total = points.gameBadges + points.triviaBadges + points.skillBadges;

    return {
      badges,
      points,
      milestoneProgress: undefined
    };
  }
} 