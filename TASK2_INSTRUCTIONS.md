# Task 2: Building from Scratch with Spec-Driven Development

## Scenario

You are continuing in your role as a Graduate Developer at Datacom. Your manager has entrusted you with building a "Kudos" system for the internal employee portal. The initial request is simple: "We need a way for people to give kudos to each other." Your job is to take on the role of an AI Architect, using a spec-driven development process to transform this ambiguous idea into a robust feature.

## Learning Objectives

- The fundamental difference between interactive "vibe coding" and structured, planning-first methodology
- The practical workflow for translating high-level feature requests into formal specifications
- The critical role of the developer in reviewing, refining, and augmenting AI-generated requirements
- How to manage and execute development plans based on pre-defined task lists

## Deliverables

1. **A link to a new, public Git repository** containing the full project source code
2. **`SPECIFICATION.md`** - The final, refined requirements and technical design used to generate the code

## Step-by-Step Instructions

### Step 1: Initiate the Specification

1. In your chosen AI development environment, initiate the process for generating a new feature from a high-level description
2. Enter the initial prompt:
   ```
   Create a feature for our internal web app that allows users to give 'kudos' to their colleagues. A user should be able to select another user from a list, write a short message of appreciation, and submit it. There should also be a public feed on the main dashboard where all recently submitted kudos are visible.
   ```

---

### My notes:

On my first try, AI went ahead and started generating the files, not just the specifications. I started again by adding "Create a specification checklist (without creating any application files until the specification has been approved)"

---

### Step 2: Review and Refine the Specification

The AI will process your request and generate a formal specification, likely including functional requirements and a technical design.

#### Your Task (Requirements): Add Content Moderation

The initial request did not consider content moderation. As the architect, you must add this:

- Edit the generated requirements to add a new user story for an administrator to be able to hide or delete inappropriate kudos messages
- Consider edge cases like spam, inappropriate content, or duplicate submissions

#### Your Task (Design): Update Database Schema

Review the proposed database schema. To support the moderation feature, the design needs to be updated:

- Edit the design document to add a new field to the Kudos table, such as `is_visible` (boolean, default: true)
- Consider additional fields that might be needed for moderation (e.g., `moderated_by`, `moderated_at`, `reason_for_moderation`)

### Step 3: Approve the Specification and Execute Implementation

1. Once you have refined the specification to be complete and correct, formally approve it within your development environment
2. This approval will trigger the AI agent to begin the implementation phase, following the plan it generated based on your approved spec
3. Observe as it creates files and writes the code

### Step 4: Commit and Push to Repository

1. Once the AI has completed the implementation, your feature is complete
2. Save the final requirements and design you approved into a single `SPECIFICATION.md` file
3. Initialize a new Git repository, add all the generated files (including your `SPECIFICATION.md`), and create an initial commit
4. Create a new public repository on a platform like GitHub or GitLab and push your local repository to it

## Specification Requirements Checklist

### Functional Requirements Should Include:

- [ ] User authentication and authorization
- [ ] User selection from a list of colleagues
- [ ] Kudos message creation and submission
- [ ] Public feed display of recent kudos
- [ ] Content moderation capabilities
- [ ] Input validation and error handling
- [ ] Responsive design for different screen sizes

### Technical Design Should Include:

- [ ] Database schema with all necessary tables and relationships
- [ ] API endpoints and their specifications
- [ ] Frontend components and their interactions
- [ ] Security considerations (authentication, authorization, input sanitization)
- [ ] Performance considerations (pagination, caching, etc.)
- [ ] Error handling and logging strategies

### Implementation Plan Should Include:

- [ ] Step-by-step breakdown of development tasks
- [ ] Dependencies between tasks
- [ ] Testing strategy
- [ ] Deployment considerations

## Example Specification Structure

Your `SPECIFICATION.md` should follow this structure:

```markdown
# Kudos System Specification

## Functional Requirements

### User Stories

1. As a user, I can select another user from a dropdown list
2. As a user, I can write a message of appreciation (max 500 characters)
3. As a user, I can submit the kudos which gets stored in the database
4. As a user, I can view a feed of recent kudos on the dashboard
5. As an administrator, I can hide or delete inappropriate kudos messages

### Acceptance Criteria

- [Detailed criteria for each user story]

## Technical Design

### Database Schema

- [Table definitions with fields, types, and relationships]

### API Endpoints

- [List of endpoints with methods, parameters, and responses]

### Frontend Components

- [Component hierarchy and interactions]

## Implementation Plan

- [Step-by-step task breakdown]
```

## Key Principles to Remember

1. **Specification First**: Don't start coding until the specification is complete and approved
2. **Human-in-the-Loop**: You are responsible for ensuring the AI understands the business requirements correctly
3. **Iterative Refinement**: The specification may need multiple rounds of review and refinement
4. **Completeness**: Ensure all edge cases and requirements are captured before implementation

## Reflection Questions

After completing the task, consider:

1. **How did the structured approach to specification change your development process compared to traditional coding?**

### My notes:

The structured process meant I was forced to step back and think through the design before immediately wanting to start putting down lines of code. This also meant that I was also freed to think of things conceptually and have those ideas turned into complete thoughts for ease of review.

AI was quite good at having a lot of common considerations covered like security and considering deleted users. I found the questions for the review team to consider to be interesting and it encouraged more focused thinking around specific aspects of the design and user experience.

2. **What was the most challenging part of reviewing and refining the AI-generated specification?**

### My notes:

The challenging part was having to correct the various assumptions made by AI which also reflected the parts of the prompts that I gave that were open-ended and therefore subject to AI's interpretation.

Because AI is good at producing a lot of information in a short amount of time, it is sometimes tempting to skim read. However this is exactly when you need to be quite vigilant against small things that may seem like innocent suggestions but may have unintended flow on effects.

I think for AI-generated specification you definitely need quite a few people to review and give their two-cents in order to absolutely verify what AI has generated.

3. **How did having a complete specification before implementation affect the quality and completeness of the final code?**

### My notes:

It was interesting to see AI create all the files. As mentioned above, the first time I ran the prompt to create the SPECIFICATION.md file, AI already started generating the files so I can definitely see the difference in terms of the number of files from before the specifications were finetuned compared to after.

As I am running out of my AI allowance, I will keep a track of what AI has completed and what still needs to be done:

I've successfully created the complete backend API routes and frontend React application scaffolding for your Kudos peer recognition system. Here's what's been implemented:

✅ Backend Routes (All 7 modules)
Kudos: Create, feed (paginated), sent, received, get single, edit (10-min window), retract (soft delete)
Comments: Create (posts immediately), get, edit (10-min window), delete anytime, flag with moderation
Reactions: Add/update emoji, get all, remove
Flags: Flag kudos with cooldown checks, get flags summary
Users: Search active users, get current user profile
Notifications: Get/update notification preferences
Admin: Pending approval queue, flagged content review, approve/reject/clear-flags (protected routes)

✅ Frontend Components & Services
API Client (services/api.ts) - 23 methods covering all endpoints with JWT token injection
Component Stack: Navigation, GiveKudosForm, KudosFeed, KudosCard, CommentSection, ReactionBar
TypeScript Interfaces - User, Kudos, Comment, Reaction, Flag, NotificationPreference
Comprehensive Styling - Modern CSS with variables, responsive design, 35+ classes

✅ Configuration
Complete TypeScript configs for both backend and frontend
Environment templates (.env.example, .env.development)
Package.json with all dependencies
Git ignore patterns
React HTML template & entry points

📋 Key Features Implemented
Post-moderation system: Comments publish immediately, flagged at 3+ flags
Unrestricted comment deletion (anytime, no time window)
24-hour retract tracking (soft delete with deletedAt timestamp)
Flag cooldown: 30 minutes between different kudos
Edit windows: 10 minutes for kudos/comments
Emoji reactions with one-per-user constraint
User search with autocomplete
Pagination on feed/history
Admin moderation dashboard endpoints

Listing remaining work, grouped by priority with brief next actions.

High Priority

Backend Services: Implement service classes for business logic — CommentService, ReactionService, FlagService, AdminService, UserService, NotificationService. Next: I'll implement CommentService first.
Wire Routes → Services: Replace direct Prisma usage in route handlers with the new services for consistent validation/error handling. Next: refactor backend/src/routes/comments.ts.
Auth + Roles: Add login/signup, JWT issuance/refresh, and proper admin role integration (replace temporary x-admin-role check). Next: add auth endpoints and update authenticateToken/authorizeAdmin.

Medium Priority

Scheduled Jobs: Add scheduled task runner (cron/Bull) for retracted-kudos purge (24h), kudos archival (365d), and flag archival (30d). Next: create backend/src/jobs/scheduledTasks.ts and wire it in index.ts.
Database / Prisma: Run prisma generate and migrations, add seed script for test data. Next: create prisma/seed.ts and migration plan.
Service Tests: Unit tests for each service and integration tests for key endpoints. Next: add Jest configs and start with KudosService tests.

Frontend Tasks

Auth UI & Token Handling: Implement login/signup pages, store/refresh JWT, protect routes. Next: add Login + Signup components and update services/api.ts auth flows.
Complete Feature Pages: Build Sent/Received history pages, Admin dashboard UI for pending/flagged items, Notification preferences UI. Next: scaffold SentKudos and ReceivedKudos components.
UX Polish & Error Handling: Improve loading states, error messages, form validation, and accessibility. Next: add skeleton loaders for feed and card components.

Infrastructure & DevOps

Docker & CI/CD: Create Dockerfiles, docker-compose.yml, and CI pipeline (GitHub Actions). Next: add backend Dockerfile and compose with Postgres.
Lint/Format/Pre-commit: Add ESLint, Prettier, Husky, and lint-staged. Next: add configs and package scripts.

Observability & Production Readiness

Notifications & Email: Integrate/send notifications (in-app/email) based on preferences. Next: stub NotificationService.sendNotification.
Monitoring & Error Reporting: Add structured logging and optional Sentry integration.

Cleanup & Documentation

README / ENV docs: Update README.md to reflect implemented endpoints and run steps. Next: reconcile docs to current code.
Address Known TODOs: Fix small inconsistencies (imports/constants), ensure route tests pass, finalize type definitions.
If you want, I'll start implementing the top-priority items now — I'll begin with CommentService and refactor backend/src/routes/comments.ts to use it. Proceed?

## Tips for Success

- Take time to thoroughly review the AI-generated specification
- Don't hesitate to add missing requirements or modify the design
- Consider edge cases and error scenarios
- Ensure the specification is detailed enough for the AI to implement correctly
- Remember that your role as Architect is to think strategically, not tactically

This structured process highlights a fundamental shift in the developer's role. The highest-value work is performed during the specification and review phases. By ensuring the blueprint is correct, you guarantee that the subsequent AI-driven implementation will be successful.
