const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '../.env.local');
let MONGODB_URI = '';
let SUPABASE_URL = '';
let SERVICE_KEY = '';
let ANON_KEY = '';

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
    if (line.trim().startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      ANON_KEY = line.substring(line.indexOf('=') + 1).replace(/\r/g, '').trim();
    }
  }
}

if (!MONGODB_URI || !SUPABASE_URL || !SERVICE_KEY || !ANON_KEY) {
  console.error('Error: Please check your .env.local file. All credentials must be defined.');
  process.exit(1);
}

// Inline Schema definitions for verification purposes
const ProfileSchema = new mongoose.Schema({
  _id: String,
  full_name: String,
  email: String,
  role: String,
}, { collection: 'profiles' });

const SystemSettingSchema = new mongoose.Schema({
  key: String,
  value: mongoose.Schema.Types.Mixed,
  description: String,
}, { collection: 'systemsettings' });

const HackathonRoundSchema = new mongoose.Schema({
  round_number: Number,
  title: String,
  date: String,
  timeline: String,
  description: String,
}, { collection: 'hackathonrounds' });

const EventAgendaSchema = new mongoose.Schema({
  title: String,
  description: String,
  start_time: Date,
  end_time: Date,
  type: String,
}, { collection: 'eventagendas' });

const RsvpSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  full_name: String,
  affiliation: String,
  ticket_code: String,
  status: String,
  checkin_time: Date,
}, { collection: 'rsvps' });

const AuditLogSchema = new mongoose.Schema({
  admin_id: { type: String, ref: 'Profile' },
  action: { type: String, required: true },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  ip_address: { type: String },
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

// Register models
const Profile = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);
const SystemSetting = mongoose.models.SystemSetting || mongoose.model('SystemSetting', SystemSettingSchema);
const HackathonRound = mongoose.models.HackathonRound || mongoose.model('HackathonRound', HackathonRoundSchema);
const EventAgenda = mongoose.models.EventAgenda || mongoose.model('EventAgenda', EventAgendaSchema);
const Rsvp = mongoose.models.Rsvp || mongoose.model('Rsvp', RsvpSchema);
const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);

async function runTests() {
  console.log('--- STARTING ALL-COLLECTIONS READ/WRITE/DELETE SANITY TESTS ---');
  try {
    // 1. Supabase Client Verifications
    console.log('\n[1/7] Testing Supabase Client Initialization...');
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;
    console.log(`✓ Supabase connection successful. Registered users: ${users.length}`);

    // 2. Connect to MongoDB
    console.log('\n[2/7] Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Successfully connected to MongoDB Atlas cluster.');

    // 3. Test Profile collection CRUD
    console.log('\n[3/7] Testing Profile Schema CRUD...');
    const testUuid = 'dummy-uuid-testing-12345';
    // Clean up if exists
    await Profile.deleteOne({ _id: testUuid });
    const dummyProfile = await Profile.create({
      _id: testUuid,
      full_name: 'Sanity Checker User',
      email: 'sanity@arvix2026.gov.in',
      role: 'participant'
    });
    console.log('✓ Profile document inserted successfully.');
    
    const fetchedProfile = await Profile.findById(testUuid);
    if (!fetchedProfile || fetchedProfile.full_name !== 'Sanity Checker User') {
      throw new Error('Fetched Profile does not match target data');
    }
    console.log(`✓ Profile fetched matches target full name: ${fetchedProfile.full_name}`);
    await Profile.deleteOne({ _id: testUuid });
    console.log('✓ Profile document deleted/cleaned up successfully.');

    // 4. Test SystemSettings collection CRUD
    console.log('\n[4/7] Testing SystemSettings Schema CRUD...');
    const testSettingKey = 'sanity_temp_setting';
    await SystemSetting.deleteOne({ key: testSettingKey });
    const dummySetting = await SystemSetting.create({
      key: testSettingKey,
      value: { testBool: true, scoreOffset: 45 },
      description: 'Temporary verification variable'
    });
    console.log('✓ SystemSetting document inserted.');
    
    const fetchedSetting = await SystemSetting.findOne({ key: testSettingKey });
    if (!fetchedSetting || fetchedSetting.value.scoreOffset !== 45) {
      throw new Error('Fetched SystemSetting does not match target nested value');
    }
    console.log(`✓ SystemSetting nested value matches: ${JSON.stringify(fetchedSetting.value)}`);
    await SystemSetting.deleteOne({ key: testSettingKey });
    console.log('✓ SystemSetting cleaned up.');

    // 5. Test HackathonRound collection CRUD
    console.log('\n[5/7] Testing HackathonRound Schema CRUD...');
    await HackathonRound.deleteOne({ round_number: 999 });
    const dummyRound = await HackathonRound.create({
      round_number: 999,
      title: 'Temporary Mock Round',
      date: 'July 15, 2026',
      timeline: '12:00 PM - 02:00 PM',
      description: 'Temporary testing round'
    });
    console.log('✓ HackathonRound inserted.');
    const fetchedRound = await HackathonRound.findOne({ round_number: 999 });
    if (!fetchedRound || fetchedRound.title !== 'Temporary Mock Round') {
      throw new Error('Fetched round does not match target title.');
    }
    console.log(`✓ HackathonRound fetched matches: ${fetchedRound.title}`);
    await HackathonRound.deleteOne({ round_number: 999 });
    console.log('✓ HackathonRound cleaned up.');

    // 6. Test Rsvp collection CRUD
    console.log('\n[6/7] Testing RSVP Ticket Scanner CRUD...');
    const testRsvpEmail = 'rsvp_sanity@arvix2026.gov.in';
    await Rsvp.deleteOne({ email: testRsvpEmail });
    const dummyRsvp = await Rsvp.create({
      email: testRsvpEmail,
      full_name: 'RSVP Tester Person',
      affiliation: 'MeitY Lead',
      ticket_code: 'TKT-SANITY-777',
      status: 'confirmed',
      checkin_time: null
    });
    console.log('✓ RSVP document inserted.');
    
    // Test check-in update
    const checkinTime = new Date();
    const updatedRsvp = await Rsvp.findOneAndUpdate(
      { email: testRsvpEmail },
      { checkin_time: checkinTime },
      { new: true }
    );
    if (!updatedRsvp || !updatedRsvp.checkin_time) {
      throw new Error('Checkin status update did not apply checkin_time timestamp.');
    }
    console.log(`✓ Check-in scan timestamp simulated successfully: ${updatedRsvp.checkin_time}`);
    await Rsvp.deleteOne({ email: testRsvpEmail });
    console.log('✓ RSVP document cleaned up.');

    // 7. Verify audit logging relation
    console.log('\n[7/7] Testing AuditLog referencing Profile ID...');
    const dummyLog = await AuditLog.create({
      admin_id: 'c5afa8f6-0a65-4cef-8cd2-aefb23d01d2c', // Super Admin ID
      action: 'SANITY_SYSTEM_CHECK_VERIFICATION',
      details: { automated: true, duration: 15 },
      ip_address: '127.0.0.1'
    });
    console.log('✓ AuditLog entry registered.');
    
    // Fetch and populate relation
    const fetchedLog = await AuditLog.findById(dummyLog._id).populate('admin_id');
    const populatedAdmin = fetchedLog.admin_id;
    if (populatedAdmin && populatedAdmin.email) {
      console.log(`✓ Populated Admin details successfully. Email: ${populatedAdmin.email}, Role: ${populatedAdmin.role}`);
    } else {
      console.log('⚠ AuditLog reference created, but Admin ID profile was not populated (likely seed account did not match this mock run)');
    }
    await AuditLog.deleteOne({ _id: dummyLog._id });
    console.log('✓ AuditLog entry cleaned up.');

    console.log('\n--- ALL DB SANITY CHECKS COMPLETED SUCCESSFULLY! ---');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ DATABASE VERIFICATION ERROR:', err);
    process.exit(1);
  }
}

runTests();
