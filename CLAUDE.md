Swapable App

Hackathon Brief
The goal is to strengthen the fabric of Leeds’ business ecosystem by building stronger connections and communication channels. Design a tool, application or service that helps local suppliers, service providers, and customers find and connect more easily for mutual benefit. Whether it’s a matchmaking engine for B2B partnerships or a shared marketplace for community needs, the aim will be to further stimulate the local business economy.

Top Level Description
A mobile-first web app that enables individuals from businesses local to Leeds to easily swap skills, equipment, materials, products and services, with minimal effort. 

Schema
Use Drizzle-orm but assume the migrations have already been run to interact with a Postgresql database. 

Auth will be handled by Clerk, any fields named user_id are referencing the user_id from Clerk.

Use auto increment ids for primary keys, assume all properties are non-nullable unless otherwise specified

User preferences, a table for storing metadata:
user_id primary key, location: string, onboarding_complete: datetime

User_tags, a table for storing user interests and offers many to many, users to tags:
User_id, is_offer: boolean, tag_id

Items, a table for storing services/products that people can make offers for, the initial price is the starting_price field:
Id, userId, active: bool, image_url: string, title: string, description: string, repeatable: bool

Item_tag:
Item_id, tag_id

Tags
Id, name

Offers, a table of pending offers for the listing:
Id, created_at: datetime

Offer history:
id, item_id, offered_item_id, expiry: Datetime, created_at: datetime, accepted_at: Nullable(datetime), rejected_at: Nullable(datetime)



User reviews:
ID, user_id, item_id, value uint, comment string

Design
Using ShadCN as your primary component library, TailwindCSS as your styling and Lucide icons.
Style: Premium, cutting-edge eco-tech brand that combines sustainable environmental values with sleek, modern sophistication and innovative technology aesthetics. 
Brand icon: refresh-ccw-dot Lucide icon with “swapable” in bold font (emerald-600 text for light mode and white for dark mode) 
Scheme:
/* Tech Eco Premium Color Palette - Tailwind CSS with Dark Mode */

.font-brand { font-family: 'Inter', system-ui, sans-serif; }

/* PRIMARY COLORS */
.bg-primary { @apply bg-emerald-600 dark:bg-emerald-500; }
.text-primary { @apply text-emerald-600 dark:text-emerald-400; }
.border-primary { @apply border-emerald-600 dark:border-emerald-500; }

/* BACKGROUNDS */
.bg-surface { @apply bg-white dark:bg-gray-900; }
.bg-surface-secondary { @apply bg-gray-50 dark:bg-gray-800; }
.bg-surface-tertiary { @apply bg-gray-100 dark:bg-gray-700; }

/* TEXT */
.text-primary-content { @apply text-gray-900 dark:text-white; }
.text-secondary-content { @apply text-gray-600 dark:text-gray-300; }
.text-muted-content { @apply text-gray-500 dark:text-gray-400; }



Features
Below is a list of all the screen that should be in the app

Landing Page 
Swapable logo 
Underneath the logo, a small marketing tagline that says “Swap skills or products, share expertise, and grow together.”
Two buttons: 
I need 
Clicking this takes you to the public listings page
I have 
Clicking this takes you to the sign up screen


Public listings page
At the top of the screen, there is a dropdown containing all the categories. Selecting one of these filters all the items shown to just those with the selected category
If you click on a listing, you can then make an offer, this is a screen where you select one of your items, or you can create a new item to offer, then this will be offered
On the receiving end of this, a user will receive an email saying someone made an offer, this is an offer record, then you can negotiate with the user using the offer_history table, and each time there is a counteroffer use the offer_history table.
Once an offer is accepted, a screen is shown to both parties that links them to the opposing persons linkedin profile

Sign-up screen  
Clerk will handle the sign in screen with its out of the box implementation.
After signing up, the user is taken to the profile set up screen
After signing in, the user is taken to the home screen

Profile set-up screen
This screen is for the user to set-up their profile and indicate what they’re looking for and what they could potentially offer (skills, equipment etc.). These should be a series of checkboxes from a predefined list of categories from the tags table, the screen should have: 
A multi select dropdown for “I’m interested in” 
Pre-defined drop down list - the user can pick multiple items from the list 
A multi select dropdown for “I can offer”
Pre-defined drop down list - the user can pick multiple items from the list 

If the user chooses “I need” on the landing page, they’re taken to a Browse Listings page
This screen is the same as the public listings page, but the default items shown are based on what tags has chosen in their profile
The page will be broken into 3 different sections:
“Recommended offers” 
This will be listings that match what you have stated you are interested in, with offers that have been created with the same category
Each recommended offer contains: 
Offer name 
Offer description 
Offer category 
If there are no recommendations, there’s a message stating “No listings at this time” 
“These people have also said they can offer what you’re interested in” 	
These are profiles of people who have stated that they can offer the categories that you’ve filtered on 
Profile name 
List of items that they can offer 
When the user clicks on an offer, they see what the offerer is looking for. The user can then propose what they will give the offerer
When they submit this form, the offerer gets an email notification

After clicking “I have”, show the create listing page
This should be a simple form that captures info about the thing they have to give (their offer)
Title
Description
Picture
Category
If the thing is one-off or repeatable (e.g. I can teach about things (repeatable) or I have 50 chairs to get rid of (one-off)

