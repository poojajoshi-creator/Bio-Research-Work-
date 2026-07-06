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
  FileText,
  Code2,
  Copy,
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
  { date: "2026-07-05", wk: 2, label: "Catch-up night", deadline: "Submit Task ii TONIGHT by 10pm ET \u2014 no time tomorrow (CNA training all day)",
    tasks: [
      { id: "t1", track: "fsgs", label: "12:18\u201312:30 \u2014 Confirm you have: dataset, variable list, template table, mentor's R code" },
      { id: "t2", track: "r", label: "12:30\u20131:15 \u2014 Review Week 2 stats concepts + the R cheat sheet on the Notes page" },
      { id: "t3", track: "r", label: "1:45\u20132:15 \u2014 Install R packages: dplyr, ggplot2, gtsummary, haven, survival" },
      { id: "t4", track: "r", label: "2:15\u20133:15 \u2014 Load real dataset; run names() \u2192 summary() \u2192 str(); confirm the recurrence column's real name" },
      { id: "t5", track: "fsgs", label: "3:15\u20134:15 \u2014 Classify every variable: continuous or categorical" },
      { id: "t6", track: "r", label: "4:30\u20135:30 \u2014 Continuous variables: check normality, run t-test or Wilcoxon, log each result" },
      { id: "t7", track: "r", label: "5:30\u20136:30 \u2014 Categorical variables: build tables, run Chi-sq or Fisher's exact" },
      { id: "t8", track: "r", label: "7:00\u20138:00 \u2014 Build the real tbl_summary() + add_p() Table 1 with all actual variables" },
      { id: "t9", track: "fsgs", label: "8:00\u20138:45 \u2014 Match mentor's template exactly (columns, labels, decimals); export to Excel" },
      { id: "t10", track: "fsgs", label: "8:45\u20139:15 \u2014 Write the 2\u20133 sentence findings summary" },
      { id: "t11", track: "fsgs", label: "9:15\u20139:45 \u2014 Final proofread of table and file" },
      { id: "t12", track: "fsgs", label: "9:45\u201310:00 \u2014 SUBMIT to mli11@gmu.edu tonight, don't wait for tomorrow", important: true },
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

// Day 2 reading list: the team's 5 actual references from the submitted Task i summary
const ARTICLES = [
  {
    id: "a1",
    title: "FSGS Recurrence in Adults after Renal Transplantation",
    citation: "Rudnicki M. BioMed Research International, 2016, 3295618.",
    url: "https://doi.org/10.1155/2016/3295618",
    note: "Foundational overview: recurrence occurs in 30\u201350% of allografts and is tied to poor allograft survival; covers the major risk factors (younger age at diagnosis, rapid progression to ESRD, prior graft loss to recurrence) and the circulating permeability factor hypothesis. Used for the background/overview section.",
  },
  {
    id: "a2",
    title: "Recurrent and de novo Glomerulonephritis After Kidney Transplantation",
    citation: "Lim WH, Shingde M, Wong G. Frontiers in Immunology, 10, 1944 (2019).",
    url: "https://www.frontiersin.org/journals/immunology/articles/10.3389/fimmu.2019.01944/full",
    note: "Broader review of recurrent glomerular disease after transplant, with FSGS as a major example \u2014 useful for contrasting recurrent vs. de novo disease and for graft-outcome framing.",
  },
  {
    id: "a3",
    title: "Treatment of post-transplant recurrent FSGS in children using plasmapheresis and augmentation of immunosuppression",
    citation: "Restrepo JM, Torres-Canchala L, Londo\u00f1o H, Manzi E, Somers MJG. BMC Nephrology, 23(1), 131 (2022).",
    url: "https://link.springer.com/article/10.1186/s12882-022-02768-w",
    note: "Pediatric cohort testing intensified immunosuppression (plasmapheresis + cyclophosphamide added to a calcineurin inhibitor/steroid base) for treating recurrence once it happens \u2014 used for the immunosuppression-role section.",
  },
  {
    id: "a4",
    title: "Kidney Transplantation for Focal Segmental Glomerulosclerosis: Can We Prevent Its Recurrence? Personal Experience and Literature Review",
    citation: "Naciri Bennani H, Elimby L, Terrec F, Malvezzi P, Noble J, Jouve T, Rostaing L. Journal of Clinical Medicine, 11(1), 93 (2021).",
    url: "https://doi.org/10.3390/jcm11010093",
    note: "17-patient single-center cohort (8 recurrence vs. 9 no-recurrence) testing pretransplant plasmapheresis/rituximab prophylaxis \u2014 found it did not clearly reduce recurrence risk, directly supporting the \"no definitive data\" gap this project addresses.",
  },
  {
    id: "a5",
    title: "Incidence and risk factors for recurrent focal segmental glomerulosclerosis after kidney transplantation: a meta-analysis",
    citation: "Bai J, Zhang T, Wang Y, et al. Renal Failure, 45(1), 2201341 (2023).",
    url: "https://www.tandfonline.com/doi/full/10.1080/0886022X.2023.2201341",
    note: "Meta-analysis pooling risk-factor data across many cohorts \u2014 used to support the risk-factor section with a range of recurrence rates rather than one single study.",
  },
];

const PROJECT_NOTES = {
  background: `Focal segmental glomerulosclerosis (FSGS) is a kidney disease characterized by scarring of the glomerulus in certain parts, the filtering units of the kidney, leading to protein loss in the urine and progressive decline in kidney function. The disease can be classified as primary, secondary, genetic, or undetermined, with primary forms including de novo cases, and its exact cause is not always known, although immune and circulating permeability factors are believed to play important roles. As FSGS progresses, many patients develop chronic kidney disease and may eventually reach end-stage kidney failure, requiring renal replacement therapy such as dialysis or kidney transplantation. Kidney transplantation is considered the preferred treatment for end-stage kidney disease because it can improve both survival and quality of life compared with long-term dialysis. However, FSGS can recur after transplantation, often within days to months, and recurrence is associated with a higher risk of graft dysfunction and loss.

Several studies have identified factors that increase the likelihood of FSGS recurrence following kidney transplantation. Recurrence rates are highest in patients with primary FSGS, while secondary and genetic forms generally carry a lower risk of recurrence. Younger age at disease onset, rapid progression from diagnosis to end-stage kidney disease, and previous graft loss due to recurrent FSGS have consistently been associated with an increase in recurrence risk. Patients receiving a second transplant after losing a previous graft to recurrent FSGS face a greater chance of recurrence in the new allograft. Shorter disease duration before kidney failure and younger age at transplantation are also significant predictors of recurrence.

The use of immunosuppressive drugs is necessary to prevent rejection of transplanted organs, but for the specific treatment of recurrent FSGS, their role is complicated and not specifically defined. Most clinicians modify induction and maintenance immunosuppressive strategies for recurrent disease; however, no definitive data show how different classes of immunosuppressive agents affect disease severity or long-term survival. This gap is what the current study addresses.`,
  objective: `To examine the relationship between immunosuppressive treatment strategies and post-transplant outcomes in kidney transplant recipients with FSGS, with a focus on identifying factors influencing FSGS recurrence, graft survival, and patient survival to improve long-term transplant management.`,
  authors: [
    { name: "Jessica Bayarjargal", school: "Briar Woods High School", role: "Overview of FSGS, kidney failure, and transplantation; drafted the clinical background section." },
    { name: "Ruhi Nalla", school: "Thomas Jefferson High School for Science and Technology", role: "Risk factors for recurrence; drafted that section and contributed to the study objective." },
    { name: "Rishi Wadhwani", school: "Rock Ridge High School", role: "Role of immunosuppressive therapy in recurrence; summarized current strategies, evidence gaps, and the need for further research." },
  ],
};

const CHEAT_SHEET = [
  {
    title: "0. Setup (run once per machine)",
    code: `install.packages(c("dplyr", "ggplot2", "gtsummary", "haven", "survival"))

library(dplyr)      # data wrangling (%>%, select, filter)
library(gtsummary)  # publication-ready tables
library(haven)      # read .dta / .sas / .sav files
library(survival)   # for Task iii later (KM, Cox)`,
  },
  {
    title: "1. Load data + the 3-step diagnostic (always do this first)",
    code: `df <- read_dta("Project1.dta")   # or read.csv() if it's a .csv

names(df)      # what columns exist?
summary(df)    # min/max/mean + missing values (NAs)
str(df)        # confirms each column's type (numeric/factor/character)

table(df$fsgs_recurr)   # check the grouping variable: how many recurred vs. not?`,
  },
  {
    title: "2. Continuous variable: is it normal? (decides t-test vs. Wilcoxon)",
    code: `hist(df$AGE)          # quick visual check
shapiro.test(df$AGE)  # p > 0.05 → roughly normal → use t-test
                       # p < 0.05 → not normal   → use Wilcoxon`,
  },
  {
    title: "3. Compare a continuous variable between groups",
    code: `# T-test (if roughly normal)
t.test(AGE ~ fsgs_recurr, data = df)

# Wilcoxon rank-sum / Mann-Whitney (if not normal)
wilcox.test(AGE ~ fsgs_recurr, data = df)`,
  },
  {
    title: "4. Compare a categorical variable between groups",
    code: `tbl <- table(df$male_pt, df$fsgs_recurr)
tbl                          # raw counts
prop.table(tbl, margin = 2) * 100   # column %

chisq.test(tbl)              # use if all expected cell counts >= 5
fisher.test(tbl)             # use instead if any cell count is small`,
  },
  {
    title: "5. The all-in-one Table 1 (this is the actual Task ii deliverable)",
    code: `df$fsgs_recurr <- as.factor(df$fsgs_recurr)

my.table.1 <- df %>%
  select(male_pt, AGE, white_pt, fsgs_recurr) %>%   # add all variables mentors gave you
  tbl_summary(
    by = fsgs_recurr,
    statistic = list(all_continuous() ~ "{mean} ({sd})"),
    missing = "no"
  ) %>%
  add_p(pvalue_fun = \\(x) style_pvalue(x, digits = 3))

my.table.1`,
  },
  {
    title: "6. Export to Excel for submission",
    code: `# gt/gtsummary can't save directly to .xlsx -- flatten to a data frame first
library(writexl)
my.table.1_df <- as_tibble(my.table.1)
write_xlsx(my.table.1_df, "task2_table.xlsx")

# nicer formatting (bold header, auto column widths):
library(openxlsx)
wb <- createWorkbook()
addWorksheet(wb, "Table 1")
writeData(wb, "Table 1", my.table.1_df, headerStyle = createStyle(textDecoration = "bold"))
setColWidths(wb, "Table 1", cols = 1:ncol(my.table.1_df), widths = "auto")
saveWorkbook(wb, "task2_table.xlsx", overwrite = TRUE)`,
  },
  {
    title: "Common errors \u2014 read this before Googling",
    code: `Error: object 'age' not found        -> R is case-sensitive. Check df$AGE vs df$age.
NAs introduced by coercion            -> a column has text mixed into numbers. Run str(df) again.
subscript out of bounds               -> you're indexing a row/column that doesn't exist. Recheck names(df).
Error in df$fsgs_recurr : $ operator  -> df isn't a data frame yet, or column name is misspelled.
  is invalid for atomic vectors`,
  },
];

const STATS_CHEAT = {
  tests: [
    { test: "T-test", when: "Continuous variable, 2 groups, roughly normal distribution", h0: "The two group means are equal" },
    { test: "Wilcoxon rank-sum (Mann-Whitney)", when: "Continuous variable, 2 groups, NOT normally distributed", h0: "The two group distributions are equal" },
    { test: "ANOVA", when: "Continuous variable, 3+ groups \u2014 not needed for this project (FSGS only has 2 groups)", h0: "All group means are equal" },
    { test: "Chi-square", when: "Two categorical variables, expected cell counts \u2265 5", h0: "No association between the two variables" },
    { test: "Fisher's exact", when: "Two categorical variables, any expected cell count < 5", h0: "No association between the two variables" },
  ],
};

const GLOSSARY = [
  {
    group: "Patient / Recipient variables",
    items: [
      { v: "pseudo_id", m: "A unique ID number for each patient \u2014 no clinical meaning, just an identifier.", c: null },
      { v: "male_pt", m: "Sex of the recipient.", c: "1 = male, 0 = female" },
      { v: "agegrp / age1, age2, age3", m: "Recipient age group. agegrp gives one category (1/2/3); age1/age2/age3 are the same groups as separate yes/no flags.", c: "1 = <40, 2 = 40\u201359, 3 = \u226560" },
      { v: "white_pt, black_pt, hisp_pt, asian_pt, other_pt", m: "Recipient race, as 5 separate yes/no flags (one flag per race, not one combined category column for kidney).", c: "1 = yes, 0 = no (for that race)" },
      { v: "DAYSWAIT_CHRON", m: "How many days the patient spent on the transplant waiting list before receiving their kidney.", c: "number of days" },
      { v: "diab_pt", m: "Whether the recipient has diabetes.", c: "1 = yes, 0 = no" },
      { v: "dial", m: "Whether the patient was on dialysis at the time of transplant.", c: "1 = yes, 0 = no" },
      { v: "END_CPRA", m: "Sensitization level at transplant \u2014 how many antibodies the patient has. Higher = more antibodies = harder to find a matching donor.", c: "0\u2013100 scale" },
      { v: "END_EPTS", m: "Estimated Post-Transplant Survival score. Lower score = longer expected survival after transplant.", c: "0\u20131 scale" },
      { v: "GFR", m: "Glomerular filtration rate \u2014 a direct measure of how well the kidneys are filtering, taken at the time of transplant.", c: "GFR rate (numeric)" },
      { v: "hcv_pt", m: "Whether the recipient tested positive for Hepatitis C.", c: "1 = yes, 0 = no" },
      { v: "ins / ins_priv, ins_medicare, ins_medicaid, ins_other", m: "Recipient's insurance type \u2014 ins gives one category, the ins_* variables are the same as separate yes/no flags. Often used as a proxy for socioeconomic status.", c: "1 = private, 2 = Medicare, 3 = Medicaid, 4 = other" },
      { v: "bmi35p", m: "Flag for BMI \u2265 35. Note: the dictionary label says \"donor BMI\" but this row sits under recipient variables \u2014 worth double-checking with the mentor which person's BMI this actually refers to.", c: "1 = yes, 0 = no" },
    ],
  },
  {
    group: "Donor variables",
    items: [
      { v: "male_don", m: "Sex of the donor.", c: "1 = yes (male), 0 = no" },
      { v: "race_don / white_don, black_don, hisp_don, asian_don, other_don", m: "Donor race \u2014 race_don gives one category, the *_don race variables are the same as separate yes/no flags.", c: "1 = white, 2 = black, 3 = hispanic, 4 = asian, 5 = other" },
      { v: "agegrp_don / age1_don\u2013age5_don", m: "Donor age group, as one category or as 5 separate yes/no flags.", c: "1 = <10, 2 = 10\u201319, 3 = 20\u201339, 4 = 40\u201359, 5 = \u226560" },
      { v: "anoxia_don, cva_don, head_trauma_don, tumor_don", m: "Cause of death for deceased donors: anoxia (oxygen deprivation), stroke, head trauma, or CNS tumor \u2014 each its own yes/no flag.", c: "1 = yes, 0 = no" },
      { v: "BMI_DON_CALC", m: "Donor's BMI at the time of transplant.", c: "numeric BMI" },
      { v: "CREAT_DON", m: "Donor's creatinine level at the time of transplant \u2014 a marker of kidney function in the donor.", c: "numeric level" },
      { v: "dcd", m: "Whether the donor was a \"donation after cardiac death\" case (as opposed to brain death).", c: "1 = yes, 0 = no" },
      { v: "diab_don", m: "Whether the donor had diabetes.", c: "1 = yes, 0 = no" },
      { v: "ECD_DONOR", m: "\"Expanded criteria donor\" \u2014 flags donors whose organs are statistically lower quality (older, higher-risk donors).", c: "1 = yes, 0 = no" },
      { v: "hyper_don", m: "Whether the donor had hypertension (high blood pressure).", c: "1 = yes, 0 = no" },
      { v: "KDPI", m: "Kidney Donor Profile Index \u2014 estimates how long the kidney is expected to keep working, compared to other kidneys. Lower is better.", c: "0\u20131 scale" },
      { v: "LD", m: "Whether the kidney came from a living donor (vs. a deceased donor).", c: "1 = yes, 0 = no" },
    ],
  },
  {
    group: "Transplant / organ variables",
    items: [
      { v: "txyr", m: "The year the transplant took place.", c: "year" },
      { v: "COLD_ISCH_KI", m: "Cold ischemic time \u2014 how many hours the kidney was outside the body (on ice) between retrieval and transplant. Longer times are generally worse for the organ.", c: "number of hours" },
      { v: "DISTANCE", m: "Straight-line distance the organ traveled, from the donor hospital to the transplant center.", c: "nautical miles" },
      { v: "HLAMIS", m: "HLA mismatch level \u2014 how well donor and recipient tissue types match. 0 is a perfect match; 6 is the worst mismatch.", c: "0 (best) \u2013 6 (worst)" },
      { v: "local, regional, national", m: "How far the organ was shared/shipped: stayed local, went regionally, or was shipped nationally outside the region. Each is its own yes/no flag.", c: "1 = yes, 0 = no" },
      { v: "retx", m: "Whether this transplant is a re-transplant (the patient had a prior transplant that failed).", c: "1 = yes, 0 = no" },
    ],
  },
  {
    group: "Medication variables (the core of this project)",
    items: [
      { v: "i_cat", m: "Induction immunosuppression category \u2014 which drug/regimen was given at the time of transplant. This is a key exposure variable for Task ii/iii.", c: "1 = Thymo, 2 = IL2, 3 = Campath, 4 = Thymo+IL2, 5 = Any Ritux" },
      { v: "i_thy, i_il2r, i_ale, i_il2r_thy, i_ritu_all", m: "The same induction categories as i_cat, but as separate yes/no flags (Thymoglobulin, IL-2 receptor antagonist, alemtuzumab/Campath, Thymo+IL2 combo, and rituximab).", c: "1 = yes, 0 = no" },
      { v: "c_cat", m: "Maintenance immunosuppression category \u2014 the ongoing regimen after transplant. The other key exposure variable for this project.", c: "1 = mTOR-based, 2 = Belatacept-based, 3 = CNI+MMF" },
      { v: "c_mtor_based, c_bela_based, c_ci_mmf", m: "The same maintenance categories as c_cat, as separate yes/no flags.", c: "1 = yes, 0 = no" },
    ],
  },
  {
    group: "Outcome variables (what you're measuring)",
    items: [
      { v: "fsgs_recurr", m: "Whether FSGS recurred after transplant \u2014 this is the primary outcome/grouping variable for the whole project.", c: "1 = yes (recurred), 0 = no" },
      { v: "dgf", m: "Delayed graft function \u2014 the transplanted kidney took longer than expected to start working.", c: "1 = yes, 0 = no" },
      { v: "GSTATUS_KI", m: "Kidney graft status \u2014 whether the transplanted kidney failed. Used for the graft-survival Kaplan-Meier/Cox analysis in Task iii.", c: "1 = failed, 0 = still functioning" },
      { v: "GTIME_KI", m: "Number of days from transplant to kidney graft failure (or to last follow-up if it didn't fail). This is the \"time\" variable paired with GSTATUS_KI for survival analysis.", c: "number of days" },
      { v: "PSTATUS", m: "Patient status \u2014 whether the patient is alive or deceased. Used for the patient-survival analysis in Task iii.", c: "0 = alive, 1 = deceased" },
      { v: "PTIME", m: "Number of days from transplant to patient death (or last follow-up if still alive). Paired with PSTATUS for survival analysis.", c: "number of days" },
      { v: "LOS", m: "Length of hospital stay immediately after the transplant.", c: "number of days" },
    ],
  },
];

const TASK2_MAPPING = [
  { label: "BMI > 35 at registration", varname: "bmi35p", test: "chisq", note: "Template colors this yellow (T-test) and says \"mean (sd)\", but bmi35p is a 0/1 flag \u2014 that's almost certainly a template error. Treated as Chi-sq here." },
  { label: "eGFR at transplant", varname: "GFR", test: "ttest", note: null },
  { label: "EPTS at transplant", varname: "END_EPTS", test: "ttest", note: null },
  { label: "cPRA at transplant", varname: "END_CPRA", test: "ttest", note: null },
  { label: "BMI at donation", varname: "BMI_DON_CALC", test: "ttest", note: null },
  { label: "Creatinine at transplant", varname: "CREAT_DON", test: "ttest", note: null },
  { label: "KDPI", varname: "KDPI", test: "ttest", note: null },
  { label: "HLA mismatch level", varname: "HLAMIS", test: "ttest", note: null },
  { label: "Cold ischemia / preservation time", varname: "COLD_ISCH_KI", test: "ttest", note: null },
  { label: "Days on waitlist", varname: "DAYSWAIT_CHRON", test: "wilcox", note: "Already shown as median (IQR) with a * in the template \u2014 confirms Wilcoxon." },
  { label: "Days on dialysis", varname: "\u2014", test: "missing", note: "No dialysis-duration column exists in Project1.dta \u2014 only the yes/no flag dial. Confirm with mentor whether this row should be dropped or a different variable used." },
  { label: "Age group, race, sex, insurance, retx, dial, diabetes, donor factors, etc.", varname: "agegrp, male_pt, race dummies, ins_*, retx, dial, diab_pt/don, donor age/sex/race, LD, dcd, ECD_DONOR, cause-of-death dummies, local/regional/national", test: "chisq", note: "All n (%) rows in the template \u2014 Chi-sq, or Fisher's exact if a cell count is small." },
  { label: "Induction regimen (Thymo, IL2, Alemtuzumab, Thymo+IL2, Any Ritux) \u2014 EACH gets its own row + p-value", varname: "i_thy, i_il2r, i_ale, i_il2r_thy, i_ritu_all", test: "chisq", note: "Use these 5 individual yes/no flags, not the combined i_cat \u2014 i_cat alone only gives one shared p-value for \"does induction matter at all,\" not a p-value per regimen." },
  { label: "Maintenance regimen (CNI+MMF, Belatacept, mTOR) \u2014 EACH gets its own row + p-value", varname: "c_ci_mmf, c_bela_based, c_mtor_based", test: "chisq", note: "Same idea as induction \u2014 c_mtor_based has only 68 patients total, so check its cross-tab for small cells and switch to Fisher's exact if needed." },
];

const TASK2_SCRIPT = `# ==========================================================
# Task ii — Table 1: Patient/Donor/Transplant Characteristics
#           by FSGS Recurrence Status
# ==========================================================

library(dplyr)
library(gtsummary)
library(haven)

# ---- 1. Load & diagnostic (always do this first) ----
df <- read_dta("Project1.dta")
names(df)
summary(df)
str(df)
table(df$fsgs_recurr)   # 0 = No Recurrence, 1 = Recurrence

# ---- 2. Prep factors ----
df$fsgs_recurr <- factor(df$fsgs_recurr, levels = c(0, 1), labels = c("No Recurrence", "Recurrence"))
df$agegrp      <- haven::as_factor(df$agegrp)       # use haven::as_factor, not as.factor,
df$agegrp_don  <- haven::as_factor(df$agegrp_don)   # so the file's real text labels are kept
df$bmi35p      <- as.factor(df$bmi35p)   # 0/1 flag -> Chi-sq, NOT t-test

# ---- 3. Build Table 1 ----
# NOTE: i_cat/c_cat give ONE overall p-value for "does regimen matter at all."
# The template wants each regimen as its own row with its own p-value, so we
# use the individual 0/1 flags instead (i_thy, i_il2r, etc.) -- already in the data.
table1 <- df %>%
  select(
    fsgs_recurr,
    agegrp, male_pt, white_pt, black_pt, hisp_pt, asian_pt, other_pt,
    DAYSWAIT_CHRON, retx, bmi35p, dial, diab_pt,
    ins_priv, ins_medicaid, ins_medicare, ins_other,
    GFR, END_EPTS, END_CPRA,
    agegrp_don, male_don, white_don, black_don, hisp_don, asian_don, other_don,
    diab_don, hyper_don, LD, dcd, ECD_DONOR,
    anoxia_don, cva_don, head_trauma_don, tumor_don,
    BMI_DON_CALC, CREAT_DON, KDPI,
    HLAMIS, COLD_ISCH_KI,
    local, regional, national,
    i_thy, i_il2r, i_ale, i_il2r_thy, i_ritu_all,   # induction, one row + one p-value each
    c_ci_mmf, c_bela_based, c_mtor_based             # maintenance, same idea
  ) %>%
  tbl_summary(
    by = fsgs_recurr,
    statistic = list(
      all_continuous()  ~ "{mean} ({sd})",              # T-test group (yellow rows)
      DAYSWAIT_CHRON    ~ "{median} ({p25}, {p75})"      # Wilcoxon group
    ),
    digits = list(all_continuous() ~ 2),
    missing = "no"
  ) %>%
  add_p(
    test = list(
      DAYSWAIT_CHRON    ~ "wilcox.test",
      c_mtor_based      ~ "fisher.test",   # small group (n=68) -> Fisher's, not Chi-sq
      all_continuous()  ~ "t.test",
      all_categorical() ~ "chisq.test"
    ),
    pvalue_fun = ~ style_pvalue(.x, digits = 3)
  ) %>%
  add_n()

table1

# ---- 4. Export to Excel ----
# gt/gtsummary can't save directly to .xlsx -- flatten to a data frame first
library(writexl)
table1_df <- as_tibble(table1)
write_xlsx(table1_df, "Task2_Table1.xlsx")

# nicer formatting (bold header, auto column widths):
# library(openxlsx)
# wb <- createWorkbook()
# addWorksheet(wb, "Table 1")
# writeData(wb, "Table 1", table1_df, headerStyle = createStyle(textDecoration = "bold"))
# setColWidths(wb, "Table 1", cols = 1:ncol(table1_df), widths = "auto")
# saveWorkbook(wb, "Task2_Table1.xlsx", overwrite = TRUE)

# ---- 5. Sanity check ----
# Any category with a small n (e.g., c_mtor_based = 68) may need Fisher's
# exact instead of Chi-sq if expected cell counts drop below 5:
table(df$c_cat, df$fsgs_recurr)
fisher.test(table(df$c_cat, df$fsgs_recurr))  # run if any cell above looks small
`;

const TASK2_SCRIPT_STEPWISE = `# ===== STEP 1: Load the tools we need =====
library(dplyr)
library(gtsummary)
library(haven)

# ===== STEP 2: Load the data =====
df <- read_dta("Project1.dta")

# ===== STEP 3: Look at the data before touching anything =====
names(df)
summary(df)
str(df)
table(df$fsgs_recurr)

# ===== STEP 4: Tell R which columns are categories, not numbers =====
df$fsgs_recurr <- factor(df$fsgs_recurr, levels = c(0, 1), labels = c("No Recurrence", "Recurrence"))
df$agegrp      <- haven::as_factor(df$agegrp)       # haven::as_factor keeps the file's real text labels
df$agegrp_don  <- haven::as_factor(df$agegrp_don)
df$bmi35p      <- as.factor(df$bmi35p)

# ===== STEP 5: Keep only the columns we need for Table 1 =====
# NOTE: using the individual induction/maintenance flags (i_thy, i_il2r, etc.)
# instead of i_cat/c_cat, so each regimen gets its own row AND its own p-value,
# matching the template -- i_cat/c_cat alone would only give one shared p-value.
step1_selected <- select(df,
  fsgs_recurr,
  agegrp, male_pt, white_pt, black_pt, hisp_pt, asian_pt, other_pt,
  DAYSWAIT_CHRON, retx, bmi35p, dial, diab_pt,
  ins_priv, ins_medicaid, ins_medicare, ins_other,
  GFR, END_EPTS, END_CPRA,
  agegrp_don, male_don, white_don, black_don, hisp_don, asian_don, other_don,
  diab_don, hyper_don, LD, dcd, ECD_DONOR,
  anoxia_don, cva_don, head_trauma_don, tumor_don,
  BMI_DON_CALC, CREAT_DON, KDPI,
  HLAMIS, COLD_ISCH_KI,
  local, regional, national,
  i_thy, i_il2r, i_ale, i_il2r_thy, i_ritu_all,
  c_ci_mmf, c_bela_based, c_mtor_based
)

# Check it worked: this should show ~44 columns, not 73
names(step1_selected)

# ===== STEP 6: Build the summary table (means/percentages by group) =====
step2_summary <- tbl_summary(
  step1_selected,
  by = fsgs_recurr,
  statistic = list(
    all_continuous() ~ "{mean} ({sd})",
    DAYSWAIT_CHRON  ~ "{median} ({p25}, {p75})"
  ),
  digits = list(all_continuous() ~ 2),
  missing = "no"
)

# Look at it before moving on -- no p-values yet, just the two columns
step2_summary

# ===== STEP 7: Add the statistical tests (p-values) =====
step3_with_pvalues <- add_p(
  step2_summary,
  test = list(
    DAYSWAIT_CHRON    ~ "wilcox.test",
    c_mtor_based      ~ "fisher.test",   # small group (n=68) -> Fisher's, not Chi-sq
    all_continuous()  ~ "t.test",
    all_categorical() ~ "chisq.test"
  ),
  pvalue_fun = ~ style_pvalue(.x, digits = 3)
)

# ===== STEP 8: Add sample sizes to the column headers =====
step4_final_table <- add_n(step3_with_pvalues)

# ===== STEP 9: Look at the finished table =====
step4_final_table

# ===== STEP 10: Turn the table into a plain data frame =====
step5_as_dataframe <- as_tibble(step4_final_table)

# ===== STEP 11: Save it as an actual Excel file =====
library(writexl)
write_xlsx(step5_as_dataframe, "Task2_Table1.xlsx")

# ===== STEP 12: Sanity check small groups =====
table(df$c_cat, df$fsgs_recurr)
fisher.test(table(df$c_cat, df$fsgs_recurr))  # run if any cell above looks small
`;

const TASK2_SCRIPT_INDIVIDUAL = `# ===== Individual calculation approach =====
# Instead of one big pipeline, calculate n (%) and a p-value for each
# regimen ONE AT A TIME -- slower to type, but much easier to see exactly
# what's happening at each step. This is what Rishi used.

library(haven)
df <- read_dta("Project1.dta")

# Label the outcome so results are readable
df$fsgs_recurr <- factor(df$fsgs_recurr, levels = c(0, 1),
                          labels = c("No Recurrence", "Recurrence"))

# ---- A small helper so we don't retype the same 6 lines for every variable ----
analyze_variable <- function(varname) {
  tbl <- table(df[[varname]], df$fsgs_recurr)

  n_no_recur   <- tbl["1", "No Recurrence"]
  pct_no_recur <- round(100 * n_no_recur / sum(tbl[, "No Recurrence"]), 1)

  n_recur   <- tbl["1", "Recurrence"]
  pct_recur <- round(100 * n_recur / sum(tbl[, "Recurrence"]), 1)

  # Decide Chi-sq vs Fisher's based on expected cell counts (cheat sheet rule)
  expected <- chisq.test(tbl)$expected
  if (min(expected) < 5) {
    test_used <- "Fisher's exact"
    p_value <- fisher.test(tbl)$p.value
  } else {
    test_used <- "Chi-sq"
    p_value <- chisq.test(tbl)$p.value
  }

  data.frame(
    Variable      = varname,
    No_Recurrence = paste0(n_no_recur, " (", pct_no_recur, "%)"),
    Recurrence    = paste0(n_recur, " (", pct_recur, "%)"),
    P_value       = round(p_value, 3),
    Test          = test_used
  )
}

# ---- Run it for each induction regimen, one at a time ----
result_i_thy      <- analyze_variable("i_thy")
result_i_il2r     <- analyze_variable("i_il2r")
result_i_ale      <- analyze_variable("i_ale")
result_i_il2r_thy <- analyze_variable("i_il2r_thy")
result_i_ritu_all <- analyze_variable("i_ritu_all")

# ---- Run it for each maintenance regimen, one at a time ----
result_c_ci_mmf     <- analyze_variable("c_ci_mmf")
result_c_bela_based <- analyze_variable("c_bela_based")
result_c_mtor_based <- analyze_variable("c_mtor_based")

# ---- Check any single one before combining everything ----
result_i_ale   # this is the one that turned out significant, p = 0.037

# ---- Stack all 8 results into one table ----
immunosuppression_table <- rbind(
  result_i_thy, result_i_il2r, result_i_ale, result_i_il2r_thy, result_i_ritu_all,
  result_c_ci_mmf, result_c_bela_based, result_c_mtor_based
)
immunosuppression_table

# ---- Save to Excel ----
library(writexl)
write_xlsx(immunosuppression_table, "Induction_Maintenance_Results.xlsx")
`;

const CONFIRMED_RESULTS = {
  induction: [
    { label: "Thymoglobulin (ATG) regimen", noRecur: "6,438 (63.5%)", recur: "392 (60.2%)", p: "0.100", test: "Chi-sq" },
    { label: "Interleukin2 (IL2) regimen", noRecur: "1,606 (15.8%)", recur: "89 (13.7%)", p: "0.156", test: "Chi-sq" },
    { label: "Alemtuzumab regimen", noRecur: "1,594 (15.7%)", recur: "123 (18.9%)", p: "0.037", test: "Chi-sq", sig: true },
    { label: "ATG+IL2 regimen", noRecur: "201 (2.0%)", recur: "20 (3.1%)", p: "0.078", test: "Chi-sq" },
    { label: "Any Rituximab regimen", noRecur: "299 (2.9%)", recur: "27 (4.1%)", p: "0.107", test: "Chi-sq" },
  ],
  maintenance: [
    { label: "CNI+MMF", noRecur: "9,792 (96.6%)", recur: "629 (96.6%)", p: "1.000", test: "Chi-sq" },
    { label: "Belatacept-based", noRecur: "283 (2.8%)", recur: "17 (2.6%)", p: "0.882", test: "Chi-sq" },
    { label: "MTOR-based", noRecur: "63 (0.6%)", recur: "5 (0.8%)", p: "0.605", test: "Fisher's exact" },
  ],
};

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

function NormalCurveSVG() {
  return (
    <svg viewBox="0 0 640 230" className="w-full h-auto">
      <path d="M40,170 C120,170 140,40 320,40 C500,40 520,170 600,170" fill="none" stroke="#0f766e" strokeWidth="3" />
      {[50, 140, 230, 320, 410, 500, 590].map((x) => (
        <line key={x} x1={x} y1="170" x2={x} y2="35" stroke="#a8a29e" strokeWidth="1" strokeDasharray="3,3" />
      ))}
      <line x1="40" y1="170" x2="600" y2="170" stroke="#78716c" strokeWidth="1.5" />
      <text x="320" y="185" textAnchor="middle" fontSize="12" fill="#57534e">\u03bc</text>
      <text x="230" y="185" textAnchor="middle" fontSize="11" fill="#78716c">-1\u03c3</text>
      <text x="410" y="185" textAnchor="middle" fontSize="11" fill="#78716c">+1\u03c3</text>
      <text x="140" y="185" textAnchor="middle" fontSize="11" fill="#78716c">-2\u03c3</text>
      <text x="500" y="185" textAnchor="middle" fontSize="11" fill="#78716c">+2\u03c3</text>
      <line x1="230" y1="197" x2="410" y2="197" stroke="#0f766e" strokeWidth="2" />
      <text x="320" y="196" textAnchor="middle" fontSize="11" fill="#0f766e" fontWeight="600">68%</text>
      <line x1="140" y1="210" x2="500" y2="210" stroke="#2563eb" strokeWidth="2" />
      <text x="320" y="209" textAnchor="middle" fontSize="11" fill="#2563eb" fontWeight="600">95%</text>
      <line x1="50" y1="223" x2="590" y2="223" stroke="#b45309" strokeWidth="2" />
      <text x="320" y="222" textAnchor="middle" fontSize="11" fill="#b45309" fontWeight="600">99.7%</text>
    </svg>
  );
}

function BoxplotSVG() {
  return (
    <svg viewBox="0 0 640 160" className="w-full h-auto">
      <line x1="60" y1="100" x2="180" y2="100" stroke="#57534e" strokeWidth="1.5" />
      <line x1="420" y1="100" x2="560" y2="100" stroke="#57534e" strokeWidth="1.5" />
      <line x1="60" y1="85" x2="60" y2="115" stroke="#57534e" strokeWidth="1.5" />
      <line x1="560" y1="85" x2="560" y2="115" stroke="#57534e" strokeWidth="1.5" />
      <rect x="180" y="70" width="240" height="60" fill="#ccfbf1" stroke="#0f766e" strokeWidth="2" />
      <line x1="300" y1="70" x2="300" y2="130" stroke="#be123c" strokeWidth="3" />
      <line x1="180" y1="50" x2="180" y2="58" stroke="#57534e" strokeWidth="1" />
      <line x1="420" y1="50" x2="420" y2="58" stroke="#57534e" strokeWidth="1" />
      <line x1="180" y1="54" x2="420" y2="54" stroke="#57534e" strokeWidth="1" />
      <text x="300" y="45" textAnchor="middle" fontSize="12" fill="#44403c">IQR = Q3 \u2212 Q1</text>
      <text x="60" y="148" textAnchor="middle" fontSize="12" fill="#57534e">Min</text>
      <text x="180" y="148" textAnchor="middle" fontSize="12" fill="#0f766e" fontWeight="600">Q1</text>
      <text x="300" y="148" textAnchor="middle" fontSize="12" fill="#be123c" fontWeight="600">Median</text>
      <text x="420" y="148" textAnchor="middle" fontSize="12" fill="#0f766e" fontWeight="600">Q3</text>
      <text x="560" y="148" textAnchor="middle" fontSize="12" fill="#57534e">Max</text>
    </svg>
  );
}

function SkewSVG() {
  return (
    <svg viewBox="0 0 640 200" className="w-full h-auto">
      <text x="320" y="20" textAnchor="middle" fontSize="12" fill="#78716c">Right-skewed example (e.g., wait time, salary)</text>
      <path d="M40,170 C80,60 140,38 190,45 C270,58 340,95 420,125 C480,148 550,160 600,168" fill="none" stroke="#b45309" strokeWidth="3" />
      <line x1="40" y1="170" x2="600" y2="170" stroke="#78716c" strokeWidth="1.5" />
      <line x1="175" y1="170" x2="175" y2="50" stroke="#be123c" strokeWidth="2" strokeDasharray="4,3" />
      <line x1="255" y1="170" x2="255" y2="70" stroke="#0f766e" strokeWidth="2" strokeDasharray="4,3" />
      <text x="175" y="185" textAnchor="middle" fontSize="12" fill="#be123c" fontWeight="600">Median</text>
      <text x="255" y="200" textAnchor="middle" fontSize="12" fill="#0f766e" fontWeight="600">Mean</text>
    </svg>
  );
}

function StatsBasics() {
  return (
    <div className="space-y-5 mb-8">
      <div className="rounded-lg border border-stone-200 bg-white p-4">
        <p className="text-sm font-medium text-stone-800 mb-1">Mean vs. Median</p>
        <p className="text-sm text-stone-600 mb-3">
          The <b>mean</b> (average) adds up all values and divides by the count. The <b>median</b> is
          the middle value when everything is sorted. They're equal in a symmetric distribution, but
          in a <b>skewed</b> distribution (like wait times or salaries, which usually have a long tail
          of large values), the mean gets pulled toward the tail while the median stays put \u2014 this is
          exactly why the mentor's R code sometimes uses <code className="text-xs bg-stone-100 px-1 rounded">median (sd)</code> instead
          of <code className="text-xs bg-stone-100 px-1 rounded">mean (sd)</code> for certain variables.
        </p>
        <SkewSVG />
      </div>

      <div className="rounded-lg border border-stone-200 bg-white p-4">
        <p className="text-sm font-medium text-stone-800 mb-1">Standard Deviation (SD)</p>
        <p className="text-sm text-stone-600 mb-3">
          SD measures how spread out the data is around the mean. In a roughly normal (bell-shaped)
          distribution, about 68% of values fall within 1 SD of the mean, 95% within 2 SD, and 99.7%
          within 3 SD \u2014 this is the "68-95-99.7 rule." A smaller SD means the data clusters tightly
          around the mean; a larger SD means it's more spread out.
        </p>
        <NormalCurveSVG />
      </div>

      <div className="rounded-lg border border-stone-200 bg-white p-4">
        <p className="text-sm font-medium text-stone-800 mb-1">Quartiles &amp; IQR</p>
        <p className="text-sm text-stone-600 mb-3">
          Quartiles split sorted data into four equal parts. <b>Q1</b> (25th percentile) is the value
          below which a quarter of the data falls; <b>Q3</b> (75th percentile) is where three-quarters
          falls below. The <b>IQR</b> (interquartile range = Q3 \u2212 Q1) captures the middle 50% of the
          data and is far less affected by outliers than the full min-to-max range \u2014 which is why it's
          usually reported alongside the median rather than the mean.
        </p>
        <BoxplotSVG />
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-stone-700">
        <span className="font-medium text-amber-800">Rule of thumb for Task ii: </span>
        Roughly normal/symmetric variable \u2192 report <b>mean (SD)</b>, use a <b>t-test</b>. Skewed
        variable (like DAYSWAIT_CHRON or COLD_ISCH_KI, which usually have long tails) \u2192 report
        <b> median (IQR or SD)</b>, use a <b>Wilcoxon</b> test instead. Check with a quick histogram
        or <code className="text-xs bg-white px-1 rounded">shapiro.test()</code> before deciding.
      </div>
    </div>
  );
}

function GlossarySection() {
  const [openGroup, setOpenGroup] = useState(GLOSSARY[0].group);
  return (
    <div className="space-y-2 mb-8">
      {GLOSSARY.map((g) => {
        const isOpen = openGroup === g.group;
        return (
          <div key={g.group} className="rounded-lg border border-stone-200 bg-white overflow-hidden">
            <button
              onClick={() => setOpenGroup(isOpen ? null : g.group)}
              className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-stone-50"
            >
              <span className="text-sm font-medium text-stone-800">{g.group}</span>
              <span className="text-xs font-mono text-stone-400">{g.items.length} vars {isOpen ? "\u2212" : "+"}</span>
            </button>
            {isOpen && (
              <div className="border-t border-stone-100 divide-y divide-stone-100">
                {g.items.map((it) => (
                  <div key={it.v} className="px-4 py-3">
                    <p className="text-sm font-mono text-teal-700">{it.v}</p>
                    <p className="text-sm text-stone-600 mt-1">{it.m}</p>
                    {it.c && <p className="text-xs text-stone-400 mt-1">Coding: {it.c}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const TEST_STYLE = {
  ttest: { name: "T-test", cls: "text-blue-700 bg-blue-50 border-blue-200" },
  wilcox: { name: "Wilcoxon", cls: "text-teal-700 bg-teal-50 border-teal-200" },
  chisq: { name: "Chi-sq / Fisher's", cls: "text-amber-700 bg-amber-50 border-amber-200" },
  missing: { name: "\u26a0 Not in data", cls: "text-rose-700 bg-rose-50 border-rose-200" },
};

function Task2Script() {
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState("individual");
  const activeScript =
    mode === "stepwise" ? TASK2_SCRIPT_STEPWISE :
    mode === "individual" ? TASK2_SCRIPT_INDIVIDUAL :
    TASK2_SCRIPT;
  const copyScript = async () => {
    try {
      await navigator.clipboard.writeText(activeScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="px-6 md:px-8 py-6 max-w-3xl">
      <h1 className="font-serif text-2xl text-stone-800 mb-1">Task ii \u2014 R script</h1>
      <p className="text-sm text-stone-500 mb-6">
        Built directly from the P1_FSGS.xlsx template's color-coding and Project1.dta's real
        variables. Yellow-highlighted rows in the template \u2192 T-test; median (IQR) rows \u2192 Wilcoxon;
        everything else \u2192 Chi-sq/Fisher's.
      </p>

      <h2 className="font-serif text-lg text-stone-800 mb-2">Variable \u2192 test mapping</h2>
      <div className="space-y-2 mb-8">
        {TASK2_MAPPING.map((m) => {
          const style = TEST_STYLE[m.test];
          return (
            <div key={m.label} className="rounded-lg border border-stone-200 bg-white px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-stone-800">{m.label}</p>
                  <p className="text-xs font-mono text-stone-400 mt-0.5">{m.varname}</p>
                </div>
                <span className={"shrink-0 font-mono text-[10px] uppercase tracking-wide rounded px-1.5 py-0.5 border " + style.cls}>
                  {style.name}
                </span>
              </div>
              {m.note && <p className="text-xs text-stone-500 mt-2">{m.note}</p>}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mb-2">
        <h2 className="font-serif text-lg text-stone-800">Full R script</h2>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-stone-200 overflow-hidden">
            <button
              onClick={() => setMode("individual")}
              className={"px-2.5 py-1 text-xs " + (mode === "individual" ? "bg-stone-800 text-white" : "bg-white text-stone-500 hover:bg-stone-50")}
            >
              Individual (per-variable)
            </button>
            <button
              onClick={() => setMode("stepwise")}
              className={"px-2.5 py-1 text-xs " + (mode === "stepwise" ? "bg-stone-800 text-white" : "bg-white text-stone-500 hover:bg-stone-50")}
            >
              Beginner (step-by-step)
            </button>
            <button
              onClick={() => setMode("compact")}
              className={"px-2.5 py-1 text-xs " + (mode === "compact" ? "bg-stone-800 text-white" : "bg-white text-stone-500 hover:bg-stone-50")}
            >
              Compact (piped)
            </button>
          </div>
          <button
            onClick={copyScript}
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 border border-stone-200 rounded px-2 py-1"
          >
            <Copy size={12} /> {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
      <p className="text-xs text-stone-500 mb-2">
        {mode === "individual"
          ? "Calculates n (%) and a p-value for each regimen ONE AT A TIME using a small reusable helper function \u2014 this is the approach Rishi used, and it's the easiest to follow since every number is traceable back to a single table()/chisq.test() call."
          : mode === "stepwise"
          ? "Each step is saved under its own name (step1_selected, step2_summary...) so you can check what each stage produced before moving to the next \u2014 easiest to follow if R/dplyr is new."
          : "The same script written with the %>% pipe (\"and then\") to chain all the steps together \u2014 more compact once the individual steps feel familiar."}
      </p>
      <div className="rounded-lg border border-stone-200 bg-stone-900 overflow-hidden mb-8">
        <pre className="text-[12px] leading-relaxed text-stone-100 p-4 overflow-x-auto font-mono whitespace-pre">{activeScript}</pre>
      </div>

      <h2 className="font-serif text-lg text-stone-800 mb-1">Confirmed results \u2014 induction &amp; maintenance</h2>
      <p className="text-sm text-stone-500 mb-3">
        Computed directly from Project1.dta. Alemtuzumab is the only individually significant
        regimen \u2014 it's what's driving the earlier combined i_cat p = 0.010 result.
      </p>
      <div className="rounded-lg border border-stone-200 bg-white overflow-hidden mb-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-100 text-stone-600 text-left">
              <th className="px-3 py-2 font-medium">Regimen</th>
              <th className="px-3 py-2 font-medium">No Recurrence</th>
              <th className="px-3 py-2 font-medium">Recurrence</th>
              <th className="px-3 py-2 font-medium">P-value</th>
              <th className="px-3 py-2 font-medium">Test</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-stone-50"><td colSpan={5} className="px-3 py-1.5 text-xs font-medium text-stone-500 uppercase tracking-wide">Induction therapy</td></tr>
            {CONFIRMED_RESULTS.induction.map((r, i) => (
              <tr key={r.label} className={r.sig ? "bg-amber-50" : i % 2 === 0 ? "bg-white" : "bg-stone-50"}>
                <td className="px-3 py-2 text-stone-700">{r.label}</td>
                <td className="px-3 py-2 text-stone-600">{r.noRecur}</td>
                <td className="px-3 py-2 text-stone-600">{r.recur}</td>
                <td className={"px-3 py-2 " + (r.sig ? "font-semibold text-amber-800" : "text-stone-600")}>{r.p}</td>
                <td className="px-3 py-2 text-stone-400 text-xs">{r.test}</td>
              </tr>
            ))}
            <tr className="bg-stone-50"><td colSpan={5} className="px-3 py-1.5 text-xs font-medium text-stone-500 uppercase tracking-wide">Maintenance therapy</td></tr>
            {CONFIRMED_RESULTS.maintenance.map((r, i) => (
              <tr key={r.label} className={i % 2 === 0 ? "bg-white" : "bg-stone-50"}>
                <td className="px-3 py-2 text-stone-700">{r.label}</td>
                <td className="px-3 py-2 text-stone-600">{r.noRecur}</td>
                <td className="px-3 py-2 text-stone-600">{r.recur}</td>
                <td className="px-3 py-2 text-stone-600">{r.p}</td>
                <td className="px-3 py-2 text-stone-400 text-xs">{r.test}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-stone-700 mb-8">
        <span className="font-medium text-amber-800">Worth flagging in the write-up: </span>
        running 8 separate tests instead of 1 increases the chance one turns up "significant" by
        chance alone (the multiple-comparisons problem). Worth a sentence in limitations, or ask
        the mentor if a correction (e.g., Bonferroni) is expected.
      </div>

      <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-stone-700">
        <span className="font-medium text-rose-800">Before submitting: </span>
        confirm with the mentor whether the "Days on dialysis" row should be dropped from the table
        or whether a different variable (not in the current Project1.dta) is meant to fill it \u2014
        it's currently left out of the script above.
      </div>
    </div>
  );
}

function ProjectNotes() {
  return (
    <div className="px-6 md:px-8 py-6 max-w-3xl">
      <h1 className="font-serif text-2xl text-stone-800 mb-1">Project notes</h1>
      <p className="text-sm text-stone-500 mb-6">
        The finalized background and objective from the submitted Task i summary \u2014 for reference
        while working on Tasks ii\u2013v.
      </p>

      <h2 className="font-serif text-lg text-stone-800 mb-2">Background</h2>
      <div className="text-sm text-stone-600 leading-relaxed space-y-3 mb-6">
        {PROJECT_NOTES.background.split("\n\n").map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <h2 className="font-serif text-lg text-stone-800 mb-2">Objective</h2>
      <p className="text-sm text-stone-600 leading-relaxed mb-6 bg-teal-50 border border-teal-200 rounded-lg px-4 py-3">
        {PROJECT_NOTES.objective}
      </p>

      <h2 className="font-serif text-lg text-stone-800 mb-2">Team &amp; contributions</h2>
      <div className="space-y-2 mb-8">
        {PROJECT_NOTES.authors.map((a) => (
          <div key={a.name} className="rounded-lg border border-stone-200 bg-white px-4 py-3">
            <p className="text-sm font-medium text-stone-800">{a.name} <span className="text-stone-400 font-normal">\u2014 {a.school}</span></p>
            <p className="text-sm text-stone-600 mt-1">{a.role}</p>
          </div>
        ))}
      </div>

      <h2 className="font-serif text-lg text-stone-800 mb-1">Variable glossary \u2014 kidney dataset</h2>
      <p className="text-sm text-stone-500 mb-3">
        Every kidney-relevant variable from the mentor's data dictionary, in plain English. Tap a
        group to expand it.
      </p>
      <GlossarySection />

      <h2 className="font-serif text-lg text-stone-800 mb-1">Statistics basics \u2014 mean, SD, quartiles</h2>
      <p className="text-sm text-stone-500 mb-3">
        The building blocks behind every test below \u2014 what these numbers mean and when to use which one.
      </p>
      <StatsBasics />

      <h2 className="font-serif text-lg text-stone-800 mb-1">Stats quick reference \u2014 which test, when</h2>
      <p className="text-sm text-stone-500 mb-3">From the Week 2 lecture: how to pick a test and what its null hypothesis (H0) says.</p>
      <div className="rounded-lg border border-stone-200 bg-white overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-100 text-stone-600 text-left">
              <th className="px-3 py-2 font-medium">Test</th>
              <th className="px-3 py-2 font-medium">When to use</th>
              <th className="px-3 py-2 font-medium">H0 says...</th>
            </tr>
          </thead>
          <tbody>
            {STATS_CHEAT.tests.map((t, i) => (
              <tr key={t.test} className={i % 2 === 0 ? "bg-white" : "bg-stone-50"}>
                <td className="px-3 py-2 font-medium text-stone-800 align-top whitespace-nowrap">{t.test}</td>
                <td className="px-3 py-2 text-stone-600 align-top">{t.when}</td>
                <td className="px-3 py-2 text-stone-600 align-top italic">{t.h0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 mb-3 text-sm text-stone-700">
        <span className="font-medium text-teal-800">Decision rule: </span>
        Reject H0 if p \u2264 0.05 \u2192 conclude there IS a statistically significant difference/association.
        Fail to reject H0 if p &gt; 0.05 \u2192 conclude there's no evidence of one.
      </div>
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 mb-8 text-sm text-stone-700">
        <span className="font-medium text-amber-800">The SD trap (worth knowing cold): </span>
        A p-value depends on BOTH the size of the difference AND the sample's variability (SD) \u2014 not
        the raw difference alone. A larger mean difference \u2192 smaller p-value. A smaller SD \u2192 smaller
        p-value (more certainty). That's why a small difference can still be significant (large sample,
        low variance) and a large difference can be non-significant (small sample, high variance).
      </div>

      <h2 className="font-serif text-lg text-stone-800 mb-1">R cheat sheet \u2014 Task ii</h2>
      <p className="text-sm text-stone-500 mb-3">
        Setup through the final Table 1, in order. <code className="text-xs bg-blue-50 text-blue-700 px-1 py-0.5 rounded">fsgs_recurr</code> is
        the grouping variable name shown in the mentor's slides for this project \u2014 swap in the real
        column name if it turns out to be different.
      </p>
      <div className="space-y-3">
        {CHEAT_SHEET.map((s) => (
          <div key={s.title} className="rounded-lg border border-stone-200 bg-stone-900 overflow-hidden">
            <p className="text-xs font-medium text-teal-400 px-4 pt-3 pb-1">{s.title}</p>
            <pre className="text-[12px] leading-relaxed text-stone-100 px-4 pb-4 overflow-x-auto font-mono whitespace-pre">{s.code}</pre>
          </div>
        ))}
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
            className={"flex-1 py-2.5 text-[11px] font-medium " + (view === "notebook" ? "bg-stone-800 text-white" : "text-stone-400 hover:bg-stone-800/60")}
          >
            Notebook
          </button>
          <button
            onClick={() => setView("reading")}
            className={"flex-1 py-2.5 text-[11px] font-medium inline-flex items-center justify-center gap-1 " + (view === "reading" ? "bg-stone-800 text-white" : "text-stone-400 hover:bg-stone-800/60")}
          >
            <BookOpen size={12} /> Reading
          </button>
          <button
            onClick={() => setView("notes")}
            className={"flex-1 py-2.5 text-[11px] font-medium inline-flex items-center justify-center gap-1 " + (view === "notes" ? "bg-stone-800 text-white" : "text-stone-400 hover:bg-stone-800/60")}
          >
            <FileText size={12} /> Notes
          </button>
          <button
            onClick={() => setView("script")}
            className={"flex-1 py-2.5 text-[11px] font-medium inline-flex items-center justify-center gap-1 " + (view === "script" ? "bg-stone-800 text-white" : "text-stone-400 hover:bg-stone-800/60")}
          >
            <Code2 size={12} /> Script
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
      ) : view === "notes" ? (
        <div className="flex-1 overflow-y-auto">
          <ProjectNotes />
        </div>
      ) : view === "script" ? (
        <div className="flex-1 overflow-y-auto">
          <Task2Script />
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
