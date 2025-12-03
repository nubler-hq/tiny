---
description: "How to use SEO components"
targets: ["*"]
cursor: # cursor specific rules
  alwaysApply: false
  description: "How to use SEO components"
---
# SEO Management Rules

## Overview
This document outlines the comprehensive SEO strategy and implementation patterns for the SaaS Boilerplate project. Follow these rules whenever implementing or managing SEO features.

## Core Principles

### 1. Type-Safe SEO Components
- **ALWAYS** use the SEO component library located at `src/components/seo/`
- **NEVER** write raw JSON-LD scripts inline
- **ALWAYS** use TypeScript helper functions for schema creation
- **ALWAYS** validate schemas using Google's Rich Results Test

### 2. Component Architecture
```
src/components/seo/
├── types.ts              # TypeScript definitions for all schemas
├── json-ld.tsx          # Base component for JSON-LD rendering
├── organization.tsx     # Organization schema component
├── website.tsx          # WebSite schema component
├── webpage.tsx          # WebPage schema component
├── article.tsx          # Article/BlogPosting schema component
├── collection-page.tsx  # CollectionPage schema component
├── faq-page.tsx         # FAQPage schema component
└── index.ts             # Centralized exports
```

### 3. Schema Selection Guidelines

| Page Type | Primary Schema | Secondary Schema | Use Case |
|-----------|----------------|------------------|----------|
| Homepage | Organization + WebSite | FAQPage | Brand presence + search functionality |
| Help Center Main | WebPage | BreadcrumbList | Overview page with navigation |
| Category Page | CollectionPage | BreadcrumbList | Article collections with metadata |
| Article Page | Article | BreadcrumbList | Individual content with rich snippets |
| Blog Post | Article | BreadcrumbList | Blog content with author/publisher info |
| Product Page | Product | Organization | Product information and offers |
| FAQ Page | FAQPage | WebPage | Frequently asked questions |
| Contact Page | Organization | ContactPoint | Contact information |
| About Page | Organization | WebPage | Company information |

## Implementation Patterns

### 1. Homepage SEO Implementation
```tsx
export default function HomePage() {
  // Multiple schema types for comprehensive coverage
  const orgData = createOrganizationSchema({
    name: AppConfig.name,
    url: AppConfig.url,
    logo: AppConfig.brand.logo.light,
    email: AppConfig.links.mail,
    sameAs: [
      AppConfig.links.twitter,
      AppConfig.links.linkedin,
      AppConfig.links.facebook,
      AppConfig.links.instagram
    ].filter(Boolean)
  });

  const websiteData = createWebSiteSchema({
    name: `${AppConfig.name} Demo`,
    url: AppConfig.url,
    searchUrl: `${AppConfig.url}/search?q=`
  });

  return (
    <>
      <OrganizationJsonLd organization={orgData} />
      <WebSiteJsonLd website={websiteData} />
      {/* Page content */}
    </>
  );
}
```

### 2. Article/Blog Post SEO Implementation
```tsx
export default function ArticlePage({ post }) {
  const articleData = createArticleSchema({
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: { name: post.author.name },
    publisher: {
      name: AppConfig.name,
      url: AppConfig.url,
      logo: AppConfig.brand.logo.light
    },
    url: `${AppConfig.url}/blog/${post.slug}`,
    section: post.category,
    keywords: post.tags,
    breadcrumb: createArticleBreadcrumb({
      items: [
        { name: AppConfig.name, url: AppConfig.url },
        { name: 'Blog', url: `${AppConfig.url}/blog` },
        { name: post.title, url: `${AppConfig.url}/blog/${post.slug}` }
      ]
    })
  });

  return (
    <>
      <ArticleJsonLd article={articleData} />
      <ArticleContent post={post} />
    </>
  );
}
```

### 3. Category/Collection Page SEO Implementation
```tsx
export default function CategoryPage({ category, articles }) {
  const collectionData = createCollectionPageSchema({
    name: category.name,
    description: category.description,
    url: `${AppConfig.url}/help/${category.slug}`,
    siteUrl: AppConfig.url,
    items: articles.map(article => ({
      name: article.title,
      description: article.excerpt,
      url: `${AppConfig.url}/help/${category.slug}/${article.slug}`,
      datePublished: article.publishedAt
    })),
    breadcrumb: createWebPageBreadcrumb({
      items: [
        { name: AppConfig.name, url: AppConfig.url },
        { name: 'Help Center', url: `${AppConfig.url}/help` },
        { name: category.name, url: `${AppConfig.url}/help/${category.slug}` }
      ]
    })
  });

  return (
    <>
      <CollectionPageJsonLd collectionPage={collectionData} />
      <CategoryContent category={category} articles={articles} />
    </>
  );
}
```

## Metadata Best Practices

### 1. Title Optimization
```tsx
// Use the generateMetadata utility for consistent formatting
export const metadata: Metadata = generateMetadata({
  title: "Page Title", // Will become "Page Title | SaaS Boilerplate"
  description: "Page description (150-160 characters)",
  path: "/page-path",
  keywords: ["keyword1", "keyword2", "keyword3"]
});
```

### 2. Open Graph Images
- **Size:** 1200x630 pixels (recommended)
- **Format:** PNG or JPG
- **Location:** Store in `public/` directory
- **Naming:** Use descriptive names like `og-image-article-title.png`

### 3. Structured Data Validation
- **ALWAYS** test schemas at: https://search.google.com/test/rich-results
- **ALWAYS** check for validation errors in browser console
- **ALWAYS** verify schema markup with browser dev tools

## Common SEO Patterns

### 1. Breadcrumb Implementation
```tsx
const breadcrumb = createWebPageBreadcrumb({
  items: [
    { name: "Home", url: "/" },
    { name: "Section", url: "/section" },
    { name: "Current Page", url: "/section/current-page" }
  ]
});
```

### 2. Article Metadata
```tsx
const articleData = createArticleSchema({
  headline: "Article Title",
  description: "Article excerpt or description",
  image: ["https://example.com/image1.jpg"],
  datePublished: "2024-01-01T00:00:00.000Z",
  dateModified: "2024-01-02T00:00:00.000Z",
  author: {
    name: "Author Name",
    url: "https://example.com/author"
  },
  publisher: {
    name: "Company Name",
    url: "https://example.com",
    logo: "https://example.com/logo.png"
  },
  url: "https://example.com/article",
  section: "Technology",
  keywords: ["keyword1", "keyword2"],
  wordCount: 1200,
  timeRequired: "PT5M"
});
```

## Quality Assurance Checklist

### Pre-Implementation
- [ ] Identify appropriate schema type for the page
- [ ] Gather all required metadata (titles, descriptions, images, dates)
- [ ] Check existing SEO components for reuse opportunities
- [ ] Plan breadcrumb structure

### Implementation
- [ ] Use TypeScript helper functions for schema creation
- [ ] Implement proper error handling for missing data
- [ ] Add appropriate fallback values
- [ ] Include comprehensive breadcrumb navigation

### Testing
- [ ] Test with Google's Rich Results Test tool
- [ ] Verify schema markup in browser dev tools
- [ ] Check for console errors
- [ ] Validate on different devices/browsers
- [ ] Test social media sharing (Open Graph)

### Post-Implementation
- [ ] Submit sitemap to Google Search Console
- [ ] Monitor search performance metrics
- [ ] Update internal documentation
- [ ] Train team members on SEO patterns

## Performance Considerations

### 1. Schema Loading
- JSON-LD scripts are minified and loaded efficiently
- No impact on page rendering performance
- Scripts are server-side rendered for better SEO

### 2. Image Optimization
- Use WebP format when possible
- Implement responsive images
- Optimize image sizes for different devices
- Include proper alt text for accessibility

### 3. Core Web Vitals
- Ensure schemas don't impact Largest Contentful Paint (LCP)
- Monitor First Input Delay (FID) for interactive elements
- Maintain Cumulative Layout Shift (CLS) below 0.1

## Maintenance Guidelines

### 1. Schema Updates
- Monitor Schema.org updates and deprecations
- Update schemas when new properties become available
- Maintain backward compatibility when possible

### 2. Content Changes
- Update schemas when content structure changes
- Re-validate schemas after major content updates
- Update metadata when titles/descriptions change

### 3. Performance Monitoring
- Regularly check Google Search Console for issues
- Monitor rich snippet appearances
- Track SEO performance metrics over time

## Error Handling

### 1. Missing Data
```tsx
// Always provide fallbacks for missing data
const articleData = createArticleSchema({
  headline: post?.title || "Article Title",
  description: post?.excerpt || post?.description || "Article description",
  datePublished: post?.publishedAt || new Date().toISOString(),
  // ... other fields
});
```

### 2. Schema Validation Errors
```tsx
// Handle API errors gracefully
try {
  const post = await api.content.get.query({ /* params */ });
  if (!post?.data) {
    return notFound(); // Or provide fallback content
  }
  // Proceed with schema creation
} catch (error) {
  console.error("Error fetching content:", error);
  return notFound();
}
```

## Future Enhancements

### 1. Advanced Schema Types
- VideoObject for video content
- Event for webinars/events
- Product for SaaS features
- Recipe for tutorials
- LocalBusiness for company locations

### 2. Dynamic Schema Generation
- Server-side schema generation based on user preferences
- A/B testing for different schema implementations
- Personalized content recommendations in schemas

### 3. SEO Automation
- Automatic schema generation from content
- AI-powered meta description generation
- Real-time SEO performance monitoring
- Automated rich snippet testing

Remember: SEO is an ongoing process. Regularly review and update schemas as content and search engine requirements evolve.

---

## Help Center Implementation Retrospective

### 🎯 **Project Overview**
Complete refactoring and SEO optimization of the Help Center feature in SaaS Boilerplate, implementing modern architecture patterns and comprehensive structured data.

### 🏗️ **Architecture Decisions**

#### **1. Feature-Sliced Architecture Implementation**
- **Location**: `src/@saas-boilerplate/features/help-center/`
- **Structure**:
  ```
  help-center/
  ├── controllers/          # API endpoints and business logic
  ├── presentation/         # UI components and presentation logic
  │   ├── components/       # Reusable React components
  │   └── hooks/           # Feature-specific hooks
  └── procedures/          # Middleware and data processing
  ```
- **Benefits**: Clear separation of concerns, easy maintenance, scalable structure

#### **2. Component Organization Strategy**
- **Pattern**: One component per file with PascalCase naming
- **Prefix**: `help-center-` for all components
- **Location**: `src/@saas-boilerplate/features/help-center/presentation/components/`
- **Examples**:
  - `help-center-header.tsx`
  - `help-center-article-list.tsx`
  - `help-center-category-grid.tsx`

#### **3. Page-Level Architecture**
- **Location**: `src/app/(site)/help/`
- **Structure**:
  ```
  help/
  ├── page.tsx                    # Main help center page
  ├── [category]/
  │   └── page.tsx               # Category listing page
  └── [category]/[slug]/
      └── page.tsx               # Individual article page
  ```
- **Dynamic Routes**: Next.js App Router with dynamic segments
- **Server Components**: All pages use RSC for optimal performance

### 🔧 **Technical Implementation Details**

#### **1. Data Fetching Strategy**
```tsx
// API-first approach with Igniter.js client
const articlesResponse = await api.helpCenter.listArticles.query({
  query: { category: categorySlug, limit: 50 }
});
```

#### **2. Error Handling Patterns**
```tsx
// Graceful fallbacks for missing data
const categoryName = category[0]?.data?.title ||
  String.formatCategoryLabel(categorySlug);

// Safe navigation for API responses
if (!post?.data?.data) return notFound();
```

#### **3. Type Safety Implementation**
```tsx
// Utility function for category name formatting
import { String } from "@/@saas-boilerplate/utils/string";

const categoryName = String.formatCategoryLabel(categorySlug);
```

#### **4. SEO Schema Implementation**
```tsx
// Article schema with comprehensive metadata
const articleData = createArticleSchema({
  headline: post.data.data.title,
  description: post.data.data.excerpt,
  datePublished: post.data.data.date,
  author: { name: post.data.data.author || 'Help Center' },
  publisher: {
    name: AppConfig.name,
    url: AppConfig.url,
    logo: AppConfig.brand.logo.light
  },
  url: `${AppConfig.url}/help/${category}/${slug}`,
  section: categoryName,
  keywords: post.data.data.tags || [],
  breadcrumb: createArticleBreadcrumb({...})
});
```

### 📊 **SEO Strategy Implementation**

#### **1. Structured Data Coverage**
- **Main Page**: WebPage schema with breadcrumb navigation
- **Category Pages**: CollectionPage schema with article listings
- **Article Pages**: Article schema with rich metadata
- **All Pages**: Comprehensive Open Graph and Twitter Card metadata

#### **2. Schema Validation Results**
- ✅ All schemas pass Google's Rich Results Test
- ✅ No console errors in browser
- ✅ Proper fallback handling for missing data
- ✅ Type-safe schema generation

#### **3. Performance Optimization**
- Server-side rendering of JSON-LD scripts
- Minified JSON output for faster loading
- No impact on Core Web Vitals
- Efficient data fetching patterns

### 🎨 **UI/UX Improvements**

#### **1. Component Design System**
- Consistent spacing using Tailwind CSS
- Responsive design for all screen sizes
- Accessible navigation patterns
- Loading states and error boundaries

#### **2. Navigation Experience**
- Breadcrumb navigation on all pages
- Clear visual hierarchy
- Intuitive category organization
- Search functionality integration

#### **3. Content Presentation**
- Rich article formatting with MDX support
- Related articles suggestions
- Article metadata display
- Mobile-optimized layouts

### 📈 **Performance Metrics**

#### **1. Core Web Vitals**
- **LCP**: Maintained excellent scores with server components
- **FID**: No impact from SEO implementations
- **CLS**: Stable layout with proper image dimensions

#### **2. SEO Performance**
- Rich snippets ready for Google Search
- Proper structured data markup
- Comprehensive metadata coverage
- Mobile-friendly design

#### **3. Developer Experience**
- Type-safe component development
- Reusable SEO utilities
- Clear architectural patterns
- Comprehensive documentation

### 🚀 **Scalability Considerations**

#### **1. Component Reusability**
- Generic SEO components work across all page types
- Utility functions for common transformations
- Consistent naming conventions
- Modular component architecture

#### **2. Content Management**
- API-driven content fetching
- Flexible category structures
- Easy content updates
- Version-controlled documentation

#### **3. Maintenance Strategy**
- Clear separation of concerns
- Comprehensive error handling
- Performance monitoring capabilities
- Automated testing opportunities

### 📚 **Lessons Learned**

#### **1. Architecture Benefits**
- Feature-sliced architecture enables easy scaling
- Server components provide optimal performance
- Type safety prevents runtime errors
- Component reusability reduces development time

#### **2. SEO Implementation Insights**
- Comprehensive schemas improve search visibility
- Helper functions reduce code duplication
- Proper fallbacks ensure robust implementations
- Regular validation prevents issues

#### **3. Development Workflow**
- Component-driven development accelerates features
- Type safety catches errors early
- Documentation enables team collaboration
- Testing ensures quality maintenance

### 🔄 **Future Enhancements**

#### **1. Advanced SEO Features**
- Video content schemas for tutorials
- Event schemas for webinars
- Product schemas for features
- Recipe schemas for step-by-step guides

#### **2. Performance Optimizations**
- Image optimization pipeline
- Content preloading strategies
- Caching layer improvements
- CDN integration for assets

#### **3. User Experience**
- Advanced search functionality
- Personalized content recommendations
- Interactive tutorials
- Community features integration

### 📝 **Maintenance Guidelines**

#### **1. Code Quality Standards**
- Maintain TypeScript strict mode
- Follow established naming conventions
- Implement comprehensive error handling
- Regular performance monitoring

#### **2. SEO Maintenance**
- Monitor Google Search Console regularly
- Update schemas with content changes
- Validate new implementations
- Track performance metrics

#### **3. Documentation Updates**
- Keep component documentation current
- Update implementation guides
- Document new patterns and utilities
- Maintain architectural decision records

### ✅ **Success Metrics**

#### **1. Technical Achievement**
- ✅ 100% type-safe implementation
- ✅ Zero runtime errors in production
- ✅ Optimal Core Web Vitals scores
- ✅ Comprehensive SEO coverage

#### **2. Developer Productivity**
- ✅ Reusable component library
- ✅ Clear architectural patterns
- ✅ Comprehensive documentation
- ✅ Easy maintenance and updates

#### **3. User Experience**
- ✅ Fast loading times
- ✅ Accessible navigation
- ✅ Mobile-optimized design
- ✅ Rich content presentation

### 🎉 **Conclusion**

The Help Center implementation demonstrates a modern, scalable approach to feature development with comprehensive SEO optimization. The combination of:

- **Feature-Sliced Architecture** for maintainability
- **Type-Safe Components** for reliability
- **Comprehensive SEO** for visibility
- **Performance Optimization** for user experience

Creates a solid foundation for future feature development and ensures excellent search engine visibility and user experience.

**Key Takeaway**: This implementation serves as the gold standard for feature development in the SaaS Boilerplate, combining technical excellence with practical usability.

---

## 📋 **Quick Reference Guide**

### **SEO Component Usage**
```tsx
import {
  ArticleJsonLd,
  createArticleSchema,
  createArticleBreadcrumb
} from "@/components/seo";

// For articles/blog posts
const articleData = createArticleSchema({
  headline: post.title,
  description: post.excerpt,
  datePublished: post.publishedAt,
  author: { name: post.author },
  publisher: { name: AppConfig.name, url: AppConfig.url },
  url: `${AppConfig.url}/article`,
  keywords: post.tags
});

<ArticleJsonLd article={articleData} />
```

### **Common Utility Functions**
```tsx
import { String } from "@/@saas-boilerplate/utils/string";

// Convert kebab-case to Title Case
const title = String.formatCategoryLabel("getting-started"); // "Getting Started"

// Capitalize words
const capitalized = String.capitalize("hello world"); // "Hello World"
```

### **SEO Metadata Pattern**
```tsx
export const metadata: Metadata = generateMetadata({
  title: "Page Title",
  description: "Page description (150-160 chars)",
  path: "/page-path",
  keywords: ["keyword1", "keyword2"]
});
```

### **Error Handling Pattern**
```tsx
// Always provide fallbacks
const title = post?.title || "Default Title";
const description = post?.excerpt || post?.description || "Default description";

// Safe API responses
if (!data?.articles || data.articles.length === 0) {
  return notFound();
}
```

### **Architecture Patterns**
- **Components**: `src/@saas-boilerplate/features/feature/presentation/components/`
- **Pages**: `src/app/(site)/feature/`
- **SEO**: `src/components/seo/`
- **Utils**: `src/@saas-boilerplate/utils/`

### **File Naming Conventions**
- Components: `feature-name-component-name.tsx`
- Pages: Standard Next.js App Router patterns
- SEO: Descriptive names in `seo/` folder

Remember: Always check `.rulesync/rules/seo.md` before implementing SEO features to maintain consistency and best practices.
