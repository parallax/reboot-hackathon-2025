import "dotenv/config";
import { db, pgClient } from "../src/db";
import { items, tags, itemTags } from "../src/db/schema";

const SAMPLE_ITEMS = [
  {
    title: "20 Office Chairs",
    description:
      "High-quality ergonomic office chairs, barely used. Perfect for startups or expanding teams. Black mesh backs with adjustable height.",
    imageUrl:
      "http://10.198.245.217:3000/_next/image?url=%2Freplace-this.jpg&w=3840&q=75",
    repeatable: false,
    category: "Furniture & Fixtures",
  },
  {
    title: "Marketing Consultancy Services",
    description:
      "Digital marketing strategy and execution. Social media campaigns, SEO optimization, and brand development. 10+ years experience.",
    imageUrl:
      "http://10.198.245.217:3000/_next/image?url=%2Freplace-this.jpg&w=3840&q=75",
    repeatable: true,
    category: "Marketing & Content",
  },
  {
    title: "Co-working Office Space",
    description:
      "Modern co-working space in Leeds city centre. Hot desks and meeting rooms available. High-speed internet, printing facilities included.",
    imageUrl:
      "http://10.198.245.217:3000/_next/image?url=%2Freplace-this.jpg&w=3840&q=75",
    repeatable: true,
    category: "Office & Co-Working Space",
  },
  {
    title: "Web Development Services",
    description:
      "Full-stack web development using React, Node.js, and modern frameworks. From MVPs to enterprise applications.",
    imageUrl:
      "http://10.198.245.217:3000/_next/image?url=%2Freplace-this.jpg&w=3840&q=75",
    repeatable: true,
    category: "Business & Tech Expertise",
  },
  {
    title: "Professional Photography Equipment",
    description:
      "Canon EOS R5 camera kit with lenses and lighting equipment. Perfect for events, portraits, and commercial photography.",
    imageUrl:
      "http://10.198.245.217:3000/_next/image?url=%2Freplace-this.jpg&w=3840&q=75",
    repeatable: false,
    category: "Specialist Equipment",
  },
  {
    title: "Business Mentoring & Coaching",
    description:
      "One-on-one business coaching for entrepreneurs and small business owners. Strategy, growth planning, and leadership development.",
    imageUrl:
      "http://10.198.245.217:3000/_next/image?url=%2Freplace-this.jpg&w=3840&q=75",
    repeatable: true,
    category: "Coaching & Mentoring",
  },
  {
    title: "Event Venue - Conference Room",
    description:
      "Professional conference room for up to 50 people. Projector, whiteboard, catering kitchen access. Perfect for workshops and meetings.",
    imageUrl:
      "http://10.198.245.217:3000/_next/image?url=%2Freplace-this.jpg&w=3840&q=75",
    repeatable: true,
    category: "Event & Meeting Venues",
  },
  {
    title: "Graphic Design Services",
    description:
      "Brand identity, logo design, marketing materials, and digital assets. Creative solutions for businesses of all sizes.",
    imageUrl:
      "http://10.198.245.217:3000/_next/image?url=%2Freplace-this.jpg&w=3840&q=75",
    repeatable: true,
    category: "Creative & Design Skills",
  },
  {
    title: "Industrial 3D Printer",
    description:
      "Professional grade 3D printer for prototyping and small-scale production. Includes materials and technical support.",
    imageUrl:
      "http://10.198.245.217:3000/_next/image?url=%2Freplace-this.jpg&w=3840&q=75",
    repeatable: false,
    category: "Specialist Equipment",
  },
  {
    title: "Legal Advisory Services",
    description:
      "Business law, contract review, and compliance advice. Experienced solicitor specializing in SME legal requirements.",
    imageUrl:
      "http://10.198.245.217:3000/_next/image?url=%2Freplace-this.jpg&w=3840&q=75",
    repeatable: true,
    category: "Finance & Legal Support",
  },
  {
    title: "Catering Services",
    description:
      "Professional catering for corporate events, meetings, and special occasions. Local, sustainable ingredients.",
    imageUrl:
      "http://10.198.245.217:3000/_next/image?url=%2Freplace-this.jpg&w=3840&q=75",
    repeatable: true,
    category: "Food & Drink",
  },
  {
    title: "Standing Desks - Set of 8",
    description:
      "Adjustable height standing desks, excellent condition. Electric motor, memory settings, cable management included.",
    imageUrl:
      "http://10.198.245.217:3000/_next/image?url=%2Freplace-this.jpg&w=3840&q=75",
    repeatable: false,
    category: "Furniture & Fixtures",
  },
  {
    title: "Social Media Management",
    description:
      "Complete social media management including content creation, scheduling, and community engagement across all platforms.",
    imageUrl:
      "http://10.198.245.217:3000/_next/image?url=%2Freplace-this.jpg&w=3840&q=75",
    repeatable: true,
    category: "Marketing & Content",
  },
  {
    title: "Van Hire Service",
    description:
      "Large transit van available for hire. Perfect for moving office equipment, deliveries, or events. Fully insured.",
    imageUrl:
      "http://10.198.245.217:3000/_next/image?url=%2Freplace-this.jpg&w=3840&q=75",
    repeatable: true,
    category: "Vehicles & Transport",
  },
  {
    title: "Accounting & Bookkeeping",
    description:
      "Professional accounting services for small businesses. VAT returns, payroll, financial planning, and tax advice.",
    imageUrl:
      "http://10.198.245.217:3000/_next/image?url=%2Freplace-this.jpg&w=3840&q=75",
    repeatable: true,
    category: "Finance & Legal Support",
  },
  {
    title: "Laptop Computers - Bulk Lot",
    description:
      "15 refurbished business laptops. Perfect for startups or training programs. Windows 11, SSD drives, 8GB RAM minimum.",
    imageUrl:
      "http://10.198.245.217:3000/_next/image?url=%2Freplace-this.jpg&w=3840&q=75",
    repeatable: false,
    category: "IT & Electronics",
  },
  {
    title: "Workshop Training Services",
    description:
      "Professional development workshops on leadership, communication, and team building. Customized for your organization.",
    imageUrl:
      "http://10.198.245.217:3000/_next/image?url=%2Freplace-this.jpg&w=3840&q=75",
    repeatable: true,
    category: "Learning & Training",
  },
  {
    title: "Office Cleaning Services",
    description:
      "Regular office cleaning service. Eco-friendly products, flexible scheduling, fully insured and bonded team.",
    imageUrl:
      "http://10.198.245.217:3000/_next/image?url=%2Freplace-this.jpg&w=3840&q=75",
    repeatable: true,
    category: "Other",
  },
  {
    title: "Printing & Packaging Materials",
    description:
      "Bulk lot of packaging materials, boxes, bubble wrap, and professional printing supplies. Great for e-commerce businesses.",
    imageUrl:
      "http://10.198.245.217:3000/_next/image?url=%2Freplace-this.jpg&w=3840&q=75",
    repeatable: false,
    category: "Stock & Materials",
  },
  {
    title: "Electrical Installation Services",
    description:
      "Qualified electrician offering commercial electrical work. Office fit-outs, lighting installation, and electrical maintenance.",
    imageUrl:
      "http://10.198.245.217:3000/_next/image?url=%2Freplace-this.jpg&w=3840&q=75",
    repeatable: true,
    category: "Hands-On Trades & Repairs",
  },
  {
    title: "Podcast Recording Studio",
    description:
      "Professional podcast recording studio with editing services. Soundproofed room, professional microphones, and mixing equipment.",
    imageUrl:
      "http://10.198.245.217:3000/_next/image?url=%2Freplace-this.jpg&w=3840&q=75",
    repeatable: true,
    category: "Media & Promotion Opportunities",
  },
  {
    title: "Garden Maintenance Tools",
    description:
      "Complete set of professional garden maintenance tools including mowers, trimmers, and hand tools. Perfect for landscaping.",
    imageUrl:
      "http://10.198.245.217:3000/_next/image?url=%2Freplace-this.jpg&w=3840&q=75",
    repeatable: false,
    category: "Gardening & Outdoor Gear",
  },
  {
    title: "IT Support Services",
    description:
      "On-site and remote IT support for small businesses. Network setup, troubleshooting, and cybersecurity consulting.",
    imageUrl:
      "http://10.198.245.217:3000/_next/image?url=%2Freplace-this.jpg&w=3840&q=75",
    repeatable: true,
    category: "Business & Tech Expertise",
  },
  {
    title: "Community Event Organization",
    description:
      "Volunteer coordination and community event planning services. Experienced in local business networking events and charity fundraisers.",
    imageUrl:
      "http://10.198.245.217:3000/_next/image?url=%2Freplace-this.jpg&w=3840&q=75",
    repeatable: true,
    category: "Community & Volunteering",
  },
  {
    title: "Professional Sound System",
    description:
      "Complete PA system with microphones, speakers, and mixing desk. Perfect for presentations, events, and conferences.",
    imageUrl:
      "http://10.198.245.217:3000/_next/image?url=%2Freplace-this.jpg&w=3840&q=75",
    repeatable: false,
    category: "Specialist Equipment",
  },
  {
    title: "Business Plan Writing Service",
    description:
      "Professional business plan development for startups and growing businesses. Financial projections, market analysis included.",
    imageUrl:
      "http://10.198.245.217:3000/_next/image?url=%2Freplace-this.jpg&w=3840&q=75",
    repeatable: true,
    category: "Business & Tech Expertise",
  },
  {
    title: "Hospitality Staff Services",
    description:
      "Trained hospitality staff for events and functions. Waiters, bartenders, and event coordinators available for hire.",
    imageUrl:
      "http://10.198.245.217:3000/_next/image?url=%2Freplace-this.jpg&w=3840&q=75",
    repeatable: true,
    category: "Events & Hospitality Services",
  },
  {
    title: "Office Furniture Set",
    description:
      "Complete office furniture set including desks, chairs, filing cabinets, and meeting table. Modern design, excellent condition.",
    imageUrl:
      "http://10.198.245.217:3000/_next/image?url=%2Freplace-this.jpg&w=3840&q=75",
    repeatable: false,
    category: "Furniture & Fixtures",
  },
  {
    title: "Video Production Services",
    description:
      "Professional video production for marketing, training, and promotional content. Filming, editing, and motion graphics included.",
    imageUrl:
      "http://10.198.245.217:3000/_next/image?url=%2Freplace-this.jpg&w=3840&q=75",
    repeatable: true,
    category: "Creative & Design Skills",
  },
  {
    title: "Warehouse Storage Space",
    description:
      "Secure warehouse storage space available for rent. Climate controlled, 24/7 access, loading dock facilities included.",
    imageUrl:
      "http://10.198.245.217:3000/_next/image?url=%2Freplace-this.jpg&w=3840&q=75",
    repeatable: true,
    category: "Office & Co-Working Space",
  },
];

// Sample user IDs (in a real scenario, these would be actual Clerk user IDs)
const SAMPLE_USER_IDS = [
  "user_1_sample",
  "user_2_sample",
  "user_3_sample",
  "user_4_sample",
  "user_5_sample",
];

async function main() {
  try {
    // Get all tags to map category names to tag IDs
    const allTags = await db.select().from(tags);
    const tagMap = new Map(allTags.map((tag) => [tag.name, tag.id]));

    console.log("Available tags:", Array.from(tagMap.keys()));

    const itemsToInsert = SAMPLE_ITEMS.map((item, index) => ({
      userId: SAMPLE_USER_IDS[index % SAMPLE_USER_IDS.length],
      active: true,
      imageUrl: item.imageUrl,
      title: item.title,
      description: item.description,
      repeatable: item.repeatable,
    }));

    // Insert items
    const insertedItems = await db
      .insert(items)
      .values(itemsToInsert)
      .returning();

    console.log(`Seeded ${insertedItems.length} items.`);

    // Link items to their categories
    const itemTagsToInsert = [];
    for (let i = 0; i < insertedItems.length; i++) {
      const item = insertedItems[i];
      const sampleItem = SAMPLE_ITEMS[i];
      const tagId = tagMap.get(sampleItem.category);

      if (tagId) {
        itemTagsToInsert.push({
          itemId: item.id,
          tagId: tagId,
        });
      } else {
        console.warn(`Tag not found for category: ${sampleItem.category}`);
      }
    }

    if (itemTagsToInsert.length > 0) {
      await db.insert(itemTags).values(itemTagsToInsert);
      console.log(`Linked ${itemTagsToInsert.length} items to categories.`);
    }

    console.table(
      insertedItems.map((item) => ({
        id: item.id,
        title: item.title,
        repeatable: item.repeatable,
        active: item.active,
      }))
    );
  } finally {
    await pgClient.end({ timeout: 5 }).catch((error) => {
      console.error("Failed to close database connection", error);
    });
  }
}

main().catch((error) => {
  console.error("Failed to seed items", error);
  process.exit(1);
});
