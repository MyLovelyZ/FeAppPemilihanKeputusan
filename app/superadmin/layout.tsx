export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-white overflow-auto z-[50]">
      {children}
    </div>
  );
}
