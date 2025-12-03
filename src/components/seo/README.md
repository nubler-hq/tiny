# SEO Components

Type-safe, reusable JSON-LD schema components for Next.js applications.

## Overview

This SEO components library provides structured data markup for better search engine optimization and rich snippets. All components are fully typed and follow Schema.org standards.

## Available Components

### Organization Schema

Used for company/organization information on homepage and about pages.

```tsx
import { OrganizationJsonLd, createOrganizationSchema } from "@/components/seo";

const organizationData = createOrganizationSchema({
  name: "My Company",
  url: "https://example.com",
  logo: "https://example.com/logo.png",
  email: "contact@example.com",
  sameAs: ["https://twitter.com/company", "https://linkedin.com/company"],
});

<OrganizationJsonLd organization={organizationData} />;
```

### WebSite Schema

Used for website information and search functionality.

```tsx
import { WebSiteJsonLd, createWebSiteSchema } from "@/components/seo";

const websiteData = createWebSiteSchema({
  name: "My Website",
  url: "https://example.com",
  searchUrl: "https://example.com/search?q=",
});

<WebSiteJsonLd website={websiteData} />;
```

### FAQ Page Schema

Used for pages with frequently asked questions.

```tsx
import { FAQPageJsonLd, createFAQPageSchema } from "@/components/seo";

const faqs = [
  { question: "How do I get started?", answer: "Simply sign up..." },
  { question: "What are the pricing?", answer: "We offer..." },
];

const faqData = createFAQPageSchema({
  faqs,
  headline: "Frequently Asked Questions",
  description: "Answers to common questions about our service",
});

<FAQPageJsonLd faqPage={faqData} />;
```

### Article Schema

Used for blog posts, news articles, and help articles.

```tsx
import { ArticleJsonLd, createArticleSchema } from "@/components/seo";

const articleData = createArticleSchema({
  headline: "How to Use Our Platform",
  description: "A comprehensive guide...",
  datePublished: "2024-01-01",
  author: { name: "John Doe" },
  publisher: { name: "My Company", url: "https://example.com" },
  url: "https://example.com/article",
  keywords: ["tutorial", "guide"],
});

<ArticleJsonLd article={articleData} />;
```

### WebPage Schema

Used for general web pages and landing pages.

```tsx
import { WebPageJsonLd, createWebPageSchema } from "@/components/seo";

const pageData = createWebPageSchema({
  name: "About Us",
  description: "Learn more about our company",
  url: "https://example.com/about",
  siteUrl: "https://example.com",
});

<WebPageJsonLd webpage={pageData} />;
```

### CollectionPage Schema

Used for category pages and article listings.

```tsx
import {
  CollectionPageJsonLd,
  createCollectionPageSchema,
} from "@/components/seo";

const collectionData = createCollectionPageSchema({
  name: "Getting Started",
  description: "Articles to help you get started",
  url: "https://example.com/help/getting-started",
  siteUrl: "https://example.com",
  items: [
    {
      name: "First Steps",
      description: "Your first steps guide",
      url: "https://example.com/help/getting-started/first-steps",
    },
  ],
});

<CollectionPageJsonLd collectionPage={collectionData} />;
```

## Usage Patterns

### Homepage SEO

```tsx
export default function HomePage() {
  return (
    <div>
      {/* Multiple schema types for comprehensive coverage */}
      <OrganizationJsonLd organization={orgData} />
      <WebSiteJsonLd website={websiteData} />
      <FAQPageJsonLd faqPage={faqData} />

      {/* Page content */}
      <HeroSection />
      <Features />
      <Pricing />
      <FAQSection />
    </div>
  );
}
```

### Article/Blog Post SEO

```tsx
export default function ArticlePage({ post }) {
  const articleData = createArticleSchema({
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: { name: post.author.name },
    publisher: { name: "My Company", url: "https://example.com" },
    url: `https://example.com/blog/${post.slug}`,
    keywords: post.tags,
  });

  return (
    <article>
      <ArticleJsonLd article={articleData} />
      <ArticleHeader post={post} />
      <ArticleContent content={post.content} />
    </article>
  );
}
```

### Category Page SEO

```tsx
export default function CategoryPage({ category, articles }) {
  const collectionData = createCollectionPageSchema({
    name: category.name,
    description: category.description,
    url: `https://example.com/help/${category.slug}`,
    siteUrl: "https://example.com",
    items: articles.map((article) => ({
      name: article.title,
      description: article.excerpt,
      url: `https://example.com/help/${category.slug}/${article.slug}`,
      datePublished: article.publishedAt,
    })),
  });

  return (
    <div>
      <CollectionPageJsonLd collectionPage={collectionData} />
      <CategoryHeader category={category} />
      <ArticleList articles={articles} />
    </div>
  );
}
```

## Best Practices

1. **Use appropriate schemas**: Choose the most specific schema type for your content
2. **Provide complete data**: Fill in as many relevant fields as possible
3. **Use helper functions**: Leverage the helper functions for consistent data structure
4. **Test with tools**: Use Google's Rich Results Test to validate your structured data
5. **Keep updated**: Update schema data when content changes
6. **Multiple schemas**: You can use multiple schemas on the same page for comprehensive coverage

## Validation

Test your structured data using:

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)
- Browser developer tools (check for console errors)

## Type Safety

All components are fully typed with TypeScript. The helper functions ensure consistent data structure and catch errors at compile time rather than runtime.
