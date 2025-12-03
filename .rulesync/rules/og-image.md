---
description: "How generate dynamic OG Images"
targets: ["*"]
cursor: # cursor specific rules
  alwaysApply: false
  description: "How generate dynamic OG Images"
---
# How generate dynamic OG Images

This document provides comprehensive guidance on how to create dynamic Open Graph images using Next.js' built-in `ImageResponse` API. These dynamic images can be used for social media cards, product previews, and content sharing across platforms.

## Table of Contents

1. [Introduction](mdc:#introduction)
2. [Key Concepts](mdc:#key-concepts)
3. [Implementation Steps](mdc:#implementation-steps)
4. [Best Practices](mdc:#best-practices)
5. [Advanced Techniques](mdc:#advanced-techniques)
6. [Troubleshooting](mdc:#troubleshooting)
7. [Examples](mdc:#examples)

## Introduction

Dynamic OG (Open Graph) images enhance content sharing by generating customized, branded images on-the-fly. Next.js provides a powerful `ImageResponse` API that allows you to create these images programmatically using JSX and React components, without requiring external rendering services.

These images are particularly valuable for:
- Social media link previews
- Product cards with dynamic pricing
- News/blog article thumbnails
- Dynamic marketing assets
- User-specific content previews

## Key Concepts

### Next.js Route Handlers

OG images are implemented as special Next.js Route Handlers that generate images instead of standard HTML or JSON responses. They are placed in your application's routing structure and respond to HTTP GET requests.

### ImageResponse API

The `ImageResponse` class from the `next/og` package converts JSX elements into PNG images, allowing you to use React-like syntax to design your images while accessing dynamic data.

### Edge Runtime

OG image generation typically runs on the Edge Runtime for optimal performance and to handle high volumes of image generation requests efficiently.

## Implementation Steps

### 1. Create a Route Handler

Create a route handler file in your application's route structure. Common locations include:
- `app/api/og/route.tsx` - For general purpose OG images
- `app/(specific-area)/og/route.tsx` - For section-specific OG images
- `app/[dynamic-route]/opengraph-image.tsx` - For route-specific OG images

### 2. Import Required Dependencies

```typescript
import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
```

### 3. Define the GET Handler

```typescript
export const runtime = 'edge' // Optional: Use Edge Runtime for better performance

export async function GET(request: NextRequest) {
  try {
    // Extract parameters from request
    const searchParams = request.nextUrl.searchParams
    
    // Fetch any needed data
    
    // Generate and return the image
    return new ImageResponse(
      (
        <div style={{ /* Styles */ }}>
          {/* Image content */}
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error(error)
    return new Response('Failed to generate image', { status: 500 })
  }
}
```

### 4. Design Your Image with JSX

Use JSX to design your image, similar to how you would create a React component:

```jsx
<div style={{
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  backgroundColor: 'white',
  position: 'relative',
  fontFamily: '"Inter", sans-serif',
}}>
  {/* Background and content layers */}
</div>
```

### 5. Add Dynamic Content

Incorporate dynamic content from parameters or data sources:

```jsx
<h1 style={{ fontSize: '64px', fontWeight: 'bold' }}>
  {title}
</h1>
<p style={{ fontSize: '32px', color: '#666' }}>
  {description}
</p>
```

### 6. Configure Image Options

Set appropriate dimensions and other options for your image:

```typescript
return new ImageResponse(
  (/* JSX content */),
  {
    width: 1200, // Standard OG image width
    height: 630, // Standard OG image height
    // Optional additional configurations
    emoji: 'twemoji', // Enable Twemoji (Twitter emoji)
    fonts: [
      {
        name: 'Inter',
        data: interFontData,
        weight: 400,
        style: 'normal',
      },
    ],
  }
)
```

## Best Practices

### Performance Optimization

1. **Use Edge Runtime**: Always specify `export const runtime = 'edge'` for optimal performance.
2. **Minimize External Data Fetching**: Limit the number of external data calls to reduce generation time.
3. **Cache When Possible**: Implement caching strategies for images that don't change frequently.

### Design Guidelines

1. **Responsive Text**: Adjust font sizes based on content length to avoid overflow.
2. **Color Contrast**: Ensure sufficient contrast between text and background for readability.
3. **Branding Consistency**: Maintain consistent branding elements (logos, colors, typography).
4. **Overlay Gradients**: Use gradient overlays to improve text readability on image backgrounds.
5. **Safe Margins**: Keep important content away from edges (at least 100px).

### Layout Structure

1. **Explicit Display Properties**: Always set explicit `display` properties (like `flex` or `grid`) for elements with multiple children.
2. **Fixed Dimensions**: Use fixed dimensions rather than percentages for reliable layouts.
3. **Position Absolute**: Use absolute positioning for layering elements.

### Error Handling

1. **Graceful Fallbacks**: Provide fallback designs when expected data is missing.
2. **Comprehensive Try-Catch**: Wrap image generation in try-catch blocks to handle errors gracefully.
3. **Validate Inputs**: Validate all input parameters before processing.

## Advanced Techniques

### Custom Fonts

To use custom fonts:

```typescript
import { readFileSync } from 'fs'
import { join } from 'path'

// Load the font file
const interBold = readFileSync(join(process.cwd(), 'public/fonts/Inter-Bold.ttf'))

return new ImageResponse(
  (/* JSX content */),
  {
    // ...other options
    fonts: [
      {
        name: 'Inter',
        data: interBold,
        weight: 700,
        style: 'normal',
      },
    ],
  }
)
```

### Incorporating Images

To include external images:

```jsx
<img 
  src="https://your-domain.com/image.jpg" 
  alt="Description"
  style={{
    width: 200,
    height: 200,
    objectFit: 'cover',
  }}
/>
```

For local images, convert them to data URLs or host them on your CDN.

### SVG Icons and Graphics

Use inline SVG for vectors and icons:

```jsx
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" />
</svg>
```

### Conditional Rendering

Adapt your image based on parameters:

```jsx
{type === 'product' ? (
  <ProductTemplate data={productData} />
) : type === 'article' ? (
  <ArticleTemplate data={articleData} />
) : (
  <DefaultTemplate />
)}
```

## Troubleshooting

### Common Issues

1. **"JSX element implicitly has type 'any'"**: Add appropriate TypeScript interfaces for your component props.

2. **"Failed to generate image"**: Check for missing or invalid data in your JSX. The most common cause is using undefined values without fallbacks.

3. **"Expected <div> to have explicit display: flex or display: none"**: Always specify `display` property for elements with multiple children.

4. **Images not loading**: Make sure image URLs are absolute and publicly accessible.

5. **Font rendering issues**: Verify that font files are properly loaded and that the font name matches exactly.

### Debugging Strategies

1. **Step-by-Step Reduction**: Remove elements one by one to isolate which part is causing problems.

2. **Console Logging**: Log intermediate values before they're used in the JSX.

3. **Fallback Template**: Start with a minimal working template and add complexity gradually.

## Examples

### Basic Product Card

```tsx
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const productName = searchParams.get('name') || 'Product'
  const price = searchParams.get('price') || '$99.99'
  const imageUrl = searchParams.get('image') || 'https://default-image.jpg'
  
  return new ImageResponse(
    (
      <div style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        padding: '40px',
      }}>
        <div style={{
          display: 'flex',
          width: '50%',
          height: '100%',
          position: 'relative',
        }}>
          <img src={imageUrl} alt={productName} style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }} />
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          width: '50%',
          padding: '20px',
          justifyContent: 'center',
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            margin: '0 0 20px 0',
          }}>{productName}</h1>
          
          <span style={{
            fontSize: '36px',
            color: '#007bff',
          }}>{price}</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
```

### News Article Preview

```tsx
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const title = searchParams.get('title') || 'Breaking News'
  const subtitle = searchParams.get('subtitle') || ''
  const imageUrl = searchParams.get('image') || 'https://default-news-bg.jpg'
  
  return new ImageResponse(
    (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        position: 'relative',
      }}>
        <img 
          src={imageUrl} 
          alt="Article background"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(0deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.8) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '60px',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '70%',
          }}>
            <h1 style={{
              fontSize: '64px',
              fontWeight: 'bold',
              color: 'white',
              lineHeight: 1.2,
              margin: '0 0 16px 0',
            }}>{title}</h1>
            
            {subtitle && (
              <p style={{
                fontSize: '32px',
                color: 'rgba(255,255,255,0.9)',
                margin: 0,
              }}>{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
```

Remember that dynamic OG images enhance user engagement by providing visually appealing and informative previews of your content across social media platforms and messaging apps. They're an essential part of a modern content sharing strategy.

By following these guidelines, you can create effective, performant, and visually consistent dynamic images for your Next.js application. 
