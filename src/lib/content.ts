/**
 * All of the site's written content lives here, so copy can be edited without
 * touching any components.
 *
 * NOTE FOR HAILSTRUM — a few numbers are marked `// CHECK` below. They were
 * taken from the pitch deck or estimated; confirm them before the site goes
 * public, especially anything that reads as a claim to investors.
 */

export const company = {
  name: "Hailstrum",
  tagline: "Autonomous logistics, engineered for range.",
  shortDescription:
    "A UTS early-stage drone startup reducing shipping costs through reliable Guidance, Navigation and Control systems in autonomous aircraft.",
  location: "Sydney, Australia",
  university: "University of Technology Sydney",
  instagram: "https://www.instagram.com/hailstrum_robotics/",
  instagramHandle: "@hailstrum_robotics",
  // Set this to the real address you want enquiries sent to, and it appears in
  // the footer and on the contact page automatically. Left empty on purpose —
  // publishing an address that doesn't exist is worse than showing none, so
  // until it's filled in the site points people at Instagram instead.
  email: "",
} as const;

export const nav = [
  { href: "/", label: "Home" },
  { href: "/technology", label: "Technology" },
  { href: "/about", label: "About" },
  { href: "/news", label: "News" },
  { href: "/contact", label: "Contact" },
] as const;

/* ------------------------------- the problem ------------------------------- */

export const problem = {
  eyebrow: "The problem",
  heading: "Last-mile delivery is the most expensive leg of the journey.",
  body: "Getting a parcel the final few kilometres costs more than moving it the first thousand. Road fleets burn fuel idling in traffic, drivers are the largest line item, and regional routes are quietly uneconomic. Existing delivery drones don't close the gap — they trade payload for range and spend most of their energy budget just staying in the air.",
  points: [
    {
      stat: "53%",
      label: "of total shipping cost",
      detail:
        "Last-mile delivery accounts for roughly half of what it costs to move a parcel end to end.", // CHECK — widely cited industry figure; cite your source on the site.
    },
    {
      stat: "~50%",
      label: "of drone energy lost",
      detail:
        "Off-the-shelf propellers operate well below their theoretical efficiency ceiling, wasting battery that could have been range.", // CHECK
    },
    {
      stat: "Fixed",
      label: "route economics",
      detail:
        "Ground fleets can't flex to demand. Every extra stop adds fuel, labour and time to a route that's already full.",
    },
  ],
} as const;

/* -------------------------------- mission --------------------------------- */

export const mission = {
  eyebrow: "Our mission",
  heading: "Make autonomous freight cheaper than the van.",
  items: [
    {
      number: "01",
      title: "Cut operational cost",
      body: "Design a logistical drone that minimises the operating cost of logistics for businesses, while optimising range and payload capability.",
    },
    {
      number: "02",
      title: "Beat commercial efficiency",
      body: "Enhance motors, propellers and energy management to exceed the efficiency levels of existing commercial systems.",
    },
    {
      number: "03",
      title: "Fly smarter, not harder",
      body: "Lower energy consumption and maintenance by optimising efficiency and building smarter flight operations into the control stack.",
    },
  ],
} as const;

/* ------------------------------- the aircraft ------------------------------ */

export const stork = {
  name: "Stork",
  eyebrow: "The aircraft",
  heading: "Stork",
  subheading:
    "A hybrid VTOL logistics platform: it lifts like a multirotor and cruises like a plane, so it can reach regional depots without a runway at either end.",
  specs: [
    { label: "Design range", value: "500", unit: "km" }, // CHECK — stated as a design target, confirm before publishing.
    { label: "Peak propulsion efficiency", value: "86.0", unit: "%" },
    { label: "Efficiency target", value: ">80", unit: "%" },
    { label: "Cost of goods, per unit", value: "21", unit: "K AUD" },
  ],
  features: [
    {
      title: "Lower operational costs",
      body: "No driver, no depot-to-door van leg, and an airframe designed so the energy budget goes into distance rather than hover.",
    },
    {
      title: "Last-mile connectivity",
      body: "Reaches addresses that are expensive to service by road — regional towns, islands, sites without sealed access.",
    },
    {
      title: "Increased payload",
      body: "Efficiency gains in propulsion are spent on useful mass instead of battery, so each flight carries more.",
    },
  ],
} as const;

/* -------------------------------- projects --------------------------------- */

export const projects = [
  {
    number: "01",
    title:
      "A high-efficiency propeller exceeding 80% propulsion efficiency",
    body: "Our first engineering programme, and the one everything else depends on. Propulsion is where most of a drone's energy budget is won or lost.",
    bullets: [
      "Optimise a propeller targeting greater than 80% efficiency using CFD and aerodynamic modelling.",
      "Use lightweight, durable materials, validated by experimental testing on our own thrust rig.",
      "Deliver a design that reduces energy use per kilometre and supports sustainable propulsion.",
    ],
    status: "In testing",
  },
  {
    number: "02",
    title: "Expanding horizons: advanced propulsion for logistical drones",
    body: "Taking the propeller work and applying it across the whole powertrain — motors, ESCs and energy management — to extend range and payload together rather than trading one for the other.",
    bullets: [
      "Extend usable range without adding battery mass.",
      "Match motor and propeller operating points so the aircraft cruises at peak efficiency.",
      "Build energy management into the GNC stack so the aircraft flies the cheapest route, not just the shortest.",
    ],
    status: "In design",
  },
] as const;

/* -------------------------------- roadmap ---------------------------------- */

export type StageStatus = "complete" | "current" | "upcoming";

export const roadmap: {
  number: number;
  title: string;
  window: string;
  body: string;
  status: StageStatus;
}[] = [
  {
    number: 1,
    title: "Research",
    window: "Oct 2023 — Oct 2025",
    body: "Comprehensive research into the limitations of current technology and the operational challenges faced by last-mile logistics.",
    status: "complete",
  },
  {
    number: 2,
    title: "Prototyping & testing",
    window: "Nov 2025 — ongoing",
    body: "Building and flying. Testing and refining products and solutions is not a phase that ends — it's how the business stays alive long term.",
    status: "current",
  },
  {
    number: 3,
    title: "Industry engagement",
    window: "Jan — Dec 2026",
    body: "Engaging with and establishing connections with logistics businesses, to understand their needs and how they'd benefit from what we're building.",
    status: "current",
  },
  {
    number: 4,
    title: "Funding",
    window: "Next",
    body: "Securing funding through research grants and pre-sales initiatives to support project development and early-stage implementation.",
    status: "upcoming",
  },
  {
    number: 5,
    title: "Manufacturing",
    window: "After stage 4",
    body: "Overseeing the manufacturing process and continuing to thoroughly test our products, to maintain a high standard of quality, functionality and customer satisfaction.",
    status: "upcoming",
  },
  {
    number: 6,
    title: "Expansion",
    window: "Long term",
    body: "Scaling operations, increasing market reach and growing the business infrastructure to support broader deployment.",
    status: "upcoming",
  },
];

/* --------------------------------- traction -------------------------------- */

export const traction = [
  {
    title: "Blackbird Protostars",
    detail:
      "Season 11. Backed by Blackbird VC with non-dilutive funding.",
  },
  {
    title: "IBISWorld 3P Programme",
    detail:
      "Selected for the 2026 IBISWorld 3P Innovation & Entrepreneurship Program at UTS.",
  },
  {
    title: "UTS ProtoSpace",
    detail:
      "Prototyping and manufacturing out of the UTS ProtoSpace facility in Sydney.",
  },
] as const;

/** Ten-year model from the pitch deck. Presented as projections, not results. */
export const projections = [
  { value: "$40M", label: "Projected revenue from drone sales", note: "10-year model" },
  { value: "$23M", label: "Projected gross profit", note: "10-year model" },
  { value: "$21K", label: "Cost of goods per unit", note: "At volume" },
  { value: "9–10 yrs", label: "Pipeline to maturity", note: "Current plan" },
] as const;

/* ---------------------------------- team ----------------------------------- */

export const team = [
  {
    name: "Chirag Murali",
    role: "Co-founder & CEO",
    detail: "First-year mechatronic engineering student.",
  },
  {
    name: "Prithvi Thakre",
    role: "Co-founder",
    detail: "First-year software engineering student and a big fan of aeronautics.",
  },
  {
    name: "Oscar Peer",
    role: "Co-founder",
    detail: "First-year software engineering student.",
  },
  {
    name: "Remy Moscovitz",
    role: "Co-founder",
    detail: "First-year software engineering student.",
  },
] as const;
