import React, { useState, useRef, useEffect, useContext, createContext } from "react";
import {
  Plane, Shield, Sparkles, Image as ImageIcon, Phone, MessageCircle, MapPin,
  Wallet, Users, AlertTriangle, Check, ChevronLeft, ChevronRight, Search,
  Filter, Home as HomeIcon, Compass, Briefcase, User, Bell, Camera, X, Send,
  Navigation, Heart, Star, Clock, ShieldCheck, Sunrise, CloudSun, Ticket,
  PlusCircle, Edit3, ArrowRight, RotateCcw, CheckCircle2, MessagesSquare,
  Route, PiggyBank, Siren, Building2, Ambulance, Landmark, ChevronDown, ChevronUp,
  Backpack, Mountain, Utensils, Palmtree, Tent, Car, PartyPopper, Loader2,
  RefreshCw, Trash2, Lock, Eye, ArrowLeft
} from "lucide-react";

/* Note on deployment safety: this prototype uses only client-side mock data and
   the browser's built-in artifact key-value storage. It calls no paid or private
   API and stores no credentials or secrets in source. If this is wired to a real
   backend later, all API keys must live in server-side environment variables,
   never in this file. */

/* ============================== DESIGN TOKENS ============================== */
const C = {
  navy: "#061A33", navyLight: "#0C2947", navyBorder: "#16324F",
  orange: "#FF6B22", orangeDark: "#E4581A",
  bg: "#F5F7FA", white: "#FFFFFF", text: "#0B1B2B",
  muted: "#64748B", mutedLight: "#94A3B8", border: "#E2E8F0",
  success: "#16A34A", successBg: "#EAF7EE", danger: "#DC2626", dangerBg: "#FDECEC",
  aiBlue: "#2563EB", aiBlueBg: "#EAF2FB",
};
const font = { fontFamily: "'Inter','Helvetica Neue',Arial,sans-serif" };

/* ============================== DATE HELPERS ============================== */
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function fmtShort(d) { return d.toLocaleDateString("en-US", { day: "numeric", month: "short" }); }
function fmtLong(d) { return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }); }
function fmtWeekday(d) { return d.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); }
function fmtClock(d) { return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }); }
function fmtISO(d) { return d.toISOString().slice(0, 10); }
function greeting(d) { const h = d.getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; }
function timeAgo(iso) {
  const diff = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString();
}

/* ============================== MOCK DATA ============================== */
const INTERESTS = ["Adventure","Nature","Hiking","Luxury","Photography","Food","Backpacking","Road Trips","Culture","Wildlife","Beaches","Camping"];
const INTEREST_ICON = { Adventure: Mountain, Nature: Palmtree, Hiking: Backpack, Luxury: Star, Photography: Camera, Food: Utensils, Backpacking: Backpack, "Road Trips": Car, Culture: Landmark, Wildlife: Palmtree, Beaches: Palmtree, Camping: Tent };
const MOTTOS = ["Explorer","Budget explorer","Luxury traveler","Adventure seeker","Culture lover","Relaxed traveler","Photography-focused","Food lover"];
const DREAM_DESTS = ["Japan","Switzerland","Bali","Iceland","Turkey","New Zealand"];
const REGIONS_INTL = ["Asia","Europe","Americas","Africa","Oceania","Middle East"];
const REGIONS_DOM = ["Himalayan North","Western Coast","Southern India","Northeast India","Central India","Desert & Heritage"];

const DEST_BY_REGION = {
  Asia: ["Japan","Thailand","Bali","Singapore","South Korea","Vietnam"],
  Europe: ["Switzerland","Iceland","Italy","Turkey","Greece","Portugal"],
  Americas: ["Peru","Canada","Brazil","Mexico","Argentina","United States"],
  Africa: ["Morocco","Kenya","South Africa","Egypt","Tanzania","Namibia"],
  Oceania: ["New Zealand","Australia","Fiji"],
  "Middle East": ["United Arab Emirates","Jordan","Oman"],
  "Himalayan North": ["Ladakh","Manali","Rishikesh"],
  "Western Coast": ["Goa","Gokarna","Mumbai"],
  "Southern India": ["Kerala","Coorg","Hampi"],
  "Northeast India": ["Meghalaya","Sikkim","Arunachal Pradesh"],
  "Central India": ["Pachmarhi","Kanha National Park"],
  "Desert & Heritage": ["Jaisalmer","Udaipur","Jaipur"],
};

const DEST_GRADIENT = {
  Japan: ["#2b2140","#c2447a"], Thailand: ["#0f3b3a","#f2a154"], Bali: ["#123a3f","#4fae9a"],
  Singapore: ["#0b1f3a","#3f7fd1"], "South Korea": ["#241b3a","#a06bd6"], Vietnam: ["#0e2a2c","#3fae7a"],
  Switzerland: ["#0d2438","#5aa7d6"], Iceland: ["#0a1e2e","#79c6d9"], Italy: ["#2a1a1c","#d68a4a"],
  Turkey: ["#2a1a0f","#d67a3f"], Greece: ["#0c2a4a","#7fc4e0"], Portugal: ["#1c2a4a","#e0a24a"],
  Peru: ["#241a12","#c98a3f"], Canada: ["#0c1f2e","#4fae7a"], Brazil: ["#1a2a12","#6dbf4a"],
  Mexico: ["#2a140f","#e0703f"], Argentina: ["#0f1c2a","#4a9fd6"], "United States": ["#0d1f2e","#4a8fd6"],
  Morocco: ["#2a1508","#e08a3f"], Kenya: ["#1e1a0a","#d6a23f"], "South Africa": ["#1a1208","#c9843f"],
  Egypt: ["#241c08","#d6b23f"], Tanzania: ["#1a1408","#c9973f"], Namibia: ["#241a0c","#d6903f"],
  "New Zealand": ["#0c2418","#4fbf7a"], Australia: ["#1e1408","#d6823f"], Fiji: ["#0a2438","#3fc4c9"],
  "United Arab Emirates": ["#1c1408","#d6a23f"], Jordan: ["#241a0c","#c98a4a"], Oman: ["#1a140c","#c99f5a"],
  Ladakh: ["#141c2e","#5a86b0"], Manali: ["#0f241c","#4fae8a"], Rishikesh: ["#12241a","#6ab04a"],
  Goa: ["#0c2438","#3fa6c9"], Gokarna: ["#0e2430","#4fae9a"], Mumbai: ["#0c1c2e","#4a80b0"],
  Kerala: ["#0c241a","#4fae6a"], Coorg: ["#12241a","#5a9f4a"], Hampi: ["#241c0c","#c9973f"],
  Meghalaya: ["#0c241e","#4fbf9a"], Sikkim: ["#141c2e","#6a8ab0"], "Arunachal Pradesh": ["#0f1e2e","#5a9fb0"],
  Pachmarhi: ["#14241a","#5aae6a"], "Kanha National Park": ["#1c1c0c","#b0a23f"],
  Jaisalmer: ["#241a08","#e0b34f"], Udaipur: ["#241408","#d68a3f"], Jaipur: ["#241008","#d6703f"],
};

function overviewFor(name) {
  const base = { bestTime: "October – March", avgBudget: "₹80,000 – ₹1,60,000", duration: "6 – 10 days", visa: "Visa on arrival for most nationalities", weather: "Pleasant, mild days", experiences: ["Local markets & street food","Guided heritage walk","Scenic viewpoint at sunset","Community-run homestay night"] };
  const custom = {
    Japan: { bestTime: "March – April (Cherry Blossom)", avgBudget: "₹1,50,000 – ₹2,20,000", duration: "8 – 10 days", visa: "e-Visa required, ~5 working days", weather: "Mild spring, 10°C – 18°C", experiences: ["Shibuya Crossing at night","Mt. Fuji day trip","Tokyo Tower at sunset","Kyoto temple trail","Osaka street food crawl"] },
    Bali: { bestTime: "April – October (Dry season)", avgBudget: "₹70,000 – ₹1,10,000", duration: "6 – 8 days", visa: "Visa on arrival", weather: "Tropical, 26°C – 32°C", experiences: ["Ubud rice terraces","Uluwatu sunset temple","Snorkeling in Nusa Penida","Canggu surf lesson"] },
    Switzerland: { bestTime: "June – September", avgBudget: "₹2,20,000 – ₹3,00,000", duration: "7 – 9 days", visa: "Schengen visa required", weather: "Alpine, 8°C – 20°C", experiences: ["Jungfraujoch train","Lake Geneva cruise","Zermatt hiking trail","Interlaken paragliding"] },
    Ladakh: { bestTime: "May – September", avgBudget: "₹35,000 – ₹55,000", duration: "6 – 8 days", visa: "Inner Line Permit (arranged on entry)", weather: "Cold desert, 5°C – 20°C", experiences: ["Pangong Lake sunrise","Khardung La ride","Monastery trail","Nubra Valley camping"] },
  };
  return { ...base, ...(custom[name] || {}) };
}

const TRAVELERS = [
  { id: 1, name: "Rahul Kumar", age: 27, location: "Bengaluru, India", style: "Adventure seeker", interests: ["Adventure","Hiking","Photography"], match: 95, budget: 90, style_m: 94, interests_m: 96, avail: 98, reliability: 92, init: "RK", color: "#FF6B22", bio: "Weekend trekker who's summited 12 peaks across the Himalayas. Loves early starts and campfire stories." },
  { id: 2, name: "Meera Iyer", age: 25, location: "Mumbai, India", style: "Culture lover", interests: ["Culture","Food","Photography"], match: 91, budget: 88, style_m: 90, interests_m: 93, avail: 95, reliability: 96, init: "MI", color: "#5AA7D6", bio: "Museum-hopper and street-food hunter. Keeps a travel journal for every trip she takes." },
  { id: 3, name: "Arjun Nair", age: 29, location: "Kochi, India", style: "Budget explorer", interests: ["Backpacking","Road Trips","Nature"], match: 87, budget: 95, style_m: 82, interests_m: 85, avail: 90, reliability: 88, init: "AN", color: "#4fae7a", bio: "Backpacked through 14 countries on a shoestring budget. Always has a spreadsheet of hostel deals." },
  { id: 4, name: "Sneha Rao", age: 26, location: "Pune, India", style: "Photography-focused", interests: ["Photography","Culture","Beaches"], match: 84, budget: 80, style_m: 88, interests_m: 90, avail: 82, reliability: 90, init: "SR", color: "#a06bd6", bio: "Freelance photographer chasing golden-hour light. Never travels without a spare memory card." },
  { id: 5, name: "Karan Mehta", age: 30, location: "Delhi, India", style: "Luxury traveler", interests: ["Luxury","Food","Culture"], match: 79, budget: 70, style_m: 76, interests_m: 82, avail: 88, reliability: 91, init: "KM", color: "#d68a4a", bio: "Believes a good trip needs a great meal. Always researches the top 5 restaurants before landing." },
];

const CHAT_SEED = [
  { id: 1, from: "Rahul Kumar", init: "RK", color: "#FF6B22", text: "Hey everyone! Excited for the trip! 🎌", me: false, ai: false },
  { id: 2, from: "Meera Iyer", init: "MI", color: "#5AA7D6", text: "Same here! Can we shift Day 2 to the evening?", me: false, ai: false },
];

const ITINERARY_SEED = [
  { day: "Day 1", title: "Arrive", items: [{ id: "i1", text: "Airport pickup & check-in" }, { id: "i2", text: "Meet the tribe over dinner" }] },
  { day: "Day 2", title: "City exploration", items: [{ id: "i3", text: "Street food crawl" }, { id: "i4", text: "City lights at night" }] },
  { day: "Day 3", title: "Landmark day", items: [{ id: "i5", text: "Morning city views" }, { id: "i6", text: "Sunset photography stop" }] },
  { day: "Day 4", title: "Heritage trail", items: [{ id: "i7", text: "Historic shrine visit" }, { id: "i8", text: "Traditional tea ceremony" }] },
];

const BUDGET_CATS = [
  { name: "Stay", pct: 40, color: "#5AA7D6" }, { name: "Food", pct: 25, color: "#FF6B22" },
  { name: "Travel", pct: 20, color: "#4fae7a" }, { name: "Activities", pct: 15, color: "#a06bd6" },
];

/* Map each destination name to the Wikipedia article most likely to have a real,
   high-quality lead photo (country-level pages sometimes lead with a flag/map
   collage, so several are pointed at an iconic city or landmark instead). */
const WIKI_OVERRIDE = {
  Japan: "Tokyo", Thailand: "Bangkok", Bali: "Bali", Singapore: "Singapore", "South Korea": "Seoul", Vietnam: "Ha Long Bay",
  Switzerland: "Interlaken", Iceland: "Iceland", Italy: "Venice", Turkey: "Cappadocia", Greece: "Santorini", Portugal: "Lisbon",
  Peru: "Machu Picchu", Canada: "Banff National Park", Brazil: "Rio de Janeiro", Mexico: "Cancún", Argentina: "Buenos Aires", "United States": "San Francisco",
  Morocco: "Marrakesh", Kenya: "Maasai Mara National Reserve", "South Africa": "Cape Town", Egypt: "Giza pyramid complex", Tanzania: "Serengeti National Park", Namibia: "Namib Desert",
  "New Zealand": "Queenstown, New Zealand", Australia: "Sydney", Fiji: "Fiji",
  "United Arab Emirates": "Dubai", Jordan: "Petra", Oman: "Muscat",
  Ladakh: "Ladakh", Manali: "Manali", Rishikesh: "Rishikesh",
  Goa: "Goa", Gokarna: "Gokarna", Mumbai: "Mumbai",
  Kerala: "Kerala backwaters", Coorg: "Kodagu district", Hampi: "Hampi",
  Meghalaya: "Meghalaya", Sikkim: "Sikkim", "Arunachal Pradesh": "Arunachal Pradesh",
  Pachmarhi: "Pachmarhi", "Kanha National Park": "Kanha National Park",
  Jaisalmer: "Jaisalmer Fort", Udaipur: "Udaipur", Jaipur: "Jaipur",
};

/* ============================== IMAGE FETCH (real, keyless, dynamic) ============================== */
const imgCache = {};
function useDestImage(name) {
  const title = WIKI_OVERRIDE[name] || name;
  const [state, setState] = useState(() => (imgCache[title] ? { status: "ready", url: imgCache[title] } : { status: "loading", url: null }));
  useEffect(() => {
    if (!title) { setState({ status: "empty", url: null }); return; }
    if (imgCache[title]) { setState({ status: "ready", url: imgCache[title] }); return; }
    let active = true;
    setState({ status: "loading", url: null });
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("not found"))))
      .then((d) => {
        if (!active) return;
        const src = (d.originalimage && d.originalimage.source) || (d.thumbnail && d.thumbnail.source);
        if (src) { imgCache[title] = src; setState({ status: "ready", url: src }); }
        else setState({ status: "error", url: null });
      })
      .catch(() => { if (active) setState({ status: "error", url: null }); });
    return () => { active = false; };
  }, [title]);
  return state;
}

/* ============================== CONTEXT ============================== */
const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);

/* ============================== SMALL UI PRIMITIVES ============================== */
function Btn({ children, onClick, variant = "primary", full, icon: Icon, iconRight = true, size = "md", disabled, loading }) {
  const sizes = { md: "10px 20px", sm: "8px 14px", lg: "13px 26px" };
  const base = { border: "none", borderRadius: 8, fontWeight: 700, fontSize: size === "sm" ? 13 : 14, cursor: disabled || loading ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: sizes[size], opacity: disabled ? 0.5 : 1, width: full ? "100%" : "auto" };
  const styles = {
    primary: { background: C.orange, color: "#fff" }, dark: { background: C.navy, color: "#fff" },
    outline: { background: "transparent", color: C.navy, border: `1px solid ${C.border}` },
    ghost: { background: "transparent", color: C.muted },
    success: { background: C.success, color: "#fff" },
    danger: { background: "transparent", color: C.danger, border: `1px solid ${C.dangerBg}` },
  };
  return (
    <button onClick={disabled || loading ? undefined : onClick} style={{ ...base, ...styles[variant] }} className="voyara-btn">
      {loading ? <Loader2 size={15} className="voyara-spin" /> : (Icon && !iconRight && <Icon size={16} />)}
      {loading ? "Please wait…" : children}
      {!loading && Icon && iconRight && <Icon size={16} />}
    </button>
  );
}

function Badge({ children, tone = "orange" }) {
  const tones = { orange: { bg: "#FFF0E8", color: C.orangeDark }, success: { bg: C.successBg, color: C.success }, navy: { bg: "#EAF0F7", color: C.navy }, muted: { bg: "#F1F5F9", color: C.muted }, danger: { bg: C.dangerBg, color: C.danger } };
  const t = tones[tone];
  return <span style={{ background: t.bg, color: t.color, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 999, letterSpacing: 0.3, display: "inline-block" }}>{children}</span>;
}

function AIBadge({ text = "AI-generated · VoyAi" }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: C.aiBlueBg, color: C.aiBlue, fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 999 }}><Sparkles size={10} /> {text}</span>;
}

function ErrorState({ title = "Something didn't load", body = "That's on us — please try again.", onRetry }) {
  return (
    <div style={{ textAlign: "center", padding: "36px 20px", color: C.muted }}>
      <AlertTriangle size={26} color={C.danger} style={{ marginBottom: 10 }} />
      <div style={{ fontWeight: 700, color: C.text, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13.5, marginBottom: 14 }}>{body}</div>
      {onRetry && <Btn variant="outline" size="sm" onClick={onRetry} icon={RefreshCw} iconRight={false}>Try again</Btn>}
    </div>
  );
}

function EmptyState({ icon: Icon = Compass, title, body, action }) {
  return (
    <div style={{ textAlign: "center", padding: "36px 20px", color: C.muted }}>
      <Icon size={26} color={C.mutedLight} style={{ marginBottom: 10 }} />
      <div style={{ fontWeight: 700, color: C.text, marginBottom: 4 }}>{title}</div>
      {body && <div style={{ fontSize: 13.5, marginBottom: 14 }}>{body}</div>}
      {action}
    </div>
  );
}

function Spinner({ label }) {
  return (
    <div style={{ textAlign: "center", padding: "36px 20px" }}>
      <Loader2 size={26} color={C.orange} className="voyara-spin" />
      {label && <div style={{ marginTop: 10, color: C.muted, fontSize: 13.5 }}>{label}</div>}
    </div>
  );
}

function ProgressDots({ total, index }) {
  return <div style={{ display: "flex", gap: 6 }}>{Array.from({ length: total }).map((_, i) => <div key={i} style={{ height: 4, width: i === index ? 28 : 14, borderRadius: 4, background: i === index ? C.orange : C.navyBorder }} />)}</div>;
}

function Avatar({ initials, color = C.orange, size = 40 }) {
  return <div style={{ width: size, height: size, borderRadius: "50%", background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size / 2.6, flexShrink: 0 }}>{initials}</div>;
}

function MatchRing({ value, size = 78 }) {
  const r = (size - 8) / 2, c = 2 * Math.PI * r, off = c - (value / 100) * c;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#22344a" strokeWidth="6" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={C.orange} strokeWidth="6" fill="none" strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ fontWeight: 800, fontSize: size / 4.2, color: "#fff" }}>{value}%</div></div>
    </div>
  );
}

function MeterRow({ label, value }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.mutedLight, marginBottom: 4 }}><span>{label}</span><span style={{ color: "#fff", fontWeight: 700 }}>{value}%</span></div>
      <div style={{ height: 5, background: "#1a2c42", borderRadius: 4 }}><div style={{ height: 5, width: `${value}%`, background: C.orange, borderRadius: 4 }} /></div>
    </div>
  );
}

function DestImg({ name, children, height = 150 }) {
  const g = DEST_GRADIENT[name] || ["#0d2438", "#3fa6c9"];
  const { status, url } = useDestImage(name);
  return (
    <div style={{ height, borderRadius: 10, position: "relative", overflow: "hidden", display: "flex", alignItems: "flex-end", background: `linear-gradient(135deg, ${g[0]}, ${g[1]})` }}>
      {status === "ready" && url && <img src={url} alt={name} onError={(e) => { e.currentTarget.style.display = "none"; }} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
      <div style={{ position: "absolute", inset: 0, background: status === "ready" ? "linear-gradient(to top, rgba(6,26,51,0.68), rgba(6,26,51,0.05) 55%)" : "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.12), transparent 60%)" }} />
      {status === "loading" && <div style={{ position: "absolute", top: 10, left: 10, display: "flex", alignItems: "center", gap: 6, background: "rgba(6,26,51,0.55)", borderRadius: 20, padding: "3px 9px", fontSize: 10, color: "#fff" }}><Loader2 size={10} className="voyara-spin" /> Loading photo</div>}
      <div style={{ position: "relative", width: "100%" }}>{children}</div>
    </div>
  );
}

/* ============================== NAV ============================== */
const MAIN_ITEMS = [
  { key: "home", label: "Home", icon: HomeIcon }, { key: "discover", label: "Discover", icon: Compass },
  { key: "myTrips", label: "My Trips", icon: Briefcase }, { key: "tribes", label: "Tribes", icon: Users },
  { key: "profile", label: "Profile", icon: User },
];

function Sidebar({ activeMain }) {
  const { go, setSos, profile, resetDemo } = useApp();
  return (
    <div className="voyara-sidebar" style={{ width: 236, background: C.navy, color: "#fff", display: "flex", flexDirection: "column", flexShrink: 0, minHeight: "100vh" }}>
      <div style={{ padding: "22px 20px 18px", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${C.navyBorder}` }}>
        <div style={{ width: 30, height: 30, border: `1.5px solid ${C.orange}`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14 }}>V</div>
        <div><div style={{ fontWeight: 800, letterSpacing: 1 }}>VOYARA</div><div style={{ fontSize: 10, color: C.mutedLight }}>Trusted journeys.</div></div>
      </div>
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${C.navyBorder}` }}>
        <Avatar initials={profile.initials} size={34} />
        <div><div style={{ fontWeight: 700, fontSize: 13 }}>{profile.name}</div><div style={{ fontSize: 11, color: C.mutedLight, display: "flex", alignItems: "center", gap: 4 }}><ShieldCheck size={11} color={C.success} /> Verified traveler</div></div>
      </div>
      <div style={{ padding: "14px 12px", flex: 1 }}>
        {MAIN_ITEMS.map((it) => {
          const active = activeMain === it.key;
          return <div key={it.key} onClick={() => go(it.key)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 8, marginBottom: 4, cursor: "pointer", background: active ? "rgba(255,107,34,0.14)" : "transparent", color: active ? C.orange : "#CBD5E1", fontWeight: active ? 700 : 500, fontSize: 14 }}><it.icon size={17} /> {it.label}</div>;
        })}
      </div>
      <div style={{ margin: 14, padding: 14, borderRadius: 10, background: C.navyLight, border: `1px solid ${C.navyBorder}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.success, fontWeight: 700, fontSize: 12, marginBottom: 8 }}><ShieldCheck size={14} /> Safety first</div>
        <div style={{ fontSize: 11, color: C.mutedLight, marginBottom: 10 }}>Your identity is protected end-to-end.</div>
        <Btn variant="danger" size="sm" full onClick={() => setSos(true)} icon={Siren} iconRight={false}>Safety SOS</Btn>
        <div onClick={resetDemo} style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", marginTop: 10, color: C.mutedLight, fontSize: 11, cursor: "pointer" }}><RotateCcw size={11} /> Reset demo</div>
      </div>
    </div>
  );
}

function MobileNav({ activeMain }) {
  const { go } = useApp();
  return (
    <div className="voyara-mobilenav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.navy, borderTop: `1px solid ${C.navyBorder}`, display: "none", justifyContent: "space-around", padding: "8px 4px 10px", zIndex: 40 }}>
      {MAIN_ITEMS.map((it) => {
        const active = activeMain === it.key;
        return <div key={it.key} onClick={() => go(it.key)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: active ? C.orange : C.mutedLight, cursor: "pointer" }}><it.icon size={19} /><span style={{ fontSize: 10, fontWeight: 600 }}>{it.label === "My Trips" ? "Trips" : it.label}</span></div>;
      })}
    </div>
  );
}

function NotifPanel({ onClose }) {
  const { notifications, go, markOneRead } = useApp();
  const openNotif = (n) => {
    markOneRead(n.id);
    if (n.targetScreen) go(n.targetScreen);
    onClose();
  };
  return (
    <div style={{ position: "fixed", top: 62, right: 20, width: 320, maxHeight: 400, overflowY: "auto", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 12, boxShadow: "0 16px 34px rgba(0,0,0,0.16)", zIndex: 70 }}>
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, fontWeight: 800, fontSize: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>Notifications <X size={15} style={{ cursor: "pointer" }} onClick={onClose} /></div>
      {notifications.length === 0 ? <div style={{ padding: 28, textAlign: "center", color: C.muted, fontSize: 13 }}>You're all caught up 🎉</div> :
        notifications.slice().reverse().map((n) => (
          <div key={n.id} onClick={() => openNotif(n)} style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, background: n.read ? "#fff" : "#FFF6F0", cursor: n.targetScreen ? "pointer" : "default" }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{n.title}</div>
            <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>{n.body}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
              <span style={{ fontSize: 10.5, color: C.mutedLight }}>{timeAgo(n.time)}</span>
              {n.targetScreen && <span style={{ fontSize: 10.5, color: C.aiBlue, fontWeight: 700 }}>View →</span>}
            </div>
          </div>
        ))}
    </div>
  );
}

function TopHeader({ title, subtitle, showDate }) {
  const { setSos, profile, now, notifications, notifOpen, setNotifOpen, markNotifsRead } = useApp();
  const unread = notifications.filter((n) => !n.read).length;
  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "22px 28px 18px", borderBottom: `1px solid ${C.border}`, flexWrap: "wrap", gap: 12 }}>
        <div>
          {showDate && <div style={{ fontSize: 12, color: C.muted, marginBottom: 3 }}>{fmtWeekday(now)}</div>}
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>{title}</div>
          {subtitle && <div style={{ color: C.muted, fontSize: 13.5, marginTop: 2 }}>{subtitle}</div>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 12.5, color: C.muted }}>{fmtClock(now)}</div>
          <div onClick={() => setSos(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: C.dangerBg, color: C.danger, padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer" }}><Siren size={13} /> SOS</div>
          <div style={{ position: "relative", cursor: "pointer" }} onClick={() => { setNotifOpen((v) => !v); if (!notifOpen) markNotifsRead(); }}>
            <Bell size={18} color={C.muted} />
            {unread > 0 && <div style={{ position: "absolute", top: -5, right: -5, background: C.danger, color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: 999, minWidth: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>{unread}</div>}
          </div>
          <Avatar initials={profile.initials} size={32} />
        </div>
      </div>
      {notifOpen && <NotifPanel onClose={() => setNotifOpen(false)} />}
    </div>
  );
}

/* ============================== ONBOARDING / AUTH ============================== */
function Landing() {
  const { go } = useApp();
  return (
    <div style={{ minHeight: "100vh", background: C.navy, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", padding: 24, textAlign: "center" }}>
      <div style={{ position: "relative", marginBottom: 18 }}>
        <div style={{ fontSize: 64, fontWeight: 900, letterSpacing: -2 }}>V</div>
        <Plane size={26} color={C.orange} style={{ position: "absolute", top: 6, right: -22, transform: "rotate(35deg)" }} />
      </div>
      <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: 6 }}>VOYARA</div>
      <div style={{ color: C.orange, fontWeight: 600, marginTop: 10, fontSize: 15 }}>Trusted Journeys. Timeless Memories.</div>
      <div style={{ marginTop: 40 }}><Btn onClick={() => go("onboard-0")} icon={ArrowRight} size="lg">Begin your journey</Btn></div>
    </div>
  );
}

const ONBOARD_SLIDES = [
  { icon: Shield, title: "Verify. Connect.\nTravel Together.", body: "Join verified travelers and find your perfect tribe." },
  { icon: Sparkles, title: "AI Matches That\nClick", body: "Our AI finds travelers with similar vibes and travel style." },
  { icon: ImageIcon, title: "Trips Become\nMemories", body: "Plan, travel, explore and create stories together." },
  { icon: Plane, title: "Your Journey\nStarts Here", body: "Let's build your travel story with Voyara." },
];

function Onboarding({ index }) {
  const { go } = useApp();
  const slide = ONBOARD_SLIDES[index];
  const last = index === ONBOARD_SLIDES.length - 1;
  return (
    <div style={{ minHeight: "100vh", background: C.navy, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="voyara-onboard-grid" style={{ display: "flex", alignItems: "center", gap: 70, maxWidth: 900, width: "100%" }}>
        <div style={{ width: 200, height: 200, borderRadius: 16, border: `1px solid ${C.navyBorder}`, background: "rgba(255,107,34,0.03)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <div style={{ width: 130, height: 130, borderRadius: "50%", border: `1px solid ${C.orange}`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <slide.icon size={38} color={C.orange} />
            <div style={{ position: "absolute", bottom: -34, fontSize: 11, color: C.mutedLight, letterSpacing: 1 }}>{String(index + 1).padStart(2, "0")} / 0{ONBOARD_SLIDES.length}</div>
          </div>
        </div>
        <div>
          <div style={{ color: C.orange, fontWeight: 700, fontSize: 12, letterSpacing: 1, marginBottom: 14 }}>VOYARA / YOUR TRAVEL TRIBE</div>
          <div style={{ fontSize: 40, fontWeight: 800, whiteSpace: "pre-line", lineHeight: 1.15, marginBottom: 16 }}>{slide.title}</div>
          <div style={{ color: C.mutedLight, fontSize: 15.5, marginBottom: 26, maxWidth: 380 }}>{slide.body}</div>
          <ProgressDots total={ONBOARD_SLIDES.length} index={index} />
          <div style={{ display: "flex", gap: 16, marginTop: 24, alignItems: "center" }}>
            <Btn onClick={() => go(last ? "phone" : `onboard-${index + 1}`)} icon={ArrowRight}>{last ? "Get started" : "Continue"}</Btn>
            {index > 0 && <span onClick={() => go(`onboard-${index - 1}`)} style={{ color: C.mutedLight, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}><ChevronLeft size={14} /> Back</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthShell({ step, total, title, subtitle, children, onBack, onContinue, continueLabel = "Continue", disabled, loading, error }) {
  return (
    <div style={{ minHeight: "100vh", background: C.navy, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ color: C.orange, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>STEP {step} OF {total}</div>
        {title && <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>{title}</div>}
        {subtitle && <div style={{ color: C.mutedLight, fontSize: 14, marginBottom: 26 }}>{subtitle}</div>}
        <div style={{ marginBottom: 14 }}>{children}</div>
        {error && <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#FCA5A5", fontSize: 13, marginBottom: 16 }}><AlertTriangle size={13} /> {error}</div>}
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <Btn onClick={onContinue} icon={ArrowRight} disabled={disabled} loading={loading}>{continueLabel}</Btn>
          {onBack && <span onClick={onBack} style={{ color: C.mutedLight, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}><ChevronLeft size={14} /> Back</span>}
        </div>
      </div>
    </div>
  );
}

const fieldStyle = { width: "100%", background: C.navyLight, border: `1px solid ${C.navyBorder}`, borderRadius: 8, padding: "12px 14px", color: "#fff", fontSize: 15, outline: "none" };

function PhoneScreen() {
  const { go, setProfile } = useApp();
  const [num, setNum] = useState("");
  const [error, setError] = useState("");
  return (
    <AuthShell step={6} total={12} title="Let's begin with your number" subtitle="We'll send a one-time code to verify it's you." onBack={() => go("onboard-3")} error={error}
      onContinue={() => { if (num.replace(/\D/g, "").length < 10) { setError("Enter a valid 10-digit number."); return; } setError(""); setProfile((p) => ({ ...p, phone: num })); go("otp"); }}>
      <div style={{ display: "flex", gap: 8 }}>
        <select style={{ ...fieldStyle, width: 90 }}><option>+91</option></select>
        <input style={fieldStyle} placeholder="98765 43210" value={num} onChange={(e) => setNum(e.target.value)} />
      </div>
    </AuthShell>
  );
}

function OtpScreen() {
  const { go, profile } = useApp();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [status, setStatus] = useState("idle");
  const [timer, setTimer] = useState(25);
  const refs = useRef([]);
  useEffect(() => { if (timer <= 0) return; const t = setInterval(() => setTimer((s) => s - 1), 1000); return () => clearInterval(t); }, [timer]);
  const setDigit = (i, v) => { const n = [...otp]; n[i] = v.replace(/\D/g, "").slice(-1); setOtp(n); if (v && i < 5) refs.current[i + 1]?.focus(); };
  const verify = () => {
    if (otp.some((d) => d === "")) { setStatus("error"); return; }
    setStatus("verifying");
    setTimeout(() => go("idType"), 900);
  };
  return (
    <AuthShell step={7} total={12} title="Enter OTP" subtitle={`We've sent a 6-digit code to +91 ${profile.phone || "98765 43210"}`} onBack={() => go("phone")} onContinue={verify}
      continueLabel="Verify" loading={status === "verifying"} error={status === "error" ? "Enter all 6 digits to continue." : ""}>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {otp.map((d, i) => <input key={i} ref={(el) => (refs.current[i] = el)} value={d} onChange={(e) => setDigit(i, e.target.value)} maxLength={1} style={{ ...fieldStyle, width: 44, textAlign: "center", fontSize: 20, fontWeight: 700 }} />)}
      </div>
      <div style={{ color: C.mutedLight, fontSize: 13 }}>
        {timer > 0 ? <>Resend OTP in <span style={{ color: C.orange, fontWeight: 700 }}>00:{String(timer).padStart(2, "0")}</span></> :
          <span style={{ color: C.orange, fontWeight: 700, cursor: "pointer" }} onClick={() => setTimer(25)}>Resend OTP</span>}
      </div>
    </AuthShell>
  );
}

const ID_TYPES = [{ label: "Passport", tag: "Recommended" }, { label: "Aadhaar", tag: "" }, { label: "Driver's License", tag: "" }, { label: "Voter ID", tag: "" }];

function IdTypeScreen() {
  const { go, idType, setIdType } = useApp();
  return (
    <AuthShell step={8} total={12} title="Verify your identity" subtitle="Choose a document type to continue." onBack={() => go("otp")} onContinue={() => go("idUpload")}>
      {ID_TYPES.map((t) => (
        <div key={t.label} onClick={() => setIdType(t.label)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: 8, border: `1px solid ${idType === t.label ? C.orange : C.navyBorder}`, background: idType === t.label ? "rgba(255,107,34,0.08)" : C.navyLight, marginBottom: 10, cursor: "pointer" }}>
          <span style={{ fontWeight: 600 }}>{t.label}</span>{t.tag ? <Badge>{t.tag}</Badge> : <ChevronRight size={16} color={C.mutedLight} />}
        </div>
      ))}
    </AuthShell>
  );
}

function IdUploadScreen() {
  const { go, idType } = useApp();
  const [state, setState] = useState("idle"); // idle | processing | error
  const process = () => { setState("processing"); setTimeout(() => go("idSuccess"), 1300); };
  return (
    <AuthShell step={9} total={12} title="Upload your document" subtitle={`Please upload a clear photo of your ${idType || "Passport"}.`} onBack={() => go("idType")}
      onContinue={state === "processing" ? undefined : process} continueLabel={state === "error" ? "Try again" : "Verify document"} loading={state === "processing"}
      error={state === "error" ? "We couldn't read that scan clearly. Please retake it in better lighting." : ""}>
      <div onClick={() => setState("idle")} style={{ border: `1.5px dashed ${C.navyBorder}`, borderRadius: 10, padding: "36px 16px", textAlign: "center", cursor: "pointer", background: C.navyLight }}>
        {state === "processing" ? <Loader2 size={30} color={C.orange} className="voyara-spin" /> : <Camera size={30} color={C.mutedLight} />}
        <div style={{ marginTop: 10, fontWeight: 600 }}>{state === "processing" ? "Verifying document…" : "Tap to upload or capture"}</div>
        <div style={{ fontSize: 12, color: C.mutedLight, marginTop: 4 }}>Front page {idType === "Passport" ? "" : "& back (if any)"}</div>
      </div>
      {state === "idle" && <div onClick={() => setState("error")} style={{ marginTop: 12, fontSize: 12, color: C.mutedLight, textDecoration: "underline", cursor: "pointer" }}>Simulate a scan failure (demo)</div>}
    </AuthShell>
  );
}

function IdSuccessScreen() {
  const { go } = useApp();
  return (
    <AuthShell step={10} total={12} onContinue={() => go("autofill")} continueLabel="Continue">
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ width: 74, height: 74, borderRadius: "50%", background: C.success, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}><Check size={36} color="#fff" /></div>
        <div style={{ fontSize: 21, fontWeight: 800, marginBottom: 8 }}>Verification successful!</div>
        <div style={{ color: C.mutedLight, fontSize: 14 }}>Your identity has been verified successfully. Your data is secure — we only store the verification status.</div>
      </div>
    </AuthShell>
  );
}

function AutofillScreen() {
  const { go, profile } = useApp();
  const fields = [["Full name", profile.name], ["Nationality", "Indian"], ["Gender", "Female"], ["Date of birth", "24 May 1999"], ["City", "Bengaluru, Karnataka"]];
  return (
    <AuthShell step={11} total={12} title="Your details" subtitle="We've auto-filled this from your document." onBack={() => go("idSuccess")} onContinue={() => go("interests")}>
      {fields.map(([label, val]) => (
        <div key={label} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: C.mutedLight, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
          <div style={{ ...fieldStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>{val} <Edit3 size={13} color={C.mutedLight} /></div>
        </div>
      ))}
    </AuthShell>
  );
}

function InterestsScreen() {
  const { go, profile, setProfile } = useApp();
  const toggle = (i) => setProfile((p) => ({ ...p, interests: p.interests.includes(i) ? p.interests.filter((x) => x !== i) : [...p.interests, i] }));
  return (
    <AuthShell step={12} total={14} title="Your interests" subtitle="Select what excites you — this powers VoyAi matching." onBack={() => go("autofill")} onContinue={() => go("travelMotto")} disabled={profile.interests.length === 0}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {INTERESTS.map((i) => { const on = profile.interests.includes(i); const Icon = INTEREST_ICON[i];
          return <div key={i} onClick={() => toggle(i)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 13px", borderRadius: 20, cursor: "pointer", border: `1px solid ${on ? C.orange : C.navyBorder}`, background: on ? C.orange : C.navyLight, color: "#fff", fontSize: 13, fontWeight: 600 }}><Icon size={13} /> {i}</div>; })}
      </div>
    </AuthShell>
  );
}

function TravelMottoScreen() {
  const { go, profile, setProfile } = useApp();
  const toggle = (m) => setProfile((p) => ({ ...p, motto: p.motto.includes(m) ? p.motto.filter((x) => x !== m) : [...p.motto, m] }));
  return (
    <AuthShell step={13} total={14} title="What kind of traveler are you?" subtitle="Choose all that describe your style." onBack={() => go("interests")} onContinue={() => go("dreamDest")} disabled={profile.motto.length === 0}>
      {MOTTOS.map((m) => { const on = profile.motto.includes(m);
        return (
          <div key={m} onClick={() => toggle(m)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 16px", borderRadius: 8, border: `1px solid ${on ? C.orange : C.navyBorder}`, background: on ? "rgba(255,107,34,0.08)" : C.navyLight, marginBottom: 8, cursor: "pointer" }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{m}</span>
            <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${on ? C.orange : C.navyBorder}`, background: on ? C.orange : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>{on && <Check size={11} color="#fff" />}</div>
          </div>
        ); })}
    </AuthShell>
  );
}

function DreamDestScreen() {
  const { go, profile, setProfile } = useApp();
  const toggle = (d) => setProfile((p) => ({ ...p, dreamDest: p.dreamDest.includes(d) ? p.dreamDest.filter((x) => x !== d) : [...p.dreamDest, d] }));
  return (
    <AuthShell step={14} total={14} title="Dream destinations" subtitle="Where do you dream of traveling?" onBack={() => go("travelMotto")} onContinue={() => go("home")} continueLabel="Enter Voyara">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {DREAM_DESTS.map((d) => { const on = profile.dreamDest.includes(d);
          return (
            <div key={d} onClick={() => toggle(d)} style={{ cursor: "pointer", position: "relative" }}>
              <DestImg name={d} height={90}>
                <div style={{ padding: 10, fontWeight: 700, color: "#fff", fontSize: 13 }}>{d}</div>
                {on && <div style={{ position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRadius: "50%", background: C.orange, display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={12} color="#fff" /></div>}
              </DestImg>
            </div>
          ); })}
      </div>
    </AuthShell>
  );
}

/* ============================== HOME / DISCOVER ============================== */
function RecommendedCard({ name, tag, sub }) {
  return (
    <div style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${C.border}`, background: "#fff" }}>
      <DestImg name={name} height={120}><Badge tone="orange">{tag}</Badge></DestImg>
      <div style={{ padding: 12 }}><div style={{ fontWeight: 700, fontSize: 14 }}>{name}</div><div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{sub}</div></div>
    </div>
  );
}

function Home() {
  const { go, profile, trip, now } = useApp();
  const d1 = fmtShort(addDays(now, 26)), d2 = fmtShort(addDays(now, 32));
  return (
    <div>
      <TopHeader title={`${greeting(now)}, ${profile.name.split(" ")[0]}`} showDate />
      <div style={{ padding: "22px 28px 60px" }}>
        <div style={{ background: `linear-gradient(120deg, ${C.navy}, #0c2a4a)`, borderRadius: 14, padding: "30px 32px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div style={{ maxWidth: 440 }}>
            <div style={{ color: C.orange, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>YOUR NEXT CHAPTER AWAITS</div>
            <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.2, marginBottom: 8 }}>Where will you <span style={{ color: C.orange }}>explore</span> today?</div>
            <div style={{ color: "#B9C6D6", fontSize: 14, marginBottom: 18 }}>Find people who travel like you and turn a destination into a shared story.</div>
            <Btn onClick={() => go("tripType")} icon={ArrowRight}>Discover your tribe</Btn>
          </div>
          <Plane size={70} color="rgba(255,107,34,0.35)" style={{ transform: "rotate(30deg)" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32, marginBottom: 14 }}>
          <div><div style={{ fontSize: 11, color: C.orange, fontWeight: 700, letterSpacing: 1 }}>CURATED FOR YOU</div><div style={{ fontSize: 18, fontWeight: 800 }}>Recommended trips</div></div>
          <span onClick={() => go("discover")} style={{ color: C.orange, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>View all →</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          <RecommendedCard name="Ladakh" tag="Adventure" sub={`Leh, India · ${d1}–${d2}`} />
          <RecommendedCard name="Bali" tag="Relaxed" sub={`Bali, Indonesia · ${fmtShort(addDays(now,33))}–${fmtShort(addDays(now,39))}`} />
          <RecommendedCard name="Japan" tag="Culture" sub={`Tokyo, Japan · ${fmtShort(addDays(now,40))}–${fmtShort(addDays(now,48))}`} />
        </div>
        {trip.destination && (
          <div style={{ marginTop: 32, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", flexWrap: "wrap", gap: 12 }}>
            <div><div style={{ fontSize: 11, color: C.orange, fontWeight: 700 }}>TRIP IN PROGRESS</div><div style={{ fontWeight: 800, fontSize: 16 }}>{trip.destination} — {trip.type}</div><div style={{ fontSize: 12, color: C.muted }}>Continue building your trip where you left off.</div></div>
            <Btn variant="outline" onClick={() => go(trip.resumeScreen || "tripType")}>Resume trip</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

function Discover() {
  const { go, discoverFilter: filter, setDiscoverFilter: setFilter, now } = useApp();
  const cats = ["Adventure", "Nature", "Hiking", "Luxury", "Photography", "Food"];
  return (
    <div>
      <TopHeader title="Discover" subtitle="Plan with people who share your pace." />
      <div style={{ padding: "20px 28px 60px" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
          <div style={{ flex: "1 1 260px", display: "flex", alignItems: "center", gap: 8, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", background: "#fff" }}><Search size={16} color={C.muted} /><input placeholder="Search destinations, trips or tribes" style={{ border: "none", outline: "none", width: "100%", fontSize: 14 }} /></div>
          <Btn variant="outline" icon={Filter} iconRight={false}>Filters</Btn>
          <Btn onClick={() => go("tripType")} icon={PlusCircle} iconRight={false}>Create trip</Btn>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
          {cats.map((c) => { const on = filter.includes(c);
            return <div key={c} onClick={() => setFilter((f) => (f.includes(c) ? f.filter((x) => x !== c) : [...f, c]))} style={{ padding: "7px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer", border: `1px solid ${on ? C.orange : C.border}`, color: on ? C.orangeDark : C.muted, background: on ? "#FFF0E8" : "#fff" }}>{c}</div>; })}
        </div>
        <div style={{ fontSize: 11, color: C.orange, fontWeight: 700, letterSpacing: 1 }}>AI-POWERED DISCOVERY</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>Find your next escape</div><span style={{ color: C.muted, fontSize: 13 }}>15 experiences</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 20 }}>
          <RecommendedCard name="Ladakh" tag="Adventure" sub={`Leh, India · ${fmtShort(addDays(now,26))}–${fmtShort(addDays(now,32))}`} />
          <RecommendedCard name="Bali" tag="Relaxed" sub={`Bali, Indonesia · ${fmtShort(addDays(now,26))}–${fmtShort(addDays(now,32))}`} />
          <RecommendedCard name="Japan" tag="Culture" sub={`Tokyo, Japan · ${fmtShort(addDays(now,26))}–${fmtShort(addDays(now,32))}`} />
        </div>
        <div style={{ background: "#FFF6F0", border: "1px solid #FFDCC4", borderRadius: 12, padding: 18, display: "flex", gap: 12, alignItems: "flex-start" }}>
          <Sparkles size={20} color={C.orange} />
          <div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}><span style={{ fontSize: 11, fontWeight: 700, color: C.orangeDark, letterSpacing: 0.5 }}>AI SUGGESTION</span><AIBadge /></div>
            <div style={{ fontSize: 14.5, color: C.text }}>Japan in spring might be your perfect match, based on your love for photography and culture.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================== CREATE TRIP WIZARD ============================== */
const TRIP_STEPS = ["Trip type","Region","Destination","Overview","Preferences","Review","Matching","Invite","Tribe","Itinerary","Budget","Live tracking"];

function WizardShell({ stepIndex, title, back, children, onContinue, continueLabel = "Continue", continueDisabled, hideFooter }) {
  return (
    <div>
      <div style={{ padding: "22px 28px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div><div style={{ color: C.orange, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>CREATE A TRIP / STEP {stepIndex + 1} OF {TRIP_STEPS.length}</div><div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>{title}</div></div>
          {!hideFooter && <div style={{ display: "flex", gap: 10 }}><Btn variant="outline" onClick={back} icon={ChevronLeft} iconRight={false}>Back</Btn><Btn onClick={onContinue} icon={ArrowRight} disabled={continueDisabled}>{continueLabel}</Btn></div>}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", margin: "16px 0 18px", fontSize: 12, color: C.muted }}>
          {TRIP_STEPS.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, background: i === stepIndex ? C.orange : i < stepIndex ? C.success : "#EDF1F5", color: i <= stepIndex ? "#fff" : C.muted }}>{i < stepIndex ? <Check size={11} /> : i + 1}</div>
              <span style={{ color: i === stepIndex ? C.text : C.mutedLight, fontWeight: i === stepIndex ? 700 : 500 }}>{s}</span>
              {i < TRIP_STEPS.length - 1 && <div style={{ width: 14, height: 1, background: C.border }} />}
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "0 28px 60px" }}>{children}</div>
    </div>
  );
}

function TripTypeStep() {
  const { trip, setTrip, go } = useApp();
  return (
    <WizardShell stepIndex={0} title="Trip type" back={() => go("discover")} onContinue={() => go("region")} continueDisabled={!trip.type}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 720 }}>
        {[{ k: "Domestic", d: "Explore hidden places closer to home.", img: "Ladakh" }, { k: "International", d: "Go farther with a verified travel tribe.", img: "Switzerland" }].map((o) => (
          <div key={o.k} onClick={() => setTrip((t) => ({ ...t, type: o.k, region: "", destination: "" }))} style={{ borderRadius: 12, overflow: "hidden", border: `2px solid ${trip.type === o.k ? C.orange : C.border}`, cursor: "pointer", background: "#fff" }}>
            <DestImg name={o.img} height={130}>{trip.type === o.k && <div style={{ position: "absolute", top: 10, right: 10, background: C.orange, borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={13} color="#fff" /></div>}</DestImg>
            <div style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div><div style={{ fontWeight: 800, fontSize: 16 }}>{o.k} trip</div><div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{o.d}</div></div>
              <ArrowRight size={16} color={C.orange} />
            </div>
          </div>
        ))}
      </div>
    </WizardShell>
  );
}

function RegionStep() {
  const { trip, setTrip, go } = useApp();
  const regions = trip.type === "Domestic" ? REGIONS_DOM : REGIONS_INTL;
  return (
    <WizardShell stepIndex={1} title={trip.type === "Domestic" ? "Choose a region in India" : "Choose region"} back={() => go("tripType")} onContinue={() => go("destination")} continueDisabled={!trip.region}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: 16 }}>
        {regions.map((r) => (
          <div key={r} onClick={() => setTrip((t) => ({ ...t, region: r, destination: "" }))} style={{ cursor: "pointer" }}>
            <DestImg name={DEST_BY_REGION[r] ? DEST_BY_REGION[r][0] : r} height={100}>{trip.region === r && <div style={{ position: "absolute", top: 8, right: 8, background: C.orange, borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={12} color="#fff" /></div>}</DestImg>
            <div style={{ fontWeight: 700, fontSize: 13.5, marginTop: 8 }}>{r}</div>
          </div>
        ))}
      </div>
    </WizardShell>
  );
}

function DestinationStep() {
  const { trip, setTrip, go } = useApp();
  const dests = DEST_BY_REGION[trip.region] || [];
  const [q, setQ] = useState("");
  const filtered = dests.filter((d) => d.toLowerCase().includes(q.toLowerCase()));
  return (
    <WizardShell stepIndex={2} title={`Popular destinations in ${trip.region}`} back={() => go("region")} onContinue={() => go("overview")} continueDisabled={!trip.destination}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 13px", background: "#fff", maxWidth: 340, marginBottom: 18 }}><Search size={15} color={C.muted} /><input placeholder="Search destination" value={q} onChange={(e) => setQ(e.target.value)} style={{ border: "none", outline: "none", width: "100%", fontSize: 14 }} /></div>
      {filtered.length === 0 ? <EmptyState title="No destinations match your search" body="Try a different spelling or clear your search." /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 16 }}>
          {filtered.map((d) => (
            <div key={d} onClick={() => setTrip((t) => ({ ...t, destination: d }))} style={{ borderRadius: 12, overflow: "hidden", border: `2px solid ${trip.destination === d ? C.orange : C.border}`, cursor: "pointer", background: "#fff" }}>
              <DestImg name={d} height={110}>{trip.destination === d && <div style={{ position: "absolute", top: 8, right: 8, background: C.orange, borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={12} color="#fff" /></div>}</DestImg>
              <div style={{ padding: 12, fontWeight: 700 }}>{d}</div>
            </div>
          ))}
        </div>
      )}
    </WizardShell>
  );
}

function OverviewStep() {
  const { trip, go } = useApp();
  const o = overviewFor(trip.destination);
  const rows = [{ icon: Sunrise, label: "Best time to visit", val: o.bestTime }, { icon: Wallet, label: "Average budget", val: o.avgBudget }, { icon: Clock, label: "Travel duration", val: o.duration }, { icon: Ticket, label: "Visa information", val: o.visa }, { icon: CloudSun, label: "Weather", val: o.weather }];
  return (
    <WizardShell stepIndex={3} title={`About ${trip.destination}`} back={() => go("destination")} onContinue={() => go("preferences")}>
      <DestImg name={trip.destination} height={190}><div style={{ padding: 18, fontSize: 26, fontWeight: 800, color: "#fff" }}>{trip.destination}</div></DestImg>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: 14, marginTop: 20 }}>
        {rows.map((r) => (
          <div key={r.label} style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, background: "#fff", display: "flex", gap: 12 }}>
            <r.icon size={18} color={C.orange} />
            <div><div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>{r.label}</div><div style={{ fontWeight: 700, fontSize: 13.5, marginTop: 2 }}>{r.val}</div></div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20 }}><div style={{ fontWeight: 800, marginBottom: 10 }}>Key experiences</div><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{o.experiences.map((e) => <Badge key={e} tone="navy">{e}</Badge>)}</div></div>
    </WizardShell>
  );
}

function PreferencesStep() {
  const { trip, setTrip, go, now } = useApp();
  const set = (k, v) => setTrip((t) => ({ ...t, [k]: v }));
  const defaultStart = trip.startDate || fmtISO(addDays(now, 26));
  const defaultEnd = trip.endDate || fmtISO(addDays(now, 34));
  const Field = ({ label, children }) => <div style={{ marginBottom: 18 }}><div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{label}</div>{children}</div>;
  const Chips = ({ options, value, onChange, multi }) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map((o) => { const on = multi ? (value || []).includes(o) : value === o;
        return <div key={o} onClick={() => onChange(multi ? (on ? value.filter((x) => x !== o) : [...(value || []), o]) : o)} style={{ padding: "7px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer", border: `1px solid ${on ? C.orange : C.border}`, background: on ? "#FFF0E8" : "#fff", color: on ? C.orangeDark : C.text }}>{o}</div>; })}
    </div>
  );
  return (
    <WizardShell stepIndex={4} title="Trip preferences" back={() => go("overview")} onContinue={() => go("review")}>
      <div style={{ maxWidth: 640 }}>
        <Field label={`Budget range — up to ₹${(trip.budgetMax || 220000).toLocaleString("en-IN")}`}><input type="range" min={30000} max={300000} step={10000} value={trip.budgetMax || 220000} onChange={(e) => set("budgetMax", Number(e.target.value))} style={{ width: "100%", accentColor: C.orange }} /></Field>
        <Field label="Travel dates">
          <div style={{ display: "flex", gap: 10 }}>
            <input type="date" value={defaultStart} onChange={(e) => set("startDate", e.target.value)} style={{ ...fieldStyle, background: "#fff", color: C.text, border: `1px solid ${C.border}`, flex: 1 }} />
            <input type="date" value={defaultEnd} onChange={(e) => set("endDate", e.target.value)} style={{ ...fieldStyle, background: "#fff", color: C.text, border: `1px solid ${C.border}`, flex: 1 }} />
          </div>
        </Field>
        <Field label="Group size"><Chips options={["2-3","4-6","7-10","10+"]} value={trip.groupSize} onChange={(v) => set("groupSize", v)} /></Field>
        <Field label="Travel style"><Chips options={["Adventure","Luxury","Backpacking","Relaxed","Culture"]} value={trip.style || []} onChange={(v) => set("style", v)} multi /></Field>
        <Field label="Age preference"><Chips options={["18-25","20-30","25-35","35+","Any"]} value={trip.agePref} onChange={(v) => set("agePref", v)} /></Field>
        <Field label="Gender preference"><Chips options={["Any","Same gender only","Mixed"]} value={trip.genderPref} onChange={(v) => set("genderPref", v)} /></Field>
        <Field label="Adventure level"><Chips options={["Low","Moderate","High","Extreme"]} value={trip.adventureLevel} onChange={(v) => set("adventureLevel", v)} /></Field>
        <Field label="Accommodation"><Chips options={["Hostel","Hotel","Homestay","Resort"]} value={trip.accommodation} onChange={(v) => set("accommodation", v)} /></Field>
        <Field label="Pace"><Chips options={["Slow & easy","Balanced","Packed & fast"]} value={trip.pace} onChange={(v) => set("pace", v)} /></Field>
        <Field label="Interests"><Chips options={INTERESTS} value={trip.interests || []} onChange={(v) => set("interests", v)} multi /></Field>
      </div>
    </WizardShell>
  );
}

function ReviewStep() {
  const { trip, go, now } = useApp();
  const start = trip.startDate ? new Date(trip.startDate) : addDays(now, 26);
  const end = trip.endDate ? new Date(trip.endDate) : addDays(now, 34);
  const rows = [["Destination", trip.destination], ["Trip type", trip.type], ["Region", trip.region], ["Dates", `${fmtLong(start)} – ${fmtLong(end)}`], ["Budget", `up to ₹${(trip.budgetMax || 220000).toLocaleString("en-IN")}`], ["Group size", trip.groupSize || "4-6"], ["Travel style", (trip.style || []).join(", ") || "Adventure"], ["Pace", trip.pace || "Balanced"]];
  return (
    <WizardShell stepIndex={5} title="Review & publish" back={() => go("preferences")} onContinue={() => go("matching")} continueLabel="Find travelers">
      <div style={{ maxWidth: 560, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", background: "#fff" }}>
        <DestImg name={trip.destination} height={150}><div style={{ padding: 16, color: "#fff", fontWeight: 800, fontSize: 20 }}>{trip.destination} Trip</div></DestImg>
        {rows.map(([k, v]) => <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "12px 18px", borderBottom: `1px solid ${C.border}` }}><span style={{ color: C.muted, fontSize: 13 }}>{k}</span><span style={{ fontWeight: 700, fontSize: 13 }}>{v}</span></div>)}
      </div>
    </WizardShell>
  );
}

function MatchingStep() {
  const { trip, go, invite, setInvite } = useApp();
  const [phase, setPhase] = useState("loading");
  const [viewing, setViewing] = useState(null);
  useEffect(() => { setPhase("loading"); const t = setTimeout(() => setPhase("results"), 1500); return () => clearTimeout(t); }, []);
  const wantInterests = trip.interests || [];
  const strict = wantInterests.length ? TRAVELERS.filter((t) => t.interests.some((i) => wantInterests.includes(i))) : TRAVELERS;
  const usedFallback = wantInterests.length > 0 && strict.length === 0;
  const list = strict.length ? strict : TRAVELERS;

  if (phase === "loading") {
    return (
      <WizardShell stepIndex={6} title="VoyAi matching" back={() => go("review")} hideFooter>
        <Spinner label={<><b>Finding the best matches for your trip…</b><br />VoyAi is analyzing budget, dates, interests and travel style.</>} />
      </WizardShell>
    );
  }
  return (
    <WizardShell stepIndex={6} title="Compatible travelers" back={() => go("review")} onContinue={() => go("invite")} continueLabel="Continue" continueDisabled={!invite.target}>
      <div style={{ background: "#FFF6F0", border: "1px solid #FFDCC4", borderRadius: 10, padding: 14, marginBottom: 10, fontSize: 14, display: "flex", gap: 10, alignItems: "flex-start" }}>
        <Sparkles size={17} color={C.orange} />
        <div>VoyAi found travelers who match your {(trip.style || ["adventure"]).join("/").toLowerCase()} style, budget and travel dates. <AIBadge /></div>
      </div>
      <div style={{ fontSize: 11.5, color: C.mutedLight, marginBottom: 18 }}>Compatibility scores are AI-generated estimates for this demo — not a verified guarantee of trip outcomes.</div>
      {usedFallback && <div style={{ marginBottom: 16 }}><Badge tone="muted">No exact interest matches — showing top overall travelers instead</Badge></div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 18 }}>
        {list.map((t) => (
          <div key={t.id} style={{ background: C.navy, borderRadius: 14, padding: 20, color: "#fff" }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
              <Avatar initials={t.init} color={t.color} size={50} />
              <div><div style={{ fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", gap: 6 }}>{t.name} <ShieldCheck size={13} color={C.success} /></div><div style={{ fontSize: 12, color: C.mutedLight }}>{t.age} · {t.location}</div><div style={{ fontSize: 12, color: C.orange, fontWeight: 600, marginTop: 2 }}>{t.style}</div></div>
              <div style={{ marginLeft: "auto" }}><MatchRing value={t.match} size={64} /></div>
            </div>
            <MeterRow label="Budget match" value={t.budget} /><MeterRow label="Travel style" value={t.style_m} /><MeterRow label="Interests" value={t.interests_m} /><MeterRow label="Availability" value={t.avail} />
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <Btn variant="outline" full onClick={() => setViewing(t)}>View profile</Btn>
              <Btn full onClick={() => setInvite({ target: t, status: "sent" })}>{invite.target?.id === t.id ? "Selected ✓" : "Invite"}</Btn>
            </div>
          </div>
        ))}
      </div>
      {viewing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(6,26,51,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 90, padding: 16 }} onClick={() => setViewing(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 400, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><Avatar initials={viewing.init} color={viewing.color} size={54} /><X size={18} style={{ cursor: "pointer" }} onClick={() => setViewing(null)} /></div>
            <div style={{ fontWeight: 800, fontSize: 18, marginTop: 12, display: "flex", alignItems: "center", gap: 6 }}>{viewing.name} <ShieldCheck size={14} color={C.success} /></div>
            <div style={{ color: C.muted, fontSize: 13, marginBottom: 10 }}>{viewing.age} · {viewing.location} · {viewing.style}</div>
            <div style={{ fontSize: 14, color: C.text, marginBottom: 14 }}>{viewing.bio}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>{viewing.interests.map((i) => <Badge key={i} tone="navy">{i}</Badge>)}</div>
            <Btn full onClick={() => { setInvite({ target: viewing, status: "sent" }); setViewing(null); }}>Invite {viewing.name.split(" ")[0]}</Btn>
          </div>
        </div>
      )}
    </WizardShell>
  );
}

function InviteStep() {
  const { trip, invite, setInvite, go, addNotification, now } = useApp();
  const t = invite.target;
  const start = trip.startDate ? new Date(trip.startDate) : addDays(now, 26);
  const end = trip.endDate ? new Date(trip.endDate) : addDays(now, 34);
  useEffect(() => { if (t) addNotification("Invitation sent", `${t.name} will be notified about your invitation.`, "invite", "invite"); }, []); // eslint-disable-line
  return (
    <WizardShell stepIndex={7} title="Invitation sent" back={() => go("matching")} onContinue={() => go("acceptInvite")} continueLabel="Simulate: traveler responds">
      <div style={{ maxWidth: 480, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, padding: 26, textAlign: "center" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#FFF0E8", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><Send size={26} color={C.orange} /></div>
        <div style={{ fontSize: 19, fontWeight: 800 }}>Invitation sent</div>
        <div style={{ color: C.muted, fontSize: 14, marginTop: 6, marginBottom: 18 }}>{t?.name} will be notified about your invitation.</div>
        <div style={{ textAlign: "left", background: C.bg, borderRadius: 10, padding: 16, fontSize: 13.5 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ color: C.muted }}>Destination</span><b>{trip.destination}</b></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ color: C.muted }}>Dates</span><b>{fmtShort(start)} – {fmtShort(end)}</b></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: C.muted }}>Match</span><b>{t?.match}%</b></div>
        </div>
        <div style={{ marginTop: 16 }}><Btn variant="danger" size="sm" onClick={() => { setInvite({}); go("matching"); }}>Cancel invitation</Btn></div>
      </div>
    </WizardShell>
  );
}

function AcceptInviteStep() {
  const { trip, invite, setInvite, go, addNotification } = useApp();
  return (
    <WizardShell stepIndex={7} title="You're invited! (recipient view)" back={() => go("invite")} hideFooter>
      <div style={{ maxWidth: 460, background: C.navy, color: "#fff", borderRadius: 16, padding: 26 }}>
        <DestImg name={trip.destination} height={130} />
        <div style={{ marginTop: 16, fontSize: 20, fontWeight: 800 }}>{trip.destination} Explorer Tribe</div>
        <div style={{ color: C.mutedLight, fontSize: 13, margin: "8px 0 14px" }}>{trip.destination} trip · demo recipient preview</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}><Badge tone="navy">1/5 members</Badge><Badge>{invite.target?.match}% match</Badge></div>
        <div style={{ display: "flex", gap: 12 }}>
          <Btn variant="outline" full onClick={() => { setInvite({}); go("matching"); }}>Decline</Btn>
          <Btn full onClick={() => { addNotification("Invitation accepted", `${invite.target?.name} accepted your invitation.`, "invite", "confirmCommitment"); go("confirmCommitment"); }}>Accept invite</Btn>
        </div>
      </div>
    </WizardShell>
  );
}

function ConfirmCommitmentStep() {
  const { go } = useApp();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [status, setStatus] = useState("idle");
  const refs = useRef([]);
  const setDigit = (i, v) => { const n = [...otp]; n[i] = v.replace(/\D/g, "").slice(-1); setOtp(n); if (v && i < 5) refs.current[i + 1]?.focus(); };
  const confirm = () => { if (otp.some((d) => d === "")) { setStatus("error"); return; } setStatus("verifying"); setTimeout(() => go("tribeCreated"), 900); };
  return (
    <WizardShell stepIndex={8} title="Confirm your commitment" back={() => go("acceptInvite")} onContinue={confirm} continueLabel="Confirm tribe">
      <div style={{ maxWidth: 420, background: C.navy, color: "#fff", borderRadius: 14, padding: 26 }}>
        <div style={{ marginBottom: 16, color: C.mutedLight, fontSize: 14 }}>Enter the 6-digit code sent to your number to confirm your spot in the tribe.</div>
        <div style={{ display: "flex", gap: 8 }}>{otp.map((d, i) => <input key={i} ref={(el) => (refs.current[i] = el)} value={d} onChange={(e) => setDigit(i, e.target.value)} maxLength={1} style={{ ...fieldStyle, width: 44, textAlign: "center", fontSize: 20, fontWeight: 700 }} />)}</div>
        {status === "error" && <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#FCA5A5", fontSize: 13, marginTop: 12 }}><AlertTriangle size={13} /> Enter all 6 digits to confirm.</div>}
        {status === "verifying" && <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.mutedLight, fontSize: 13, marginTop: 12 }}><Loader2 size={13} className="voyara-spin" /> Confirming…</div>}
      </div>
    </WizardShell>
  );
}

function TribeCreatedStep() {
  const { trip, go, setTribeActive, addNotification } = useApp();
  useEffect(() => { addNotification("Tribe created! 🎉", `Your ${trip.destination} tribe is ready to make memories.`, "trip", "tribeDashboard"); }, []); // eslint-disable-line
  return (
    <WizardShell stepIndex={8} title="" back={() => go("confirmCommitment")} hideFooter>
      <div style={{ maxWidth: 460, textAlign: "center", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 16, padding: 34 }}>
        <PartyPopper size={40} color={C.orange} />
        <div style={{ fontSize: 24, fontWeight: 800, margin: "14px 0 6px" }}>Tribe created!</div>
        <div style={{ color: C.muted, fontSize: 14, marginBottom: 20 }}>Your {trip.destination} tribe is ready to make memories.</div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>{["AS","RK","MI","AN","SR"].map((i, idx) => <div key={i} style={{ marginLeft: idx ? -10 : 0 }}><Avatar initials={i} color={["#FF6B22","#FF6B22","#5AA7D6","#4fae7a","#a06bd6"][idx]} size={38} /></div>)}</div>
        <Badge tone="success">5/5 members confirmed</Badge>
        <div style={{ marginTop: 22 }}><Btn onClick={() => { setTribeActive(true); go("tribeDashboard"); }} icon={ArrowRight}>Open tribe chat</Btn></div>
      </div>
    </WizardShell>
  );
}

/* ============================== TRIBE ============================== */
const TRIBE_TABS = [{ key: "tribeDashboard", label: "Overview", icon: Users }, { key: "tribeChat", label: "Chat", icon: MessagesSquare }, { key: "tribeItinerary", label: "Itinerary", icon: Route }, { key: "tribeBudget", label: "Budget", icon: PiggyBank }, { key: "tribeTracking", label: "Live tracking", icon: Navigation }];

function TribeTabs({ screen }) {
  const { go } = useApp();
  return (
    <div style={{ display: "flex", gap: 6, borderBottom: `1px solid ${C.border}`, padding: "0 28px", overflowX: "auto" }}>
      {TRIBE_TABS.map((t) => { const active = screen === t.key;
        return <div key={t.key} onClick={() => go(t.key)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 16px", borderBottom: `2px solid ${active ? C.orange : "transparent"}`, color: active ? C.text : C.muted, fontWeight: active ? 700 : 500, fontSize: 13.5, cursor: "pointer", whiteSpace: "nowrap" }}><t.icon size={14} /> {t.label}</div>; })}
    </div>
  );
}

const TRIBE_MEMBERS = [{ n: "You", i: "AS", c: C.orange }, { n: "Rahul Kumar", i: "RK", c: "#FF6B22" }, { n: "Meera Iyer", i: "MI", c: "#5AA7D6" }, { n: "Arjun Nair", i: "AN", c: "#4fae7a" }, { n: "Sneha Rao", i: "SR", c: "#a06bd6" }];

function TribeDashboard() {
  const { trip, now } = useApp();
  const start = trip.startDate ? new Date(trip.startDate) : addDays(now, 26);
  const end = trip.endDate ? new Date(trip.endDate) : addDays(now, 34);
  return (
    <div>
      <TopHeader title={`${trip.destination} Explorer Tribe`} subtitle={`${fmtShort(start)} – ${fmtLong(end)} · 5 members`} />
      <TribeTabs screen="tribeDashboard" />
      <div style={{ padding: "24px 28px 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 26 }}>
          {[["Destination", trip.destination], ["Members", "5/5"], ["Budget", `₹${(trip.budgetMax || 250000).toLocaleString("en-IN")}`], ["Trip progress", "Planning stage"]].map(([k, v]) => (
            <div key={k} style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, background: "#fff" }}><div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase" }}>{k}</div><div style={{ fontWeight: 800, fontSize: 17, marginTop: 4 }}>{v}</div></div>
          ))}
        </div>
        <div style={{ fontWeight: 800, marginBottom: 12 }}>Members</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
          {TRIBE_MEMBERS.map((m) => (
            <div key={m.n} style={{ display: "flex", alignItems: "center", gap: 10, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", background: "#fff" }}>
              <Avatar initials={m.i} color={m.c} size={34} /><div><div style={{ fontWeight: 700, fontSize: 13 }}>{m.n}</div><div style={{ fontSize: 11, color: C.success, display: "flex", alignItems: "center", gap: 3 }}><ShieldCheck size={10} /> Verified</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const VOYAI_QUICK = ["Fit Shibuya and Tokyo Tower into Day 2?", "Optimize our budget.", "Suggest restaurants.", "What should we pack?"];

function TribeChat() {
  const { trip, messages, setMessages, addNotification } = useApp();
  const [text, setText] = useState("");
  const [askVoy, setAskVoy] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, aiTyping]);
  const send = () => { if (!text.trim()) return; setMessages((m) => [...m, { id: Date.now(), from: "You", init: "AS", color: C.orange, text, me: true }]); setText(""); };
  const simulateIncoming = () => {
    const t = "Just checking — are we still meeting at the hotel lobby at 9?";
    setMessages((m) => [...m, { id: Date.now(), from: "Rahul Kumar", init: "RK", color: "#FF6B22", text: t, me: false }]);
    addNotification("New message from Rahul Kumar", t, "chat", "tribeChat");
  };
  const askVoyAi = (prompt) => {
    setMessages((m) => [...m, { id: Date.now(), from: "You", init: "AS", color: C.orange, text: prompt, me: true }]);
    setAiTyping(true);
    let reply = "Here's what I found based on your itinerary and budget.";
    const p = prompt.toLowerCase();
    if (p.includes("shibuya")) reply = "Yes — based on your current itinerary, I recommend Shibuya in the afternoon and Tokyo Tower around sunset.";
    if (p.includes("budget")) reply = "Moving your accommodation one neighborhood away could reduce the estimated stay cost by about 14%.";
    if (p.includes("pack")) reply = "For your dates and destination: light layers, a rain shell, comfortable walking shoes, and a portable charger.";
    if (p.includes("restaurant")) reply = "Try a local izakaya near Shibuya for dinner, and a ramen counter near the station for a quick lunch.";
    setTimeout(() => { setMessages((m) => [...m, { id: Date.now() + 1, from: "VoyAi", init: "AI", color: C.aiBlue, text: reply, me: false, ai: true }]); setAiTyping(false); }, 900);
  };
  return (
    <div>
      <TopHeader title={`${trip.destination} Explorer Tribe`} subtitle="Tribe chat" />
      <TribeTabs screen="tribeChat" />
      <div style={{ padding: "18px 28px 20px", display: "flex", flexDirection: "column", height: "calc(100vh - 210px)" }}>
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 12.5, color: C.muted, marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}><MapPin size={13} color={C.orange} /> Pinned: {trip.destination} · 5 members</span>
          <span onClick={simulateIncoming} style={{ color: C.aiBlue, fontWeight: 600, cursor: "pointer", fontSize: 12 }}>Simulate incoming message</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 }}>
          {messages.length === 0 && <EmptyState icon={MessagesSquare} title="No messages yet" body="Say hello to kick off the trip chat." />}
          {messages.map((m) => (
            <div key={m.id} style={{ display: "flex", justifyContent: m.me ? "flex-end" : "flex-start", gap: 8 }}>
              {!m.me && <Avatar initials={m.init} color={m.color} size={30} />}
              <div style={{ maxWidth: 360 }}>
                {!m.me && <div style={{ fontSize: 11, color: C.muted, marginBottom: 2, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>{m.from}{m.ai && <AIBadge text="AI" />}</div>}
                <div style={{ background: m.me ? C.orange : m.ai ? C.aiBlueBg : "#fff", color: m.me ? "#fff" : C.text, border: m.me ? "none" : `1px solid ${C.border}`, borderRadius: 12, padding: "10px 14px", fontSize: 14 }}>{m.text}</div>
              </div>
              {m.me && <Avatar initials="AS" color={C.orange} size={30} />}
            </div>
          ))}
          {aiTyping && <div style={{ display: "flex", gap: 8 }}><Avatar initials="AI" color={C.aiBlue} size={30} /><div style={{ background: C.aiBlueBg, borderRadius: 12, padding: "10px 14px", fontSize: 13, color: C.muted }}><Loader2 size={12} className="voyara-spin" style={{ marginRight: 6, verticalAlign: "middle" }} />VoyAi is thinking…</div></div>}
          <div ref={endRef} />
        </div>
        {askVoy && <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>{VOYAI_QUICK.map((p) => <div key={p} onClick={() => { askVoyAi(p); setAskVoy(false); }} style={{ border: "1px solid #C9DEF5", background: C.aiBlueBg, color: "#245", borderRadius: 20, padding: "7px 13px", fontSize: 12.5, cursor: "pointer", fontWeight: 600 }}>{p}</div>)}</div>}
        <div style={{ display: "flex", gap: 10 }}>
          <div onClick={() => setAskVoy((v) => !v)} style={{ display: "flex", alignItems: "center", gap: 6, background: C.aiBlueBg, color: C.aiBlue, borderRadius: 8, padding: "0 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}><Sparkles size={14} /> Ask VoyAi</div>
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Type a message…" style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none" }} />
          <Btn onClick={send} icon={Send} iconRight={false}>Send</Btn>
        </div>
      </div>
    </div>
  );
}

function TribeItinerary() {
  const { trip, itinerary, setItinerary, go, addNotification } = useApp();
  const [active, setActive] = useState(0);
  const [newText, setNewText] = useState("");
  const [editing, setEditing] = useState(null);
  const day = itinerary[active];
  const addActivity = () => { if (!newText.trim()) return; setItinerary((it) => it.map((d, i) => i === active ? { ...d, items: [...d.items, { id: `i${Date.now()}`, text: newText }] } : d)); setNewText(""); addNotification("Itinerary updated", `${newText} added to ${day.day}.`, "trip", "tribeItinerary"); };
  const removeActivity = (id) => setItinerary((it) => it.map((d, i) => i === active ? { ...d, items: d.items.filter((x) => x.id !== id) } : d));
  const saveEdit = (id, text) => { setItinerary((it) => it.map((d, i) => i === active ? { ...d, items: d.items.map((x) => x.id === id ? { ...x, text } : x) } : d)); setEditing(null); };
  const move = (idx, dir) => { const items = [...day.items]; const j = idx + dir; if (j < 0 || j >= items.length) return; [items[idx], items[j]] = [items[j], items[idx]]; setItinerary((it) => it.map((d, i) => i === active ? { ...d, items } : d)); };
  return (
    <div>
      <TopHeader title={`${trip.destination} Explorer Tribe`} subtitle="Day-by-day itinerary" />
      <TribeTabs screen="tribeItinerary" />
      <div style={{ padding: "20px 28px 60px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto" }}>
          {itinerary.map((d, i) => <div key={d.day} onClick={() => setActive(i)} style={{ padding: "9px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", background: active === i ? C.navy : "#fff", color: active === i ? "#fff" : C.text, border: `1px solid ${active === i ? C.navy : C.border}` }}>{d.day}</div>)}
        </div>
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 14, padding: 22, background: "#fff", maxWidth: 560 }}>
          <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 14 }}>{day.day} — {day.title}</div>
          {day.items.length === 0 ? <EmptyState title="No activities yet" body="Add your first activity for this day." /> : day.items.map((it, idx) => (
            <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: idx < day.items.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.orange, flexShrink: 0 }} />
              {editing === it.id ? (
                <input autoFocus defaultValue={it.text} onKeyDown={(e) => e.key === "Enter" && saveEdit(it.id, e.currentTarget.value)} onBlur={(e) => saveEdit(it.id, e.currentTarget.value)} style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 8px", fontSize: 14 }} />
              ) : <span style={{ fontSize: 14, flex: 1 }}>{it.text}</span>}
              <ChevronUp size={14} color={C.mutedLight} style={{ cursor: "pointer" }} onClick={() => move(idx, -1)} />
              <ChevronDown size={14} color={C.mutedLight} style={{ cursor: "pointer" }} onClick={() => move(idx, 1)} />
              <Edit3 size={14} color={C.mutedLight} style={{ cursor: "pointer" }} onClick={() => setEditing(it.id)} />
              <Trash2 size={14} color={C.danger} style={{ cursor: "pointer" }} onClick={() => removeActivity(it.id)} />
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <input value={newText} onChange={(e) => setNewText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addActivity()} placeholder="Add an activity…" style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 13.5 }} />
            <Btn size="sm" icon={PlusCircle} iconRight={false} onClick={addActivity}>Add</Btn>
          </div>
          <div style={{ marginTop: 12 }}><Btn variant="ghost" size="sm" icon={Sparkles} iconRight={false} onClick={() => go("tribeChat")}>Ask VoyAi</Btn></div>
        </div>
      </div>
    </div>
  );
}

function TribeBudget() {
  const { trip, expenses, setExpenses, addNotification } = useApp();
  const total = trip.budgetMax || 250000, baseCollected = Math.round(total * 0.62), per = Math.round(total / 5);
  const spent = expenses.reduce((s, e) => s + e.amount, 0);
  const collected = baseCollected + spent;
  const [adding, setAdding] = useState(false);
  const [cat, setCat] = useState("Food");
  const [amt, setAmt] = useState("");
  const submit = () => { const n = Number(amt); if (!n || n <= 0) return; setExpenses((e) => [...e, { id: Date.now(), category: cat, amount: n }]); addNotification("Expense added", `₹${n.toLocaleString("en-IN")} added under ${cat}.`, "trip", "tribeBudget"); setAmt(""); setAdding(false); };
  let acc = 0; const size = 160, r = 60, c = 2 * Math.PI * r;
  return (
    <div>
      <TopHeader title={`${trip.destination} Explorer Tribe`} subtitle="Budget planner" />
      <TribeTabs screen="tribeBudget" />
      <div style={{ padding: "20px 28px 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 26, maxWidth: 700 }}>
          {[["Total budget", total], ["Collected", collected], ["Per person", per]].map(([k, v]) => <div key={k} style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, background: "#fff" }}><div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase" }}>{k}</div><div style={{ fontWeight: 800, fontSize: 18, marginTop: 4 }}>₹{v.toLocaleString("en-IN")}</div></div>)}
        </div>
        <div style={{ display: "flex", gap: 40, flexWrap: "wrap", alignItems: "flex-start" }}>
          <svg width={size} height={size}>{BUDGET_CATS.map((cat2) => { const len = (cat2.pct / 100) * c, dash = `${len} ${c - len}`, off = -acc; acc += len; return <circle key={cat2.name} cx={size / 2} cy={size / 2} r={r} stroke={cat2.color} strokeWidth="22" fill="none" strokeDasharray={dash} strokeDashoffset={off} transform={`rotate(-90 ${size / 2} ${size / 2})`} />; })}</svg>
          <div>
            {BUDGET_CATS.map((cat2) => <div key={cat2.name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}><div style={{ width: 12, height: 12, borderRadius: 3, background: cat2.color }} /><span style={{ fontSize: 13.5, fontWeight: 600 }}>{cat2.name}</span><span style={{ fontSize: 13, color: C.muted, marginLeft: 6 }}>{cat2.pct}%</span></div>)}
            {adding ? (
              <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                <select value={cat} onChange={(e) => setCat(e.target.value)} style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 8px", fontSize: 13 }}>{BUDGET_CATS.map((c2) => <option key={c2.name}>{c2.name}</option>)}</select>
                <input placeholder="Amount ₹" value={amt} onChange={(e) => setAmt(e.target.value)} style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 8px", fontSize: 13, width: 100 }} />
                <Btn size="sm" onClick={submit}>Add</Btn><Btn size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Btn>
              </div>
            ) : <Btn size="sm" variant="outline" icon={PlusCircle} iconRight={false} onClick={() => setAdding(true)}>Add expense</Btn>}
          </div>
        </div>
        <div style={{ marginTop: 24, maxWidth: 500 }}>
          {expenses.length === 0 ? <div style={{ fontSize: 12.5, color: C.mutedLight }}>No expenses added yet.</div> : expenses.slice().reverse().map((e) => <div key={e.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: `1px solid ${C.border}` }}><span>{e.category}</span><b>₹{e.amount.toLocaleString("en-IN")}</b></div>)}
        </div>
        <div style={{ marginTop: 26, background: "#FFF6F0", border: "1px solid #FFDCC4", borderRadius: 12, padding: 16, display: "flex", gap: 10, alignItems: "flex-start", maxWidth: 600 }}>
          <Sparkles size={18} color={C.orange} />
          <div style={{ fontSize: 13.5 }}><b>VoyAi:</b> Moving your accommodation one neighborhood away could reduce the estimated stay cost by 14%. <AIBadge /></div>
        </div>
      </div>
    </div>
  );
}

function TribeTracking() {
  const { trip, tracking, setTracking, addNotification } = useApp();
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (!tracking) { setLoading(false); return; } setLoading(true); const t = setTimeout(() => setLoading(false), 900); return () => clearTimeout(t); }, [tracking]);
  return (
    <div>
      <TopHeader title={`${trip.destination} Explorer Tribe`} subtitle="Live tracking (opt-in)" />
      <TribeTabs screen="tribeTracking" />
      <div style={{ padding: "20px 28px 60px" }}>
        <div style={{ maxWidth: 680, borderRadius: 14, overflow: "hidden", border: `1px solid ${C.border}` }}>
          <div style={{ height: 260, background: tracking ? "linear-gradient(135deg,#0d2438,#3fa6c9)" : "#EDF1F5", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {!tracking ? <EmptyState icon={Lock} title="Tracking is off" body="Turn it on to see your tribe's live location." /> : loading ? <Spinner label="Fetching live locations…" /> : (
              <>{[["30%","40%","AS",C.orange], ["55%","55%","RK","#FF6B22"], ["40%","70%","MI","#5AA7D6"]].map(([t,l,i,c],idx) => <div key={idx} style={{ position: "absolute", top: t, left: l }}><Avatar initials={i} color={c} size={30} /></div>)}</>
            )}
          </div>
          <div style={{ padding: 18, background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <Badge tone={tracking ? "success" : "muted"}>{tracking ? "Tracking is ON" : "Tracking is OFF"}</Badge>
              <div style={{ fontSize: 12.5, color: C.muted, marginTop: 8 }}>Location sharing is optional and only visible to your tribe. You can turn it off anytime.</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn variant="outline" size="sm" onClick={() => setTracking((v) => !v)}>{tracking ? "Turn tracking off" : "Turn tracking on"}</Btn>
              <Btn size="sm" icon={MapPin} iconRight={false} disabled={!tracking} onClick={() => addNotification("Location shared", "Your live location was shared with your tribe.", "trip", "tribeTracking")}>Share location</Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================== SIDE PAGES ============================== */
function MyTrips() {
  const { go, trip } = useApp();
  return (
    <div>
      <TopHeader title="My Trips" subtitle="Everything you're planning and traveling." />
      <div style={{ padding: "22px 28px 60px" }}>
        {trip.destination ? (
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", background: "#fff", maxWidth: 420 }}>
            <DestImg name={trip.destination} height={130}><Badge>In progress</Badge></DestImg>
            <div style={{ padding: 16 }}><div style={{ fontWeight: 800, fontSize: 16 }}>{trip.destination} Explorer Tribe</div><div style={{ color: C.muted, fontSize: 13, margin: "4px 0 14px" }}>Planning stage</div><Btn full onClick={() => go(trip.resumeScreen || "tripType")}>Continue planning</Btn></div>
          </div>
        ) : <EmptyState icon={Briefcase} title="No trips yet" body="Start building your first trip and VoyAi will help find your tribe." action={<Btn onClick={() => go("tripType")} icon={PlusCircle} iconRight={false}>Create trip</Btn>} />}
      </div>
    </div>
  );
}

function TribesPage() {
  const { go, tribeActive, trip } = useApp();
  return (
    <div>
      <TopHeader title="Tribes" subtitle="Your verified travel communities." />
      <div style={{ padding: "22px 28px 60px" }}>
        {tribeActive ? (
          <div onClick={() => go("tribeDashboard")} style={{ cursor: "pointer", border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", background: "#fff", maxWidth: 420 }}>
            <DestImg name={trip.destination} height={110} />
            <div style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><div style={{ fontWeight: 800 }}>{trip.destination} Explorer Tribe</div><div style={{ fontSize: 12, color: C.muted }}>5 members · Active</div></div><ArrowRight size={16} color={C.orange} /></div>
          </div>
        ) : <EmptyState icon={Users} title="No tribes yet" body="Create a trip to get matched with a verified travel tribe." action={<Btn onClick={() => go("tripType")} icon={PlusCircle} iconRight={false}>Create trip</Btn>} />}
      </div>
    </div>
  );
}

function ProfilePage() {
  const { profile, go } = useApp();
  return (
    <div>
      <TopHeader title="Profile" />
      <div style={{ padding: "22px 28px 60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Avatar initials={profile.initials} size={64} />
            <div><div style={{ fontWeight: 800, fontSize: 19 }}>{profile.name}</div><div style={{ color: C.success, fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}><ShieldCheck size={13} /> Verified traveler</div></div>
          </div>
          <Btn variant="outline" icon={Edit3} iconRight={false} onClick={() => go("settings")}>Edit profile & settings</Btn>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, background: "#fff" }}><div style={{ fontWeight: 700, marginBottom: 8 }}>Interests</div><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{profile.interests.length ? profile.interests.map((i) => <Badge key={i} tone="navy">{i}</Badge>) : <span style={{ fontSize: 12.5, color: C.mutedLight }}>None selected yet.</span>}</div></div>
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, background: "#fff" }}><div style={{ fontWeight: 700, marginBottom: 8 }}>Traveler type</div><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{profile.motto.length ? profile.motto.map((i) => <Badge key={i}>{i}</Badge>) : <span style={{ fontSize: 12.5, color: C.mutedLight }}>None selected yet.</span>}</div></div>
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, background: "#fff" }}><div style={{ fontWeight: 700, marginBottom: 8 }}>Dream destinations</div><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{profile.dreamDest.length ? profile.dreamDest.map((i) => <Badge key={i} tone="muted">{i}</Badge>) : <span style={{ fontSize: 12.5, color: C.mutedLight }}>None selected yet.</span>}</div></div>
        </div>
      </div>
    </div>
  );
}

function SettingsPage() {
  const { profile, setProfile, go, privacy, setPrivacy, notifPrefs, setNotifPrefs, tracking, setTracking, addNotification, resetDemo } = useApp();
  const toggleI = (i) => setProfile((p) => ({ ...p, interests: p.interests.includes(i) ? p.interests.filter((x) => x !== i) : [...p.interests, i] }));
  const Toggle = ({ on, onClick }) => <div onClick={onClick} style={{ width: 40, height: 22, borderRadius: 20, background: on ? C.orange : "#CBD5E1", position: "relative", cursor: "pointer", flexShrink: 0 }}><div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: on ? 21 : 3, transition: "left .15s" }} /></div>;
  const Row = ({ label, sub, on, onClick, icon: Icon }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>{Icon && <Icon size={16} color={C.muted} style={{ marginTop: 2 }} />}<div><div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>{sub && <div style={{ fontSize: 12, color: C.muted }}>{sub}</div>}</div></div>
      <Toggle on={on} onClick={onClick} />
    </div>
  );
  return (
    <div>
      <TopHeader title="Edit profile & settings" />
      <div style={{ padding: "22px 28px 60px", maxWidth: 620 }}>
        <div onClick={() => go("profile")} style={{ display: "flex", alignItems: "center", gap: 6, color: C.muted, fontSize: 13, cursor: "pointer", marginBottom: 18 }}><ArrowLeft size={14} /> Back to profile</div>

        <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, marginBottom: 18 }}>
          <div style={{ fontWeight: 800, marginBottom: 12 }}>Basic info</div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Full name</div>
          <input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value, initials: e.target.value.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "AS" }))} style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", fontSize: 14 }} />
        </div>

        <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, marginBottom: 18 }}>
          <div style={{ fontWeight: 800, marginBottom: 12 }}>Travel interests</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{INTERESTS.map((i) => { const on = profile.interests.includes(i); const Icon = INTEREST_ICON[i]; return <div key={i} onClick={() => toggleI(i)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 20, cursor: "pointer", border: `1px solid ${on ? C.orange : C.border}`, background: on ? "#FFF0E8" : "#fff", color: on ? C.orangeDark : C.text, fontSize: 12.5, fontWeight: 600 }}><Icon size={12} /> {i}</div>; })}</div>
        </div>

        <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, marginBottom: 18 }}>
          <div style={{ fontWeight: 800, marginBottom: 4 }}>Privacy & safety</div>
          <Row icon={MapPin} label="Location sharing with tribe" sub="Lets tribe members see you on the live tracking map" on={tracking} onClick={() => setTracking((v) => !v)} />
          <Row icon={Eye} label="Profile visible to potential tribes" sub="Allow VoyAi to surface your profile in matching" on={privacy.visible} onClick={() => setPrivacy((p) => ({ ...p, visible: !p.visible }))} />
          <Row icon={Lock} label="Show verification badge publicly" sub="Display your verified traveler status on your profile" on={privacy.showVerified} onClick={() => setPrivacy((p) => ({ ...p, showVerified: !p.showVerified }))} />
        </div>

        <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, marginBottom: 18 }}>
          <div style={{ fontWeight: 800, marginBottom: 4 }}>Notification preferences</div>
          <Row label="Invitations" on={notifPrefs.invite} onClick={() => setNotifPrefs((p) => ({ ...p, invite: !p.invite }))} />
          <Row label="Tribe chat messages" on={notifPrefs.chat} onClick={() => setNotifPrefs((p) => ({ ...p, chat: !p.chat }))} />
          <Row label="Trip updates" on={notifPrefs.trip} onClick={() => setNotifPrefs((p) => ({ ...p, trip: !p.trip }))} />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Btn onClick={() => { addNotification("Profile updated", "Your profile and settings were saved.", "trip", "profile"); go("profile"); }} icon={Check} iconRight={false}>Save changes</Btn>
          <Btn variant="danger" icon={RotateCcw} iconRight={false} onClick={resetDemo}>Reset demo data</Btn>
        </div>
      </div>
    </div>
  );
}

/* ============================== SOS MODAL ============================== */
function SOSModal({ onClose }) {
  const [alerted, setAlerted] = useState(false);
  const { addNotification } = useApp();
  const trigger = () => { setAlerted(true); addNotification("SOS alert sent (demo)", "Your tribe was notified of your emergency alert.", "trip"); };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(6,26,51,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 420, overflow: "hidden" }}>
        <div style={{ background: C.danger, color: "#fff", padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 17 }}><Siren size={19} /> Emergency Center</div>
          <X size={20} style={{ cursor: "pointer" }} onClick={onClose} />
        </div>
        <div style={{ padding: 22 }}>
          {alerted ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <CheckCircle2 size={38} color={C.success} />
              <div style={{ fontWeight: 800, fontSize: 16, margin: "12px 0 4px" }}>Your tribe has been alerted</div>
              <div style={{ color: C.muted, fontSize: 13.5, marginBottom: 16 }}>This is a simulated demo alert — no real emergency services were contacted.</div>
              <Btn full onClick={onClose} variant="outline">Close</Btn>
            </div>
          ) : (
            <>
              <Btn full variant="danger" onClick={trigger} icon={AlertTriangle} iconRight={false}>SOS — Alert my tribe</Btn>
              <div style={{ fontSize: 11, color: C.muted, textAlign: "center", margin: "10px 0 18px" }}>Demo action only — simulates notifying your tribe members.</div>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Emergency contacts</div>
              {[["Police", "100", Shield], ["Ambulance", "108", Ambulance], ["Embassy", "+91-11-2345-6789", Building2], ["Nearest hospital", "2.4 km away", Landmark]].map(([label, val, Icon]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: `1px solid ${C.border}` }}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><Icon size={16} color={C.muted} /><span style={{ fontSize: 14 }}>{label}</span></div><span style={{ fontWeight: 700, fontSize: 13 }}>{val}</span></div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================== INITIAL STATE ============================== */
const initialProfile = { name: "Ashley Sharma", initials: "AS", phone: "", interests: [], motto: [], dreamDest: [] };
const initialPrivacy = { visible: true, showVerified: true };
const initialNotifPrefs = { invite: true, chat: true, trip: true };
const STORAGE_KEY = "voyara_demo_state_v1";

/* ============================== APP ROOT ============================== */
export default function App() {
  const [hydrated, setHydrated] = useState(false);
  const [screen, setScreen] = useState("landing");
  const [stack, setStack] = useState([]);
  const [sos, setSos] = useState(false);
  const [now, setNow] = useState(new Date());

  const [profile, setProfile] = useState(initialProfile);
  const [trip, setTrip] = useState({});
  const [invite, setInvite] = useState({});
  const [idType, setIdType] = useState("Passport");
  const [discoverFilter, setDiscoverFilter] = useState(["Adventure", "Nature"]);
  const [tribeActive, setTribeActive] = useState(false);
  const [messages, setMessages] = useState(CHAT_SEED);
  const [itinerary, setItinerary] = useState(ITINERARY_SEED);
  const [tracking, setTracking] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [privacy, setPrivacy] = useState(initialPrivacy);
  const [notifPrefs, setNotifPrefs] = useState(initialNotifPrefs);

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);

  // Hydrate from persistent artifact storage
  useEffect(() => {
    (async () => {
      try {
        if (typeof window !== "undefined" && window.storage) {
          const res = await window.storage.get(STORAGE_KEY, false);
          if (res && res.value) {
            const d = JSON.parse(res.value);
            if (d.screen) setScreen(d.screen);
            if (d.stack) setStack(d.stack);
            if (d.profile) setProfile(d.profile);
            if (d.trip) setTrip(d.trip);
            if (d.invite) setInvite(d.invite);
            if (typeof d.tribeActive === "boolean") setTribeActive(d.tribeActive);
            if (d.messages) setMessages(d.messages);
            if (d.itinerary) setItinerary(d.itinerary);
            if (typeof d.tracking === "boolean") setTracking(d.tracking);
            if (d.expenses) setExpenses(d.expenses);
            if (d.notifications) setNotifications(d.notifications);
            if (d.privacy) setPrivacy(d.privacy);
            if (d.notifPrefs) setNotifPrefs(d.notifPrefs);
            if (d.idType) setIdType(d.idType);
            if (d.discoverFilter) setDiscoverFilter(d.discoverFilter);
          }
        }
      } catch (e) { /* no saved demo state yet — start fresh */ }
      setHydrated(true);
    })();
  }, []);

  // Persist on change (debounced)
  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => {
      try {
        if (typeof window !== "undefined" && window.storage) {
          const payload = JSON.stringify({ screen, stack, profile, trip, invite, tribeActive, messages, itinerary, tracking, expenses, notifications, privacy, notifPrefs, idType, discoverFilter });
          window.storage.set(STORAGE_KEY, payload, false).catch(() => {});
        }
      } catch (e) { /* best-effort persistence only */ }
    }, 400);
    return () => clearTimeout(t);
  }, [hydrated, screen, stack, profile, trip, invite, tribeActive, messages, itinerary, tracking, expenses, notifications, privacy, notifPrefs, idType, discoverFilter]);

  const go = (next) => {
    setStack((s) => [...s, screen]);
    setTrip((t) => ({ ...t, resumeScreen: ["tripType","region","destination","overview","preferences","review","matching","invite"].includes(next) ? next : t.resumeScreen }));
    setScreen(next);
    setNotifOpen(false);
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  };

  const addNotification = (title, body, type = "trip", targetScreen = null) => {
    if (notifPrefs[type] === false) return;
    setNotifications((n) => [...n, { id: Date.now() + Math.random(), title, body, type, targetScreen, time: new Date().toISOString(), read: false }]);
  };
  const markNotifsRead = () => setNotifications((n) => n.map((x) => ({ ...x, read: true })));
  const markOneRead = (id) => setNotifications((n) => n.map((x) => (x.id === id ? { ...x, read: true } : x)));

  const resetDemo = async () => {
    try { if (typeof window !== "undefined" && window.storage) await window.storage.delete(STORAGE_KEY, false); } catch (e) {}
    setScreen("landing"); setStack([]); setProfile(initialProfile); setTrip({}); setInvite({});
    setIdType("Passport"); setDiscoverFilter(["Adventure", "Nature"]); setTribeActive(false);
    setMessages(CHAT_SEED); setItinerary(ITINERARY_SEED); setTracking(true); setExpenses([]);
    setNotifications([]); setPrivacy(initialPrivacy); setNotifPrefs(initialNotifPrefs); setNotifOpen(false); setSos(false);
  };

  const ctx = { screen, go, profile, setProfile, trip, setTrip, invite, setInvite, idType, setIdType, discoverFilter, setDiscoverFilter, tribeActive, setTribeActive, messages, setMessages, itinerary, setItinerary, tracking, setTracking, expenses, setExpenses, notifications, addNotification, markNotifsRead, markOneRead, notifOpen, setNotifOpen, privacy, setPrivacy, notifPrefs, setNotifPrefs, now, setSos, resetDemo };

  if (!hydrated) {
    return (
      <div style={{ ...font, minHeight: "100vh", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
        <style>{`@keyframes voyaraspin{to{transform:rotate(360deg)}} .voyara-spin{animation:voyaraspin 1s linear infinite}`}</style>
        <div style={{ textAlign: "center" }}><Loader2 size={30} className="voyara-spin" color={C.orange} /><div style={{ marginTop: 10, fontSize: 13, color: C.mutedLight }}>Loading Voyara…</div></div>
      </div>
    );
  }

  const onboardMatch = /^onboard-(\d)$/.exec(screen);
  const mainScreens = ["home", "discover", "myTrips", "tribes", "profile", "settings"];
  const tripScreens = ["tripType","region","destination","overview","preferences","review","matching","invite","acceptInvite","confirmCommitment","tribeCreated"];
  const tribeScreens = ["tribeDashboard","tribeChat","tribeItinerary","tribeBudget","tribeTracking"];
  const appShellScreens = [...mainScreens, ...tripScreens, ...tribeScreens];

  let content = null;
  if (screen === "landing") content = <Landing />;
  else if (onboardMatch) content = <Onboarding index={Number(onboardMatch[1])} />;
  else if (screen === "phone") content = <PhoneScreen />;
  else if (screen === "otp") content = <OtpScreen />;
  else if (screen === "idType") content = <IdTypeScreen />;
  else if (screen === "idUpload") content = <IdUploadScreen />;
  else if (screen === "idSuccess") content = <IdSuccessScreen />;
  else if (screen === "autofill") content = <AutofillScreen />;
  else if (screen === "interests") content = <InterestsScreen />;
  else if (screen === "travelMotto") content = <TravelMottoScreen />;
  else if (screen === "dreamDest") content = <DreamDestScreen />;

  if (appShellScreens.includes(screen)) {
    let inner;
    if (screen === "home") inner = <Home />;
    else if (screen === "discover") inner = <Discover />;
    else if (screen === "myTrips") inner = <MyTrips />;
    else if (screen === "tribes") inner = <TribesPage />;
    else if (screen === "profile") inner = <ProfilePage />;
    else if (screen === "settings") inner = <SettingsPage />;
    else if (screen === "tripType") inner = <TripTypeStep />;
    else if (screen === "region") inner = <RegionStep />;
    else if (screen === "destination") inner = <DestinationStep />;
    else if (screen === "overview") inner = <OverviewStep />;
    else if (screen === "preferences") inner = <PreferencesStep />;
    else if (screen === "review") inner = <ReviewStep />;
    else if (screen === "matching") inner = <MatchingStep />;
    else if (screen === "invite") inner = <InviteStep />;
    else if (screen === "acceptInvite") inner = <AcceptInviteStep />;
    else if (screen === "confirmCommitment") inner = <ConfirmCommitmentStep />;
    else if (screen === "tribeCreated") inner = <TribeCreatedStep />;
    else if (screen === "tribeDashboard") inner = <TribeDashboard />;
    else if (screen === "tribeChat") inner = <TribeChat />;
    else if (screen === "tribeItinerary") inner = <TribeItinerary />;
    else if (screen === "tribeBudget") inner = <TribeBudget />;
    else if (screen === "tribeTracking") inner = <TribeTracking />;

    const activeMain = mainScreens.includes(screen) ? screen : (tripScreens.includes(screen) ? "discover" : "tribes");
    content = (
      <div style={{ display: "flex", minHeight: "100vh", background: C.bg }}>
        <Sidebar activeMain={activeMain} />
        <div style={{ flex: 1, minWidth: 0, paddingBottom: 70 }}>{inner}</div>
        <MobileNav activeMain={activeMain} />
      </div>
    );
  }

  return (
    <AppCtx.Provider value={ctx}>
      <div style={{ ...font, background: C.bg, minHeight: "100vh" }}>
        <style>{`
          * { box-sizing: border-box; }
          input:focus, select:focus { outline: none; border-color: ${C.orange} !important; }
          .voyara-btn:active { transform: scale(0.98); }
          ::-webkit-scrollbar { height: 6px; width: 6px; }
          ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
          @keyframes voyaraspin { to { transform: rotate(360deg); } }
          .voyara-spin { animation: voyaraspin 1s linear infinite; }
          @media (max-width: 820px) {
            .voyara-sidebar { display: none !important; }
            .voyara-mobilenav { display: flex !important; }
            .voyara-onboard-grid { flex-direction: column; gap: 30px !important; text-align: center; }
            .voyara-onboard-grid > div:last-child { display: flex; flex-direction: column; align-items: center; }
          }
        `}</style>
        {content}
        {sos && <SOSModal onClose={() => setSos(false)} />}
      </div>
    </AppCtx.Provider>
  );
}
