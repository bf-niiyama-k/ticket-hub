
import EventEdit from './EventEdit';

export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ];
}

export default function EventEditPage({ params }: { params: { id: string } }) {
  return <EventEdit eventId={params.id} />;
}
