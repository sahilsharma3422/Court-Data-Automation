// seedDatabase.js - Populate database with demo data for testing

const sqlite3 = require('sqlite3').verbose();

// Connect to database
const db = new sqlite3.Database('./court_data.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

// Demo case data
const demoCases = [
  {
    case_type: 'Civil Appeal',
    case_number: '12345',
    year: 2024,
    parties: 'Ramesh Kumar vs State of Delhi',
    filing_date: '15-Jan-2024',
    next_hearing: '20-Oct-2025',
    case_status: 'Pending',
    judgment_url: 'https://example.com/judgment1.pdf'
  },
  {
    case_type: 'Criminal Appeal',
    case_number: '67890',
    year: 2023,
    parties: 'State of Maharashtra vs John Doe',
    filing_date: '22-Mar-2023',
    next_hearing: '15-Nov-2025',
    case_status: 'Under Review',
    judgment_url: 'https://example.com/judgment2.pdf'
  },
  {
    case_type: 'Writ Petition',
    case_number: '11111',
    year: 2024,
    parties: 'ABC Corporation vs Union of India',
    filing_date: '10-Feb-2024',
    next_hearing: '25-Oct-2025',
    case_status: 'Disposed',
    judgment_url: 'https://example.com/judgment3.pdf'
  },
  {
    case_type: 'Special Leave Petition',
    case_number: '22222',
    year: 2023,
    parties: 'Priya Sharma vs Municipal Corporation of Delhi',
    filing_date: '05-May-2023',
    next_hearing: '30-Oct-2025',
    case_status: 'Adjourned',
    judgment_url: null
  },
  {
    case_type: 'Transfer Petition',
    case_number: '33333',
    year: 2024,
    parties: 'Tech Solutions Pvt Ltd vs State Bank of India',
    filing_date: '18-Jun-2024',
    next_hearing: '12-Nov-2025',
    case_status: 'Final Order Passed',
    judgment_url: 'https://example.com/judgment5.pdf'
  },
  {
    case_type: 'Civil Suit',
    case_number: '44444',
    year: 2022,
    parties: 'Rajesh Verma vs Sunita Devi',
    filing_date: '12-Aug-2022',
    next_hearing: '18-Nov-2025',
    case_status: 'Pending',
    judgment_url: null
  },
  {
    case_type: 'Criminal Case',
    case_number: '55555',
    year: 2024,
    parties: 'State of Karnataka vs Amit Singh',
    filing_date: '01-Sep-2024',
    next_hearing: '05-Dec-2025',
    case_status: 'Under Investigation',
    judgment_url: null
  },
  {
    case_type: 'Civil Appeal',
    case_number: '66666',
    year: 2023,
    parties: 'Global Industries Ltd vs Local Traders Association',
    filing_date: '20-Nov-2023',
    next_hearing: '10-Dec-2025',
    case_status: 'Disposed',
    judgment_url: 'https://example.com/judgment8.pdf'
  }
];

// Clear existing data
function clearDatabase(callback) {
  console.log('Clearing existing data...');
  db.run('DELETE FROM queries', (err) => {
    if (err) {
      console.error('Error clearing database:', err);
      callback(err);
    } else {
      console.log('Database cleared successfully');
      callback(null);
    }
  });
}

// Insert demo data
function insertDemoData() {
  const sql = `
    INSERT INTO queries (
      case_type, case_number, year, status,
      raw_response, parties, filing_date,
      next_hearing, case_status, judgment_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  let completed = 0;
  const total = demoCases.length;

  console.log(`Inserting ${total} demo cases...`);

  demoCases.forEach((caseData, index) => {
    const rawResponse = JSON.stringify({
      caseNumber: `${caseData.case_type}/${caseData.case_number}/${caseData.year}`,
      parties: caseData.parties,
      filingDate: caseData.filing_date,
      nextHearing: caseData.next_hearing,
      status: caseData.case_status,
      judgmentUrl: caseData.judgment_url
    });

    const values = [
      caseData.case_type,
      caseData.case_number,
      caseData.year,
      'success',
      rawResponse,
      caseData.parties,
      caseData.filing_date,
      caseData.next_hearing,
      caseData.case_status,
      caseData.judgment_url
    ];

    db.run(sql, values, function(err) {
      if (err) {
        console.error(`Error inserting case ${index + 1}:`, err);
      } else {
        console.log(`✓ Inserted case ${index + 1}/${total}: ${caseData.case_type} ${caseData.case_number}/${caseData.year}`);
      }

      completed++;
      if (completed === total) {
        console.log('\n✅ All demo data inserted successfully!');
        displayStats();
      }
    });
  });
}

// Display database statistics
function displayStats() {
  db.get('SELECT COUNT(*) as count FROM queries', (err, row) => {
    if (err) {
      console.error('Error getting stats:', err);
    } else {
      console.log(`\n📊 Database Statistics:`);
      console.log(`   Total queries: ${row.count}`);
    }

    // Get cases by type
    db.all(`
      SELECT case_type, COUNT(*) as count 
      FROM queries 
      GROUP BY case_type
    `, (err, rows) => {
      if (err) {
        console.error('Error getting case type stats:', err);
      } else {
        console.log('\n   Cases by type:');
        rows.forEach(row => {
          console.log(`   - ${row.case_type}: ${row.count}`);
        });
      }

      console.log('\n✅ Database seeded successfully!');
      console.log('You can now start the server and test the application.\n');
      
      db.close();
    });
  });
}

// Main execution
console.log('========================================');
console.log('Court Data Fetcher - Database Seeder');
console.log('========================================\n');

clearDatabase((err) => {
  if (err) {
    console.error('Failed to clear database');
    process.exit(1);
  }
  insertDemoData();
});