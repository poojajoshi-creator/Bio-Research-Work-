import { useState, useEffect, useRef, useCallback } from "react";
import {
  CheckCircle2,
  Circle,
  FlaskConical,
  Terminal,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  NotebookPen,
  RotateCcw,
  AlertCircle,
  BookOpen,
  ExternalLink,
} from "lucide-react";

const STORAGE_KEY = "fsgs-portal-data";
const ARTICLES_STORAGE_KEY = "fsgs-portal-articles";
const SUMMARY_TARGET = 600;

// Tracks: fsgs = reading/writing/project tasks, r = required R coding (mentor-provided code), py = optional Python portfolio
const DAYS = [
  { date: "2026-06-22", wk: 1, label: "Kickoff", deadline: null,
    tasks: [
      { id: "t1", track: "fsgs", label: "Attend Intro & Project Q&A, 11:00\u201313:00 ET \u2014 ask your prepped question" },
      { id: "t2", track: "fsgs", label: "Right after: write down mentor comments not in the packet" },
      { id: "t3", track: "r", label: "Install R + RStudio. Run a first script: assign variables, read a CSV" },
    ]},
  { date: "2026-06-23", wk: 1, label: null, deadline: null,
    tasks: [
      { id: "t1", track: "fsgs", label: "Attend 1st lecture on Task i" },
      { id: "t2", track: "fsgs", label: "Google Scholar search: FSGS recurrence, immunosuppression, podocyte" },
      { id: "t3", track: "fsgs", label: "Read the 5 shortlisted articles on the Reading List page, one by one" },
      { id: "t4", track: "r", label: "R basics: vectors, data frames, str(), summary()" },
    ]},
  { date: "2026-06-24", wk: 1, label: null, deadline: null,
    tasks: [
      { id: "t1", track: "fsgs", label: "Continue Reading List: aim for at least 2 more article summaries" },
      { id: "t2", track: "fsgs", label: "Read abstracts fully, skim full text of the top picks" },
      { id: "t3", track: "fsgs", label: "Pull key facts: recurrence rates, risk factors, agents studied" },
      { id: "t4", track: "r", label: "dplyr basics: filter(), select(), mutate()" },
    ]},
  { date: "2026-06-25", wk: 1, label: null, deadline: null,
    tasks: [
      { id: "t1", track: "fsgs", label: "Finish all 5 Reading List summaries (600 words each)" },
      { id: "t2", track: "fsgs", label: "Organize notes: overview / risk factors / immunosuppression role" },
      { id: "t3", track: "fsgs", label: "Flag any conflicting findings between papers \u2014 that's the \"gap\"" },
      { id: "t4", track: "r", label: "dplyr: group_by() + summarize(); a first ggplot2 chart" },
    ]},
  { date: "2026-06-26", wk: 1, label: null, deadline: null,
    tasks: [
      { id: "t1", track: "fsgs", label: "Draft the one-page lit review (overview \u2192 risk factors \u2192 immunosuppression \u2192 objective \u2192 why novel)" },
      { id: "t2", track: "fsgs", label: "Draft the references page" },
      { id: "t3", track: "r", label: "Practice: load a sample dataset, compute group summary stats in R" },
    ]},
  { date: "2026-06-29", wk: 2, label: null, deadline: "Task i due, noon ET",
    tasks: [
      { id: "t1", track: "fsgs", label: "Final polish, check every claim has a citation" },
      { id: "t2", track: "fsgs", label: "SUBMIT Task i to mli11@gmu.edu by noon ET", important: true },
      { id: "t3", track: "fsgs", label: "Attend 2nd lecture on Task ii \u2014 mentors share data + R code today" },
    ]},
  { date: "2026-06-30", wk: 2, label: null, deadline: null,
    tasks: [
      { id: "t1", track: "r", label: "Open the mentor's R script; run it top to bottom without editing first" },
      { id: "t2", track: "r", label: "Load provided data + variable list; explore recurrence vs. no-recurrence groups" },
      { id: "t3", track: "fsgs", label: "Note anything in the R code or variables you don't understand yet" },
    ]},
  { date: "2026-07-01", wk: 2, label: null, deadline: null,
    tasks: [
      { id: "t1", track: "r", label: "Descriptive stats for every variable, both groups, using the template" },
      { id: "t2", track: "py", label: "(Optional) scipy.stats basics: t-test and Mann-Whitney U" },
    ]},
  { date: "2026-07-02", wk: 2, label: null, deadline: null,
    tasks: [
      { id: "t1", track: "r", label: "Run t-test/Wilcoxon + Chi-sq/Fisher's, check normality first" },
      { id: "t2", track: "r", label: "Populate the template table with p-values" },
    ]},
  { date: "2026-07-03", wk: 2, label: null, deadline: null,
    tasks: [
      { id: "t1", track: "fsgs", label: "Sanity-check p-values against the raw group numbers" },
      { id: "t2", track: "r", label: "Format, export to Excel, write 2\u20133 sentences on key findings" },
    ]},
  { date: "2026-07-06", wk: 3, label: null, deadline: "Task ii due, noon ET",
    tasks: [
      { id: "t1", track: "fsgs", label: "Final check" },
      { id: "t2", track: "fsgs", label: "SUBMIT Task ii Excel file by noon ET", important: true },
      { id: "t3", track: "fsgs", label: "Attend 3rd lecture on Task iii \u2014 KM/Cox tutorial + R code" },
    ]},
  { date: "2026-07-07", wk: 3, label: null, deadline: null,
    tasks: [
      { id: "t1", track: "r", label: "Run the mentor's KM/Cox script as-is; confirm outcome definitions with mentors" },
      { id: "t2", track: "r", label: "Learn what each line does: survfit(), Surv(), coxph()" },
    ]},
  { date: "2026-07-08", wk: 3, label: null, deadline: null,
    tasks: [
      { id: "t1", track: "r", label: "Run KM curves: recurrence, graft failure, mortality by regimen" },
      { id: "t2", track: "py", label: "(Optional) Plot the same KM curve in Python with lifelines" },
    ]},
  { date: "2026-07-09", wk: 3, label: null, deadline: null,
    tasks: [
      { id: "t1", track: "r", label: "Run multivariable Cox models, extract HRs and CIs" },
    ]},
  { date: "2026-07-10", wk: 3, label: null, deadline: null,
    tasks: [
      { id: "t1", track: "r", label: "Compile results table + plain-English interpretation of each finding" },
      { id: "t2", track: "py", label: "(Optional) Recreate the Cox model in Python, compare output to R" },
    ]},
  { date: "2026-07-13", wk: 4, label: null, deadline: "Task iii due, noon ET",
    tasks: [
      { id: "t1", track: "fsgs", label: "Final check" },
      { id: "t2", track: "fsgs", label: "SUBMIT Task iii Excel file by noon ET", important: true },
      { id: "t3", track: "fsgs", label: "Attend 4th lecture on Task iv" },
      { id: "t4", track: "r", label: "Export clean plots from R (ggplot2) for the slide deck" },
    ]},
  { date: "2026-07-14", wk: 4, label: null, deadline: null,
    tasks: [
      { id: "t1", track: "fsgs", label: "Build full slide deck: background \u2192 objective \u2192 methods \u2192 results \u2192 discussion" },
    ]},
  { date: "2026-07-15", wk: 4, label: null, deadline: null,
    tasks: [
      { id: "t1", track: "fsgs", label: "Run through solo 3x, timing each pass. Cut anything shaky" },
    ]},
  { date: "2026-07-16", wk: 4, label: null, deadline: "Mock presentation (Zoom)",
    tasks: [
      { id: "t1", track: "fsgs", label: "Mock presentation with mentors", important: true },
      { id: "t2", track: "fsgs", label: "Same evening: revise slides from feedback while it's fresh" },
    ]},
  { date: "2026-07-17", wk: 4, label: "Presentation day", deadline: "Final presentation, GMU Arlington",
    tasks: [
      { id: "t1", track: "fsgs", label: "Final in-person presentation, GMU Arlington \u2014 arrive early, one last run-through", important: true },
      { id: "t2", track: "fsgs", label: "Write a short personal reflection (great raw material for college essays)" },
    ]},
  { date: "2026-07-20", wk: 5, label: null, deadline: null,
    tasks: [
      { id: "t1", track: "fsgs", label: "Outline final paper, fold in Jul 17 feedback" },
      { id: "t2", track: "py", label: "(Optional) Start a portfolio notebook translating the R analysis to Python" },
    ]},
  { date: "2026-07-21", wk: 5, label: null, deadline: null,
    tasks: [
      { id: "t1", track: "fsgs", label: "Write Introduction + Methods sections" },
      { id: "t2", track: "py", label: "(Optional) Write a README explaining the mini data-analysis project" },
    ]},
  { date: "2026-07-22", wk: 5, label: null, deadline: null,
    tasks: [
      { id: "t1", track: "fsgs", label: "Write Results + Discussion sections" },
      { id: "t2", track: "py", label: "(Optional) Push the project to GitHub (create a repo)" },
    ]},
  { date: "2026-07-23", wk: 5, label: null, deadline: null,
    tasks: [
      { id: "t1", track: "fsgs", label: "Write Limitations + Conclusion, compile references" },
      { id: "t2", track: "fsgs", label: "Full read-through of the entire paper" },
      { id: "t3", track: "r", label: "Proofread R code and comments used in the final paper/appendix" },
    ]},
  { date: "2026-07-24", wk: 5, label: "Final day", deadline: "Final paper due, noon ET",
    tasks: [
      { id: "t1", track: "fsgs", label: "Final proofread and formatting pass" },
      { id: "t2", track: "fsgs", label: "SUBMIT final paper by noon ET", important: true },
      { id: "t3", track: "py", label: "(Optional) Final polish, share the portfolio link" },
    ]},
];

const WEEK_NAMES = {
  1: "Week 1 \u2014 Literature review",
  2: "Week 2 \u2014 Group comparison",
  3: "Week 3 \u2014 Survival analysis",
  4: "Week 4 \u2014 Presentation",
  5: "Week 5 \u2014 Final paper",
};

const TRACK_STYLE = {
  fsgs: { icon: FlaskConical, name: "fsgs", cls: "text-teal-700 bg-teal-50 border-teal-200" },
  r: { icon: Terminal, name: "r (required)", cls: "text-blue-700 bg-blue-50 border-blue-200" },
  py: { icon: Terminal, name: "python (optional)", cls: "text-amber-700 bg-amber-50 border-amber-200" },
};

// Day 2 reading list: 5 articles on immunosuppression's role in FSGS recurrence
const ARTICLES = [
  {
    id: "a1",
    title: "Recurrence of FSGS after Kidney Transplantation in Adults",
    citation: "Uffing A, P\u00e9rez-S\u00e1ez MJ, Mazzali M, et al. Clinical Journal of the American Society of Nephrology, 15(2), 247\u2013256 (2020).",
    url: "https://doi.org/10.2215/CJN.08970719",
    note: "The anchor study for this project. 176 biopsy-proven primary FSGS recipients across 15 centers; FSGS recurred in 32%, and 39% of those lost their graft. Best for the overview + risk-factor buckets.",
  },
  {
    id: "a2",
    title: "Focal segmental glomerulosclerosis: Risk for recurrence and interventions to optimize outcomes following recurrence",
    citation: "Harshman LA, et al. Pediatric Transplantation (2022).",
    url: "https://onlinelibrary.wiley.com/doi/10.1111/petr.14307",
    note: "Review focused specifically on immunosuppression's role \u2014 notes there's no clear evidence for one induction regimen over another, with mixed findings on ATG and daclizumab. Best for the immunosuppression-role bucket.",
  },
  {
    id: "a3",
    title: "Incidence and risk factors for recurrent focal segmental glomerulosclerosis after kidney transplantation: a meta-analysis",
    citation: "Bai J, Zhang T, Wang Y, et al. Renal Failure, 45(1), 2201341 (2023).",
    url: "https://pubmed.ncbi.nlm.nih.gov/29117638/",
    note: "Meta-analysis pooling risk-factor data across many cohorts \u2014 useful for showing the range of reported recurrence rates rather than relying on a single study.",
  },
  {
    id: "a4",
    title: "Kidney transplantation outcomes in patients with IgA nephropathy and other glomerular and non-glomerular primary diseases in the new era of immunosuppression",
    citation: "Lionaki S, Makropoulos I, Panagiotellis K, et al. PLOS ONE, 16(8), e0253337 (2021).",
    url: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0253337",
    note: "Directly compares maintenance regimens: tacrolimus-based maintenance was associated with lower recurrence than cyclosporine-based, and graft loss from recurrence was highest in the FSGS group of all diseases studied.",
  },
  {
    id: "a5",
    title: "Treatment of post-transplant recurrent FSGS in children using plasmapheresis and augmentation of immunosuppression",
    citation: "Restrepo JM, Torres-Canchala L, Londo\u00f1o H, Manzi E, Somers MJG. BMC Nephrology, 23(1), 131 (2022).",
    url: "https://link.springer.com/article/10.1186/s12882-022-02768-w",
    note: "Pediatric cohort testing intensified immunosuppression (plasmapheresis + cyclophosphamide added to a calcineurin inhibitor/steroid base) for treating recurrence once it happens.",
  },
];

function formatDate(iso) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

// Default timezone for this app is US Eastern (program deadlines are all ET)
function todayIso() {
  const d = new Date();
  const et = new Date(d.toLocaleString("en-US", { timeZone: "America/New_York" }));
  return et.toISOString().slice(0, 10);
}

function defaultEntryFor(day) {
  const tasks = {};
  day.tasks.forEach((t) => (tasks[t.id] = false));
  return { tasks, findings: "", questions: "" };
}

function wordCount(text) {
  const trimmed = (text || "").trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function loadJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveJSON(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    return false;
  }
}

function ReadingList() {
  const [data, setData] = useState(null);
  const [saveState, setSaveState] = useState("idle");
  const [expanded, setExpanded] = useState(ARTICLES[0].id);
  const saveTimer = useRef(null);

  useEffect(() => {
    setData(loadJSON(ARTICLES_STORAGE_KEY));
  }, []);

  const persist = useCallback((next) => {
    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const ok = saveJSON(ARTICLES_STORAGE_KEY, next);
      setSaveState(ok ? "saved" : "idle");
    }, 400);
  }, []);

  if (data === null) {
    return <div className="w-full py-12 text-center text-stone-500 font-serif">Loading reading list...</div>;
  }

  const entryFor = (id) => data[id] || { read: false, summary: "" };

  const update = (id, partial) => {
    const next = { ...data, [id]: { ...entryFor(id), ...partial } };
    setData(next);
    persist(next);
  };

  const readCount = ARTICLES.filter((a) => entryFor(a.id).read).length;

  return (
    <div className="px-6 md:px-8 py-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-serif text-2xl text-stone-800">Reading list \u2014 Day 2</h1>
        <span className="font-mono text-xs text-stone-400">{readCount}/{ARTICLES.length} read</span>
      </div>
      <p className="text-sm text-stone-500 mb-6">
        Five articles on how immunosuppression relates to FSGS recurrence. Read each one, then write a
        ~600 word summary in your own words before moving to the next.
      </p>

      <div className="space-y-3">
        {ARTICLES.map((a, i) => {
          const entry = entryFor(a.id);
          const words = wordCount(entry.summary);
          const pct = Math.min(100, Math.round((words / SUMMARY_TARGET) * 100));
          const isOpen = expanded === a.id;
          return (
            <div key={a.id} className="rounded-lg border border-stone-200 bg-white overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : a.id)}
                className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-stone-50"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    update(a.id, { read: !entry.read });
                  }}
                  className="mt-0.5 shrink-0"
                >
                  {entry.read ? (
                    <CheckCircle2 size={19} className="text-teal-600" />
                  ) : (
                    <Circle size={19} className="text-stone-300" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800">
                    {i + 1}. {a.title}
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">{a.citation}</p>
                </div>
                <span className="shrink-0 font-mono text-[10px] text-stone-400 mt-1">{words}/{SUMMARY_TARGET}w</span>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-stone-100">
                  <p className="text-sm text-stone-600 mb-2">{a.note}</p>
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-blue-700 hover:underline mb-3"
                  >
                    <ExternalLink size={13} /> Read the article
                  </a>

                  <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden mb-2">
                    <div
                      className={"h-full " + (pct >= 100 ? "bg-teal-500" : "bg-blue-400")}
                      style={{ width: pct + "%" }}
                    />
                  </div>

                  <textarea
                    value={entry.summary}
                    onChange={(e) => update(a.id, { summary: e.target.value })}
                    placeholder="Write your ~600 word summary here, in your own words: what the study looked at, what it found, and how it connects to the FSGS/immunosuppression question..."
                    className="w-full h-56 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-teal-400 resize-none"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-right">
        <span className="text-xs font-mono text-stone-400">
          {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved" : ""}
        </span>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("notebook");
  const [allData, setAllData] = useState(null);
  const [selected, setSelected] = useState(0);
  const [saveState, setSaveState] = useState("idle");
  const saveTimer = useRef(null);

  useEffect(() => {
    const data = loadJSON(STORAGE_KEY);
    setAllData(data);

    const t = todayIso();
    const idx = DAYS.findIndex((d) => d.date === t);
    if (idx >= 0) setSelected(idx);
    else if (t > DAYS[DAYS.length - 1].date) setSelected(DAYS.length - 1);
    else if (t < DAYS[0].date) setSelected(0);
  }, []);

  const persist = useCallback((next) => {
    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const ok = saveJSON(STORAGE_KEY, next);
      setSaveState(ok ? "saved" : "idle");
    }, 400);
  }, []);

  if (allData === null) {
    return (
      <div className="w-full flex items-center justify-center py-24 text-stone-500 font-serif">
        Loading your notebook...
      </div>
    );
  }

  const day = DAYS[selected];
  const entry = allData[day.date] || defaultEntryFor(day);

  const updateEntry = (partial) => {
    const nextDayEntry = { ...entry, ...partial };
    const next = { ...allData, [day.date]: nextDayEntry };
    setAllData(next);
    persist(next);
  };

  const toggleTask = (taskId) => {
    updateEntry({ tasks: { ...entry.tasks, [taskId]: !entry.tasks[taskId] } });
  };

  const resetDay = () => {
    updateEntry(defaultEntryFor(day));
  };

  const doneCount = day.tasks.filter((t) => entry.tasks[t.id]).length;
  const allDone = doneCount === day.tasks.length;

  const goTo = (i) => {
    if (i >= 0 && i < DAYS.length) setSelected(i);
  };

  const completionFor = (d) => {
    const e = allData[d.date] || null;
    if (!e) return 0;
    const total = d.tasks.length;
    const done = d.tasks.filter((t) => e.tasks[t.id]).length;
    return total === 0 ? 0 : done / total;
  };

  const totalDaysFullyDone = DAYS.filter((d) => completionFor(d) === 1).length;

  return (
    <div className="w-full flex flex-col md:flex-row gap-0 bg-stone-50 border border-stone-200 rounded-lg overflow-hidden font-sans" style={{ minHeight: "640px" }}>
      <div className="md:w-72 shrink-0 bg-stone-900 text-stone-100 flex flex-col">
        <div className="px-5 pt-5 pb-4 border-b border-stone-700">
          <p className="font-serif text-lg leading-tight">FSGS research notebook</p>
          <p className="text-xs text-stone-400 mt-1">Immunosuppression &amp; recurrent FSGS \u2014 summer program</p>
          <p className="text-xs text-teal-400 font-mono mt-3">{totalDaysFullyDone} / {DAYS.length} days complete</p>
        </div>

        <div className="flex border-b border-stone-700">
          <button
            onClick={() => setView("notebook")}
            className={"flex-1 py-2.5 text-xs font-medium " + (view === "notebook" ? "bg-stone-800 text-white" : "text-stone-400 hover:bg-stone-800/60")}
          >
            Daily notebook
          </button>
          <button
            onClick={() => setView("reading")}
            className={"flex-1 py-2.5 text-xs font-medium inline-flex items-center justify-center gap-1.5 " + (view === "reading" ? "bg-stone-800 text-white" : "text-stone-400 hover:bg-stone-800/60")}
          >
            <BookOpen size={13} /> Reading list
          </button>
        </div>

        {view === "notebook" && (
          <div className="flex-1 overflow-y-auto py-2">
            {[1, 2, 3, 4, 5].map((wk) => (
              <div key={wk} className="mb-1">
                <p className="px-5 pt-3 pb-1 text-[11px] uppercase tracking-wide text-stone-500 font-mono">
                  {WEEK_NAMES[wk]}
                </p>
                {DAYS.map((d, i) =>
                  d.wk === wk ? (
                    <button
                      key={d.date}
                      onClick={() => setSelected(i)}
                      className={
                        "w-full text-left px-5 py-2 flex items-center gap-3 transition-colors " +
                        (i === selected ? "bg-stone-800" : "hover:bg-stone-800/60")
                      }
                    >
                      <span
                        className={
                          "w-2.5 h-2.5 rounded-full shrink-0 border " +
                          (completionFor(d) === 1
                            ? "bg-teal-400 border-teal-400"
                            : completionFor(d) > 0
                            ? "bg-amber-400 border-amber-400"
                            : "bg-transparent border-stone-600")
                        }
                      />
                      <span className="font-mono text-xs text-stone-400 w-14 shrink-0">
                        {formatDate(d.date)}
                      </span>
                      <span className="text-sm truncate">
                        {d.deadline ? d.deadline : d.label || "Program day"}
                      </span>
                    </button>
                  ) : null
                )}
              </div>
            ))}
          </div>
        )}

        <div className="px-5 py-3 border-t border-stone-700 flex gap-3 text-[10px] font-mono text-stone-400">
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-600 inline-block" />fsgs</span>
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />r, required</span>
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-600 inline-block" />python, optional</span>
        </div>
      </div>

      {view === "reading" ? (
        <div className="flex-1 overflow-y-auto">
          <ReadingList />
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-6 md:px-8 pt-6 pb-4 border-b border-stone-200 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-stone-400">
                <button onClick={() => goTo(selected - 1)} disabled={selected === 0} className="disabled:opacity-30">
                  <ChevronLeft size={18} />
                </button>
                <span className="font-mono text-xs">Day {String(selected + 1).padStart(2, "0")} of {DAYS.length}</span>
                <button onClick={() => goTo(selected + 1)} disabled={selected === DAYS.length - 1} className="disabled:opacity-30">
                  <ChevronRight size={18} />
                </button>
              </div>
              <h1 className="font-serif text-2xl text-stone-800 mt-1">{formatDate(day.date)}</h1>
              {day.deadline && (
                <p className="mt-1 inline-flex items-center gap-1.5 text-rose-700 bg-rose-50 border border-rose-200 rounded px-2 py-1 text-xs font-medium">
                  <AlertCircle size={13} /> {day.deadline}
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="font-mono text-xs text-stone-400">{doneCount}/{day.tasks.length} tasks</p>
              <p className={"text-xs mt-1 " + (allDone ? "text-teal-700" : "text-stone-400")}>
                {allDone ? "Day complete" : "In progress"}
              </p>
            </div>
          </div>

          <div className="px-6 md:px-8 py-5 flex-1 overflow-y-auto">
            <div className="space-y-2">
              {day.tasks.map((t) => {
                const checked = !!entry.tasks[t.id];
                const style = TRACK_STYLE[t.track] || TRACK_STYLE.fsgs;
                const Icon = style.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => toggleTask(t.id)}
                    className={
                      "w-full text-left flex items-start gap-3 rounded-lg border px-4 py-3 transition-colors " +
                      (checked ? "bg-stone-100 border-stone-200" : "bg-white border-stone-200 hover:border-stone-300")
                    }
                  >
                    {checked ? (
                      <CheckCircle2 size={19} className="text-teal-600 shrink-0 mt-0.5" />
                    ) : (
                      <Circle size={19} className="text-stone-300 shrink-0 mt-0.5" />
                    )}
                    <span className={"text-sm leading-snug " + (checked ? "text-stone-400 line-through" : "text-stone-700")}>
                      {t.label}
                    </span>
                    <span className={"ml-auto shrink-0 font-mono text-[10px] uppercase tracking-wide rounded px-1.5 py-0.5 border " + style.cls}>
                      <span className="inline-flex items-center gap-1"><Icon size={10} />{style.name}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-2">
                  <NotebookPen size={15} /> What did you learn today?
                </label>
                <textarea
                  value={entry.findings}
                  onChange={(e) => updateEntry({ findings: e.target.value })}
                  placeholder="Jot down key findings, a concept that clicked, something surprising in the data..."
                  className="w-full h-36 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-teal-400 resize-none"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-2">
                  <HelpCircle size={15} /> Questions for your mentor/teacher
                </label>
                <textarea
                  value={entry.questions}
                  onChange={(e) => updateEntry({ questions: e.target.value })}
                  placeholder="Anything unclear, worth double-checking, or worth asking about at the next lecture..."
                  className="w-full h-36 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-teal-400 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="px-6 md:px-8 py-3 border-t border-stone-200 flex items-center justify-between">
            <button onClick={resetDay} className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600">
              <RotateCcw size={13} /> Reset this day
            </button>
            <span className="text-xs font-mono text-stone-400">
              {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved" : ""}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
