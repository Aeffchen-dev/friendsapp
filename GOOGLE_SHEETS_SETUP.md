# Google Sheets Backend Setup

To enable the wishlist functionality to update Google Sheets, you need to set up a Google Apps Script.

## Steps:

1. **Open your Google Sheet** (the one with ID: `1-5NpzNwUiAsl_BPruHygyUbpO3LHkWr8E08fqkypOcU`)

2. **Go to Extensions > Apps Script**

3. **Replace the default code with this script:**

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
    const data = JSON.parse(e.postData.contents);
    const question = data.question;
    const action = data.action; // 'add' or 'remove'
    
    // Find the row with this question
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    for (let i = 1; i < values.length; i++) { // Start from 1 to skip header
      if (values[i][0] === question) { // Column A contains questions
        if (action === 'add') {
          sheet.getRange(i + 1, 3).setValue('X'); // Column C - add X when liked
        } else if (action === 'remove') {
          sheet.getRange(i + 1, 3).setValue(''); // Column C - remove X when unliked
        }
        break;
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. **Deploy the script:**
   - Click the "Deploy" button (top right)
   - Select "New deployment"
   - Choose type: "Web app"
   - Execute as: "Me"
   - Who has access: "Anyone"
   - Click "Deploy"
   - Copy the web app URL

5. **Update the code:**
   - Replace the URL in `src/components/QuizApp.tsx` (line ~355) with your deployed script URL
   - Look for: `https://script.google.com/macros/s/AKfycbx.../exec`

## Current Implementation:

- ✅ Heart icon fills when clicked
- ✅ Liked questions saved in cookies (persistent across reloads)
- ✅ Share button opens native share dialogue
- ✅ Shared links include question parameter to show exact question
- ⏳ Google Sheets update (requires script deployment as described above)

## How it works:

1. User clicks heart → Question added to cookies
2. App sends POST request to Google Apps Script
3. Script finds the question row and adds X to column C
4. User clicks filled heart → Question removed from cookies and X removed from sheet
