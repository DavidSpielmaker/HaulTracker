import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface DumpsterCardProps {
  id: string;
  name: string;
  sizeYards: number;
  description: string;
  weeklyRate: number;
  dailyRate: number;
  weightLimit: number;
  imageUrl: string;
  popular?: boolean;
  onSelect?: (id: string) => void;
}

export default function DumpsterCard({
  id,
  name,
  sizeYards,
  description,
  weeklyRate,
  dailyRate,
  weightLimit,
  imageUrl,
  popular = false,
  onSelect
}: DumpsterCardProps) {
  return (
    <Card className="relative hover-elevate overflow-visible" data-testid={`card-dumpster-${id}`}>
      {popular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 z-10" data-testid="badge-popular">
          Most Popular
        </Badge>
      )}
      <CardHeader>
        <div className="aspect-[4/3] mb-4 overflow-hidden rounded-md bg-muted">
          <img 
            src={imageUrl} 
            alt={name}
            className="w-full h-full object-cover"
            data-testid={`img-dumpster-${id}`}
          />
        </div>
        <CardTitle className="flex items-center justify-between">
          <span data-testid={`text-name-${id}`}>{name}</span>
          <Badge variant="secondary" data-testid={`badge-size-${id}`}>{sizeYards} Yards</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground" data-testid={`text-description-${id}`}>
          {description}
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-primary" />
            <span data-testid={`text-weekly-rate-${id}`}>${weeklyRate}/week</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-primary" />
            <span data-testid={`text-daily-rate-${id}`}>${dailyRate}/day after 7 days</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-primary" />
            <span data-testid={`text-weight-limit-${id}`}>Up to {weightLimit} tons</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={() => onSelect?.(id)}
          data-testid={`button-select-${id}`}
        >
          Select This Size
        </Button>
      </CardFooter>
    </Card>
  );
}
