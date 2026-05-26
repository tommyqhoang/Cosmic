import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/account'],
      },
    ],
    sitemap: 'https://shinyms.com/sitemap.xml',
    host: 'https://shinyms.com',
  }
}
