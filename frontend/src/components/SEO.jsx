import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://gymmpilot.netlify.app';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

/**
 * Reusable SEO component for per-page <title>, <meta description>,
 * Open Graph, Twitter Card, and canonical URL tags.
 *
 * Usage:
 *   <SEO
 *     title="Dashboard"
 *     description="View your workout stats..."
 *     path="/dashboard"
 *   />
 */
export default function SEO({
  title,
  description = 'GymPilot is a free workout and strength tracking app. Log exercises, monitor progress, hit personal records, and stay consistent on your fitness journey.',
  path = '/',
  ogImage = DEFAULT_OG_IMAGE,
  noIndex = false,
}) {
  const fullTitle = title
    ? `${title} | GymPilot`
    : 'GymPilot — Track Your Strength. Build Your Best Self.';
  const canonicalUrl = `${SITE_URL}${path}`;

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="GymPilot" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
