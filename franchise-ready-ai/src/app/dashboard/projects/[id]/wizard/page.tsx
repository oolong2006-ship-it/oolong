"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { WIZARD_SECTIONS, type WizardSection, type WizardQuestion } from "@/lib/wizard-config"

type Answers = Record<string, string | number | boolean>
type SectionAnswers = Record<string, Answers>

function getCompletionBadge(pct: number): { label: string; color: string } {
  if (pct < 25) return { label: "ضعيف", color: "bg-red-100 text-red-700" }
  if (pct < 50) return { label: "متوسط", color: "bg-yellow-100 text-yellow-700" }
  if (pct < 75) return { label: "جيد", color: "bg-blue-100 text-blue-700" }
  return { label: "ممتاز", color: "bg-green-100 text-green-700" }
}

function isSectionComplete(section: WizardSection, sectionAnswers: Answers): boolean {
  const requiredKeys = section.questions
    .filter((q) => q.required !== false)
    .map((q) => q.key)
  return requiredKeys.every((key) => {
    const val = sectionAnswers[key]
    return val !== undefined && val !== null && val !== ""
  })
}

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: WizardQuestion
  value: string | number | boolean | undefined
  onChange: (key: string, val: string | number | boolean) => void
}) {
  const inputClass =
    "w-full rounded-lg border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-colors"

  if (question.type === "boolean") {
    return (
      <div className="flex gap-4 mt-1">
        {(["نعم", "لا"] as const).map((opt) => {
          const boolVal = opt === "نعم"
          const checked = value === boolVal
          return (
            <label
              key={opt}
              className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border-2 transition-colors ${
                checked
                  ? "border-[var(--color-primary)] bg-[var(--color-accent)] text-[var(--color-primary)] font-semibold"
                  : "border-[var(--color-border)] hover:border-[var(--color-primary-light)]"
              }`}
            >
              <input
                type="radio"
                name={question.key}
                value={opt}
                checked={checked}
                onChange={() => onChange(question.key, boolVal)}
                className="sr-only"
              />
              {opt}
            </label>
          )
        })}
      </div>
    )
  }

  if (question.type === "select") {
    return (
      <select
        value={value as string ?? ""}
        onChange={(e) => onChange(question.key, e.target.value)}
        className={inputClass}
      >
        <option value="">اختر...</option>
        {question.options?.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    )
  }

  if (question.type === "textarea") {
    return (
      <textarea
        value={value as string ?? ""}
        onChange={(e) => onChange(question.key, e.target.value)}
        rows={4}
        className={inputClass + " resize-y"}
        placeholder="اكتب هنا..."
      />
    )
  }

  if (question.type === "number") {
    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value as number ?? ""}
          onChange={(e) =>
            onChange(question.key, e.target.value === "" ? "" : Number(e.target.value))
          }
          className={inputClass + " [direction:ltr] text-right"}
          placeholder="0"
          min={0}
        />
        {question.unit && (
          <span className="text-sm text-[var(--color-muted)] whitespace-nowrap">
            {question.unit}
          </span>
        )}
      </div>
    )
  }

  // text
  return (
    <input
      type="text"
      value={value as string ?? ""}
      onChange={(e) => onChange(question.key, e.target.value)}
      className={inputClass}
      placeholder="اكتب هنا..."
    />
  )
}

export default function WizardPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const router = useRouter()

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [sectionAnswers, setSectionAnswers] = useState<SectionAnswers>({})
  const [overallCompletion, setOverallCompletion] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [allDone, setAllDone] = useState(false)
  const [loading, setLoading] = useState(true)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const currentSection = WIZARD_SECTIONS[currentSectionIndex]
  const currentAnswers = sectionAnswers[currentSection?.key] ?? {}

  // Load existing answers on mount
  useEffect(() => {
    async function loadProject() {
      try {
        const res = await fetch(`/api/projects/${id}`)
        if (!res.ok) return
        const data = await res.json()

        if (data.answers) {
          const grouped: SectionAnswers = {}
          for (const ans of data.answers as Array<{
            section: string
            questionKey: string
            answerValue: string | null
            answerJson: unknown
          }>) {
            if (!grouped[ans.section]) grouped[ans.section] = {}
            const raw = ans.answerJson ?? ans.answerValue
            grouped[ans.section][ans.questionKey] =
              raw as string | number | boolean
          }
          setSectionAnswers(grouped)
        }

        if (data.establishment?.dataCompletion != null) {
          setOverallCompletion(data.establishment.dataCompletion)
        }
      } catch {
        // silently ignore, user can still fill in
      } finally {
        setLoading(false)
      }
    }
    loadProject()
  }, [id])

  // Recalculate overall completion whenever answers change
  useEffect(() => {
    const totalRequired = WIZARD_SECTIONS.flatMap((s) =>
      s.questions.filter((q) => q.required !== false)
    ).length
    if (totalRequired === 0) return

    let answered = 0
    for (const section of WIZARD_SECTIONS) {
      const ans = sectionAnswers[section.key] ?? {}
      for (const q of section.questions) {
        if (q.required === false) continue
        const val = ans[q.key]
        if (val !== undefined && val !== null && val !== "") answered++
      }
    }
    setOverallCompletion(Math.round((answered / totalRequired) * 100))

    const allSectionsComplete = WIZARD_SECTIONS.every((s) =>
      isSectionComplete(s, sectionAnswers[s.key] ?? {})
    )
    setAllDone(allSectionsComplete)
  }, [sectionAnswers])

  const saveSection = useCallback(
    async (sectionKey: string, answers: Answers) => {
      setSaving(true)
      setSaveError(null)
      try {
        await fetch(`/api/projects/${id}/answers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section: sectionKey, answers }),
        })
      } catch {
        setSaveError("تعذّر الحفظ. سيُعاد المحاولة.")
      } finally {
        setSaving(false)
      }
    },
    [id]
  )

  // Debounced auto-save (30 s)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (currentSection) {
        saveSection(currentSection.key, currentAnswers)
      }
    }, 30_000)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [currentAnswers, currentSection, saveSection])

  function handleAnswer(key: string, val: string | number | boolean) {
    setSectionAnswers((prev) => ({
      ...prev,
      [currentSection.key]: {
        ...(prev[currentSection.key] ?? {}),
        [key]: val,
      },
    }))
  }

  async function handleNext() {
    await saveSection(currentSection.key, currentAnswers)
    if (currentSectionIndex < WIZARD_SECTIONS.length - 1) {
      setCurrentSectionIndex((i) => i + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  async function handlePrev() {
    await saveSection(currentSection.key, currentAnswers)
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex((i) => i - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  async function handleSectionClick(index: number) {
    await saveSection(currentSection.key, currentAnswers)
    setCurrentSectionIndex(index)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handleSaveDraft() {
    await saveSection(currentSection.key, currentAnswers)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)]">
        <div className="text-[var(--color-muted)] text-lg">جارٍ التحميل...</div>
      </div>
    )
  }

  const badge = getCompletionBadge(overallCompletion)
  const progressPercent = ((currentSectionIndex + 1) / WIZARD_SECTIONS.length) * 100

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-border)] px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-[var(--color-primary)]">فرنشايز ريدي</span>
          <span className="text-[var(--color-muted)] text-sm hidden sm:inline">/ استبيان الجاهزية</span>
        </div>
        <div className="flex items-center gap-3">
          {saveError && (
            <span className="text-xs text-red-600">{saveError}</span>
          )}
          {saving && (
            <span className="text-xs text-[var(--color-muted)]">جارٍ الحفظ...</span>
          )}
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.color}`}>
            {badge.label}
          </span>
          <span className="text-sm text-[var(--color-muted)]">
            اكتمال البيانات:{" "}
            <strong className="text-[var(--color-primary)]">{overallCompletion}%</strong>
          </span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-l border-[var(--color-border)] overflow-y-auto shrink-0">
          <div className="p-4 border-b border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-muted)] font-medium">أقسام الاستبيان</p>
          </div>
          <nav className="p-2 space-y-1">
            {WIZARD_SECTIONS.map((section, index) => {
              const done = isSectionComplete(section, sectionAnswers[section.key] ?? {})
              const active = index === currentSectionIndex
              return (
                <button
                  key={section.key}
                  onClick={() => handleSectionClick(index)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-right transition-colors ${
                    active
                      ? "bg-[var(--color-primary)] text-white font-semibold"
                      : "hover:bg-[var(--color-surface)] text-[var(--color-foreground)]"
                  }`}
                >
                  <span className="text-lg shrink-0">{section.icon}</span>
                  <span className="flex-1 truncate">{section.titleAr}</span>
                  {done && !active && (
                    <span className="text-green-500 shrink-0">✓</span>
                  )}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Section Header */}
            <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <span className="text-4xl">{currentSection.icon}</span>
                <div>
                  <h1 className="text-xl font-bold text-[var(--color-foreground)]">
                    {currentSection.titleAr}
                  </h1>
                  <p className="text-sm text-[var(--color-muted)] mt-1">
                    {currentSection.descriptionAr}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-5 space-y-1.5">
                <div className="flex justify-between text-xs text-[var(--color-muted)]">
                  <span>
                    القسم {currentSectionIndex + 1} من {WIZARD_SECTIONS.length}
                  </span>
                  <span>{Math.round(progressPercent)}%</span>
                </div>
                <div className="w-full h-2 bg-[var(--color-surface)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* All-done CTA */}
            {allDone && (
              <div className="bg-gradient-to-l from-[#1a5c3a] to-[#2d7a52] text-white rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row items-center gap-4 justify-between">
                <div>
                  <h2 className="text-lg font-bold">🎉 اكتملت بياناتك!</h2>
                  <p className="text-sm text-white/80 mt-1">
                    أنت جاهز للمرحلة التالية. ارفع ملفاتك الداعمة لإتمام التحليل.
                  </p>
                </div>
                <button
                  onClick={() => router.push(`/dashboard/projects/${id}/files`)}
                  className="shrink-0 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white font-bold px-6 py-3 rounded-xl transition-colors"
                >
                  جهّز الملفات ←
                </button>
              </div>
            )}

            {/* Questions */}
            <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6 shadow-sm space-y-6">
              {currentSection.questions.map((question) => (
                <div key={question.key}>
                  <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-1">
                    {question.labelAr}
                    {question.required !== false && (
                      <span className="text-red-500 mr-1">*</span>
                    )}
                    {question.unit && question.type !== "number" && (
                      <span className="text-[var(--color-muted)] font-normal mr-1">
                        ({question.unit})
                      </span>
                    )}
                  </label>
                  <QuestionField
                    question={question}
                    value={currentAnswers[question.key]}
                    onChange={handleAnswer}
                  />
                  {question.helpAr && (
                    <p className="mt-1.5 text-xs text-[var(--color-muted)]">
                      {question.helpAr}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-8">
              <div className="flex gap-2">
                {currentSectionIndex > 0 && (
                  <button
                    onClick={handlePrev}
                    className="px-5 py-2.5 rounded-lg border border-[var(--color-border)] text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-surface)] transition-colors"
                  >
                    → السابق
                  </button>
                )}
                <button
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-lg border border-[var(--color-primary)] text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-accent)] transition-colors disabled:opacity-50"
                >
                  حفظ مسودة
                </button>
              </div>

              {currentSectionIndex < WIZARD_SECTIONS.length - 1 ? (
                <button
                  onClick={handleNext}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {saving ? "جارٍ الحفظ..." : "← حفظ والتالي"}
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleSaveDraft().then(() =>
                      router.push(`/dashboard/projects/${id}/files`)
                    )
                  }}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-lg bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  ← التالي: رفع الملفات
                </button>
              )}
            </div>
          </div>

          {/* Mobile section nav */}
          <div className="md:hidden fixed bottom-0 right-0 left-0 bg-white border-t border-[var(--color-border)] px-4 py-3 overflow-x-auto flex gap-2">
            {WIZARD_SECTIONS.map((section, index) => {
              const done = isSectionComplete(section, sectionAnswers[section.key] ?? {})
              const active = index === currentSectionIndex
              return (
                <button
                  key={section.key}
                  onClick={() => handleSectionClick(index)}
                  className={`shrink-0 flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-xs transition-colors ${
                    active
                      ? "text-[var(--color-primary)] font-semibold"
                      : "text-[var(--color-muted)]"
                  }`}
                >
                  <span className="text-lg">{section.icon}</span>
                  {done && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                </button>
              )
            })}
          </div>
        </main>
      </div>
    </div>
  )
}
