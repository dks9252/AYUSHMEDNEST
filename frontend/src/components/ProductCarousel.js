import React, { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProductCarousel = ({ children }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 768px)': { slidesToScroll: 2 },
      '(min-width: 1024px)': { slidesToScroll: 3 }
    }
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {children}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg rounded-full h-10 w-10 hover:bg-stone-50 z-10"
        onClick={scrollPrev}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg rounded-full h-10 w-10 hover:bg-stone-50 z-10"
        onClick={scrollNext}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default ProductCarousel;
