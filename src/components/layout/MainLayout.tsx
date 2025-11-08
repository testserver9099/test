import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useEffect } from "react";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function MainLayout({ children, title = "ArcadeCalc", description = "Calculate your Google Cloud Skills Boost Arcade points" }: MainLayoutProps) {
  // Update document metadata (similar to Next.js metadata)
  useEffect(() => {
    document.title = title;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }
  }, [title, description]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased">
      <Header />
      <main className="flex-1 bg-background text-foreground">{children}</main>
      <Footer />
    </div>
  );
}
