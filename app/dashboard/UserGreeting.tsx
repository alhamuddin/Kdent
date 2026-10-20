type UserGreetingProps = {
  name: string;
  role: "USER" | "DOCTOR" | "ASSISTANT" | "ADMIN";
};

const roleBadge = {
  USER: { letter: "U", label: "User", style: "bg-slate-400/15 text-slate-200" },
  DOCTOR: { letter: "D", label: "Doctor", style: "bg-primary/15 text-primary" },
  ASSISTANT: { letter: "S", label: "Assistant", style: "bg-violet-400/15 text-violet-200" },
  ADMIN: { letter: "A", label: "Admin", style: "bg-amber-400/15 text-amber-200" },
} as const;

export default function UserGreeting({ name, role }: UserGreetingProps) {
  const badge = roleBadge[role];

  return (
    <div className="mb-3 flex items-center justify-end gap-2 px-1 text-sm">
      <span className="text-white/65">Hello <span className="font-semibold text-white">{name || "there"}</span></span>
      <span aria-label={badge.label} className={`grid size-7 place-items-center rounded-full text-xs font-bold ${badge.style}`} title={badge.label}>
        {badge.letter}
      </span>
    </div>
  );
}
