"use client";

// For App Router, we use next/head in client components
// This component should be used in client components only
import Head from "next/head";

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

export function MetaTags({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  twitterCard = "summary_large_image",
  canonicalUrl,
  noindex = false,
  nofollow = false,
}: MetaTagsProps) {
  const siteName = "Le Juelle Hair";
  const defaultTitle = `${siteName} - Crochet Braiding Hair Extensions & Wig Shop`;
  const defaultDescription = "Shop premium wigs, braids, and hair care products in Ghana";
  const defaultImage = "/logo.png";

  const finalTitle = title || defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalOgTitle = ogTitle || finalTitle;
  const finalOgDescription = ogDescription || finalDescription;
  const finalOgImage = ogImage || defaultImage;
  const finalCanonical = canonicalUrl || (typeof window !== "undefined" ? window.location.href : "");

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(", ")} />
      )}

      {/* Robots */}
      {noindex && <meta name="robots" content="noindex" />}
      {nofollow && <meta name="robots" content="nofollow" />}
      {!noindex && !nofollow && <meta name="robots" content="index, follow" />}

      {/* Canonical */}
      {finalCanonical && <link rel="canonical" href={finalCanonical} />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={finalOgTitle} />
      <meta property="og:description" content={finalOgDescription} />
      <meta property="og:image" content={finalOgImage} />
      <meta property="og:url" content={finalCanonical} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={finalOgTitle} />
      <meta name="twitter:description" content={finalOgDescription} />
      <meta name="twitter:image" content={finalOgImage} />
    </Head>
  );
}
