# Task Manager API — Take-Home Assignment Submission

This submission adds automated unit and integration tests, fixes a pagination bug, and implements task assignment with validation.

## What I changed

### Tests
- Added unit tests for the task service.
- Added integration tests for the API routes using Supertest.
- Covered happy paths for the API endpoints and multiple edge cases, including validation and missing resources.
- Added tests for the assignment endpoint, including empty/whitespace/non-string assignees and reassignment.

### Bug found and fixed
The pagination logic in `src/services/taskService.js` used `page * limit` as the offset, which skipped the first page. It now uses `(page - 1) * limit`.

The discovery and expected/fixed behavior are documented in `BUG_REPORT.md`.

### New feature
Implemented:

`PATCH /tasks/:id/assign`

Body:

```json
{ "assignee": "string" }
```

Design decisions:
- The assignee must be a non-empty string after trimming whitespace.
- A missing task returns `404`.
- Reassignment is allowed and replaces the existing assignee.
- The updated task is returned in the response.

## Test / coverage result

The final test suite passes successfully. Run:

```bash
npm install
npm test
npm run coverage
```

The latest run completed with **25 passing tests** and coverage above the requested 80% target.

## What I would test next

With more time, I would add tests for:
- Invalid pagination values and boundary conditions.
- Status filtering with unsupported status values.
- More combinations of due dates and task statuses for overdue statistics.
- Update behavior for every mutable task field.
- Concurrent requests and behavior if the in-memory store is replaced by a database.

## What surprised me

The pagination bug was easy to miss because the endpoint works for later pages but skips the first page when using a one-based page number. Writing a direct unit test for page 1 exposed the off-by-one error clearly.

I also found that the API uses an in-memory store, so all data is reset whenever the process restarts. That is appropriate for this exercise but would need to change for production persistence.

## Questions before production

- What are the expected authorization and authentication rules for creating, updating, deleting, completing, and assigning tasks?
- Should assignees be free-form names or references to real users?
- What pagination limits and validation rules should be enforced?
- What persistence/database and migration strategy should be used in production?
- What are the expected error response format, logging, monitoring, and rate-limiting requirements?
