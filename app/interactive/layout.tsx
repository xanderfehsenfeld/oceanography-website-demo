import { Settings } from "@/types/settings"
import { Sidebar } from "@/components/sidebar"
import { BackToTop } from "@/components/toc/backtotop"
import ClientSideFeedback from "@/components/toc/client-side-feedback"

interface ILayoutProps {
  params: Promise<{ slug: string[] }>
}

export default async function InteractiveLayout({
  children,
  params,
}: Readonly<
  ILayoutProps & {
    children: React.ReactNode
  }
>) {
  const p = await params

  return (
    <div className="flex items-start gap-10 pt-5">
      <Sidebar />
      <div className="flex-1 md:flex-6">
        <div className="flex items-start gap-10">{children} </div>
      </div>

      <aside
        className="toc sticky top-16 hidden h-screen min-w-[230px] flex-1 gap-3 xl:flex xl:flex-col"
        aria-label="Table of contents"
      >
        {Settings.feedback && <ClientSideFeedback />}
        {Settings.totop && <BackToTop />}
      </aside>
    </div>
  )
}
