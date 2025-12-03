import { InferPageType, loader } from 'fumadocs-core/source'
import { help } from '../../../../../.source'
import type { Item } from 'fumadocs-core/page-tree';
import { String } from '@/@saas-boilerplate/utils/string';

/**
 * @constant source
 * @description Loader for the Help Center contents
 */
export const source = loader({
  baseUrl: '/help',
  source: help.toFumadocsSource(),
})

export type Article = {
  name: string;
  url: string;
  description?: string;
};

export function listArticlesWithCategory(categorySlug?: string): Article[] {
  const categories = source.pageTree.children;

  if (categorySlug) {
    // Find the specific category
    const category = categories.find(cat => cat.type === 'folder' && cat.$id && String.toSlug(cat.$id) === categorySlug);
    if (!category || category.type !== 'folder') return [];
    
    // @ts-expect-error - Expected
    return category.children
      .filter((item): item is Item => item.type === 'page')
      .map(item => ({
        name: item.name,
        url: `/help/${categorySlug}/${item.url.slice('/help/'.length)}`,
        description: item.description,
      }));
  } else {
    // @ts-expect-error - Expected
    return categories
      .filter(cat => cat.type === 'folder')
      .flatMap(category => {
        const catSlug = String.toSlug(category.$id as string);
        return category.children
          .filter((item): item is Item => item.type === 'page')
          .map(item => ({
            name: item.name,
            url: `/help/${catSlug}/${item.url.slice('/help/'.length)}`,
            description: item.description,
          }));
      });
  }
}

export function listArticlesByCategory(categorySlug: string): Article[] {
  const categories = source.pageTree.children;
  // Find the specific category
  const category = categories.find(cat => cat.type === 'folder' && cat.$id && String.toSlug(cat.$id) === categorySlug);
  if (!category || category.type !== 'folder') return [];

  // @ts-expect-error - Expected
  return category.children
    .filter((item): item is Item => item.type === 'page')
    .map(item => ({
      name: item.name,
      url: `/help/${categorySlug}/${item.url.slice('/help/'.length)}`,
      description: item.description,
    }));
}

/**
 * @constant ContentTypeHelpCenterEntry
 * @description Type for the Help Center contents
 */
export type ContentTypeHelpCenterEntry = InferPageType<typeof source>
