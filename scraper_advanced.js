// scraper.js - Advanced scraping utilities for eCourts

const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Court Portal URLs by State
 */
const COURT_PORTALS = {
  delhi: 'https://delhihighcourt.nic.in',
  maharashtra: 'https://bombayhighcourt.nic.in',
  karnataka: 'https://karnatakajudiciary.kar.nic.in',
  default: 'https://services.ecourts.gov.in/ecourtindia_v6/'
};

/**
 * Delay utility for rate limiting
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * User agent pool for rotation
 */
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
];

/**
 * Get random user agent
 */
function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Validate case inputs
 */
function validateCaseInput(caseType, caseNumber, year) {
  const errors = [];

  if (!caseType || caseType.trim() === '') {
    errors.push('Case type is required');
  }

  if (!caseNumber || caseNumber.trim() === '') {
    errors.push('Case number is required');
  }

  const yearNum = parseInt(year);
  if (isNaN(yearNum) || yearNum < 1950 || yearNum > 2025) {
    errors.push('Year must be between 1950 and 2025');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Parse case details from HTML
 */
function parseCaseDetails(html, caseNumber) {
  const $ = cheerio.load(html);
  
  // These selectors will need to be adjusted based on actual eCourts HTML structure
  const data = {
    caseNumber: caseNumber,
    parties: '',
    filingDate: '',
    nextHearing: '',
    status: '',
    judgmentUrl: null
  };

  try {
    // Example selectors (adjust based on actual site structure)
    data.parties = $('td:contains("Petitioner")').next().text().trim() + 
                   ' vs ' + 
                   $('td:contains("Respondent")').next().text().trim();
    
    data.filingDate = $('td:contains("Date of Filing")').next().text().trim();
    data.nextHearing = $('td:contains("Next Hearing")').next().text().trim();
    data.status = $('td:contains("Case Status")').next().text().trim();
    
    // Find judgment link
    const judgmentLink = $('a:contains("Judgment")').attr('href') || 
                         $('a:contains("Order")').attr('href');
    
    if (judgmentLink) {
      data.judgmentUrl = judgmentLink.startsWith('http') 
        ? judgmentLink 
        : COURT_PORTALS.default + judgmentLink;
    }

  } catch (error) {
    console.error('Error parsing case details:', error);
  }

  return data;
}

/**
 * Fetch case data from eCourts portal (Simplified version)
 */
async function fetchCaseData(caseType, caseNumber, year, state = 'default') {
  // Validate inputs
  const validation = validateCaseInput(caseType, caseNumber, year);
  if (!validation.isValid) {
    throw new Error(`Invalid input: ${validation.errors.join(', ')}`);
  }

  try {
    const baseUrl = COURT_PORTALS[state] || COURT_PORTALS.default;
    
    // Add delay to respect rate limits
    await delay(1000);

    // Make request
    const response = await axios({
      method: 'GET',
      url: baseUrl,
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive'
      },
      timeout: 30000
    });

    // Parse response
    const caseData = parseCaseDetails(response.data, `${caseType}/${caseNumber}/${year}`);
    
    return caseData;

  } catch (error) {
    console.error('Error fetching case data:', error.message);
    
    if (error.response) {
      throw new Error(`Server error: ${error.response.status}`);
    } else if (error.request) {
      throw new Error('No response from server. Court portal may be down.');
    } else {
      throw new Error(`Request failed: ${error.message}`);
    }
  }
}

/**
 * Download judgment PDF
 */
async function downloadJudgment(url) {
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': getRandomUserAgent()
      },
      timeout: 60000
    });

    return response.data;

  } catch (error) {
    console.error('Error downloading judgment:', error.message);
    throw new Error('Failed to download judgment PDF');
  }
}

/**
 * Generate simulated case data for demo purposes
 * Replace this with actual scraping in production
 */
function generateSimulatedData(caseType, caseNumber, year) {
  const parties = [
    'Ramesh Kumar vs State of Delhi',
    'ABC Corporation vs XYZ Ltd',
    'John Doe vs Union of India',
    'Priya Sharma vs Municipal Corporation',
    'Tech Solutions Pvt Ltd vs State Bank'
  ];

  const statuses = [
    'Pending',
    'Disposed',
    'Adjourned',
    'Under Review',
    'Final Order Passed'
  ];

  // Generate realistic dates
  const filingDate = new Date(year, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
  const nextHearing = new Date(2025, 9, Math.floor(Math.random() * 30) + 1);

  return {
    caseNumber: `${caseType}/${caseNumber}/${year}`,
    parties: parties[Math.floor(Math.random() * parties.length)],
    filingDate: filingDate.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    }),
    nextHearing: nextHearing.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    }),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    judgmentUrl: 'https://example.com/judgments/sample.pdf'
  };
}

/**
 * Main scraper function with fallback to simulated data
 */
async function scrapeCourtData(caseType, caseNumber, year, useRealScraping = false) {
  const validation = validateCaseInput(caseType, caseNumber, year);
  
  if (!validation.isValid) {
    throw new Error(`Invalid input: ${validation.errors.join(', ')}`);
  }

  if (useRealScraping) {
    // Use actual scraping
    try {
      return await fetchCaseData(caseType, caseNumber, year);
    } catch (error) {
      console.error('Real scraping failed, falling back to simulated data:', error.message);
      return generateSimulatedData(caseType, caseNumber, year);
    }
  } else {
    // Use simulated data for demo
    return generateSimulatedData(caseType, caseNumber, year);
  }
}

/**
 * Batch scraping with rate limiting
 */
async function scrapeBatchCases(cases, delayMs = 2000) {
  const results = [];
  
  for (let i = 0; i < cases.length; i++) {
    const { caseType, caseNumber, year } = cases[i];
    
    try {
      console.log(`Scraping case ${i + 1}/${cases.length}: ${caseType} ${caseNumber}/${year}`);
      const data = await scrapeCourtData(caseType, caseNumber, year);
      results.push({ success: true, data });
      
      // Rate limiting
      if (i < cases.length - 1) {
        await delay(delayMs);
      }
    } catch (error) {
      console.error(`Failed to scrape case ${caseNumber}:`, error.message);
      results.push({ 
        success: false, 
        error: error.message,
        caseNumber 
      });
    }
  }
  
  return results;
}

/**
 * Search cases by party name
 */
async function searchByPartyName(partyName, state = 'default') {
  // This would need to be implemented based on the specific court portal
  // Most portals have a party name search feature
  
  try {
    const baseUrl = COURT_PORTALS[state] || COURT_PORTALS.default;
    
    // Example implementation (adjust based on actual site)
    const response = await axios({
      method: 'POST',
      url: `${baseUrl}/search`,
      data: {
        searchType: 'party',
        partyName: partyName
      },
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const $ = cheerio.load(response.data);
    const cases = [];

    // Parse search results
    $('.case-row').each((i, elem) => {
      cases.push({
        caseNumber: $(elem).find('.case-number').text().trim(),
        parties: $(elem).find('.parties').text().trim(),
        filingDate: $(elem).find('.filing-date').text().trim(),
        status: $(elem).find('.status').text().trim()
      });
    });

    return cases;

  } catch (error) {
    console.error('Error searching by party name:', error.message);
    throw new Error('Failed to search cases by party name');
  }
}

// Export all functions
module.exports = {
  scrapeCourtData,
  fetchCaseData,
  downloadJudgment,
  validateCaseInput,
  parseCaseDetails,
  scrapeBatchCases,
  searchByPartyName,
  generateSimulatedData,
  COURT_PORTALS
};