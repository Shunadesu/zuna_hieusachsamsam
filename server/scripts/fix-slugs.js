import mongoose from 'mongoose';
import 'dotenv/config';
import Book from '../src/models/Book.js';
import Category from '../src/models/Category.js';
import { slugify } from '../src/utils/slugify.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hieusach';

async function fixSlugs() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);

  console.log('\n=== Fixing Category Slugs ===');
  const categories = await Category.find().lean();
  for (const cat of categories) {
    const newSlug = slugify(cat.name || 'category');
    if (cat.slug !== newSlug) {
      const oldSlug = cat.slug;
      await Category.findByIdAndUpdate(cat._id, { slug: newSlug });
      console.log(`  [UPDATED] "${cat.name}" | ${oldSlug} → ${newSlug}`);
    } else {
      console.log(`  [OK]     "${cat.name}" | ${cat.slug}`);
    }
  }

  console.log('\n=== Fixing Book Slugs ===');
  const books = await Book.find().lean();
  for (const book of books) {
    const newSlug = slugify(book.title || 'book');
    if (book.slug !== newSlug) {
      const oldSlug = book.slug;
      await Book.findByIdAndUpdate(book._id, { slug: newSlug });
      console.log(`  [UPDATED] "${book.title}" | ${oldSlug} → ${newSlug}`);
    } else {
      console.log(`  [OK]     "${book.title}" | ${book.slug}`);
    }
  }

  console.log('\nDone.');
  await mongoose.disconnect();
}

fixSlugs().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
