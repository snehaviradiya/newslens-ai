// Verified Seed & Default News Sources with Active Public RSS Feeds

export interface DefaultNewsSource {
  name: string;
  websiteUrl: string;
  rssFeedUrl: string;
  description: string;
  country: string;
  category: string;
  isActive: boolean;
}

export const DEFAULT_NEWS_SOURCES: DefaultNewsSource[] = [
  {
    name: 'BBC News',
    websiteUrl: 'https://www.bbc.com/news',
    rssFeedUrl: 'http://feeds.bbci.co.uk/news/rss.xml',
    description: 'British public service broadcaster providing international and UK news coverage.',
    country: 'UK',
    category: 'General',
    isActive: true,
  },
  {
    name: 'The Guardian',
    websiteUrl: 'https://www.theguardian.com',
    rssFeedUrl: 'https://www.theguardian.com/world/rss',
    description: 'Independent global journalism covering world affairs, environment, and politics.',
    country: 'UK',
    category: 'Analysis',
    isActive: true,
  },
  {
    name: 'The New York Times',
    websiteUrl: 'https://www.nytimes.com',
    rssFeedUrl: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
    description: 'International reporting, deep policy investigations, and current affairs.',
    country: 'USA',
    category: 'General',
    isActive: true,
  },
  {
    name: 'NPR News',
    websiteUrl: 'https://www.npr.org',
    rssFeedUrl: 'https://feeds.npr.org/1001/rss.xml',
    description: 'National Public Radio independent reporting and in-depth cultural and economic coverage.',
    country: 'USA',
    category: 'Public Radio',
    isActive: true,
  },
];
