import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X, Instagram } from "lucide-react";

const Gallery = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const displayCount = 6;

  // 👇 načítanie všetkých obrázkov + zoradenie podľa názvu
  const images = import.meta.glob("/src/assets/hairCuts/*.{jpg,jpeg,png,webp}", {
    eager: true,
    import: "default",
  });

  const allImages = Object.entries(images)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value as string);

  // 👇 iba prvých 6 do gridu
  const displayedImages = allImages.slice(0, displayCount);

  const handleImageClick = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <section id="gallery" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-metallic bg-clip-text text-transparent">Galéria</span>
          </h2>
          <div className="h-1 w-24 bg-gradient-metallic mx-auto mb-6" />
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Pohľad do nášho remesla a atmosféry</p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {displayedImages.map((src, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border hover:border-accent/50 transition-all duration-300 cursor-pointer shadow-deep hover:shadow-metallic"
              onClick={() => handleImageClick(index)}
            >
              <img
                src={src}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* 👇 bonus: overlay ak je viac obrázkov */}
              {index === displayCount - 1 && allImages.length > displayCount && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xl font-semibold">
                  +{allImages.length - displayCount}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Instagram CTA */}
        <div className="flex justify-center mt-12">
          <a
            href="https://www.instagram.com/gemerbarbier/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-3 px-8 py-4 border border-border/60 bg-card/30 text-muted-foreground uppercase tracking-[0.2em] text-xs font-semibold rounded-sm hover:text-foreground hover:border-accent/50 hover:bg-card/60 transition-all duration-300"
          >
            <Instagram className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />
            Zobraziť viac na Instagrame

            {/* Industrial corner rivets */}
            <span className="absolute -top-px -left-px w-1 h-1 bg-background" />
            <span className="absolute -top-px -right-px w-1 h-1 bg-background" />
            <span className="absolute -bottom-px -left-px w-1 h-1 bg-background" />
            <span className="absolute -bottom-px -right-px w-1 h-1 bg-background" />
          </a>
        </div>

        {/* Modal */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-7xl w-full p-0 bg-background/95 border-border">
            <div className="relative">
              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 z-10 bg-accent/90 hover:bg-accent text-accent-foreground rounded-full p-2"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Navigation */}
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-accent/90 hover:bg-accent text-accent-foreground rounded-full p-3"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-accent/90 hover:bg-accent text-accent-foreground rounded-full p-3"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Image */}
              <img src={allImages[currentIndex]} className="w-full h-auto max-h-[85vh] object-contain" />

              {/* Counter */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-6 text-center">
                <p className="text-muted-foreground text-sm">
                  {currentIndex + 1} / {allImages.length}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default Gallery;
