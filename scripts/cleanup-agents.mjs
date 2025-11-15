import { createClient } from '@supabase/supabase-js';

// You can directly access Supabase dashboard to delete agents, or run this with proper auth
const supabaseUrl = 'https://diexsbzqwsbpilsymnfb.supabase.co';
// Using anon key - RLS will apply
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXhzYnpxd3NicGlsc3ltbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg4ODE2NzQsImV4cCI6MjA0NDQ1NzY3NH0.rL-Zq3gHBhQoGFoF9p7TYkWXMt8rlVpvlUi9jVUwpX0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupDuplicateAgents() {
  console.log('🧹 Starting cleanup of duplicate agents...\n');

  try {
    // Get all agents
    const { data: agents, error: fetchError } = await supabase
      .from('ai_agents')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      throw fetchError;
    }

    console.log(`📊 Found ${agents.length} total agents\n`);

    // Show current agents
    console.log('Current agents:');
    agents.forEach((agent, index) => {
      console.log(`${index + 1}. ${agent.name} (${agent.type}) - ${agent.status} - Created: ${new Date(agent.created_at).toLocaleString()}`);
    });

    // Find duplicates by name pattern
    const duplicatePatterns = [
      'Content Writer Agent',
      'Lead Nurture Agent',
      'Social Media Agent',
      'Analytics Agent'
    ];

    const agentsToDelete = agents.filter(agent => 
      duplicatePatterns.some(pattern => agent.name.includes(pattern))
    );

    if (agentsToDelete.length === 0) {
      console.log('\n✅ No duplicate agents found!');
      return;
    }

    console.log(`\n🗑️  Found ${agentsToDelete.length} agents to delete:`);
    agentsToDelete.forEach(agent => {
      console.log(`   - ${agent.name} (ID: ${agent.id})`);
    });

    // Delete duplicates
    const idsToDelete = agentsToDelete.map(a => a.id);
    
    const { error: deleteError } = await supabase
      .from('ai_agents')
      .delete()
      .in('id', idsToDelete);

    if (deleteError) {
      throw deleteError;
    }

    console.log(`\n✅ Successfully deleted ${agentsToDelete.length} duplicate agents!`);

    // Show remaining agents
    const { data: remainingAgents } = await supabase
      .from('ai_agents')
      .select('*')
      .order('created_at', { ascending: false });

    console.log(`\n📊 Remaining agents: ${remainingAgents.length}`);
    if (remainingAgents.length > 0) {
      remainingAgents.forEach((agent, index) => {
        console.log(`${index + 1}. ${agent.name} (${agent.type}) - ${agent.status}`);
      });
    } else {
      console.log('   (No agents remaining - you can create new ones via UI)');
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    process.exit(1);
  }
}

cleanupDuplicateAgents();
