import PublicNavbar from "@/components/public-navbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />
      <main>{children}</main>
    </div>
  );
}
