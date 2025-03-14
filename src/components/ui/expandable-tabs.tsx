
"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOnClickOutside } from "usehooks-ts";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

// Define the Tab interface
interface Tab {
  title: string;
  icon: LucideIcon;
  path?: string;
  type?: undefined;
}

// Define the Separator interface
interface Separator {
  type: "separator";
  title?: undefined;
  icon?: undefined;
  path?: undefined;
}

// Union type for tabs array items
type TabItem = Tab | Separator;

interface ExpandableTabsProps {
  tabs: TabItem[];
  className?: string;
  activeColor?: string;
  onChange?: (index: number | null) => void;
}

const buttonVariants = {
  initial: {
    gap: 0,
    paddingLeft: ".5rem",
    paddingRight: ".5rem",
  },
  animate: (isSelected: boolean) => ({
    gap: isSelected ? ".5rem" : 0,
    paddingLeft: isSelected ? "1rem" : ".5rem",
    paddingRight: isSelected ? "1rem" : ".5rem",
  }),
};

const spanVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: "auto", opacity: 1 },
  exit: { width: 0, opacity: 0 },
};

const transition = { delay: 0.1, type: "spring", bounce: 0, duration: 0.6 };

export function ExpandableTabs({
  tabs,
  className,
  activeColor = "text-primary",
  onChange,
}: ExpandableTabsProps) {
  const location = useLocation();
  const pathname = location.pathname;
  
  // Find the selected tab index based on the current path
  const findSelectedTabIndex = () => {
    return tabs.findIndex(
      (tab) => {
        if (tab.type === "separator") return false;
        return tab.path && 
          (pathname === tab.path || 
           (tab.path !== "/" && pathname.startsWith(tab.path)));
      }
    );
  };
  
  const [selected, setSelected] = React.useState<number | null>(() => {
    const index = findSelectedTabIndex();
    return index !== -1 ? index : null;
  });
  
  const outsideClickRef = React.useRef(null);

  // Update selected tab when the pathname changes
  React.useEffect(() => {
    const index = findSelectedTabIndex();
    setSelected(index !== -1 ? index : null);
  }, [pathname]);

  useOnClickOutside(outsideClickRef, () => {
    // Don't clear selection on outside click for navigation tabs
    if (!tabs.some(tab => tab.type !== "separator" && tab.path)) {
      setSelected(null);
      onChange?.(null);
    }
  });

  const handleSelect = (index: number) => {
    setSelected(index);
    onChange?.(index);
  };

  const Separator = () => (
    <div className="mx-1 h-[24px] w-[1.2px] bg-border" aria-hidden="true" />
  );

  return (
    <div
      ref={outsideClickRef}
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-2xl border bg-background p-1 shadow-sm",
        className
      )}
    >
      {tabs.map((tab, index) => {
        if (tab.type === "separator") {
          return <Separator key={`separator-${index}`} />;
        }

        // Now TypeScript knows this is a Tab
        const tabItem = tab as Tab;
        const Icon = tabItem.icon;
        const isSelected = selected === index;
        
        // Determine if this tab should be considered active based on the URL path
        const isActive = tabItem.path && 
          (tabItem.path === pathname || 
           (tabItem.path !== "/" && pathname.startsWith(tabItem.path)));
        
        // Select UI classNames based on whether tab is active
        const tabClassName = cn(
          "relative flex items-center rounded-xl px-2 py-1 text-sm font-medium transition-colors duration-300 hover:scale-110",
          isSelected || isActive
            ? cn("bg-transparent", activeColor, "animate-pulse-slow")
            : "text-primary-foreground hover:text-secondary"
        );

        // If tab has a path, wrap with Link
        const TabContent = (
          <motion.div
            variants={buttonVariants}
            initial={false}
            animate="animate"
            custom={isSelected || isActive}
            transition={transition}
            className={tabClassName}
          >
            <div className="flex justify-center w-full">
              <Icon className={cn(
                "w-4 h-4 mb-0.5 transition-all",
                isSelected || isActive ? activeColor : "text-primary-foreground"
              )} />
            </div>
            <AnimatePresence initial={false}>
              {(isSelected || isActive) && (
                <motion.span
                  variants={spanVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                  className="overflow-hidden text-[10px] font-medium"
                >
                  {tabItem.title}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        );

        return tabItem.path ? (
          <Link 
            key={tabItem.title}
            to={tabItem.path} 
            className="flex justify-center"
            onClick={() => handleSelect(index)}
          >
            {TabContent}
          </Link>
        ) : (
          <button
            key={tabItem.title}
            onClick={() => handleSelect(index)}
            className="flex justify-center"
          >
            {TabContent}
          </button>
        );
      })}
    </div>
  );
}
