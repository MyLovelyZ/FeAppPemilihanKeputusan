export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-white overflow-auto z-[50]">
      {children}
    </div>
  );
}
