import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ProblemStatement from '@/models/ProblemStatement';

const DEFAULT_PROBLEMS = [
  {
    title: 'AI-Enabled Public Grievance Redressal System',
    track: 'AI for Governance',
    description: 'Build a system to automatically categorize, prioritize, and summarize public grievances submitted to the government portals. Integrate sentiment analysis and auto-routing to relevant ministries for rapid resolution.',
    pdf_url: '#',
    api_links: [
      { name: 'CPGRAMS API', url: 'https://cpgrams.gov.in/api-doc' },
      { name: 'Bhashini Translation API', url: 'https://bhashini.gov.in/en/' }
    ],
    is_active: true
  },
  {
    title: 'Blockchain-Based Land Registry & Smart Contracts',
    track: 'Digital India',
    description: 'Develop a secure, immutable, and transparent land ownership registry using Distributed Ledger Technology. Design smart contracts for ownership transfers that auto-execute on payment clearance to prevent land frauds.',
    pdf_url: '#',
    api_links: [
      { name: 'India Stack Auth API', url: 'https://indiastack.org/' },
      { name: 'National Map Datasets', url: 'https://bhuvan.nrsc.gov.in/' }
    ],
    is_active: true
  },
  {
    title: 'IoT-Driven Real-time Air Quality & Traffic Management',
    track: 'Smart Cities',
    description: 'Integrate real-time feeds from city air quality sensors and traffic cameras. Build an intelligent traffic light control system that optimizes traffic flows dynamically in high pollution hotspots to disperse congestion.',
    pdf_url: '#',
    api_links: [
      { name: 'Open Government Data (OGD)', url: 'https://data.gov.in' }
    ],
    is_active: true
  }
];

export async function GET() {
  try {
    await dbConnect();

    // Query active problem statements
    let problems = await ProblemStatement.find({ is_active: true });

    // Auto-seed if empty
    if (problems.length === 0) {
      await ProblemStatement.insertMany(DEFAULT_PROBLEMS);
      problems = await ProblemStatement.find({ is_active: true });
    }

    return NextResponse.json({ problems });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
