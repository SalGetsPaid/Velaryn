type PlaceholderPageProps = {
  title: string;
};

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-zinc-400">Module initializing...</p>
      </div>
    </div>
  );
}