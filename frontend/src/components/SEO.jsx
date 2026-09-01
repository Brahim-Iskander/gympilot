import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://gymmpilot.netlify.app';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

/**
 * Reusable SEO component for per-page <title>, <meta description>,
 * <meta keywords>, Open Graph, Twitter Card, and canonical URL tags.
 *
 * Usage:
 *   <SEO
 *     title="Dashboard"
 *     description="View your workout stats..."
 *     keywords="workout tracker, fitness"
 *     path="/dashboard"
 *     noIndex={false}
 *   />
 */
export default function SEO({
  title,
  description = 'GymPilot is a free workout and strength tracking app. Log exercises, monitor progress, hit personal records, and stay consistent on your fitness journey.',
  keywords = 'workout tracker, gym tracker, strength training, progressive overload, gym workout log, fitness app, PR tracker, exercise log',
  path = '/',
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  noIndex = false,
  structuredData = null,
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
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
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

      {/* Dynamic JSON-LD Structured Data if provided */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
