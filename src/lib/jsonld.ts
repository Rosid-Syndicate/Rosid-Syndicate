import { CONTACT, SITE_DESCRIPTION, SITE_NAME, SITE_URL, SOCIAL_URLS } from '../config/site'

// Site-level structured data. Only facts already published on the site.

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo-emblem.png`,
    description: SITE_DESCRIPTION,
    email: CONTACT.email,
    telephone: CONTACT.phone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: CONTACT.addressLocality,
      addressCountry: CONTACT.addressCountry,
    },
    areaServed: { '@type': 'Country', name: 'Nepal' },
    ...(SOCIAL_URLS.length ? { sameAs: SOCIAL_URLS } : {}),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: CONTACT.email,
      telephone: CONTACT.phone,
      availableLanguage: ['en', 'ne'],
    },
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'en',
  }
}
