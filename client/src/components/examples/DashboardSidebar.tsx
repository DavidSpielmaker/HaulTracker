import { SidebarProvider } from '@/components/ui/sidebar'
import DashboardSidebar from '../DashboardSidebar'

export default function DashboardSidebarExample() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <DashboardSidebar />
        <div className="flex-1 p-8 bg-background">
          <h2 className="text-2xl font-semibold">Main Content Area</h2>
          <p className="text-muted-foreground mt-2">This is where the dashboard content would appear</p>
        </div>
      </div>
    </SidebarProvider>
  )
}
