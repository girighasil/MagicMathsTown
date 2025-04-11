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
    <div className={`flex gap-2 ${className}`}>
      <TooltipProvider>
        {!isHomePage && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleGoBack}
                size="icon"
                variant="ghost"
                className="h-9 w-9 rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">{previousLabel}</span>
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
                size="icon"
                variant="ghost"
                className="h-9 w-9 rounded-full"
              >
                <Home className="h-5 w-5" />
                <span className="sr-only">Home</span>
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