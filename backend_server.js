// server.js - Express Backend Server
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup (SQLite)
const db = new sqlite3.Database('./court_data.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS queries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_type TEXT NOT NULL,
      case_number TEXT NOT NULL,
      year INTEGER NOT NULL,
      query_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT,
      raw_response TEXT,
      parties TEXT,
      filing_date TEXT,
      next_hearing TEXT,
      case_status TEXT,
      judgment_url TEXT
    )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      console.log('Database table ready');
    }
  });
}

// Scraper function for eCourts portal
async function scrapeCourtData(caseType, caseNumber, year) {
  try {
    // NOTE: This is a simplified simulation. Real eCourts scraping requires:
    // 1. Handling CAPTCHAs (manual or automated)
    // 2. State-specific URL patterns
    // 3. Session management
    // 4. Dynamic content rendering (may need Puppeteer)
    
    // Simulated data for demonstration
    // In production, replace with actual scraping logic
    
    const simulatedData = {
      caseNumber: `${caseType}/${caseNumber}/${year}`,
      parties: 'John Doe vs State of Delhi',
      filingDate: '15-Jan-2024',
      nextHearing: '20-Oct-2025',
      status: 'Pending',
      judgmentUrl: 'https://example.com/judgment.pdf'
    };

    // Example of actual scraping (commented out):
    /*
    const courtUrl = 'https://services.ecourts.gov.in/ecourtindia_v6/';
    const response = await axios.post(courtUrl, {
      caseType,
      caseNumber,
      year
    }, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 30000
    });

    const $ = cheerio.load(response.data);
    
    const parties = $('.parties-names').text().trim();
    const filingDate = $('.filing-date').text().trim();
    const nextHearing = $('.next-hearing').text().trim();
    const status = $('.case-status').text().trim();
    const judgmentUrl = $('.judgment-link').attr('href');
    */

    return simulatedData;

  } catch (error) {
    console.error('Error scraping court data:', error);
    throw new Error('Failed to fetch case data from eCourts portal');
  }
}

// Save query to database
function saveQuery(queryData, callback) {
  const sql = `
    INSERT INTO queries (
      case_type, case_number, year, status, 
      raw_response, parties, filing_date, 
      next_hearing, case_status, judgment_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    queryData.caseType,
    queryData.caseNumber,
    queryData.year,
    'success',
    JSON.stringify(queryData.rawResponse),
    queryData.parties,
    queryData.filingDate,
    queryData.nextHearing,
    queryData.caseStatus,
    queryData.judgmentUrl
  ];

  db.run(sql, values, function(err) {
    if (err) {
      console.error('Error saving query:', err);
      callback(err);
    } else {
      console.log(`Query saved with ID: ${this.lastID}`);
      callback(null, this.lastID);
    }
  });
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Fetch case details
app.post('/api/fetch-case', async (req, res) => {
  try {
    const { caseType, caseNumber, year } = req.body;

    // Validation
    if (!caseType || !caseNumber || !year) {
      return res.status(400).json({ 
        error: 'Missing required fields: caseType, caseNumber, year' 
      });
    }

    // Validate year
    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 1950 || yearNum > 2025) {
      return res.status(400).json({ 
        error: 'Invalid year. Must be between 1950 and 2025' 
      });
    }

    console.log(`Fetching case: ${caseType} ${caseNumber}/${year}`);

    // Scrape court data
    const caseData = await scrapeCourtData(caseType, caseNumber, year);

    // Save to database
    const queryData = {
      caseType,
      caseNumber,
      year: yearNum,
      rawResponse: caseData,
      parties: caseData.parties,
      filingDate: caseData.filingDate,
      nextHearing: caseData.nextHearing,
      caseStatus: caseData.status,
      judgmentUrl: caseData.judgmentUrl
    };

    saveQuery(queryData, (err, id) => {
      if (err) {
        console.error('Error saving to database:', err);
      }
    });

    // Return case data
    res.json(caseData);

  } catch (error) {
    console.error('Error in /api/fetch-case:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch case data' 
    });
  }
});

// Download judgment
app.get('/api/download-judgment', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // For demo purposes, return a sample PDF
    // In production, fetch actual PDF from court website
    
    // Example of actual PDF download:
    /*
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 60000
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=judgment.pdf');
    res.send(response.data);
    */

    // For demo, return error message
    res.status(501).json({ 
      error: 'PDF download not implemented in demo. Connect to actual eCourts portal.' 
    });

  } catch (error) {
    console.error('Error downloading judgment:', error);
    res.status(500).json({ 
      error: 'Failed to download judgment' 
    });
  }
});

// Get query history
app.get('/api/queries', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  const sql = `
    SELECT * FROM queries 
    ORDER BY query_timestamp DESC 
    LIMIT ?
  `;

  db.all(sql, [limit], (err, rows) => {
    if (err) {
      console.error('Error fetching queries:', err);
      return res.status(500).json({ error: 'Failed to fetch query history' });
    }
    res.json(rows);
  });
});

// Get specific case by ID
app.get('/api/case/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'SELECT * FROM queries WHERE id = ?';

  db.get(sql, [id], (err, row) => {
    if (err) {
      console.error('Error fetching case:', err);
      return res.status(500).json({ error: 'Failed to fetch case' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Case not found' });
    }
    res.json(row);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Database: SQLite (court_data.db)`);
});