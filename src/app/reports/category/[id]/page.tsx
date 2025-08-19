import { notFound } from 'next/navigation';

export default function CategoryReportPage({ params }: { params: { id: string } }) {
  if (!params.id) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Category Report: {params.id}</h1>
      <p className="text-muted-foreground">
        This is a placeholder for the detailed category report view.
      </p>
    </div>
  );
}
