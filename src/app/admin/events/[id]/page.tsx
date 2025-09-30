
import EventEdit from './EventEdit';

export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ];
}

export default async function EventEditPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return <EventEdit eventId={params.id} />;
}
