/* eslint-disable */
// Tiny one-off seed script. Run with: npx ts-node-dev --transpile-only src/scripts/seed.ts
// Creates a demo account and a handful of listings so the app isn't empty on first run.

import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { User } from '../models/User';
import { Listing } from '../models/Listing';

async function run() {
  await connectDB();

  const email = 'demo@findr.app';
  const password = 'demo1234';
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name: 'Aarav Sharma',
      email,
      password: await bcrypt.hash(password, 10),
      phone: '+91 90000 12345',
      bio: 'Helping people find what they\'ve lost.',
    });
    console.log('Created demo user:', email, '/', password);
  } else {
    console.log('Demo user already exists, skipping create');
  }

  const count = await Listing.countDocuments({ user: user._id });
  if (count > 0) {
    console.log('Listings already seeded, skipping');
    await mongoose.disconnect();
    return;
  }

  const seedItems: Array<Partial<typeof Listing.prototype>> = [
    {
      type: 'lost',
      title: 'Black Apple AirPods Pro',
      description: 'Lost in the library reading hall. The case has a small scratch on the lid.',
      category: 'Headphones',
      brand: 'Apple',
      color: 'White',
      location: 'Central Library, 2nd Floor',
      date: new Date('2026-02-08'),
      contactName: 'Aarav',
      contactPhone: '+91 90000 12345',
      tags: ['airpods', 'wireless', 'apple'],
      reward: '₹500 reward',
      images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600'],
    },
    {
      type: 'found',
      title: 'Set of car keys with red lanyard',
      description: 'Found near the gym entrance after the morning class. Has 3 keys and a Honda fob.',
      category: 'Keys',
      color: 'Silver',
      brand: 'Honda',
      location: 'Sports Complex, near Gym',
      date: new Date('2026-02-10'),
      contactName: 'Aarav',
      contactPhone: '+91 90000 12345',
      tags: ['car keys', 'honda', 'lanyard'],
      images: ['https://images.unsplash.com/photo-1643804926339-e94f0a655185?w=600'],
    },
    {
      type: 'lost',
      title: 'Yellow North Face backpack',
      description: 'Bright yellow with a small dent on the front pocket. Contains my CS textbooks.',
      category: 'Bags',
      brand: 'North Face',
      color: 'Yellow',
      location: 'Bus Stop near Hostel C',
      date: new Date('2026-02-11'),
      contactName: 'Aarav',
      contactPhone: '+91 90000 12345',
      tags: ['backpack', 'yellow', 'textbooks'],
      reward: 'Coffee on me',
      images: ['https://images.unsplash.com/photo-1526513060-5f0a39419699?w=600'],
    },
    {
      type: 'found',
      title: 'Black leather wallet',
      description: 'Brown stitching, no cash inside but contains some ID cards. Will hand over after verification.',
      category: 'Wallet',
      color: 'Black',
      location: 'Cafeteria, Block B',
      date: new Date('2026-02-12'),
      contactName: 'Aarav',
      contactPhone: '+91 90000 12345',
      tags: ['wallet', 'leather', 'id cards'],
      images: [],
    },
    {
      type: 'lost',
      title: 'Silver Casio digital watch',
      description: 'Old square digital watch, sentimental value. Lost during PE class.',
      category: 'Watch',
      brand: 'Casio',
      color: 'Silver',
      location: 'PE Ground',
      date: new Date('2026-02-09'),
      contactName: 'Aarav',
      contactPhone: '+91 90000 12345',
      tags: ['casio', 'digital', 'silver'],
      images: [],
    },
    {
      type: 'found',
      title: 'Pair of black-rimmed glasses',
      description: 'Found on a bench. Looks like prescription, please describe to claim.',
      category: 'Eyewear',
      color: 'Black',
      location: 'Park bench near Block A',
      date: new Date('2026-02-13'),
      contactName: 'Aarav',
      contactPhone: '+91 90000 12345',
      tags: ['glasses', 'prescription'],
      images: [],
    },
  ];

  await Listing.insertMany(seedItems.map((s) => ({ ...s, user: user!._id })));
  console.log(`Seeded ${seedItems.length} listings`);
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
