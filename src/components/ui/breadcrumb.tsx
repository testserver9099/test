import type * as React from "react";
import { IconChevronRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface BreadcrumbSegment {
  name: string;
  href: string;
  current?: boolean;
}

interface BreadcrumbProps extends React.HTMLAttributes<HTMLDivElement> {
  segments: BreadcrumbSegment[];
  separator?: React.ReactNode;
  className?: string;
}

export function Breadcrumb({
  segments,
  separator = <IconChevronRight className="h-4 w-4 text-muted-foreground" />,
  className,
  ...props
}: BreadcrumbProps) {
  return (
    <nav
      className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)}
      aria-label="Breadcrumb"
      {...props}
    >
      <ol className="flex items-center space-x-1">
        {segments.map((segment, index) => (
          <li key={segment.href} className="flex items-center">
            {index > 0 && <span className="mx-1">{separator}</span>}
            {segment.current ? (
              <span className="font-medium text-foreground" aria-current="page">
                {segment.name}
              </span>
            ) : (
              <Link
                to={segment.href}
                className="transition-colors hover:text-foreground"
              >
                {segment.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
