import { useState } from "react";
import "./analysis-reporting.css";
import { Sidebar } from "./dashboard/sidebar";
import { Header } from "./dashboard/header";
import { OverviewSection } from "./dashboard/sections/overview";
import { PipelineSection } from "./dashboard/sections/pipeline";
import { DealsSection } from "./dashboard/sections/deals";
import { CustomersSection } from "./dashboard/sections/customers";
import { TeamSection } from "./dashboard/sections/team";
import { ForecastingSection } from "./dashboard/sections/forecasting";
import { ReportsSection } from "./dashboard/sections/reports";
import { SettingsSection } from "./dashboard/sections/settings";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return <OverviewSection />;
      case "pipeline":
        return <PipelineSection />;
      case "deals":
        return <DealsSection />;
      case "customers":
        return <CustomersSection />;
      case "team":
        return <TeamSection />;
      case "forecasting":
        return <ForecastingSection />;
      case "reports":
        return <ReportsSection />;
      case "settings":
        return <SettingsSection />;
      default:
        return <OverviewSection />;
    }
  };

  return (
    <div className="analysis-reporting min-h-screen bg-background overflow-hidden">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      <div
        className={`flex flex-col h-screen transition-all duration-300 ease-out ${sidebarCollapsed ? "ml-[72px]" : "ml-[260px]"
          }`}
      >
        <Header activeSection={activeSection} />
        <main className="flex-1 p-6 overflow-auto">
          <div
            key={activeSection}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}
