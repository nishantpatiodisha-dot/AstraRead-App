import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

interface HubShellProps {
  children: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
}

export default function HubShell({ children, title, icon }: HubShellProps) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] relative z-10">
      <Sidebar />
      <div className="lg:pl-64">
        <Header title={title} icon={icon} />
        <main className="p-3 lg:p-6 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
