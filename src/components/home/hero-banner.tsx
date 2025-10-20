"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BannerSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  badge?: string;
}

const mockSlides: BannerSlide[] = [
  {
    id: "1",
    title: "Summer Sale",
    subtitle: "Up to 50% Off",
    description:
      "Get amazing deals on electronics, fashion, and more. Limited time offer!",
    image: "/api/placeholder/1200/400",
    ctaText: "Shop Now",
    ctaLink: "/sale",
    badge: "HOT DEAL",
  },
  {
    id: "2",
    title: "New Arrivals",
    subtitle: "Latest Collection",
    description: "Discover our newest products and stay ahead of the trends.",
    image: "/api/placeholder/1200/400",
    ctaText: "Explore",
    ctaLink: "/new-arrivals",
    badge: "NEW",
  },
  {
    id: "3",
    title: "Free Shipping",
    subtitle: "On Orders Over $50",
    description: "Shop now and enjoy free shipping on all orders above $50.",
    image: "/api/placeholder/1200/400",
    ctaText: "Learn More",
    ctaLink: "/shipping",
  },
];

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % mockSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % mockSlides.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + mockSlides.length) % mockSlides.length
    );
    setIsAutoPlaying(false);
  };

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-lg">
      {/* Slides */}
      <div className="relative h-full">
        {mockSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000",
              index === currentSlide ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="relative h-full">
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="absolute inset-0 bg-black/40" />
              </div>

              {/* Content */}
              <div className="relative h-full flex items-center">
                <div className="container mx-auto px-4">
                  <div className="max-w-2xl text-white">
                    {slide.badge && (
                      <Badge className="mb-4 bg-red-500 hover:bg-red-600">
                        {slide.badge}
                      </Badge>
                    )}
                    <h1 className="text-4xl md:text-6xl font-bold mb-2">
                      {slide.title}
                    </h1>
                    <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-primary-foreground/90">
                      {slide.subtitle}
                    </h2>
                    <p className="text-lg mb-8 text-primary-foreground/80 max-w-lg">
                      {slide.description}
                    </p>
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      asChild
                    >
                      <a href={slide.ctaLink}>{slide.ctaText}</a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border-white/20"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border-white/20"
        onClick={nextSlide}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {mockSlides.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              index === currentSlide
                ? "w-8 bg-white"
                : "bg-white/50 hover:bg-white/75"
            )}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}
