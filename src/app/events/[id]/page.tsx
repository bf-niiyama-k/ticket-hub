import EventDetail from './EventDetail';

export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
    { id: '6' },
  ];
}

export default function EventPage({ params }: { params: { id: string } }) {
  return <EventDetail eventId={params.id} />;
}