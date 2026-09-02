const COLORS = ["#FFD6E0", "#D6EBFF", "#DFFFDB", "#FFF4D6", "#E6DCFF", "#FFE2CC"];

// Dependency-free confetti: a burst of colored divs falling with randomized
// timing/rotation via inline keyframes, shown for the "Book Complete" moment.
export default function ConfettiBurst({ show }) {
  if (!show) return null;

  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    duration: 2.5 + Math.random() * 1.5,
    color: COLORS[i % COLORS.length],
    rotate: Math.random() * 360,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <style>{`
        @keyframes cys-confetti-fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0.9; }
        }
      `}</style>
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: 0,
            width: 10,
            height: 16,
            backgroundColor: p.color,
            borderRadius: 2,
            animation: `cys-confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
