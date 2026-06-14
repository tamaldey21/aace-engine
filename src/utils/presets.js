export const presets = [
  {
    id: "project_tracker",
    title: "Engineering Status Tracker",
    directive: "Set up a project status tracking system for our engineering team",
    response: {
      "objective": "Deploy an internal project status tracking system for the engineering team within the existing React + Node.js stack.",
      "selected_engines": ["ceo_bot", "cto_bot", "frontend_bot", "backend_bot", "deploy_bot"],
      "analysis": "The engineering team lacks a centralised view of project progress, creating coordination overhead and visibility gaps. A lightweight internal tracker — covering projects, owners, statuses, and blockers — will reduce sync meetings and surface risks earlier. Building within the existing stack avoids additional infrastructure and keeps maintenance low.",
      "tasks": [
        "CTO Architecture Bot: Define data model parameters (projects, milestones, owners, statuses, blockers)",
        "Backend Developer Bot: Build REST API endpoints for project updates: GET/POST/PATCH /projects",
        "Frontend Developer Bot: Build React status listing board and detail card UI widgets",
        "DevOps & Deploy Bot: Configure Docker containers and deploy container to server file system",
        "COO Operations Bot: Write SOP for weekly status update routines"
      ],
      "deliverables": [
        "Node.js API with full CRUD for projects and milestones",
        "React dashboard with status board and filter by owner/status",
        "SOP document: weekly status update workflow",
        "Database schema with seed data for 5 sample projects"
      ],
      "risks": [
        "Adoption risk: engineers may not update statuses consistently — mitigate with a weekly automated reminder integrated into Slack.",
        "Scope creep risk: feature requests will accumulate — mitigate by locking v1 scope to status tracking only, no time tracking or sprint planning."
      ],
      "recommendations": [
        "Integrate Slack notifications for status changes in v1.1 to drive passive adoption.",
        "Review usage metrics after 30 days to determine whether to expand to other departments."
      ],
      "execution_plan": "The CTO Bot will deliver the data model and API in week 1. The Frontend and Backend Bots follow in week 2, prioritising the list view and database endpoints. The Deploy Bot handles docker deployment in parallel with the API build. Go-live targets end of week 2 with a team walkthrough and 5 seed projects loaded.",
      "memory_updates": [
        "Engineering team uses React + Node.js internal stack for tooling.",
        "Team priority: reduce coordination overhead and improve project visibility.",
        "v1 scope locked to status tracking — no time tracking or sprint planning."
      ]
    }
  },
  {
    id: "vendor_onboarding",
    title: "Vendor Onboarding Workflow",
    directive: "Build a vendor onboarding workflow for the operations team",
    response: {
      "objective": "Design and implement an automated vendor onboarding workflow to reduce onboarding time and ensure compliance.",
      "selected_engines": ["ceo_bot", "coo_bot", "hr_bot", "backend_bot", "legal_bot"],
      "analysis": "The current vendor onboarding is manual, scattered across emails, and prone to compliance gaps (missing tax documents/NDAs). Automating the submission and review process will accelerate vendor registration and create a clear audit trail. Integrating contract generation and automatic status updates will reduce operational friction.",
      "tasks": [
        "Legal & Compliance Bot: Draft the Standard Operating Procedure (SOP) for vendor compliance verification",
        "Frontend Developer Bot: Build a secure public-facing portal for vendors to upload W-9 and NDA",
        "COO Operations Bot: Configure automated email sequence for document status alerts and reminders",
        "Backend Developer Bot: Implement database schema storing encrypted vendor compliance metadata",
        "HR Operations Bot: Design approval dashboard for the finance and operations team"
      ],
      "deliverables": [
        "SOP document: vendor screening and validation standards",
        "React-based vendor portal with encrypted file upload widgets",
        "Admin panel for operations team displaying approval queue",
        "Database schema storing encrypted vendor compliance metadata"
      ],
      "risks": [
        "Security risk: vendor financial details could be exposed — mitigate by storing bank details in an encrypted, isolated database table with strict IAM policies.",
        "Delays in submission: vendors may stall uploading documentation — mitigate by sending automatic email reminders every 48 hours."
      ],
      "recommendations": [
        "Incorporate DocuSign API in v1.2 for formal, legally-binding contract e-signatures.",
        "Sync approved vendor records automatically with the ERP/accounting system (e.g. QuickBooks or NetSuite)."
      ],
      "execution_plan": "The Legal Bot will map out the complete verification checklist and compliance criteria in days 1-2. The COO Bot generates the automated email templates. Backend Bot leads the technical database implementation starting in week 2, deploying the public portal first. Final testing is completed by day 12.",
      "memory_updates": [
        "Company lacks central vault for vendor compliance documents.",
        "Onboarding operations team requires secure, automated document verification workflow.",
        "Target SLA for vendor onboarding set to 48 hours from request."
      ]
    }
  },
  {
    id: "hr_recruiting",
    title: "HR: Recruiting & Onboarding",
    directive: "Hire a Lead Frontend Developer and prepare onboarding checklist",
    response: {
      "objective": "Deploy a recruiting pipeline and onboarding checklist for a Lead Frontend Developer.",
      "selected_engines": ["ceo_bot", "hr_bot", "coo_bot", "legal_bot"],
      "analysis": "Securing a Lead Frontend Developer is crucial to accelerate our user interface milestones. Introducing a structured, compliant hiring funnel and automated onboarding playbook ensures fast integration and legal compliance.",
      "tasks": [
        "HR Operations Bot: Draft the Job Description and post to primary hiring boards",
        "HR Operations Bot: Compile screening questions and interview evaluation templates",
        "Legal & Compliance Bot: Review employment offer letters and intellectual property agreements",
        "COO Operations Bot: Setup equipment allocation checklists (MacBook, security tokens)"
      ],
      "deliverables": [
        "Lead Frontend Developer Job Description blueprint",
        "Standard Employment Offer Template & IP Agreement",
        "New Hire Onboarding Checklist (SOP)"
      ],
      "risks": [
        "Hiring bottleneck: Candidate search takes longer than planned — mitigate by leveraging active referral channels and contracting agencies.",
        "Legal risk: Intellectual property ownership gaps — mitigate by requiring signed IP assignment contracts prior to day-one repo access."
      ],
      "recommendations": [
        "Integrate automated candidate tracking (ATS) pipelines to reduce HR manager manual steps.",
        "Establish a 30-60-90 day product milestone review to ensure new hire alignment."
      ],
      "execution_plan": "The HR Bot will finalize the JD and post it on Day 1. Legal Bot reviews offer templates by Day 3. Screening interviews are executed by HR Bot in week 1. Target offer date is day 12, with onboarding starting in week 3.",
      "memory_updates": [
        "Hiring target: Lead Frontend Developer role.",
        "Employment models require signed NDA and IP assignments prior to code access."
      ]
    }
  },
  {
    id: "cto_db_audit",
    title: "CTO: Database & Container Audit",
    directive: "Audit database schema models and compile a docker deployment script",
    response: {
      "objective": "Conduct a technical database schema audit and compile a production Docker container configuration.",
      "selected_engines": ["ceo_bot", "cto_bot", "backend_bot", "deploy_bot"],
      "analysis": "Performing a database audit prevents query latency and data redundancy. Standardizing deployment in Docker containerizes our dependencies, reducing developer setup issues and production environment skew.",
      "tasks": [
        "CTO Architecture Bot: Run indexing audit on high-frequency query tables",
        "Backend Developer Bot: Update Express model schemas and foreign key configurations",
        "DevOps & Deploy Bot: Draft production-ready Dockerfile and Docker Compose templates",
        "DevOps & Deploy Bot: Test container build scripts locally in dry-run environment"
      ],
      "deliverables": [
        "Database Index Optimization Report",
        "Refactored Prisma/Sequelize database schema models",
        "Production Dockerfile & docker-compose.yml configuration scripts"
      ],
      "risks": [
        "Migration downtime: database audit migrations could lock tables — mitigate by executing migrations during off-peak hours (02:00 UTC).",
        "Container size bloat: large Docker images slow down deployment — mitigate by utilizing lightweight alpine base images and multi-stage builds."
      ],
      "recommendations": [
        "Configure auto-scaling container configurations on AWS ECS / Kubernetes.",
        "Setup database query tracking metrics (e.g. PgHero) to detect slow queries in real-time."
      ],
      "execution_plan": "CTO Bot starts schema audits on day 1. Backend Bot updates database models by day 4. Deploy Bot drafts Docker configurations in week 2, executing local build checks by day 10. Target deployment launch is day 14.",
      "memory_updates": [
        "Database containers standard base image set to node:20-alpine.",
        "High frequency queries occur on projects and status tables."
      ]
    }
  },
  {
    id: "coo_campaign",
    title: "COO: LinkedIn Campaign & CPA Audit",
    directive: "Design a Q4 LinkedIn growth campaign and forecast CPA metrics",
    response: {
      "objective": "Formulate a Q4 LinkedIn outreach marketing campaign and model Customer Acquisition Cost (CAC) parameters.",
      "selected_engines": ["ceo_bot", "coo_bot", "marketing_bot", "product_bot"],
      "analysis": "Launching a Q4 enterprise outreach campaign targets high-budget leads before the fiscal year-end. Auditing CPA/CAC metrics ensures the ad budget is spent efficiently and returns high-LTV accounts.",
      "tasks": [
        "Marketing & Growth Bot: Write ad copy variations and select target audience demographics",
        "COO Operations Bot: Formulate budget allocations and model ROI at variable conversion rates",
        "Product Manager Bot: Create dedicated campaign landing page PRD and tracking triggers",
        "Marketing & Growth Bot: Build LinkedIn Campaign Manager ad sets and copy briefs"
      ],
      "deliverables": [
        "Q4 LinkedIn Campaign copy sheets & target criteria",
        "ROI modeling spreadsheet & CAC forecasts",
        "Campaign Landing Page PRD & tracking specifications"
      ],
      "risks": [
        "Budget waste: enterprise conversion rates are lower than expected — mitigate by setting a daily ad budget cap of $50 and testing copy for 7 days.",
        "Lead leakage: landing page has high bounce rates — mitigate by keeping forms short and adding clear value call-to-actions."
      ],
      "recommendations": [
        "Create a retargeting ad set on LinkedIn targeting landing page bounces.",
        "Integrate campaign leads database directly with the sales CRM via webhook."
      ],
      "execution_plan": "Marketing Bot delivers ad copies by day 2. COO Bot computes margin models and budget forecasts by day 4. Product Bot drafts landing page specs in week 1. Campaign goes live on day 8 with initial A/B testing runs.",
      "memory_updates": [
        "Primary target audience: Enterprise VP of Engineering and COOs.",
        "LinkedIn ad test budget limit set to $350 for the first week."
      ]
    }
  }
];
