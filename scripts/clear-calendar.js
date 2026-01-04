// Script to clear consultation events from Google Calendar

const SUPABASE_URL = 'https://diexsbzqwsbpilsymnfb.supabase.co';
// Using anon key from .env.local
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXhzYnpxd3NicGlsc3ltbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzOTIxOTEsImV4cCI6MjA3NTk2ODE5MX0.Nf1wHe7EDONS25Yv987KqhgyvZu07COnu6qgC0qCy2I';

async function callClearCalendar(action, options = {}) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/clear-calendar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      action,
      searchQuery: 'Tư vấn', // Only consultation events
      ...options,
    }),
  });

  const text = await response.text();
  console.log('Raw response:', text);
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

async function main() {
  const action = process.argv[2] || 'list';

  console.log(`\n📅 Google Calendar - Action: ${action.toUpperCase()}\n`);

  if (action === 'list') {
    console.log('Listing consultation events...\n');
    const result = await callClearCalendar('list');
    
    if (result.error) {
      console.error('Error:', result.error);
      return;
    }

    console.log(`Found ${result.count} consultation events:\n`);
    result.events?.forEach((e, i) => {
      console.log(`${i + 1}. ${e.summary}`);
      console.log(`   📅 ${e.start} → ${e.end}`);
      console.log(`   ID: ${e.id}\n`);
    });

    if (result.count > 0) {
      console.log('\n💡 To delete all these events, run:');
      console.log('   node scripts/clear-calendar.js clear\n');
    }
  } else if (action === 'clear') {
    console.log('⚠️  Deleting all consultation events...\n');
    const result = await callClearCalendar('clear');
    
    if (result.error) {
      console.error('Error:', result.error);
      return;
    }

    console.log(`✅ ${result.message}`);
    console.log(`   Deleted: ${result.deleted}`);
    console.log(`   Failed: ${result.failed}\n`);
  } else {
    console.log('Usage:');
    console.log('  node scripts/clear-calendar.js list   - List consultation events');
    console.log('  node scripts/clear-calendar.js clear  - Delete all consultation events');
  }
}

main().catch(console.error);
