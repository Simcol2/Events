const STYLES = {
  draft: "bg-stone-100 text-stone-600",
  skeleton_generating: "bg-amber-100 text-amber-700",
  skeleton_ready: "bg-sky-100 text-sky-700",
  skeleton_failed: "bg-red-100 text-red-700",
  locked: "bg-violet-100 text-violet-700",
  live: "bg-emerald-100 text-emerald-700",
  completed: "bg-emerald-200 text-emerald-800",
  final_generating: "bg-amber-100 text-amber-700",
  final_ready: "bg-emerald-200 text-emerald-800",
  final_failed: "bg-red-100 text-red-700",
  archived: "bg-stone-100 text-stone-500",
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-stone-100 text-stone-500",
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] ?? "bg-stone-100 text-stone-600";
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
