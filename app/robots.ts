import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/settings', '/onboarding', '/home'],
      },
    ],
    sitemap: 'https://www.beehive-books.app/sitemap.xml',
  };
}
