import { Documents } from "@/settings/documents"

export type Paths =
  | {
      title: string
      href: string
      noLink?: true
      heading?: string
      items?: Paths[],
    }
  | {
      spacer: true
    }

export const Routes: Paths[] = [...Documents]

interface Page {
  title: string
  href: string,
  breadCrumb: string[]
}

function isRoute(
  node: Paths
): node is Extract<Paths, { title: string; href: string }> {
  return "title" in node && "href" in node
}

function getAllLinks(node: Paths & {breadCrumb?: string[]}): Page[] {
  const pages: Page[] = []

  const { breadCrumb = []} = node

  if (isRoute(node) && !node.noLink) {
    pages.push({ title: node.title, href: node.href, breadCrumb: [...breadCrumb , node.title] })
  }

  if (isRoute(node) && node.items) {
    
    node.items.forEach((subNode) => {
      if (isRoute(subNode)) {
        const temp = { 
          ...subNode, href: `${node.href}${subNode.href}` ,

          breadCrumb: [...breadCrumb , node.title]
        
        
        }
        pages.push(...getAllLinks(temp))
      }
    })
  }

  return pages
}

export const PageRoutes = Routes.map((it) => getAllLinks(it)).flat()
