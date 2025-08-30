import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar sticky */}
      <div className="sticky top-0 h-screen">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col">
        {/* Topbar sticky */}
        <div className="sticky top-0 z-50">
          <Topbar />
        </div>
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
