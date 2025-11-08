import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useNotification } from '@/lib/notification-provider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  IconSearch,
  IconBook,
  IconPlayerPlay,
  IconArticle,
  IconCode,
  IconCertificate,
  IconDownload,
  IconExternalLink,
  IconBookmark,
  IconStar,
  IconClockHour4,
  IconDeviceLaptop,
  IconEye,
  IconFilter,
  IconBell,
  IconCalendar,
  IconNews,
  IconSparkles,
  IconX
} from '@tabler/icons-react';

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1 + (i * 0.05),
      duration: 0.3,
    },
  }),
};

// Skill Badges Data
const skillBadgesData = [
  { id: 1, name: 'Analyze BigQuery Data in Connected Sheets', image: 'https://cdn.qwiklabs.com/3dEst6RNTZQgSGIi4PTlumTkXxf%2FdmfV%2FBV3rh%2Fx6X4%3D', url: 'https://www.cloudskillsboost.google/course_templates/632', labs: 4, credits: 0, level: 'Introductory' },
  { id: 2, name: 'Streaming Analytics into BigQuery', image: 'https://cdn.qwiklabs.com/y81rBzff%2BCRvWt9hHWXUK4505cPpZZpfcyi9%2FS2srsU%3D', url: 'https://www.cloudskillsboost.google/course_templates/752', labs: 4, credits: 2, level: 'Introductory' },
  { id: 3, name: 'Store, Process, and Manage Data on Google Cloud - Console', image: 'https://cdn.qwiklabs.com/IBk%2B54Lh16e0KAao3UrPB6buPf5tzxOwSPnVPkmE50s%3D', url: 'https://www.cloudskillsboost.google/course_templates/658', labs: 4, credits: 3, level: 'Introductory' },
  { id: 4, name: 'Using the Google Cloud Speech API', image: 'https://cdn.qwiklabs.com/4ofkN4%2BKKacdIrTvLp1ZSAGImsdSAJvyRtXoK4D%2BZSE%3D', url: 'https://www.cloudskillsboost.google/course_templates/756', labs: 4, credits: 4, level: 'Introductory' },
  { id: 5, name: 'Analyze Speech and Language with Google APIs', image: 'https://cdn.qwiklabs.com/9l3ABNdsyhUC0bPIs6Vf1sAGsC4nb7UGe9GuP39%2FwKI%3D', url: 'https://www.cloudskillsboost.google/course_templates/634', labs: 4, credits: 8, level: 'Introductory' },
  { id: 6, name: 'Create a Secure Data Lake on Cloud Storage', image: 'https://cdn.qwiklabs.com/aDrD1KiIU1kDIUQ2GVPJEeFtmOlfG3s527tsqON5GWM%3D', url: 'https://www.cloudskillsboost.google/course_templates/704', labs: 4, credits: 4, level: 'Introductory' },
  { id: 7, name: 'Get Started with API Gateway', image: 'https://cdn.qwiklabs.com/p4abbcLtmsng92YCgnUZjS41b6t6vr%2FcebRrv0wBroE%3D', url: 'https://www.cloudskillsboost.google/course_templates/662', labs: 4, credits: 3, level: 'Introductory' },
  { id: 8, name: 'Get Started with Dataplex', image: 'https://cdn.qwiklabs.com/2tJ1LSxF0ZRz71mWC1oyfMl71xyysS8RcfJThsnrXTM%3D', url: 'https://www.cloudskillsboost.google/course_templates/726', labs: 4, credits: 4, level: 'Introductory' },
  { id: 9, name: 'Get Started with Pub/Sub', image: 'https://cdn.qwiklabs.com/HDQKD%2Btnlq2juEuFJFBBmtJ9JWrHrbVI0v7J8uQp1VA%3D', url: 'https://www.cloudskillsboost.google/course_templates/728', labs: 4, credits: 3, level: 'Introductory' },
  { id: 10, name: 'Tag and Discover BigLake Data', image: 'https://cdn.qwiklabs.com/MfXm3Olm4qpvd7kAaeuCCHA3bDOGBZwB5k5a%2FmAG7Ac%3D', url: 'https://www.cloudskillsboost.google/course_templates/753', labs: 4, credits: 3, level: 'Introductory' },
  { id: 11, name: 'Use APIs to Work with Cloud Storage', image: 'https://cdn.qwiklabs.com/d1mWg2UMiEJvwUnG3vIA%2B6lfBHcIY%2BSa5wZFAFWlRro%3D', url: 'https://www.cloudskillsboost.google/course_templates/755', labs: 4, credits: 4, level: 'Introductory' },
  { id: 12, name: 'Integrate BigQuery Data and Google Workspace using Apps Script', image: 'https://cdn.qwiklabs.com/LgPpZOcvdaVSF6mlyVK2wtUkDcZ0J1Votoh2TdDhIEc%3D', url: 'https://www.cloudskillsboost.google/course_templates/737', labs: 4, credits: 2, level: 'Introductory' },
  { id: 13, name: 'Configure Service Accounts and IAM Roles for Google Cloud', image: 'https://cdn.qwiklabs.com/vFFpJG5%2FzrfiRL0tlhXuKNOsps9N0ItaaX4Omx1oHw8%3D', url: 'https://www.cloudskillsboost.google/course_templates/702', labs: 4, credits: 4, level: 'Introductory' },
  { id: 14, name: 'Prepare Data for Looker Dashboards and Reports', image: 'https://cdn.qwiklabs.com/oQzIxeIv%2F5iBbNR5dcJtoGDClQ6hcrioCnaW8lHxCGQ%3D', url: 'https://www.cloudskillsboost.google/course_templates/628', labs: 5, credits: 0, level: 'Introductory' },
  { id: 15, name: 'Create and Manage Cloud Spanner Instances', image: 'https://cdn.qwiklabs.com/Lwx9nBf13DUavchAbefiCQXovxumLE3Z8hNOuHTHsIk%3D', url: 'https://www.cloudskillsboost.google/course_templates/643', labs: 5, credits: 5, level: 'Introductory' },
  { id: 16, name: 'Use Functions, Formulas, and Charts in Google Sheets', image: 'https://cdn.qwiklabs.com/QvOcCXRFs6%2BvFDa76EDz73BTH%2BWOiC3JCq0TZKiwdcE%3D', url: 'https://www.cloudskillsboost.google/course_templates/776', labs: 6, credits: 0, level: 'Introductory' },
  { id: 17, name: 'Create and Manage AlloyDB Instances', image: 'https://cdn.qwiklabs.com/vd89ENUiXxPUrl9fIMVYVlOwLADbLb4nVTg%2FVN8PVvw%3D', url: 'https://www.cloudskillsboost.google/course_templates/642', labs: 6, credits: 6, level: 'Introductory' },
  { id: 18, name: 'Build Real World AI Applications with Gemini and Imagen', image: 'https://cdn.qwiklabs.com/s%2BgzHsWL6hGBYeWSWPdSZu6mYa7pwCn%2BbEYQ%2FMVOYAA%3D', url: 'https://www.cloudskillsboost.google/course_templates/1076', labs: 4, credits: 0, level: 'Introductory' },
  { id: 19, name: 'App Engine: 3 Ways', image: 'https://cdn.qwiklabs.com/%2Fus%2B9SsjBJvNFaAG9KABofDumpomMuhFAIJrP23UqIE%3D', url: 'https://www.cloudskillsboost.google/course_templates/671', labs: 4, credits: 4, level: 'Introductory' },
  { id: 20, name: 'Create a Streaming Data Lake on Cloud Storage', image: 'https://cdn.qwiklabs.com/%2BmxpiO1TW2GqjnlC2VdxdbcWeJ4k09d2CTlTQP3FfSo%3D', url: 'https://www.cloudskillsboost.google/course_templates/705', labs: 4, credits: 3, level: 'Introductory' },
  { id: 21, name: 'Store, Process, and Manage Data on Google Cloud - Command Line', image: 'https://cdn.qwiklabs.com/gYTg%2BDXGqVzYT%2FzP4Sfmo0uU8DuwFoU0DAWVviCoaYY%3D', url: 'https://www.cloudskillsboost.google/course_templates/659', labs: 4, credits: 3, level: 'Introductory' },
  { id: 22, name: 'App Building with AppSheet', image: 'https://cdn.qwiklabs.com/%2BHiaxttmNQhNTMn9kWXTSJGmqrPW2XD3hPu%2BduzXvxQ%3D', url: 'https://www.cloudskillsboost.google/course_templates/635', labs: 4, credits: 0, level: 'Introductory' },
  { id: 23, name: 'Cloud Functions: 3 Ways', image: 'https://cdn.qwiklabs.com/1nt6qVofyc4V2sOlyDZF85hTF3JIehVPWQkKKcQaaiI%3D', url: 'https://www.cloudskillsboost.google/course_templates/696', labs: 4, credits: 4, level: 'Introductory' },
  { id: 24, name: 'Get Started with Cloud Storage', image: 'https://cdn.qwiklabs.com/kuaGVEw6SmwSZvIEmzgw20IjhRG18j1ZYD40NowhrO4%3D', url: 'https://www.cloudskillsboost.google/course_templates/725', labs: 4, credits: 4, level: 'Introductory' },
  { id: 25, name: 'Get Started with Looker', image: 'https://cdn.qwiklabs.com/ulqjHgtu%2Bk%2B8y8mj14KaWAF2o5m8kUPdFRSkjd0Bh7I%3D', url: 'https://www.cloudskillsboost.google/course_templates/647', labs: 4, credits: 0, level: 'Introductory' },
  { id: 26, name: 'The Basics of Google Cloud Compute', image: 'https://cdn.qwiklabs.com/NF0NyO9bRbljief2SSKZl6cc8Y7kMrCPExD%2FZ6YbS5M%3D', url: 'https://www.cloudskillsboost.google/course_templates/754', labs: 4, credits: 4, level: 'Introductory' },
  { id: 27, name: 'Analyze Images with the Cloud Vision API', image: 'https://cdn.qwiklabs.com/2BDgUKeuXkt2l%2BKNxw3jfHe%2B1zI4XUtjoERdVj3AGFs%3D', url: 'https://www.cloudskillsboost.google/course_templates/633', labs: 4, credits: 16, level: 'Intermediate' },
  { id: 28, name: 'Analyze Sentiment with Natural Language API', image: 'https://cdn.qwiklabs.com/JOmYLpYKK1IZvJx%2FtSZh%2B5fTLcpu37J8lMm8v0qQm6Q%3D', url: 'https://www.cloudskillsboost.google/course_templates/667', labs: 4, credits: 16, level: 'Intermediate' },
  { id: 29, name: 'Cloud Speech API: 3 Ways', image: 'https://cdn.qwiklabs.com/Kuk%2BNWucV0QlygxvAs33Octfp6RVtr1YqCmf803l1Gs%3D', url: 'https://www.cloudskillsboost.google/course_templates/700', labs: 4, credits: 4, level: 'Intermediate' },
  { id: 30, name: 'Monitor and Manage Google Cloud Resources', image: 'https://cdn.qwiklabs.com/amYX1KCwe7tlqkFT3BJXJkE1mZR94DuxbAPOPaUzqeA%3D', url: 'https://www.cloudskillsboost.google/course_templates/653', labs: 4, credits: 4, level: 'Intermediate' },
  { id: 31, name: 'Get Started with Sensitive Data Protection', image: 'https://cdn.qwiklabs.com/P7fcBnIGDr7G8JlMY3HBiSKoRsVcJR%2Bt7oU0DLMFhps%3D', url: 'https://www.cloudskillsboost.google/course_templates/750', labs: 4, credits: 4, level: 'Intermediate' },
  { id: 32, name: 'Secure BigLake Data', image: 'https://cdn.qwiklabs.com/4IP7mqDtQ4gEwzCEg50kGc8FA%2FFf%2BbY4O3ZO63Yjkos%3D', url: 'https://www.cloudskillsboost.google/course_templates/751', labs: 4, credits: 4, level: 'Introductory' },
  { id: 33, name: 'Get Started with Eventarc', image: 'https://cdn.qwiklabs.com/ETszwT0%2BVG1zyW%2FVLj6nH5mZPBq18Jy1vfyghCq%2BBN8%3D', url: 'https://www.cloudskillsboost.google/course_templates/727', labs: 4, credits: 3, level: 'Intermediate' },
  { id: 34, name: 'Implement Load Balancing on Compute Engine', image: 'https://cdn.qwiklabs.com/QlR8VSC38qpQUHJPs6pq2%2F330l9KejU8QDuxYF7cewo%3D', url: 'https://www.cloudskillsboost.google/course_templates/648', labs: 5, credits: 5, level: 'Intermediate' },
  { id: 35, name: 'Monitoring in Google Cloud', image: 'https://cdn.qwiklabs.com/s7GqrFeMrvzz%2Bll7n2vKP8bTadKQ5gOvBTkqHTKMcAI%3D', url: 'https://www.cloudskillsboost.google/course_templates/747', labs: 4, credits: 4, level: 'Intermediate' },
  { id: 36, name: 'Automate Data Capture at Scale with Document AI', image: 'https://cdn.qwiklabs.com/zINnuEa2Zsi9GZKbcmUT97b8uWQMGp9vRlOUYsdE3jE%3D', url: 'https://www.cloudskillsboost.google/course_templates/674', labs: 4, credits: 8, level: 'Intermediate' },
  { id: 37, name: 'Develop Serverless Apps with Firebase', image: 'https://cdn.qwiklabs.com/TxPdjh0YSi66rQsyXacKfuK97yNHtQPky54TIbv9KEY%3D', url: 'https://www.cloudskillsboost.google/course_templates/649', labs: 4, credits: 11, level: 'Intermediate' },
  { id: 38, name: 'Develop with Apps Script and AppSheet', image: 'https://cdn.qwiklabs.com/vjyujWQAvAJDCAw%2BFY%2F6AOqEEKNXJ6y7hiBRHadG9IY%3D', url: 'https://www.cloudskillsboost.google/course_templates/715', labs: 4, credits: 7, level: 'Introductory' },
  { id: 39, name: 'Networking Fundamentals on Google Cloud', image: 'https://cdn.qwiklabs.com/%2FX2jwzmWtD0IjbWRpVyW9CH0tjmbSpgY8oDBwdYxN5M%3D', url: 'https://www.cloudskillsboost.google/course_templates/748', labs: 4, credits: 4, level: 'Intermediate' },
  { id: 40, name: 'Build Google Cloud Infrastructure for Azure Professionals', image: 'https://cdn.qwiklabs.com/%2Ffg4SqAEG%2FnQVIt2ut06Nh5NxTPBZb3QO7cG175FEhg%3D', url: 'https://www.cloudskillsboost.google/course_templates/688', labs: 4, credits: 20, level: 'Intermediate' },
  { id: 41, name: 'Engineer Data for Predictive Modeling with BigQuery ML', image: 'https://cdn.qwiklabs.com/buCzMzxYUhmRRa4hAgfQAo0FNxdIIQexIdHcyuznQj0%3D', url: 'https://www.cloudskillsboost.google/course_templates/627', labs: 4, credits: 15, level: 'Intermediate' },
  { id: 42, name: 'Deploy Kubernetes Applications on Google Cloud', image: 'https://cdn.qwiklabs.com/EXyE%2FCxxZ6VQwYc5s0G%2Bpfsa2h5gY1TKPlCWSRiPGxw%3D', url: 'https://www.cloudskillsboost.google/course_templates/663', labs: 4, credits: 12, level: 'Introductory' },
  { id: 43, name: 'Explore Generative AI with the Vertex AI Gemini API', image: 'https://cdn.qwiklabs.com/N2O3xN1Oe8ia77xuOMUq6lozlWCXihUpqe%2Bb2KqHxm8%3D', url: 'https://www.cloudskillsboost.google/course_templates/959', labs: 4, credits: 15, level: 'Introductory' },
  { id: 44, name: 'Implement CI/CD Pipelines on Google Cloud', image: 'https://cdn.qwiklabs.com/8FCeW6Ghxq6YJ%2B%2B0wucn4QzO92YLIkf13qHMHxnyRZo%3D', url: 'https://www.cloudskillsboost.google/course_templates/691', labs: 4, credits: 20, level: 'Intermediate' },
  { id: 45, name: 'Implement DevOps Workflows in Google Cloud', image: 'https://cdn.qwiklabs.com/WGq8WpVC%2Bdd52Yv3wqJG%2F7mP%2FrmFFUikWBuUom12Tuo%3D', url: 'https://www.cloudskillsboost.google/course_templates/716', labs: 4, credits: 16, level: 'Intermediate' },
  { id: 46, name: 'Build Google Cloud Infrastructure for AWS Professionals', image: 'https://cdn.qwiklabs.com/8w1pVvti1LLNv555uykNY7CBkdROp2O7OIPAdt7K2kM%3D', url: 'https://www.cloudskillsboost.google/course_templates/687', labs: 4, credits: 20, level: 'Intermediate' },
  { id: 47, name: 'Inspect Rich Documents with Gemini Multimodality and Multimodal RAG', image: 'https://cdn.qwiklabs.com/DKI5VEayf%2B1ZxD3CJ46PRSttLWwSksW3f0BZfwQIfik%3D', url: 'https://www.cloudskillsboost.google/course_templates/981', labs: 4, credits: 20, level: 'Intermediate' },
  { id: 48, name: 'Manage Kubernetes in Google Cloud', image: 'https://cdn.qwiklabs.com/SbaluKNBD8ILVo2svsp%2FjP6afBiti7LzxoSPIye9JPs%3D', url: 'https://www.cloudskillsboost.google/course_templates/783', labs: 4, credits: 16, level: 'Introductory' },
  { id: 49, name: 'Prompt Design in Vertex AI', image: 'https://cdn.qwiklabs.com/s%2FZRePds6xWgygxn10JCzWgR584W9Df2%2BngG2Leq0dI%3D', url: 'https://www.cloudskillsboost.google/course_templates/976', labs: 4, credits: 0, level: 'Introductory' },
  { id: 50, name: 'Protect Cloud Traffic with BeyondCorp Enterprise (BCE) Security', image: 'https://cdn.qwiklabs.com/hGqPtaT%2BsIToNTGGEQj3R%2BdQRkRSA%2BWzlo71ZP2YHBc%3D', url: 'https://www.cloudskillsboost.google/course_templates/784', labs: 4, credits: 16, level: 'Intermediate' },
  { id: 51, name: 'Build LangChain Applications using Vertex AI', image: 'https://cdn.qwiklabs.com/Nh2ORGK2cC1wzFv/x34N0sF6NggfUk3kANtFIy4ct1Y=', url: 'https://www.cloudskillsboost.google/course_templates/984', labs: 4, credits: 20, level: 'Introductory' },
  { id: 52, name: 'Create and Manage Cloud SQL for PostgreSQL Instances', image: 'https://cdn.qwiklabs.com/VuW9c3oSDA0JWAwyxysOXQ6EbcUvBhtG2b3nSIhNArA%3D', url: 'https://www.cloudskillsboost.google/course_templates/652', labs: 5, credits: 5, level: 'Intermediate' },
  { id: 53, name: 'Build a Data Warehouse with BigQuery', image: 'https://cdn.qwiklabs.com/Fah1omJYpGK0QWlt6On%2FNXijcM0cQwUkp50IvrRpvXI%3D', url: 'https://www.cloudskillsboost.google/course_templates/624', labs: 5, credits: 25, level: 'Intermediate' },
  { id: 54, name: 'Build a Data Mesh with Dataplex', image: 'https://cdn.qwiklabs.com/IUGd19ltWmGBltTsy6zNCZ81tYB3NBELNf9%2BW3UPDsw%3D', url: 'https://www.cloudskillsboost.google/course_templates/681', labs: 5, credits: 5, level: 'Intermediate' },
  { id: 55, name: 'Migrate MySQL data to Cloud SQL using Database Migration Service', image: 'https://cdn.qwiklabs.com/szTWW02B6wvs24aW4bLPiUCnjikwKZLAFI55zwmXpRw%3D', url: 'https://www.cloudskillsboost.google/course_templates/629', labs: 5, credits: 16, level: 'Intermediate' },
  { id: 56, name: 'Share Data Using Google Data Cloud', image: 'https://cdn.qwiklabs.com/H5Nw8iJDyQktGkZLbZBXV%2FwyW9tf2co6Sbpu67lz2dU%3D', url: 'https://www.cloudskillsboost.google/course_templates/657', labs: 5, credits: 9, level: 'Introductory' },
  { id: 57, name: 'Monitor and Log with Google Cloud Observability', image: 'https://cdn.qwiklabs.com/4Rb5x1I0pnY4%2BUPvlBp5ady7UwKnLi7GdZafabxCNcY%3D', url: 'https://www.cloudskillsboost.google/course_templates/749', labs: 5, credits: 9, level: 'Introductory' },
  { id: 58, name: 'Perform Predictive Data Analysis in BigQuery', image: 'https://cdn.qwiklabs.com/J%2Fxk4xpBWdqQT0JEuTiN5h%2F3gpAS%2BliRT64kJBjcJrs%3D', url: 'https://www.cloudskillsboost.google/course_templates/656', labs: 5, credits: 23, level: 'Intermediate' },
  { id: 59, name: 'Build Infrastructure with Terraform on Google Cloud', image: 'https://cdn.qwiklabs.com/VHFZrm%2Bx107vRoKqo%2BxPzwhbMoLCNk1EctzHY7SZwhI%3D', url: 'https://www.cloudskillsboost.google/course_templates/636', labs: 5, credits: 21, level: 'Introductory' },
  { id: 60, name: 'Build LookML Objects in Looker', image: 'https://cdn.qwiklabs.com/VSikZWpYgfMlYJ1qs5LZ%2FeIRa%2FjTIlm53clSpT5TJrk%3D', url: 'https://www.cloudskillsboost.google/course_templates/639', labs: 5, credits: 0, level: 'Intermediate' },
  { id: 61, name: 'Develop Serverless Applications on Cloud Run', image: 'https://cdn.qwiklabs.com/kFh0tNiUHhgbAFtBWQeTIOCdBx988W3ZYI7Ew2AqALw%3D', url: 'https://www.cloudskillsboost.google/course_templates/741', labs: 5, credits: 25, level: 'Intermediate' },
  { id: 62, name: 'Build a Website on Google Cloud', image: 'https://cdn.qwiklabs.com/Rv0QhP4yVyrmO68%2Fe45arpXtdZgM%2BolI2G6JdFN1y0Y%3D', url: 'https://www.cloudskillsboost.google/course_templates/638', labs: 5, credits: 13, level: 'Intermediate' },
  { id: 63, name: 'Create ML Models with BigQuery ML', image: 'https://cdn.qwiklabs.com/Wm106BMo1s08lU7N%2BBp7tWioQwpDFr1R60VxPqqF8r0%3D', url: 'https://www.cloudskillsboost.google/course_templates/626', labs: 5, credits: 11, level: 'Intermediate' },
  { id: 64, name: 'Mitigate Threats and Vulnerabilities with Security Command Center', image: 'https://cdn.qwiklabs.com/5NWaSWLl43%2B5GwhlDm8SyazP662JNNoxufqGhbDH6Bc%3D', url: 'https://www.cloudskillsboost.google/course_templates/759', labs: 5, credits: 5, level: 'Introductory' },
  { id: 65, name: 'Develop GenAI Apps with Gemini and Streamlit', image: 'https://cdn.qwiklabs.com/HGh8OpsJmf3kRhKbLlDBTvJWkBtWGKItyoVQ7PPGnq4%3D', url: 'https://www.cloudskillsboost.google/course_templates/978', labs: 5, credits: 20, level: 'Intermediate' },
  { id: 66, name: 'Monitor Environments with Google Cloud Managed Service for Prometheus', image: 'https://cdn.qwiklabs.com/Opy8Mo%2F0cJ6x8wiZV5GdGmaE0tToSTn66au0LQy0nMM%3D', url: 'https://www.cloudskillsboost.google/course_templates/761', labs: 5, credits: 9, level: 'Intermediate' },
  { id: 67, name: 'Create and Manage Bigtable Instances', image: 'https://cdn.qwiklabs.com/%2FybkjqsKqUZkugVMQpcLbbiD8%2BdCkPqu4MvVqYhFgRI%3D', url: 'https://www.cloudskillsboost.google/course_templates/650', labs: 5, credits: 5, level: 'Introductory' },
  { id: 68, name: 'Detect Manufacturing Defects using Visual Inspection AI', image: 'https://cdn.qwiklabs.com/ItJGiLFt%2BWk6R4oqXpf7h78m8%2BXPC3BLBSMKOesct%2Bs%3D', url: 'https://www.cloudskillsboost.google/course_templates/644', labs: 5, credits: 25, level: 'Intermediate' },
  { id: 69, name: 'Optimize Costs for Google Kubernetes Engine', image: 'https://cdn.qwiklabs.com/JVjBXaXXv2iu10%2FpaeJt0ed1yluhaplGd7HMYNYyxYM%3D', url: 'https://www.cloudskillsboost.google/course_templates/655', labs: 5, credits: 25, level: 'Intermediate' },
  { id: 70, name: 'Build and Deploy Machine Learning Solutions on Vertex AI', image: 'https://cdn.qwiklabs.com/cmZQaQiE8mTwUGicCKBBIt4fbsDubwxcoHK0bjF%2BARc%3D', url: 'https://www.cloudskillsboost.google/course_templates/684', labs: 5, credits: 21, level: 'Intermediate' },
  { id: 71, name: 'Deploy and Manage Apigee X', image: 'https://cdn.qwiklabs.com/9%2BfjTCoZD5SSJZOTfWz5WWp07GUbHFzxTiQ2m8zaBjs%3D', url: 'https://www.cloudskillsboost.google/course_templates/661', labs: 5, credits: 9, level: 'Intermediate' },
  { id: 72, name: 'Set Up an App Dev Environment on Google Cloud', image: 'https://cdn.qwiklabs.com/FRpM2MMSR7jg%2FFjdC%2F9EmuOkSJ0F7YptWGKe6VD8sjk%3D', url: 'https://www.cloudskillsboost.google/course_templates/637', labs: 10, credits: 7, level: 'Introductory' },
  { id: 73, name: 'Derive Insights from BigQuery Data', image: 'https://cdn.qwiklabs.com/ryTniLyAhIKMMP16FCfNS4BOEOX3PpjWQRnvLf7Q7%2B8%3D', url: 'https://www.cloudskillsboost.google/course_templates/623', labs: 7, credits: 6, level: 'Introductory' },
  { id: 74, name: 'Develop and Secure APIs with Apigee X', image: 'https://cdn.qwiklabs.com/zrJ3ITt0ixHh8sU0kb7m1ADYGu8dLKaQ1F0DqLb0F3Y%3D', url: 'https://www.cloudskillsboost.google/course_templates/714', labs: 6, credits: 26, level: 'Intermediate' },
  { id: 75, name: 'Set Up a Google Cloud Network', image: 'https://cdn.qwiklabs.com/RIYYNU%2BR2ph1OI51G3CNug%2FvziE7K1cVWxX96RWfS%2F4%3D', url: 'https://www.cloudskillsboost.google/course_templates/641', labs: 7, credits: 15, level: 'Introductory' },
  { id: 76, name: 'Implement Cloud Security Fundamentals on Google Cloud', image: 'https://cdn.qwiklabs.com/QZ3Lm78VShnMTK6G4HeVF1JMJUajwq%2BBmdXaizCd5f0%3D', url: 'https://www.cloudskillsboost.google/course_templates/645', labs: 8, credits: 19, level: 'Intermediate' },
  { id: 77, name: 'Develop your Google Cloud Network', image: 'https://cdn.qwiklabs.com/BAUF8WPVlWaDyWm1EK%2FKHt9EoU8%2BKdHpodHJ%2BCYVIWE%3D', url: 'https://www.cloudskillsboost.google/course_templates/625', labs: 6, credits: 18, level: 'Intermediate' },
  { id: 78, name: 'Build Custom Processors with Document AI', image: 'https://cdn.qwiklabs.com/NQESlhWmxT8fKIOui0bHAgwpu8N82mcA3dUtXpexVjA%3D', url: 'https://www.cloudskillsboost.google/course_templates/686', labs: 6, credits: 30, level: 'Intermediate' },
  { id: 79, name: 'Cloud Architecture: Design, Implement, and Manage', image: 'https://cdn.qwiklabs.com/p4JZAfZDpg8laLP1g5%2B2W84mCvbUaCsQrmAfxR7UIng%3D', url: 'https://www.cloudskillsboost.google/course_templates/640', labs: 6, credits: 32, level: 'Intermediate' },
  { id: 80, name: 'Build a Secure Google Cloud Network', image: 'https://cdn.qwiklabs.com/HpKzUnOzAJCt2GEWpsF9N96EDKWXDyqhliQzhdPlEGw%3D', url: 'https://www.cloudskillsboost.google/course_templates/654', labs: 6, credits: 30, level: 'Introductory' },
  { id: 81, name: 'Manage Data Models in Looker', image: 'https://cdn.qwiklabs.com/yLL9ckYq9xPQqACrXiISLOO0pZ93pZ1u89BqXycHtbk%3D', url: 'https://www.cloudskillsboost.google/course_templates/651', labs: 6, credits: 0, level: 'Introductory' },
  { id: 82, name: 'Classify Images with TensorFlow on Google Cloud', image: 'https://cdn.qwiklabs.com/Nl6YqeQV32kx3Ijt2OWacKzXfiLsorsHsb%2F6EsX9B5I%3D', url: 'https://www.cloudskillsboost.google/course_templates/646', labs: 6, credits: 20, level: 'Intermediate' },
  { id: 83, name: 'Get Started with Google Workspace Tools', image: 'https://cdn.qwiklabs.com/dBCW5W%2B3GnYkggMUwTo3NBLf3W1pWwP2hUbzy3%2FCCZ8%3D', url: 'https://www.cloudskillsboost.google/course_templates/676', labs: 7, credits: 0, level: 'Introductory' },
  { id: 84, name: 'Use Machine Learning APIs on Google Cloud', image: 'https://cdn.qwiklabs.com/G0nUb7y%2FUlLKTnpNQU6fxMCQEyZvGy0w2QrIBkzfXLY%3D', url: 'https://www.cloudskillsboost.google/course_templates/630', labs: 7, credits: 31, level: 'Intermediate' },
  { id: 85, name: 'Prepare Data for ML APIs on Google Cloud', image: 'https://cdn.qwiklabs.com/ZUhhfh33J7x31SmcU8DIAf3ejiLuMPjfTRgjZMBj0xA%3D', url: 'https://www.cloudskillsboost.google/course_templates/631', labs: 10, credits: 12, level: 'Intermediate' },
  { id: 87, name: 'Discover and Protect Sensitive Data Across Your Ecosystem', image: 'https://cdn.qwiklabs.com/Ed3pk8ud26JsY5o%2BfBEcRkoS4lHRv7yuUoHa%2FhjypBk%3D', url: 'https://www.cloudskillsboost.google/course_templates/1177', labs: 5, credits: 9, level: 'Intermediate' },
  { id: 88, name: 'Enhance Gemini Model Capabilities', image: 'https://cdn.qwiklabs.com/5AjhaIZb8OavEnJyok0lNbX6NVJbxSYvysBsqxIK93c%3D', url: 'https://www.cloudskillsboost.google/course_templates/1241', labs: 4, credits: 20, level: 'Intermediate' },
  { id: 89, name: 'Protect Cloud Traffic with Chrome Enterprise Premium Security', image: 'https://cdn.qwiklabs.com/j2b%2F8EPFIubafNJjgIl9J1JsHMO4PKZXdWQDmtdWrgs%3D', url: 'https://www.cloudskillsboost.google/course_templates/784', labs: 4, credits: 12, level: 'Introductory' },
  { id: 90, name: 'Secure Software Delivery', image: 'https://cdn.qwiklabs.com/VwV2%2BSx9Av1v7wWgUp7zbv6%2FQpk37%2F%2Fvc5WBCuLYmRg%3D', url: 'https://www.cloudskillsboost.google/course_templates/1164', labs: 5, credits: 21, level: 'Intermediate' },
  { id: 91, name: 'Implement Multimodal Vector Search with BigQuery', image: 'https://cdn.qwiklabs.com/t0Y8P7PYbBqN%2FKJDMWUslFY8v7DmwZMgvNqaSkrBeu4%3D', url: 'https://www.cloudskillsboost.google/course_templates/1232', labs: 4, credits: 20, level: 'Intermediate' },
  { id: 92, name: 'Analyze and Reason on Multimodal Data with Gemini', image: 'https://cdn.qwiklabs.com/kPUghibTbIdWeBZpOTdaPbih64XPBgS5uAVOE4dhoi8%3D', url: 'https://www.cloudskillsboost.google/course_templates/1240', labs: 6, credits: 14, level: 'Intermediate' },
  { id: 93, name: 'Privileged Access with IAM', image: 'https://cdn.qwiklabs.com/wib9VACYDFn34mPZPfxq%2Bdz5xEBBb97hLFB8yQmm9es%3D', url: 'https://www.cloudskillsboost.google/course_templates/1337', labs: 5, credits: 5, level: 'Intermediate' },
  { id: 94, name: 'Connecting Cloud Networks with NCC', image: 'https://cdn.qwiklabs.com/eNCNCHyWo2UP%2FTBizMDG6SttL40jTwdFfHzHzCZYQoM%3D', url: 'https://www.cloudskillsboost.google/course_templates/1364', labs: 4, credits: 20, level: 'Intermediate' },
  { id: 95, name: 'Designing Network Security in Google Cloud', image: 'https://cdn.qwiklabs.com/JTqg3dHcMxJXSOHz7X2hfaRDyiLoEhOTwnz5JtKyJwg%3D', url: 'https://www.cloudskillsboost.google/course_templates/1412', labs: 5, credits: 25, level: 'Intermediate' },
];

// Lab-Free Courses Data
const labFreeCoursesData = [
  { id: 101, name: 'Digital Transformation with Google Cloud', image: 'https://cdn.qwiklabs.com/EYJaXVbF7KyRxt7YUfOeTUDM%2F17EXn0HVbgYiJTOywE%3D', url: 'https://www.cloudskillsboost.google/course_templates/116' },
  { id: 102, name: 'Exploring Data Transformation with Google Cloud', image: 'https://cdn.qwiklabs.com/V%2BQ2ynv3UQ%2FEiWm0GUSXx%2Ff0pcfvyRU6ZmLBMrlLN%2B8%3D', url: 'https://www.cloudskillsboost.google/course_templates/267' },
  { id: 103, name: 'Infrastructure and Application Modernization with Google Cloud', image: 'https://cdn.qwiklabs.com/Ad6mEos31tswa8dQDmD%2FvZjHMNDhQ%2BmRv9n2UB%2FgBLA%3D', url: 'https://www.cloudskillsboost.google/course_templates/117' },
  { id: 104, name: 'Scaling with Google Cloud Operations', image: 'https://cdn.qwiklabs.com/v8AL1tQJYNNUQj9j69SWe2nWtVX43vGx2fqU6%2FpZDAE%3D', url: 'https://www.cloudskillsboost.google/course_templates/120' },
  { id: 105, name: 'Innovating with Google Cloud Artificial Intelligence', image: 'https://cdn.qwiklabs.com/42wLmkxHZ%2B2SzDW6u1Ia%2F0vCFqBj%2Fls58ayBuJlm3iI%3D', url: 'https://www.cloudskillsboost.google/course_templates/119' },
  { id: 106, name: 'Trust and Security with Google Cloud', image: 'https://cdn.qwiklabs.com/hKYzKuumKFXn%2FkB2byuon%2FeMaz8yZ0yp2nWP90AdYQA%3D', url: 'https://www.cloudskillsboost.google/course_templates/945' },
  { id: 107, name: 'Gen AI: Beyond the Chatbot', image: 'https://cdn.qwiklabs.com/JPr1g9uZFq1aypIHVwhz1asCdk8jXmL1xYTiGGTiGwY%3D', url: 'https://www.cloudskillsboost.google/course_templates/1268' },
  { id: 108, name: 'Gen AI: Unlock Foundational Concepts', image: 'https://cdn.qwiklabs.com/HUOT4aYZ%2B43BQKC9%2BZq9qv37LUImtjFz2FK0W7FvG00%3D', url: 'https://www.cloudskillsboost.google/course_templates/1265' },
  { id: 109, name: 'Google Drive', image: 'https://cdn.qwiklabs.com/B4bSenDv%2BGg9z4sXRBqUlOvJEJol3AIptUOCxxaB0qg%3D', url: 'https://www.cloudskillsboost.google/course_templates/194' },
  { id: 110, name: 'Google Docs', image: 'https://cdn.qwiklabs.com/ghdleu8oJKyZfdn6jNbMwnotrKgM3b8JcUTOTigN7jw%3D', url: 'https://www.cloudskillsboost.google/course_templates/195' },
  { id: 111, name: 'Google Slides', image: 'https://cdn.qwiklabs.com/jAWSnQt0Gi1y%2B%2Bcd9WoIy3piB7SHvSieEcGyt3dPmIs%3D', url: 'https://www.cloudskillsboost.google/course_templates/197' },
  { id: 112, name: 'Google Meet', image: 'https://cdn.qwiklabs.com/cjgAgNKlTqtjc5eyyYxx0dEYXTsFYORWfoZR6wo0mWw%3D', url: 'https://www.cloudskillsboost.google/course_templates/198' },
  { id: 113, name: 'Google Sheets', image: 'https://cdn.qwiklabs.com/cRfMCqh0C9dBLpf1GeTGfdqMYgeCBfHUyOVq0ANRovw%3D', url: 'https://www.cloudskillsboost.google/course_templates/196' },
  { id: 114, name: 'Google Calendar', image: 'https://cdn.qwiklabs.com/1zc0xL6ySAIx6K8fNPul9HZsaGnAPKwIaF9LccQpD%2Bw%3D', url: 'https://www.cloudskillsboost.google/course_templates/201' },
  { id: 115, name: 'Gen AI: Navigate the Landscape', image: 'https://cdn.qwiklabs.com/oJC4RKsDNYXMLV4lPpO41JXmzWkIkbcM6%2B%2FwnODTM0o%3D', url: 'https://www.cloudskillsboost.google/course_templates/1261' },
  { id: 116, name: 'Gen AI Apps: Transform Your Work', image: 'https://cdn.qwiklabs.com/4P40H3KHQRyvqtxRtE1FeqMkSxO9v8iJtTVgGdB3y2E%3D', url: 'https://www.cloudskillsboost.google/course_templates/1266' },
  { id: 117, name: 'Introduction to Large Language Models', image: 'https://cdn.qwiklabs.com/licxd8JDS5%2FvJ3%2FcXDcU2Wmyj8Ii8Old17CuG49CW%2BM%3D', url: 'https://www.cloudskillsboost.google/course_templates/539' },
  { id: 118, name: 'Responsible AI: Applying AI Principles with Google Cloud', image: 'https://cdn.qwiklabs.com/vbrFqw4TKTZb%2FjY8z32R81dK8C9JZlN4td3b%2BUb0afM%3D', url: 'https://www.cloudskillsboost.google/course_templates/468' },
  { id: 119, name: 'Responsible AI for Digital Leaders with Google Cloud', image: 'https://cdn.qwiklabs.com/rr6q6TgDjVdYPO3LWoRnwHeYoPfBqvcb9WfQhohPRrw%3D', url: 'https://www.skills.google/course_templates/1069' },
  { id: 120, name: 'AI Infrastructure: Introduction to AI Hypercomputer', image: 'https://cdn.qwiklabs.com/d0YZkFX7jZ1IsOMikCmlEfN3nAmSlAPaE3l5yjQfiJg%3D', url: 'https://www.cloudskillsboost.google/course_templates/1301' },
  { id: 121, name: 'Machine Learning Operations (MLOps) with Vertex AI: Model Evaluation', image: 'https://cdn.qwiklabs.com/Rw3tUCwM%2FDWqg4nBwx54KAnPOzPoohmUBhiW2bYMRnI%3D', url: 'https://www.skills.google/course_templates/1080' },
  { id: 122, name: 'Conversational AI on Vertex AI and Dialogflow CX', image: 'https://cdn.qwiklabs.com/fjdlMJrxQS7Z6zYqLcUUlaEaVijarKcq9ee9V9wo%2FRE%3D', url: 'https://www.skills.google/course_templates/892' },
  { id: 123, name: 'Building Complex End to End Self-Service Experiences in Dialogflow CX', image: 'https://cdn.qwiklabs.com/68NSd9YUZrkeUa%2Ft%2B%2FQnXr41PcAH4UCRR7Dbg%2BdA3Jg%3D', url: 'https://www.cloudskillsboost.google/course_templates/1103' },
  { id: 124, name: 'Gen AI Agents: Transform Your Organization', image: 'https://cdn.qwiklabs.com/JRQZls%2F%2B1eQuEHWmGDdcr7tZyzuw7mYpPa8wqK1vRtM%3D', url: 'https://www.cloudskillsboost.google/course_templates/1267' },
];

// Combine all resources
const resourcesData = [
  ...skillBadgesData.map(badge => ({
    id: badge.id,
    title: badge.name,
    description: `${badge.labs} labs • ${badge.credits} credits`,
    type: 'skill-badge',
    category: 'skill-badge',
    icon: <IconCertificate size={20} />,
    featured: false,
    difficulty: badge.level.toLowerCase(),
    timeToComplete: `${badge.labs} labs`,
    publishedDate: '',
    views: 0,
    author: 'Google Cloud',
    link: badge.url,
    image: badge.image,
    labs: badge.labs,
    credits: badge.credits,
    level: badge.level
  })),
  ...labFreeCoursesData.map(course => ({
    id: course.id,
    title: course.name,
    description: 'Lab-free course • No credits required',
    type: 'course',
    category: 'lab-free',
    icon: <IconBook size={20} />,
    featured: false,
    difficulty: 'introductory',
    timeToComplete: 'Self-paced',
    publishedDate: '',
    views: 0,
    author: 'Google Cloud',
    link: course.url,
    image: course.image,
    labs: 0,
    credits: 0,
    level: 'Introductory'
  })),
];

// Mock data for updates
const updatesData = [
  {
    id: 1,
    title: 'The Arcade Hoodie is Finally Here! 🎉',
    description: 'You wanted it more than anything else this season — and it\'s finally here: The Arcade Hoodie! Complete October games, stack your points, and get closer to claiming your hoodie in the Champion and Legend Tiers.',
    fullContent: `You wanted it more than anything else this season — and it's finally here: The Arcade Hoodie, ready to add extra glow to your Skills Boost Arcade journey this Diwali!

Soft where it counts, tough where it needs to be. This navy blue pullover hoodie is cozy enough to keep you in the game-on mode all day.

Warm enough to beat a Monday. Cool enough to flex on a Friday — it's that kind of win you can actually wear!

Note: Product image is for reference only. Actual design may vary slightly.

October games are ending soon — complete them, stack your points, and get closer to claiming your Arcade Hoodie waiting in the Champion and Legend Tiers for players who've truly earned their shine.`,
    date: 'Oct 29, 2025',
    category: 'announcement',
    icon: <IconSparkles size={20} />,
    image: 'https://d2yds90mtvelsl.cloudfront.net/original/3X/0/5/058d6e068eadc5a39b824f0114ce452d9ddde625.gif'
  },
  {
    id: 2,
    title: 'New Google Cloud Arcade Badges Released!',
    description: 'Exciting new badges have been added to the Google Cloud Arcade program. Check out the Level 3 challenges and earn exclusive rewards.',
    fullContent: `Exciting new badges have been added to the Google Cloud Arcade program! 

We're thrilled to announce the release of several new skill badges focusing on advanced cloud computing concepts. These Level 3 challenges will test your expertise and help you earn exclusive rewards.

New badges include:
• Advanced Kubernetes Operations
• Machine Learning Pipeline Design
• Cloud Security Architecture
• Data Engineering at Scale

Complete these challenges to earn points and climb the leaderboard. Don't miss out on this opportunity to showcase your cloud skills!`,
    date: 'Oct 28, 2025',
    category: 'announcement',
    icon: <IconSparkles size={20} />,
    image: 'https://ext.same-assets.com/1544848213/3112357059.jpg'
  },
  {
    id: 3,
    title: 'Arcade Facilitator Program Update',
    description: 'Milestone 4 requirements have been finalized. Facilitators can now track their progress towards completing all arcade challenges.',
    fullContent: `Important update for all Arcade Facilitators!

Milestone 4 requirements have been finalized, and we're excited to share the details with you. This milestone focuses on advanced facilitation skills and community engagement.

Requirements:
• Complete 10 advanced skill badges
• Host 3 community learning sessions
• Mentor at least 5 participants
• Achieve 500 total points

Facilitators can now track their progress in real-time through the new dashboard. Make sure to check your progress regularly and reach out if you need any support.

The deadline for Milestone 4 completion is November 30, 2025. Good luck!`,
    date: 'Oct 25, 2025',
    category: 'update',
    icon: <IconNews size={20} />,
    image: 'https://ext.same-assets.com/1544848213/2075453289.jpg'
  },
  {
    id: 4,
    title: 'Weekly Leaderboard Champions',
    description: 'Congratulations to this week\'s top performers! The competition is heating up as we approach the final milestone deadline.',
    fullContent: `Congratulations to this week's top performers! 🏆

The leaderboard is showing some incredible competition as we approach the final milestone deadline. This week's champions have demonstrated exceptional dedication and skill.

Top 3 Performers:
1. CloudMaster Pro - 1,250 points
2. DataEngineerX - 1,180 points  
3. MLExpert2025 - 1,145 points

Special shoutout to all participants who completed badges this week. Your progress is inspiring the entire community!

The competition is heating up - keep pushing forward and earn your place among the legends. Remember, every badge counts!`,
    date: 'Oct 22, 2025',
    category: 'community',
    icon: <IconStar size={20} />,
    image: 'https://ext.same-assets.com/1544848213/3290764125.jpg'
  },
];

export function ResourcesPage() {
  const { notifyNewUpdate } = useNotification();
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeType, setActiveType] = useState('all');
  const [activeDifficulty, setActiveDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<'resources' | 'updates'>('resources');
  const [selectedUpdate, setSelectedUpdate] = useState<typeof updatesData[0] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Check for new updates on mount and notify user
  useEffect(() => {
    // Get last seen update timestamp from localStorage
    const lastSeenUpdate = localStorage.getItem('lastSeenUpdate');
    const lastSeenDate = lastSeenUpdate ? new Date(lastSeenUpdate) : null;

    // Check if there are new updates
    const hasNewUpdates = updatesData.some(update => {
      const updateDate = new Date(update.date);
      return !lastSeenDate || updateDate > lastSeenDate;
    });

    // Notify about the latest update if it's new
    if (hasNewUpdates && updatesData.length > 0) {
      const latestUpdate = updatesData[0];
      notifyNewUpdate(latestUpdate.title, latestUpdate.description);
    }
  }, [notifyNewUpdate]);

  // Mark updates as seen when user visits the updates section
  useEffect(() => {
    if (activeSection === 'updates' && updatesData.length > 0) {
      const latestUpdateDate = updatesData[0].date;
      localStorage.setItem('lastSeenUpdate', new Date(latestUpdateDate).toISOString());
    }
  }, [activeSection]);

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const handleReadMore = (update: typeof updatesData[0]) => {
    setSelectedUpdate(update);
    setIsDialogOpen(true);
  };

  // Filter resources based on active filters and search query
  const filteredResources = resourcesData.filter(resource => {
    const matchesCategory =
      activeFilter === 'all' ||
      activeFilter === resource.category;

    const matchesType =
      activeType === 'all' ||
      activeType === resource.type;

    const matchesDifficulty =
      activeDifficulty === 'all' ||
      activeDifficulty === resource.difficulty;

    const matchesSearch =
      searchQuery === '' ||
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesType && matchesDifficulty && matchesSearch;
  });

  return (
    <div className="space-y-8" ref={ref}>
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div>
          <h1 className="text-3xl font-bold">Learning Hub</h1>
          <p className="text-muted-foreground mt-1">
            Stay updated with the latest news and explore comprehensive resources for Google Cloud Arcade
          </p>
        </div>
      </div>

      {/* Updates Section (Top) */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <IconSparkles size={24} className="text-primary" />
              Latest Updates
            </h2>
            <p className="text-muted-foreground mt-1">
              Recent announcements and community highlights
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {updatesData.map((update, index) => (
            <motion.div
              key={update.id}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <Card className="google-card overflow-hidden h-full hover:shadow-lg transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={update.image}
                    alt={update.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge 
                      className={`
                        ${update.category === 'announcement' ? 'bg-google-blue text-white' :
                          update.category === 'update' ? 'bg-google-green text-white' :
                          'bg-google-yellow text-white'}
                      `}
                    >
                      {update.icon}
                      <span className="ml-1 capitalize">{update.category}</span>
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <IconCalendar size={14} className="mr-1" />
                    {update.date}
                  </div>
                  <CardTitle className="text-lg">{update.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {update.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => handleReadMore(update)}
                  >
                    Read More →
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Update Detail Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
            {selectedUpdate && (
              <>
                {/* Full Image - Static, 30% of space */}
                <div className="relative w-full flex-shrink-0" style={{ height: '30%' }}>
                  <img
                    src={selectedUpdate.image}
                    alt={selectedUpdate.title}
                    className="w-full h-full object-contain"
                  />
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge 
                      className={`
                        ${selectedUpdate.category === 'announcement' ? 'bg-google-blue text-white' :
                          selectedUpdate.category === 'update' ? 'bg-google-green text-white' :
                          'bg-google-yellow text-white'}
                      `}
                    >
                      {selectedUpdate.icon}
                      <span className="ml-1 capitalize">{selectedUpdate.category}</span>
                    </Badge>
                  </div>
                </div>
                
                {/* Content Below Image - Scrollable, 70% of space */}
                <div className="p-6 space-y-4 overflow-y-auto" style={{ height: '70%' }}>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">{selectedUpdate.title}</h2>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <IconCalendar size={14} className="mr-1" />
                      {selectedUpdate.date}
                    </div>
                  </div>
                  
                  <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">
                    {selectedUpdate.fullContent}
                  </p>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Newsletter subscription card */}
        <Card className="google-card bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconBell size={24} className="text-primary" />
              Never Miss an Update
            </CardTitle>
            <CardDescription className="text-base">
              Subscribe to our newsletter and get the latest news, updates, and exclusive content delivered to your inbox.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email address"
                className="h-11 flex-grow rounded-md border bg-background px-4 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              <Button className="bg-primary hover:bg-primary/90 text-white h-11">
                <IconBell size={16} className="mr-2" />
                Subscribe Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-8" />

      {/* All Resources Section (Bottom) */}
      <section className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <IconBook size={24} className="text-primary" />
            All Resources
          </h2>
          <p className="text-muted-foreground mt-1">
            Comprehensive guides, tutorials, and learning materials
          </p>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-grow max-w-md">
          <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search resources..."
            className="pl-9 h-10 w-full rounded-md border bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <select
            className="h-10 rounded-md border bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="skill-badge">Skill Badges</option>
            <option value="lab-free">Lab-Free Courses</option>
          </select>

          <select
            className="h-10 rounded-md border bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={activeType}
            onChange={(e) => setActiveType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="skill-badge">Skill Badges</option>
            <option value="course">Lab-Free Courses</option>
          </select>

          <select
            className="h-10 rounded-md border bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={activeDifficulty}
            onChange={(e) => setActiveDifficulty(e.target.value)}
          >
            <option value="all">All Levels</option>
            <option value="introductory">Introductory</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          {(activeFilter !== 'all' || activeType !== 'all' || activeDifficulty !== 'all' || searchQuery !== '') && (
            <Button
              variant="outline"
              size="sm"
              className="h-10"
              onClick={() => {
                setActiveFilter('all');
                setActiveType('all');
                setActiveDifficulty('all');
                setSearchQuery('');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Resources grid */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Browse All</h3>
        <span className="text-sm text-muted-foreground">Showing {filteredResources.length} of {resourcesData.length} resources</span>
      </div>

      {filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
              >
                <Card className="google-card h-full flex flex-col hover:shadow-md transition-shadow overflow-hidden bg-card">
                  {/* Resource Image - Full width, proper aspect ratio */}
                  <div className="relative w-full aspect-[16/9] overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                    <img
                      src={resource.image}
                      alt={resource.title}
                      className="w-full h-full object-contain bg-white"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    {/* Level badge in top-right corner */}
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-purple-600 text-white capitalize text-xs px-3 py-1">
                        {resource.level}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="pb-2 pt-4 px-4 space-y-2">
                    <CardTitle className="text-lg font-semibold line-clamp-2 leading-tight">{resource.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pb-3 pt-0 px-4 flex-grow">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {resource.labs > 0 && (
                        <span className="flex items-center gap-1">
                          <IconBook size={16} />
                          {resource.labs} {resource.labs === 1 ? 'Lab' : 'Labs'}
                        </span>
                      )}
                      {resource.credits > 0 && (
                        <span className="flex items-center gap-1">
                          <IconCertificate size={16} className="text-orange-500" />
                          {resource.credits} {resource.credits === 1 ? 'Credit' : 'Credits'}
                        </span>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-2 pb-4 px-4">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" asChild>
                      <a href={resource.link} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2">
                        <span>Start Challenge</span>
                        <IconExternalLink size={16} />
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/5">
            <IconFilter size={40} className="mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No resources found</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              Try adjusting your filters or search query to find resources.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setActiveFilter('all');
                setActiveType('all');
                setActiveDifficulty('all');
                setSearchQuery('');
              }}
            >
            Clear All Filters
          </Button>
        </div>
      )}
    </section>
    </div>
  );
}