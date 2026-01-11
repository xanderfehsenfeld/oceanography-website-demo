import {
  branding,
  companyname,
  description,
  feedbackedit,
  gtm,
  gtmconnected,
  imagealt,
  keywords,
  loadfromgithub,
  rightsidebar,
  siteicon,
  sitename,
  tableofcontent,
  totopscroll,
  url,
  urlimage,
} from "@/settings/main"

import { OpenGraph } from "@/types/opengraph"

interface AppSettings {
  name: string
  link: string
  branding: boolean
  gtm: string
  gtmconnected: boolean
  rightbar: boolean
  toc: boolean
  feedback: boolean
  totop: boolean
  gitload: boolean
  title: string
  metadataBase: string
  description: string
  siteicon: string
  keywords: string[]
  openGraph: OpenGraph
  canonical: string
}

export const Settings: AppSettings = {
  name: companyname,
  link: "",
  branding,
  gtm,
  gtmconnected,
  rightbar: rightsidebar,
  toc: tableofcontent,
  feedback: feedbackedit,
  totop: totopscroll,
  gitload: loadfromgithub,

  title: sitename,
  metadataBase: url,
  description,
  siteicon,
  keywords,
  openGraph: {
    type: "website",
    title: sitename,
    description,
    siteName: sitename,
    images: [
      {
        url: urlimage,
        width: 1200,
        height: 630,
        alt: imagealt,
      },
    ],
  },

  canonical: url,
}
