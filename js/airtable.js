const airtable = require('airtable');
const csv = require('csvtojson');

const ALLOWED_FIELDS = [
  {
    name: 'Author(s)',
    isArray: true,
    isFiltered: false
  },
  {
    name: 'Country(ies)',
    isArray: true,
    isFiltered: true
  },
  {
    name: 'Document ID',
    isArray: false,
    isFiltered: false
  },
  {
    name: 'Document Title',
    isArray: false,
    isFiltered: false
  },
  {
    name: 'Key Findings',
    isArray: false,
    isFiltered: false
  },
  {
    name: 'Key Recommendations',
    isArray: false,
    isFiltered: false
  },
  {
    name: 'Internet URL of Document',
    isArray: false,
    isFiltered: false
  },
  {
    name: 'Private Sector Industry',
    isArray: true,
    isFiltered: true
  },
  {
    name: 'Name of Private Sector Partner(s)',
    isArray: true,
    isFiltered: true
  },
  {
    name: 'R4D Activities',
    isArray: true,
    isFiltered: true
  },
  {
    name: 'R4D Outcomes',
    isArray: true,
    isFiltered: true
  },
  {
    name: 'Publishing Institution(s)',
    isArray: true,
    isFiltered: false
  },
  {
    name: 'Special Considerations',
    isArray: true,
    isFiltered: true
  },
  {
    name: 'Technical Sector',
    isArray: true,
    isFiltered: true
  },
  {
    name: 'Type of Document',
    isArray: true,
    isFiltered: true
  },
  {
    name: 'Type of Enterprise',
    isArray: true,
    isFiltered: true
  },
  {
    name: 'USAID-Funded?',
    isArray: false,
    isFiltered: false
  },
  {
    name: 'USAID Region',
    isArray: true,
    isFiltered: true
  },
  {
    name: 'Year',
    isArray: false,
    isFiltered: false
  },
  {
    name: 'Direction of Evidence',
    isArray: true,
    isFiltered: false
  },
  {
    name: 'Methodologies Used',
    isArray: true,
    isFiltered: true
  }
];

/**
 * Fetches data from Airtable, serializes it to JSON and outputs it to stdout.
 * Requires the AIRTABLE_API_KEY and AIRTABLE_BASE_ID environment variables to be set.
 */
(async function(){
  try {
    if (!process.env.AIRTABLE_BASE_ID) {
      throw new Error('A valid base ID is required to connect to Airtable. The AIRTABLE_BASE_ID environment variable is not set.');
    }
    const base = airtable.base(process.env.AIRTABLE_BASE_ID);
    const records = await base('Categorization Matrix').select({
      cellFormat: 'string',
      timeZone: 'America/Indiana/Indianapolis',
      userLocale: 'en',
      view: 'Grid view'
    }).all();
    const results = {
      records: [],
      filteredFields: {}
    };
    // Initialize filtered fields
    for (const field of ALLOWED_FIELDS.filter(entry => entry.isFiltered)) {
      results.filteredFields[field.name] = new Set();
    }
    for (const entry of records) {
      const record = entry.fields;
      const result = {};
      // Only add whitelisted fields
      for (const field of ALLOWED_FIELDS) {
        if (record[field.name]) {
          if (field.isArray) {
            const rows = await csv({ noheader: true, output: 'csv'}).fromString(record[field.name]);
            result[field.name] = rows.pop();
            if (field.isFiltered) {
              for (const fieldValue of result[field.name]) {
                results.filteredFields[field.name].add(fieldValue);
              }
            }
          } else {
            result[field.name] = record[field.name];
            if (field.isFiltered) {
              results.filteredFields[field.name].add(result[field.name]);
            }
          }
        }
      }
      results.records.push(result);
    }
    // Convert sets to arrays
    for (const [name, values] of Object.entries(results.filteredFields)) {
      results.filteredFields[name] = Array.from(values).sort();
    }
    results.filteredFields["Year"] = [
      "Before 1990",
      "Since 1990",
      "Since 2006",
      "Since 2016"
    ]
    console.log(JSON.stringify(results, null, 2));
  } catch (err) {
    console.error(err);
    process.exit(1)
  }
})();
