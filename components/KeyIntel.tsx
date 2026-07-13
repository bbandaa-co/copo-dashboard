"use client";

const NEEDS_DECISION = [
  {
    client: "Mochi",
    text: "Who from CoPo is on set July 16? Decide and tell Amy — photographer will control by default if not established now.",
  },
  {
    client: "Emergence",
    text: "Who is writing the web manifesto copy? Flagged in two separate meetings, still unresolved.",
  },
  {
    client: "Pavilion",
    text: "Matt's consolidated feedback expected Monday. Follow up if not received.",
  },
];

const NEW_THIS_WEEK = [
  {
    client: "Automat Workforce",
    text: "45-day trial agreed Jun 26. Check-in July 2 @11am PT. Send testimonial to Lucas today.",
  },
  {
    client: "BTQ Tech",
    text: "Intro call Jun 24 — quantum computing. Potential engagement, follow-up needed.",
  },
];

const DECISIONS_LOCKED = [
  {
    client: "Mochi",
    text: 'Direction 1 confirmed. Cardone Book as headline. All-caps out. "Health" at equal visual weight.',
  },
  {
    client: "Emergence",
    text: "Per-vertical color palette dropped. Nighthaus + Martina Plantin confirmed. Dark green as hero.",
  },
  {
    client: "Pavilion",
    text: '"Local Without Limits" as central idea. Direction 3 ruled out.',
  },
  {
    client: "Federato",
    text: "Lock copy received — Katie clear to build all report pages.",
  },
];

function IntelSection({
  title,
  items,
}: {
  title: string;
  items: { client: string; text: string }[];
}) {
  return (
    <div className="intel-section">
      <div className="intel-title">{title}</div>
      {items.map((item, i) => (
        <div className="intel-row" key={i}>
          <div className="intel-client-tag">{item.client}</div>
          {item.text}
        </div>
      ))}
    </div>
  );
}

export default function KeyIntel() {
  return (
    <div>
      <div className="page-header">
        <div className="header-left">
          <div className="week-label">From Granola</div>
          <div className="week-title">Key intel</div>
        </div>
      </div>
      <IntelSection title="Needs a decision" items={NEEDS_DECISION} />
      <IntelSection title="New this week" items={NEW_THIS_WEEK} />
      <IntelSection title="Decisions locked" items={DECISIONS_LOCKED} />
    </div>
  );
}
