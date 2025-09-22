# LinkedIn Scraper for No Stress Visa Jobs

A powerful web scraper that extracts jobs, events, people profiles, and articles from LinkedIn, conforming to the Prisma schema models.

## Features

- **Multi-Type Scraping**: Jobs, events, people profiles, articles/blogs
- **Multi-Country Support**: Scrapes from 100+ countries worldwide
- **Duplicate Prevention**: Avoids scraping the same data twice
- **Schema Conformance**: Maps data to your Prisma models (Job, Event, User, Blog)
- **Advanced UI**: Web-based configuration dashboard
- **Progress Tracking**: Real-time scraping progress monitoring
- **Pagination Handling**: Continues from last scraped page

## Prerequisites

- Node.js 16+
- PostgreSQL database
- LinkedIn account (for authentication)

## Installation

1. Install dependencies:
```bash
npm install puppeteer @prisma/client --legacy-peer-deps
```

2. Set up environment variables:
```bash
LINKEDIN_EMAIL=your-email@example.com
LINKEDIN_PASSWORD=your-password
SCRAPER_LOCATIONS=["United States","United Kingdom"]
SCRAPER_TYPES=["jobs","events","people","articles"]
SCRAPER_MAX_PAGES=100
SCRAPER_DELAY=2000
```

## Usage

### Web Dashboard

Access the scraper dashboard at `/dashboard/scraper` in your Next.js app.

1. Configure LinkedIn credentials
2. Select countries to scrape
3. Choose data types (jobs, events, people, articles)
4. Set scraping parameters
5. Start/stop the scraper
6. Monitor progress and statistics

### Command Line

Run the scraper directly:

```bash
node lib/scraper/linkedin-scraper.ts
```

## Data Mapping

### Jobs → Job Model
- `title` → `title`
- `company` → `company`
- `location` → `location`
- `description` → `description`
- `salary` → `salaryMin`, `salaryMax`
- Additional fields mapped as per schema

### Events → Event Model
- `title` → `title`
- `description` → `description`
- `date` → `startDate`
- `location` → `location`
- `isVirtual` → `isVirtual`

### People → User Model
- `name` → `firstName`, `lastName`
- `title` → `bio` (professional title)
- `location` → `currentLocation`
- `url` → `linkedinUrl`

### Articles → Blog Model
- `title` → `title`
- `content` → `content`
- `author` → `authorId` (creates/finds user)
- `tags` → `tags`

## Configuration Options

- **Locations**: Select from 100+ countries
- **Data Types**: Jobs, Events, People, Articles
- **Max Pages**: Limit pages per type/location (default: 100)
- **Delay**: Request delay in milliseconds (default: 2000)
- **Credentials**: LinkedIn login credentials

## API Endpoints

- `POST /api/scraper/start` - Start scraping
- `POST /api/scraper/stop` - Stop scraping
- `GET /api/scraper/progress` - Get progress

## Important Notes

⚠️ **Legal Disclaimer**: Web scraping may violate LinkedIn's Terms of Service. Use responsibly and at your own risk. Consider official LinkedIn APIs for production use.

⚠️ **Rate Limiting**: LinkedIn may block accounts with excessive scraping. Use reasonable delays and monitor your account.

⚠️ **Data Quality**: Scraped data may be incomplete or outdated. Always validate and clean data before use.

## Troubleshooting

- **Login Issues**: Ensure credentials are correct and 2FA is disabled
- **Blocking**: If blocked, wait 24+ hours or use different credentials
- **Performance**: Reduce max pages or increase delay for slower systems
- **Duplicates**: The scraper checks existing database records to prevent duplicates

## Development

To extend the scraper:

1. Add new data types in `scrapeTypes`
2. Implement scraping functions (e.g., `scrapeNews()`)
3. Map data to schema models
4. Update the UI configuration

## License

This project is for educational purposes. Check local laws regarding web scraping.