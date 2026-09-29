# Bug Report

## Bug 1: Pagination starts from the wrong offset

### Location
`src/services/taskService.js`

### Expected Behavior
For page 1 with limit 10, the API should return the first 10 tasks (indices 0 to 9).

### Actual Behavior
The implementation calculated offset as `page * limit`. For page = 1 and limit = 10, offset became 10, skipping the first page tasks entirely.

### How I Discovered It
I wrote a unit test for `getPaginated()` in `tests/taskService.test.js` requesting page 1 with a limit of 2. The test failed because it returned items starting from index 2 instead of index 0.

### Fix
Changed `const offset = page * limit;` to `const offset = (page - 1) * limit;`.