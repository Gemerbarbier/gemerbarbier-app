import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Review {
  name: string;
  rating: number;
  text: string;
  date: string;
  profilePhoto?: string;
}

const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(5.0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchGoogleReviews();
  }, []);

  const fetchGoogleReviews = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('google-reviews');
      
      if (error) {
        console.error('Error fetching Google reviews:', error);
        toast({
          title: "Chyba",
          description: "Nepodarilo sa načítať recenzie z Google.",
          variant: "destructive",
        });
        return;
      }

      if (data?.reviews && data.reviews.length > 0) {
        setReviews(data.reviews);
        setAverageRating(data.averageRating || 5.0);
        setTotalReviews(data.totalReviews || data.reviews.length);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa načítať recenzie.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="reviews" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Recenzie <span className="bg-gradient-metallic bg-clip-text text-transparent">Klientov</span>
          </h2>
          <div className="h-1 w-24 bg-gradient-metallic mx-auto mb-6" />
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Nepočúvajte len nás – počujte od našich spokojných klientov
          </p>
        </div>

        {/* Reviews Grid */}
        {isLoading ? (
          <div className="text-center text-muted-foreground">
            Načítavam recenzie...
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center text-muted-foreground">
            Žiadne recenzie sa nenašli.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {reviews.map((review, index) => (
            <Card
              key={index}
              className="p-8 bg-card border-border hover:border-accent/50 transition-all duration-300 hover:shadow-metallic animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-muted-foreground mb-6 leading-relaxed">
                "{review.text}"
              </p>

              {/* Author Info */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <p className="font-semibold text-foreground">{review.name}</p>
                  <p className="text-sm text-muted-foreground">Overený Klient</p>
                </div>
                <p className="text-sm text-muted-foreground">{review.date}</p>
              </div>
            </Card>
            ))}
          </div>
        )}

        {/* Average Rating Display */}
        <div className="mt-16 text-center animate-fade-in">
          <div className="inline-flex flex-col items-center gap-4 p-8 bg-card border border-accent/20 rounded-lg shadow-metallic">
            <div className="flex items-center gap-2">
              <Star className="w-8 h-8 fill-accent text-accent" />
              <span className="text-5xl font-bold bg-gradient-metallic bg-clip-text text-transparent">
                {averageRating.toFixed(1)}
              </span>
            </div>
            <p className="text-muted-foreground">
              Priemerné hodnotenie z {totalReviews > 0 ? `${totalReviews} recenzií` : 'recenzií'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
