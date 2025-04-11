import React from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NavigationIconsProps {
  previousPath?: string;
  previousLabel?: string;
  className?: string;
}

export function NavigationIcons({ 
  previousPath, 
  previousLabel = "Go Back", 
  className = ""
}: NavigationIconsProps) {
  const [, navigate] = useLocation();
  const [isHomePage] = useRoute("/");
  
  const handleGoBack = () => {
    if (previousPath) {
      navigate(previousPath);
    } else {
      window.history.back();
    }
  };

  return (
    <div className={`flex gap-3 ${className}`}>
      <TooltipProvider>
        {!isHomePage && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleGoBack}
                size="sm"
                variant="secondary"
                className="shadow-sm border bg-secondary/30 hover:bg-secondary/50 flex items-center gap-1 pl-2 pr-3 py-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-xs font-medium">{previousLabel}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{previousLabel}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {!isHomePage && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => navigate("/")}
                size="sm"
                variant="secondary"
                className="shadow-sm border bg-secondary/30 hover:bg-secondary/50 flex items-center gap-1 px-3 py-2"
              >
                <Home className="h-4 w-4" />
                <span className="text-xs font-medium">Home</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Home</p>
            </TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  );
}