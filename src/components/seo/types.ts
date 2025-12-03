// JSON-LD Schema Types for SEO Components
export interface HoursAvailable {
  '@type': 'OpeningHoursSpecification'
  dayOfWeek: string[]
  opens: string
  closes: string
}

export interface ContactPoint {
  '@type': 'ContactPoint'
  email?: string
  telephone?: string
  contactType?: string
  availableLanguage?: string[]
  hoursAvailable?: HoursAvailable[]
}

export interface AddressSchema {
  '@type': 'PostalAddress'
  streetAddress?: string
  addressLocality?: string
  addressRegion?: string
  postalCode?: string
  addressCountry?: string
}

export interface OrganizationSchema {
  '@type': 'Organization'
  name: string
  url: string
  logo?: string
  description?: string
  sameAs?: string[]
  contactPoint?: ContactPoint[]
  foundingDate?: string
  address?: AddressSchema
}

export interface SearchAction {
  '@type': 'SearchAction'
  target: string
  'query-input': string
}

export interface WebSiteSchema {
  '@type': 'WebSite'
  name: string
  url: string
  inLanguage?: string
  potentialAction?: SearchAction
  description?: string
  publisher?: OrganizationSchema
}

export interface FAQItem {
  '@type': 'Question'
  name: string
  acceptedAnswer: {
    '@type': 'Answer'
    text: string
  }
}

export interface FAQPageSchema {
  '@type': 'FAQPage'
  mainEntity: FAQItem[]
  headline?: string
  description?: string
}

export interface BreadcrumbItem {
  '@type': 'ListItem'
  position: number
  name: string
  item: string
}

export interface BreadcrumbListSchema {
  '@type': 'BreadcrumbList'
  itemListElement: BreadcrumbItem[]
}

export interface ArticleSchema {
  '@type': 'Article' | 'BlogPosting' | 'NewsArticle'
  headline: string
  description: string
  image?: string[]
  datePublished: string
  dateModified?: string
  // eslint-disable-next-line no-use-before-define
  author: PersonSchema | OrganizationSchema
  publisher: OrganizationSchema
  mainEntityOfPage: {
    '@type': 'WebPage'
    '@id': string
  }
  articleSection?: string
  keywords?: string[]
  wordCount?: number
  timeRequired?: string
  breadcrumb?: BreadcrumbListSchema
}

export interface PersonSchema {
  '@type': 'Person'
  name: string
  url?: string
  image?: string
  sameAs?: string[]
  jobTitle?: string
  worksFor?: OrganizationSchema
}

export interface WebPageSchema {
  '@type': 'WebPage'
  name: string
  description: string
  url: string
  isPartOf?: {
    '@type': 'WebSite'
    '@id': string
  }
  primaryImageOfPage?: {
    '@type': 'ImageObject'
    url: string
  }
  datePublished?: string
  dateModified?: string
  breadcrumb?: BreadcrumbListSchema
  mainEntity?: ArticleSchema
}

export interface CollectionPageSchema
  extends Omit<WebPageSchema, '@type' | 'mainEntity'> {
  '@type': 'CollectionPage'
  mainEntity?: {
    '@type': 'ItemList'
    name: string
    description?: string
    numberOfItems: number
    itemListElement: WebPageSchema[]
  }
}

export interface OfferSchema {
  '@type': 'Offer'
  price?: string
  priceCurrency?: string
  availability?: string
  priceValidUntil?: string
  url?: string
}

export interface AggregateRatingSchema {
  '@type': 'AggregateRating'
  ratingValue: number
  reviewCount: number
  bestRating?: number
  worstRating?: number
}

export interface ReviewSchema {
  '@type': 'Review'
  author: PersonSchema
  reviewRating: {
    '@type': 'Rating'
    ratingValue: number
    bestRating: number
    worstRating: number
  }
  reviewBody?: string
  datePublished?: string
}

export interface ProductSchema {
  '@type': 'Product' | 'SoftwareApplication'
  name: string
  description: string
  image?: string
  offers?: OfferSchema
  applicationCategory?: string
  operatingSystem?: string
  softwareVersion?: string
  aggregateRating?: AggregateRatingSchema
  review?: ReviewSchema[]
}

export interface VideoSchema {
  '@type': 'VideoObject'
  name: string
  description: string
  thumbnailUrl: string
  uploadDate: string
  duration?: string
  contentUrl?: string
  embedUrl?: string
  interactionStatistic?: {
    '@type': 'InteractionCounter'
    interactionType: string
    userInteractionCount: number
  }
}

export interface EventSchema {
  '@type': 'Event'
  name: string
  startDate: string
  endDate?: string
  description: string
  image?: string
  location?: {
    '@type': 'Place'
    name: string
    address?: AddressSchema
  }
  organizer?: OrganizationSchema
  performer?: PersonSchema[]
  eventAttendanceMode?: string
  eventStatus?: string
}

// @ts-expect-error - Expected error
export interface LocalBusinessSchema extends OrganizationSchema {
  '@type': 'LocalBusiness'
  priceRange?: string
  openingHours?: string
  paymentAccepted?: string[]
  currenciesAccepted?: string
}

export interface RecipeInstruction {
  '@type': 'HowToStep'
  text: string
  image?: string
  name?: string
}

export interface NutritionSchema {
  '@type': 'NutritionInformation'
  calories?: string
  carbohydrateContent?: string
  cholesterolContent?: string
  fatContent?: string
  fiberContent?: string
  proteinContent?: string
  saturatedFatContent?: string
  sodiumContent?: string
  sugarContent?: string
  transFatContent?: string
  unsaturatedFatContent?: string
}

export interface RecipeSchema {
  '@type': 'Recipe'
  name: string
  image?: string
  description: string
  recipeIngredient: string[]
  recipeInstructions: RecipeInstruction[]
  cookTime?: string
  prepTime?: string
  totalTime?: string
  recipeYield?: string
  recipeCategory?: string
  recipeCuisine?: string
  nutrition?: NutritionSchema
  aggregateRating?: AggregateRatingSchema
  review?: ReviewSchema[]
  author: PersonSchema
  datePublished: string
}

// Component Props Types
export interface BaseJsonLdProps {
  id?: string
}

export interface OrganizationJsonLdProps extends BaseJsonLdProps {
  organization: OrganizationSchema
}

export interface WebSiteJsonLdProps extends BaseJsonLdProps {
  website: WebSiteSchema
}

export interface FAQPageJsonLdProps extends BaseJsonLdProps {
  faqPage: FAQPageSchema
}

export interface ArticleJsonLdProps extends BaseJsonLdProps {
  article: ArticleSchema
}

export interface WebPageJsonLdProps extends BaseJsonLdProps {
  webpage: WebPageSchema
}

export interface CollectionPageJsonLdProps extends BaseJsonLdProps {
  collectionPage: CollectionPageSchema
}

export interface ProductJsonLdProps extends BaseJsonLdProps {
  product: ProductSchema
}

export interface VideoJsonLdProps extends BaseJsonLdProps {
  video: VideoSchema
}

export interface EventJsonLdProps extends BaseJsonLdProps {
  event: EventSchema
}

export interface LocalBusinessJsonLdProps extends BaseJsonLdProps {
  localBusiness: LocalBusinessSchema
}

export interface RecipeJsonLdProps extends BaseJsonLdProps {
  recipe: RecipeSchema
}
