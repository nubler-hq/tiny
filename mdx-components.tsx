import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { MDXComponents } from 'mdx/types'
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion'
import { Banner } from 'fumadocs-ui/components/banner'
import { Callout } from 'fumadocs-ui/components/callout'
import { Step, Steps } from 'fumadocs-ui/components/steps'
import * as TabsComponents from 'fumadocs-ui/components/tabs'
import { TypeTable } from 'fumadocs-ui/components/type-table'
import { File, Folder, Files } from 'fumadocs-ui/components/files'
import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock'

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Accordion,
    Accordions,
    Banner,
    Callout,
    Step,
    Steps,
    TypeTable,
    File,
    Folder,
    Files,
    pre: ({ ...props }) => (
      <CodeBlock {...props}>
        <Pre>{props.children}</Pre>
      </CodeBlock>
    ),
    ...TabsComponents,
    ...components,
  }
}
