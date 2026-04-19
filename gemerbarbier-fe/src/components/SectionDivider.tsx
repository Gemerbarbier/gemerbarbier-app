import { Scissors } from "lucide-react";

const SectionDivider = () => {
  return (
    <div className="relative py-20">
      {/* Smooth gradient blend - extends the background seamlessly */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background to-background/0" />
      
      <div className="container mx-auto px-4 relative">
        <div className="flex items-center justify-center gap-4 opacity-40">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-accent/40 animate-pulse" />
            <Scissors className="w-4 h-4 text-accent/50" />
            <div className="h-1 w-1 rounded-full bg-accent/40 animate-pulse" />
          </div>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        </div>
      </div>
    </div>
  );
};

export default SectionDivider;
