const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '../.env.local');
let MONGODB_URI = '';
let SUPABASE_URL = '';
let SERVICE_KEY = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.trim().startsWith('MONGODB_URI=')) {
      MONGODB_URI = line.substring(line.indexOf('=') + 1).replace(/\r/g, '').trim();
    }
    if (line.trim().startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      SUPABASE_URL = line.substring(line.indexOf('=') + 1).replace(/\r/g, '').trim();
    }
    if (line.trim().startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      SERVICE_KEY = line.substring(line.indexOf('=') + 1).replace(/\r/g, '').trim();
    }
  }
}

if (!MONGODB_URI || !SUPABASE_URL || !SERVICE_KEY) {
  console.error('Error: Please check your .env.local file. MONGODB_URI, NEXT_PUBLIC_SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY are required.');
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node scripts/create-admin.js <email> [role]');
  console.log('Available roles: participant, judge, mentor, admin, super_admin');
  process.exit(0);
}

const email = args[0].trim().toLowerCase();
const role = (args[1] || 'admin').trim().toLowerCase();

const validRoles = ['participant', 'judge', 'mentor', 'admin', 'super_admin'];
if (!validRoles.includes(role)) {
  console.error(`Error: Invalid role "${role}". Valid roles are: ${validRoles.join(', ')}`);
  process.exit(1);
}

// Define profile schema
const ProfileSchema = new mongoose.Schema({
  _id: String, // Maps to Supabase Auth UUID
  full_name: String,
  email: { type: String, unique: true },
  role: String,
}, { collection: 'profiles' });

const Profile = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);

async function run() {
  try {
    // 2. Update Supabase Auth user metadata
    console.log(`Initializing Supabase Admin client for: ${SUPABASE_URL}`);
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

    console.log(`Searching for Supabase user with email: ${email}...`);
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    const user = users.find(u => u.email.toLowerCase() === email);
    if (!user) {
      console.error(`Error: User not found in Supabase Auth. Make sure they have registered via the website first.`);
      process.exit(1);
    }

    console.log(`Found user in Supabase. User ID: ${user.id}`);
    console.log(`Updating Supabase metadata role to: ${role}...`);
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: { role }
    });
    if (updateError) throw updateError;
    console.log(`Supabase Auth role updated successfully.`);

    // 3. Connect to MongoDB Atlas and update profile document
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    console.log(`Updating Profile document in MongoDB for user: ${email}...`);
    const profile = await Profile.findOneAndUpdate(
      { email },
      { role },
      { new: true, upsert: true } // Upsert in case document wasn't fully synced
    );

    console.log(`MongoDB profile updated successfully. New Profile:`, profile);
    process.exit(0);
  } catch (err) {
    console.error('Execution failed:', err);
    process.exit(1);
  }
}

run();
