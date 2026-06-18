import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

interface HubShellProps {
  children: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
}

export default function HubShell({ children, title, icon }: HubShellProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
      <Sidebar />
      <div className="lg:pl-64">
        <Header title={title} icon={icon} />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
