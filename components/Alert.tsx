type AlertType = "error" | "success" | "info";

const styles: Record<AlertType, string> = {
  error: "bg-red-50 border-red-500 text-red-600",
  success: "bg-green-50 border-green-500 text-green-700",
  info: "bg-blue-50 border-blue-500 text-brand-blue",
};

export default function Alert({ type, message }: { type: AlertType; message: string }) {
  if (!message) return null;
  return (
    <div className={`border-l-4 rounded-xl px-4 py-3 ${styles[type]}`}>
      <p className="text-[14px]">{message}</p>
    </div>
  );
}
