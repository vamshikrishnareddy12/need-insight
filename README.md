# Find My Tool

Build a Full-Stack Web App: Service & Tool Discovery Platform

Build a complete, functional web application for discovering and comparing services, apps, websites, SaaS products, and online platforms.

The core idea is:

Users describe what they need, search for a type of service/tool, and discover relevant companies or platforms that provide it.

Examples:

Search "grocery delivery" → Blinkit, Zepto, BigBasket, Amazon Fresh, Swiggy Instamart

Search "website builder" → Wix, Webflow, Framer, Squarespace, WordPress

Search "learn Python" → Coursera, Udemy, DataCamp, freeCodeCamp, etc.

Search "AI image generator" → relevant AI image-generation platforms

Search "email marketing" → Mailchimp, Brevo, HubSpot, etc.

Search "cloud hosting" → AWS, Azure, Google Cloud, DigitalOcean, etc.

This is NOT simply a company directory.

The product should eventually help users answer:

"Which service/tool is best for what I need?"

For the first MVP, focus on excellent discovery, search, filtering, service profiles, and comparison. Keep the UI clean and simple. Do NOT over-design the application.

1. PRODUCT NAME

Use a temporary working name:

ServiceFinder

Make the application name easy to change later.

Do not create an elaborate brand identity yet.

2. PRIMARY GOAL

The application should allow a user to:

Search for something they need.

Discover services/platforms that provide it.

Browse results.

Filter results.

Sort results.

Open a service's detailed profile.

Compare multiple services.

Visit the official service website.

Save/favorite services if logged in.

Eventually receive intelligent recommendations based on requirements.

The MVP should have the architecture necessary to add AI-powered natural-language recommendations later, but DO NOT make AI the core dependency of the first version.

3. TARGET USERS

Primary users:

Students

Developers

Professionals

Freelancers

Startup founders

Small businesses

General internet users

A user should not need technical knowledge to use the platform.

4. IMPORTANT PRODUCT PRINCIPLE

The application should focus on:

Need → Discovery → Comparison → Decision

NOT:

Directory → Thousands of random listings

The interface should make finding the right service fast.

5. MAIN PAGES

Create these pages:

A. Home Page

Purpose: Help users immediately search for what they need.

Include:

Simple header/navigation

Logo/name: ServiceFinder

Navigation:

Explore

Categories

Compare

Saved

Main search bar

Search placeholder:

"What service or tool are you looking for?"

Examples below search:

"Website builder"

"Grocery delivery"

"Learn Python"

"AI writing tool"

"Email marketing"

Include a simple heading:

Find the right service for what you need.

Supporting text:

Discover, compare, and choose from services, apps, platforms, and tools.

Include a "Popular Categories" section.

Example categories:

AI Tools

Education

Delivery

Website Builders

Developer Tools

Marketing

Finance

Travel

Business

Design

Productivity

Hosting

Include a "Popular Searches" section.

Include a "Trending / Popular Services" section.

Keep the homepage relatively simple.

6. SEARCH SYSTEM

Search is the most important feature.

Implement functional search.

The search should search across:

Service name

Description

Category

Subcategory

Tags

Features

Use cases

Examples:

Searching:

"website"

should return relevant website builders.

Searching:

"learn python"

should return learning platforms related to Python.

Searching:

"grocery delivery"

should return grocery delivery services.

Searching:

"AI writing"

should return AI writing tools.

Support partial and case-insensitive matching.

Prioritize exact name/category matches where appropriate.

Show a useful empty state when nothing is found.

Example:

No services found

Try searching for:

website builder

AI tools

online learning

delivery

7. SEARCH RESULTS PAGE

Create a dedicated search/explore page.

URL structure should be clean and scalable, for example:

/search?q=website+builder

or an equivalent Next.js routing structure.

Layout:

Top

Search bar with current query.

Example:

Search results for "website builder"

Show result count.

Left side / top on mobile

Filters.

Filters should include:

Category

Subcategory

Pricing model

Free plan

Platform

Availability

Service type

Pricing:

Free

Freemium

Paid

Free trial

Contact for pricing

Platform:

Web

Android

iOS

Windows

macOS

API

Results

Each result should be a service card.

Service card should show:

Logo/avatar

Service name

Short description

Category

Pricing type

Key features

Rating if available

Country/availability if relevant

Compare checkbox/button

Save button

Buttons:

View details

Compare

Visit website

Do NOT use fake ratings or fake user reviews.

If rating/review data is not available, don't display fabricated values.

8. CATEGORIES PAGE

Create:

/categories

Display categories in a clean grid.

Initial categories:

AI Tools

Education & Learning

Delivery & Shopping

Website Builders

Developer Tools

Marketing

Business

Finance

Travel

Design

Productivity

Hosting & Cloud

Communication

Entertainment

Health & Wellness

Freelancing

Each category should have:

Name

Short description

Number of services

Link to category page

9. CATEGORY PAGE

Create dynamic category pages.

Example:

/category/website-builders

Show:

Category title

Description

Search within category

Filters

Sort options

Services

Sort options:

Relevance

Name

Recently added

Do not claim "best" unless the application actually has enough data to justify it.

10. SERVICE DETAIL PAGE

Create a detailed page for every service.

Example:

/service/framer

or equivalent slug-based route.

Service page should include:

Header

Logo

Service name

Short description

Category

Official website button

Save button

Add to compare button

Overview

Detailed description.

Key information

Category

Subcategory

Pricing

Free plan

Platforms

Availability

Founded/year if known

Service type

Features

List important features.

Best for

Examples:

Beginners

Developers

Small businesses

Students

Enterprises

Only show this information when available in the database.

Pros and Cons

Show structured pros/cons if available.

Do not invent claims.

Alternatives

Show related services from the same or related category.

Related services

Show other relevant platforms.

Visit official website

Use the stored official URL.

Open external websites in a new tab.

11. COMPARISON FEATURE

This is an important differentiating feature.

Users should be able to select services for comparison.

Example:

User searches:

"website builder"

Selects:

Wix

Framer

Webflow

Then clicks:

Compare

Create:

/compare

Show a comparison table.

Comparison fields:

Service

Description

Category

Pricing

Free plan

Free trial

Platform

Ease of use

Main features

Best for

API availability

Official website

Only show fields where reliable data exists.

Allow removing services from comparison.

Support comparing at least 2 and ideally up to 4 services.

Prevent users from comparing hundreds of services simultaneously.

12. SAVE / FAVORITE FEATURE

Allow users to save services.

For MVP:

Guest users can optionally save locally using localStorage.

Logged-in users can save permanently.

If authentication is straightforward with Supabase, implement it.

Users should have:

/saved

Show:

Your saved services

If nothing is saved:

You haven't saved any services yet.

Do not force users to create an account simply to browse.

13. AUTHENTICATION

Use Supabase authentication if available.

Support:

Email/password

Basic session management

Logout

Do not spend excessive effort on authentication UI.

Authentication is secondary to discovery.

14. DATABASE

Use Supabase/PostgreSQL if supported.

Create a scalable database structure.

At minimum:

services

Fields:

id

name

slug

description

long_description

logo_url

official_url

category_id

subcategory

pricing_type

price_description

has_free_plan

has_free_trial

platforms

availability

founded_year

features

best_for

pros

cons

tags

status

created_at

updated_at

Use appropriate PostgreSQL types.

Arrays/JSON can be used where appropriate, but keep the schema maintainable.

categories

Fields:

id

name

slug

description

icon

created_at

service_categories

If necessary, use a relational structure rather than duplicating category information.

users

Use Supabase authentication.

saved_services

Fields:

id

user_id

service_id

created_at

comparisons

Only create a persistent comparison table if genuinely useful. Otherwise manage comparison state on the client.

15. INITIAL DATABASE DATA

Populate the MVP with realistic sample services.

Do NOT populate thousands of fake services.

Start with approximately 50–100 real services across several categories.

Examples:

AI Tools:

ChatGPT

Claude

Gemini

Perplexity

Grammarly

Canva

Website Builders:

Wix

Webflow

Framer

Squarespace

WordPress

Education:

Coursera

Udemy

edX

freeCodeCamp

DataCamp

Delivery/Shopping:

Amazon

Blinkit

Zepto

BigBasket

Swiggy Instamart

Developer Tools:

GitHub

GitLab

Vercel

Netlify

Postman

Cloud:

AWS

Microsoft Azure

Google Cloud

DigitalOcean

Cloudflare

Marketing:

Mailchimp

HubSpot

Brevo

Semrush

Design:

Canva

Figma

Adobe Express

Productivity:

Notion

Trello

Asana

ClickUp

IMPORTANT:

Use factual information only.

Do not fabricate:

Prices

Ratings

Reviews

User counts

Revenue

Features

Availability

Company statistics

If exact information is unavailable, leave it blank or use a neutral value such as "Varies".

16. ADMIN / DATA MANAGEMENT

Create a basic admin mechanism if practical.

The long-term application will require adding and updating services.

The architecture should make it possible to:

Add service

Edit service

Delete/deactivate service

Add category

Edit category

Update service information

If a full admin dashboard would significantly reduce reliability of the MVP, prioritize a clean database structure and simple protected admin functionality instead.

Do not spend time building a beautiful admin UI.

17. RELATED SERVICES

Every service should have related services.

For example:

Framer:

Related:

Wix

Webflow

Squarespace

WordPress

The system should determine related services based on:

Same category

Subcategory

Tags

Shared features

Do not manually hardcode every relationship if it can be derived logically.

18. SEARCH RELEVANCE

Create a basic relevance ranking.

Priority:

Exact service name match

Category match

Subcategory match

Tag match

Feature match

Description match

Example:

Query:

"website builder"

A service categorized as Website Builder should rank higher than a generic design tool merely mentioning "website" in its description.

Keep the search implementation simple and reliable for MVP.

19. FUTURE AI SEARCH ARCHITECTURE

Do NOT require an AI API for the MVP unless it is already available and free.

However, structure the application so AI can be added later.

Future example:

User writes:

"I need a cheap website builder for a restaurant. I don't know coding and I want AI features."

Future system should extract:

intent:
website creation

requirements:
- restaurant
- beginner
- no-code
- affordable
- AI features


Then rank services accordingly.

For now, the normal search system should work without AI.

Add a clearly separated service/function where an AI recommendation layer can later be integrated.

20. RESPONSIVE DESIGN

The main focus is a web application.

It must work properly on:

Desktop

Laptop

Tablet

Mobile browser

However, optimize primarily for desktop because this is a web-first discovery platform.

Use responsive layouts rather than creating a separate mobile application.

21. DESIGN REQUIREMENTS

IMPORTANT:

Do NOT create an "AI slop" design.

Avoid:

Excessive gradients

Huge glowing text

Random floating blobs

Excessive glassmorphism

Neon colors

Excessive rounded cards

Unnecessary animations

Giant hero sections

Overly decorative backgrounds

Fake futuristic AI aesthetics

The design should look like a real modern SaaS/product website.

Use:

Clean typography

White/light neutral background

Good spacing

Clear hierarchy

Subtle borders

Simple cards

Consistent buttons

Simple icons

Professional navigation

Good information density

Use a restrained color system.

Do not spend significant effort on branding.

The design will be improved later.

22. UI COMPONENTS

Create reusable components:

Navbar

SearchBar

ServiceCard

ServiceGrid

CategoryCard

FilterPanel

SortDropdown

CompareButton

SaveButton

ComparisonTable

ServiceLogo

EmptyState

LoadingState

ErrorState

Pagination if required

Footer

Avoid duplicating UI code between pages.

23. ACCESSIBILITY

Implement basic accessibility:

Semantic HTML

Proper button labels

Keyboard navigation

Visible focus states

Form labels

Alt text for images

Reasonable color contrast

24. PERFORMANCE

Keep the MVP fast.

Lazy-load images where appropriate.

Optimize database queries.

Avoid unnecessary API calls.

Do not load huge datasets into the browser.

Use pagination or reasonable limits.

Debounce search input where appropriate.

Keep JavaScript bundle size reasonable.

25. ERROR HANDLING

Implement proper states for:

Loading

Empty results

Database errors

Invalid service URL

Missing service

Authentication failure

Failed save

Failed comparison

Do not leave users with blank screens.

26. SECURITY

Implement basic security best practices.

Never expose private database credentials.

Use environment variables for secrets.

Use Supabase Row Level Security where appropriate.

Users should only be able to modify their own saved data.

Protect admin functionality.

Validate user inputs.

Sanitize/validate URLs and forms.

27. SEO

Because this is a discovery/search website, SEO is important.

Implement basic SEO structure:

Proper page titles

Meta descriptions

Semantic headings

Clean URLs

Dynamic metadata for service pages

Category-specific metadata

Example:

Service page:

"Framer — Website Builder | ServiceFinder"

Category:

"Best Website Builders — Compare Website Building Platforms | ServiceFinder"

Do not make unsupported "best" claims if the page does not actually establish rankings.

28. FOOTER

Include:

About

Categories

Explore

Submit a service

Contact

Privacy

Terms

These can initially point to simple placeholder pages where necessary.

29. SUBMIT A SERVICE

Create a basic:

/submit

page where companies/users can submit a service.

Fields:

Service name

Website URL

Category

Description

Contact email

Additional information

For MVP, submissions can enter a pending state rather than automatically appearing publicly.

Do not automatically publish user submissions.

30. URL STRUCTURE

Use clean routes.

Examples:

/

/search?q=...

/categories

/category/ai-tools

/category/website-builders

/service/chatgpt

/service/framer

/compare

/saved

/submit

/login

/signup

/about

/contact

31. NAVIGATION

Desktop navbar:

ServiceFinder

Explore | Categories | Compare | Saved

Right side:

Login / Sign up

Mobile:

Use a simple responsive menu.

Do not overcrowd navigation.

32. HOME PAGE SEARCH BEHAVIOR

The search bar must actually work.

When the user submits a search:

Read query.

Search database.

Navigate to search results.

Display matching services.

Preserve the query.

Allow filters.

Allow comparison.

Do not create a fake search animation that doesn't actually search the database.

33. DATA QUALITY

This is extremely important.

The application is fundamentally a structured service database.

Do not use generic filler text such as:

"An amazing platform for all your needs."

Descriptions should be specific and factual.

Each service should have useful structured information.

If information is unavailable:

Use:

"Information not available"

or omit the field.

Never invent facts.

34. NO FAKE SOCIAL PROOF

Do NOT create:

Fake testimonials

Fake customer reviews

Fake star ratings

Fake user counts

Fake "10,000+ users"

Fake company statistics

The MVP should prioritize credibility.

35. FUTURE FEATURES TO KEEP ARCHITECTURE READY FOR

Do not necessarily implement these now, but don't build the system in a way that prevents them later:

AI recommendations

Natural language requirements → recommended services.

Advanced comparison

Side-by-side feature comparison.

User reviews

Verified reviews.

Community recommendations

Users can recommend services.

Personalized discovery

Recommendations based on saved services/search history.

Service verification

Verified business/service badges.

Price tracking

Track pricing changes.

Country-specific availability

Example:

India → available services

USA → different services.

Affiliate links

Track outbound clicks.

Analytics

Searches, popular categories, outbound clicks.

Monetization

Sponsored listings clearly labeled.

36. ANALYTICS-READY STRUCTURE

If practical, create basic tracking architecture for:

Search queries

Service page views

External website clicks

Saves

Comparisons

Do not collect unnecessary personal information.

Anonymous analytics are sufficient for MVP.

37. IMPORTANT MVP PRIORITIES

If there is a conflict between features, prioritize in this exact order:

Working search

Service database

Search results

Filtering

Service detail pages

Comparison

Categories

Responsive design

Save/favorites

Authentication

Submit service

Admin

Advanced features

Do NOT sacrifice core functionality for visual design.

38. TECH STACK

Prefer:

Frontend:

React

Next.js if supported

TypeScript

Tailwind CSS

Backend/database:

Supabase

PostgreSQL

Authentication:

Supabase Auth

Use a clean component-based architecture.

If Lovable's recommended stack differs slightly, use the closest production-quality equivalent while preserving the architecture.

39. CODE QUALITY

Write maintainable code.

Use:

TypeScript

Reusable components

Clear naming

Modular files

Separation between UI and data logic

Environment variables

Reusable database queries/functions

Avoid putting the entire application in a few huge files.

Avoid unnecessary dependencies.

40. FINAL MVP EXPECTATION

At the end of this build, I should have a working web application where I can:

Open the homepage.

Search for a service/tool.

See real matching results from the database.

Filter results.

Sort results.

Open a service.

See structured service information.

Visit its official website.

Add services to comparison.

Compare 2–4 services.

Save services.

Browse categories.

Submit a new service.

Use the application on desktop and mobile.

The application should be functional end-to-end, not merely a visual prototype.

MOST IMPORTANT INSTRUCTION

Do not over-engineer the first version.

Build a clean, reliable MVP with a strong foundation.

The most important product feature is:

A user should be able to type what they need and quickly discover relevant services/tools.

Do not prioritize flashy UI over this.

Do not add unnecessary AI features just to make the application appear "AI-powered."

Do not fabricate data.

Do not create fake reviews or statistics.

Make the application feel like a real early-stage startup product that can be expanded later.

After completing the implementation, verify that the major flows actually work:

Search → Results → Filters → Service → Compare

and

Categories → Service → Save → Saved

and

Submit Service → Pending submission

Fix any broken functionality before considering the MVP complete.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0e71e5f6-d309-49bd-99bc-56115fc12caa).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
