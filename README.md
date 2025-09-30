# Testing Guide - Court Data Fetcher

This guide will help you test all features of the Court Data Fetcher application.

## Prerequisites

- Backend server running on `http://localhost:3001`
- Frontend running on `http://localhost:3000`
- Database seeded with demo data (optional but recommended)

## Seeding Demo Data

Before testing, you can populate the database with demo data:

```bash
cd backend
node seedDatabase.js
```

This will create 8 sample cases in the database.

## Manual Testing Checklist

### 1. Frontend UI Testing

#### Test Case 1.1: Application Load
- [ ] Open `http://localhost:3000`
- [ ] Verify page loads without errors
- [ ] Verify header displays "Court Data Fetcher"
- [ ] Verify all three input fields are visible
- [ ] Verify "Recent Queries" sidebar is visible

#### Test Case 1.2: Form Validation
**Test empty form submission:**
- [ ] Click "Fetch Case Details" without filling any fields
- [ ] Verify error message: "Please fill in all fields"

**Test partial form submission:**
- [ ] Select only Case Type
- [ ] Click submit
- [ ] Verify error message appears

**Test invalid year:**
- [ ] Enter year 1800 (before valid range)
- [ ] Verify appropriate error handling

### 2. Case Fetching Tests

#### Test Case 2.1: Successful Case Fetch - Civil Appeal
**Steps:**
1. Select "Civil Appeal" from dropdown
2. Enter case number: `12345`
3. Enter year: `2024`
4. Click "Fetch Case Details"

**Expected Results:**
- [ ] Loading spinner appears
- [ ] Success message: "Case details fetched successfully!"
- [ ] Case details display:
  - Case Number: `Civil Appeal/12345/2024`
  - Parties names displayed
  - Filing date displayed
  - Next hearing date displayed
  - Case status displayed
- [ ] Download button appears
- [ ] Query appears in "Recent Queries" sidebar

#### Test Case 2.2: Successful Case Fetch - Criminal Appeal
**Steps:**
1. Select "Criminal Appeal"
2. Enter case number: `67890`
3. Enter year: `2023`
4. Click "Fetch Case Details"

**Expected Results:**
- [ ] Similar to Test Case 2.1
- [ ] Different case details displayed

#### Test Case 2.3: Successful Case Fetch - Writ Petition
**Steps:**
1. Select "Writ Petition"
2. Enter case number: `11111`
3. Enter year: `2024`
4. Click submit

**Expected Results:**
- [ ] Case details fetched successfully
- [ ] All fields populated correctly

### 3. Error Handling Tests

#### Test Case 3.1: Network Error
**Steps:**
1. Stop the backend server
2. Try to fetch a case
3. Observe error handling

**Expected Results:**
- [ ] Error message displayed
- [ ] Application doesn't crash
- [ ] Failed query appears in sidebar with error indicator

#### Test Case 3.2: Invalid Case Number
**Steps:**
1. Enter non-existent case number: `99999`
2. Select any case type and year
3. Submit

**Expected Results:**
- [ ] Appropriate error or "case not found" message
- [ ] Graceful error handling

### 4. Recent Queries Sidebar

#### Test Case 4.1: Query History Updates
**Steps:**
1. Make 3 different case searches
2. Observe sidebar

**Expected Results:**
- [ ] Each query appears in sidebar
- [ ] Most recent query at top
- [ ] Success indicator (green checkmark) for successful queries
- [ ] Error indicator (red X) for failed queries
- [ ] Maximum 5 recent queries displayed

#### Test Case 4.2: Query Details Display
**Steps:**
1. Make a successful query
2. Check sidebar entry

**Expected Results:**
- [ ] Case type displayed
- [ ] Case number and year displayed
- [ ] Timestamp displayed
- [ ] Status icon displayed

### 5. Download Functionality

#### Test Case 5.1: Download Button Visibility
**Steps:**
1. Fetch a case with judgment available
2. Observe download button

**Expected Results:**
- [ ] Download button appears below case details
- [ ] Button shows "Download Judgment (PDF)" text
- [ ] Button has download icon

#### Test Case 5.2: Download Attempt
**Steps:**
1. Click download button

**Expected Results:**
- [ ] In demo mode: Error message about feature not implemented
- [ ] In production: PDF download initiates

### 6. Responsive Design Tests

#### Test Case 6.1: Desktop View (1920x1080)
- [ ] All elements visible and properly aligned
- [ ] Sidebar visible on right
- [ ] No horizontal scrolling

#### Test Case 6.2: Tablet View (768x1024)
- [ ] Layout adjusts appropriately
- [ ] Sidebar moves below main content
- [ ] All functionality accessible

#### Test Case 6.3: Mobile View (375x667)
- [ ] Single column layout
- [ ] All buttons accessible
- [ ] Forms properly sized
- [ ] No content cutoff

### 7. Backend API Testing

You can test the backend API directly using cURL, Postman, or the provided Postman collection.

#### Test Case 7.1: Health Check
```bash
curl http://localhost:3001/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

#### Test Case 7.2: Fetch Case - Success
```bash
curl -X POST http://localhost:3001/api/fetch-case \
  -H "Content-Type: application/json" \
  -d '{
    "caseType": "Civil Appeal",
    "caseNumber": "12345",
    "year": 2024
  }'
```

**Expected Response:**
```json
{
  "caseNumber": "Civil Appeal/12345/2024",
  "parties": "...",
  "filingDate": "...",
  "nextHearing": "...",
  "status": "...",
  "judgmentUrl": "..."
}
```

#### Test Case 7.3: Fetch Case - Missing Fields
```bash
curl -X POST http://localhost:3001/api/fetch-case \
  -H "Content-Type: application/json" \
  -d '{
    "caseType": "Civil Appeal"
  }'
```

**Expected Response:**
```json
{
  "error": "Missing required fields: caseType, caseNumber, year"
}
```
**Expected Status Code:** 400

#### Test Case 7.4: Fetch Case - Invalid Year
```bash
curl -X POST http://localhost:3001/api/fetch-case \
  -H "Content-Type: application/json" \
  -d '{
    "caseType": "Civil Appeal",
    "caseNumber": "12345",
    "year": 1800
  }'
```

**Expected Response:**
```json
{
  "error": "Invalid year. Must be between 1950 and 2025"
}
```
**Expected Status Code:** 400

#### Test Case 7.5: Get Query History
```bash
curl http://localhost:3001/api/queries?limit=5
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "case_type": "Civil Appeal",
    "case_number": "12345",
    "year": 2024,
    "query_timestamp": "2024-09-30T10:30:00.000Z",
    ...
  },
  ...
]
```

#### Test Case 7.6: Get Specific Case
```bash
curl http://localhost:3001/api/case/1
```

**Expected Response:**
```json
{
  "id": 1,
  "case_type": "Civil Appeal",
  "case_number": "12345",
  ...
}
```

### 8. Database Testing

#### Test Case 8.1: Verify Data Storage
**Steps:**
1. Make a case query
2. Check SQLite database

```bash
cd backend
sqlite3 court_data.db
```

```sql
SELECT * FROM queries ORDER BY query_timestamp DESC LIMIT 5;
```

**Expected Results:**
- [ ] Query saved in database
- [ ] All fields populated correctly
- [ ] Timestamp recorded

#### Test Case 8.2: Query History Persistence
**Steps:**
1. Make several queries
2. Restart backend server
3. Call `/api/queries` endpoint

**Expected Results:**
- [ ] All previous queries still accessible
- [ ] Data persists across server restarts

### 9. Performance Testing

#### Test Case 9.1: Response Time
**Steps:**
1. Make 10 consecutive case queries
2. Measure response time for each

**Expected Results:**
- [ ] Average response time < 2 seconds
- [ ] No significant degradation over multiple requests

#### Test Case 9.2: Concurrent Requests
**Steps:**
1. Use a tool like Apache Bench or Postman Runner
2. Send 10 concurrent requests

```bash
# Using Apache Bench (if installed)
ab -n 10 -c 5 -p data.json -T application/json http://localhost:3001/api/fetch-case
```

**Expected Results:**
- [ ] All requests handled successfully
- [ ] No server crashes
- [ ] Reasonable response times

### 10. Edge Cases & Boundary Testing

#### Test Case 10.1: Very Old Year
- [ ] Test with year: 1950 (minimum valid)
- [ ] Verify acceptance

#### Test Case 10.2: Future Year
- [ ] Test with year: 2025 (maximum valid)
- [ ] Verify acceptance

#### Test Case 10.3: Long Case Number
- [ ] Test with 20-character case number
- [ ] Verify proper handling

#### Test Case 10.4: Special Characters
- [ ] Test case number with special characters: `ABC/123-XYZ`
- [ ] Verify proper handling or error message

#### Test Case 10.5: Unicode Characters
- [ ] Test with Hindi party names
- [ ] Verify proper display and storage

### 11. Browser Compatibility

Test the application in multiple browsers:

#### Test Case 11.1: Chrome
- [ ] All features work
- [ ] UI renders correctly
- [ ] No console errors

#### Test Case 11.2: Firefox
- [ ] All features work
- [ ] UI renders correctly
- [ ] No console errors

#### Test Case 11.3: Safari
- [ ] All features work
- [ ] UI renders correctly
- [ ] No console errors

#### Test Case 11.4: Edge
- [ ] All features work
- [ ] UI renders correctly
- [ ] No console errors

### 12. Security Testing

#### Test Case 12.1: SQL Injection Prevention
```bash
curl -X POST http://localhost:3001/api/fetch-case \
  -H "Content-Type: application/json" \
  -d '{
    "caseType": "Civil Appeal",
    "caseNumber": "12345\" OR \"1\"=\"1",
    "year": 2024
  }'
```

**Expected Results:**
- [ ] No SQL injection vulnerability
- [ ] Input properly sanitized

#### Test Case 12.2: XSS Prevention
**Steps:**
1. Enter `<script>alert('XSS')</script>` in case number field
2. Submit

**Expected Results:**
- [ ] Script not executed
- [ ] Input properly escaped

### 13. Accessibility Testing

#### Test Case 13.1: Keyboard Navigation
- [ ] Tab through all form fields
- [ ] Submit form using Enter key
- [ ] All interactive elements accessible

#### Test Case 13.2: Screen Reader Compatibility
- [ ] Form labels properly associated
- [ ] Error messages announced
- [ ] Success messages announced

#### Test Case 13.3: Color Contrast
- [ ] Text readable on all backgrounds
- [ ] Error messages have sufficient contrast
- [ ] Success messages have sufficient contrast

## Test Data Reference

Use these test cases for consistent testing:

| Case Type | Case Number | Year | Expected Result |
|-----------|-------------|------|-----------------|
| Civil Appeal | 12345 | 2024 | Success |
| Criminal Appeal | 67890 | 2023 | Success |
| Writ Petition | 11111 | 2024 | Success |
| Special Leave Petition | 22222 | 2023 | Success |
| Transfer Petition | 33333 | 2024 | Success |
| Civil Suit | 44444 | 2022 | Success |
| Criminal Case | 55555 | 2024 | Success |
| Civil Appeal | 66666 | 2023 | Success |
| Civil Appeal | 99999 | 2024 | Not Found (Demo) |

## Automated Testing (Future Enhancement)

Consider adding these automated tests:

### Jest/React Testing Library (Frontend)
```javascript
// Example test
test('displays error when form is incomplete', async () => {
  render(<App />);
  const button = screen.getByText(/Fetch Case Details/i);
  fireEvent.click(button);
  expect(await screen.findByText(/Please fill in all fields/i)).toBeInTheDocument();
});
```

### Mocha/Chai (Backend)
```javascript
// Example test
describe('POST /api/fetch-case', () => {
  it('should return case data for valid input', async () => {
    const response = await request(app)
      .post('/api/fetch-case')
      .send({ caseType: 'Civil Appeal', caseNumber: '12345', year: 2024 });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('caseNumber');
  });
});
```

## Reporting Issues

When reporting issues during testing, include:
1. Test case number
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Screenshots (if applicable)
6. Browser/Environment details

## Test Summary Template

After completing testing, fill out this summary:

```
Testing Date: _______________
Tested By: __________________

Total Test Cases: ___
Passed: ___
Failed: ___
Blocked: ___

Critical Issues: ___
Major Issues: ___
Minor Issues: ___

Overall Assessment:
[ ] Ready for demo
[ ] Needs fixes before demo
[ ] Major issues require resolution

Comments:
_________________________________
_________________________________
```

---

**Good luck with your testing and demo! 🚀**# Court-Data-Automation
