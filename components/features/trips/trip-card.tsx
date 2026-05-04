import type { Trip } from '@/types/trip';

type TripCardProps = {
  trip: Trip;
};

export function TripCard({ trip }: TripCardProps) {
  return (
    <article className="rounded-xl border bg-background p-5">
      <h2 className="font-semibold">{trip.destination}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{trip.status}</p>
    </article>
  );
}
