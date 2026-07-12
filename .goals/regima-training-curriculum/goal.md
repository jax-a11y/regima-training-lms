# Goal: Comprehensive RegimA Training Curriculum

## User Request

Comprehensive RegimA training curriculum with complete modules based on the training manual source man20 (RegimA Zone Ingredients document).

## Refined Goal

Populate all 16 existing training modules in the RegimA LMS with complete lesson content, step-by-step procedures, quiz questions, and resources. The curriculum content must be derived from the RegimA Zone Ingredients training manual (`attached_assets/RegimA Zone Ingredients_1757761762227.md`) and general professional skincare training knowledge aligned with RegimA's product line. Each module should have 3-5 lessons with meaningful educational content, steps, quizzes (multiple-choice), and downloadable resource references.

## Acceptance Criteria

- [ ] All 16 modules have at least 3 lessons each with proper content, descriptions, and ordering
- [ ] Each lesson has 3-5 sequential steps with instructional content
- [ ] Each lesson has a quiz with at least 3 multiple-choice questions (using the Question schema: id, question, options[], correctOptionId)
- [ ] Each lesson has at least 1 resource reference (type: pdf/video/link)
- [ ] Ingredient-related modules (especially Module 4) use real data from the RegimA Zone Ingredients manual
- [ ] The application builds successfully with `tsc` (TypeScript check passes)
- [ ] The curriculum data is properly seeded in `server/routes.ts` initializeData() function

## Scope Boundaries

**In scope:**
- Populating curriculum data in `server/routes.ts` initializeData() function
- Creating lessons, steps, quizzes, and resources for all 16 modules
- Using real RegimA ingredient content from the training manual
- Ensuring data matches the existing schema (shared/schema.ts)

**Out of scope:**
- UI/frontend changes
- Database migrations
- New API endpoints
- Authentication changes
- Deployment configuration
- Adding new modules beyond the existing 16

## Applicable Project Conventions

**Quality gate command:**
- `npx tsc --noEmit` (TypeScript type checking)

**Commit convention:**
- Conventional commits (default)
- Assisted-by trailer required: `Assisted-by: Claude:Sonnet-4.6`

**Guidelines:**
- No AGENTS.md or CONSTITUTION.md found
- No `.agents/guidelines/` or `.github/guidelines/` found

**Rules:**
- Data must conform to shared/schema.ts types (InsertModule, InsertLesson, InsertStep, InsertResource, InsertQuiz)
- Quiz questions must use questionSchema format: { id, question, options: [{id, text}], correctOptionId }
- Lessons reference moduleId, steps reference lessonId, quizzes reference lessonId
