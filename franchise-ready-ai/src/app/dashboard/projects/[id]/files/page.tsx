"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"

const FILE_TYPES = [
  { key: "logo", labelAr: "شعار المنشأة", accept: ".png,.jpg,.svg", required: true },
  { key: "cr", labelAr: "السجل التجاري", accept: ".pdf,.jpg,.png", required: false },
  { key: "trademark", labelAr: "شهادة العلامة التجارية", accept: ".pdf", required: false },
  { key: "license", labelAr: "الترخيص البلدي", accept: ".pdf", required: false },
  { key: "menu", labelAr: "قائمة المنتجات", accept: ".pdf,.xlsx,.csv,.docx", required: false },
  { key: "financial", labelAr: "الكشف المالي", accept: ".pdf,.xlsx,.csv", required: false },
  { key: "suppliers", labelAr: "قائمة الموردين", accept: ".pdf,.xlsx,.csv,.docx", required: false },
  { key: "sop", labelAr: "أدلة التشغيل", accept: ".pdf,.docx", required: false },
  { key: "products", labelAr: "صور المنتجات", accept: ".jpg,.png", required: false },
  { key: "branches", labelAr: "صور الفروع", accept: ".jpg,.png", required: false },
  { key: "pos_export", labelAr: "تصدير مبيعات POS", accept: ".xlsx,.csv", required: false },
] as const

type FileKey = (typeof FILE_TYPES)[number]["key"]

interface UploadedFileInfo {
  fileId: string
  fileName: string
  url: string | null
}

interface UploadState {
  uploading: boolean
  progress: number
  error: string | null
  uploaded: UploadedFileInfo | null
}

const MAX_SIZE_MB = 25
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} بايت`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} كيلوبايت`
  return `${(bytes / (1024 * 1024)).toFixed(1)} ميجابايت`
}

function isImageFile(fileName: string): boolean {
  return /\.(jpg|jpeg|png|svg|gif|webp)$/i.test(fileName)
}

export default function FilesPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const router = useRouter()

  const [uploadStates, setUploadStates] = useState<Record<FileKey, UploadState>>(
    () =>
      Object.fromEntries(
        FILE_TYPES.map((ft) => [
          ft.key,
          { uploading: false, progress: 0, error: null, uploaded: null },
        ])
      ) as Record<FileKey, UploadState>
  )

  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<FileKey | null>(null)
  const [loadingExisting, setLoadingExisting] = useState(true)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  // Load existing files
  useEffect(() => {
    async function loadFiles() {
      try {
        const res = await fetch(`/api/projects/${id}/files`)
        if (!res.ok) return
        const data = await res.json()
        if (Array.isArray(data.files)) {
          const updates: Partial<Record<FileKey, UploadState>> = {}
          for (const file of data.files as Array<{
            fileType: string
            id: string
            fileName: string
            publicUrl: string | null
          }>) {
            const key = file.fileType as FileKey
            if (FILE_TYPES.some((ft) => ft.key === key)) {
              updates[key] = {
                uploading: false,
                progress: 100,
                error: null,
                uploaded: {
                  fileId: file.id,
                  fileName: file.fileName,
                  url: file.publicUrl,
                },
              }
              if (key === "logo" && file.publicUrl) {
                setLogoPreview(file.publicUrl)
              }
            }
          }
          if (Object.keys(updates).length > 0) {
            setUploadStates((prev) => ({ ...prev, ...updates }))
          }
        }
      } catch {
        // ignore
      } finally {
        setLoadingExisting(false)
      }
    }
    loadFiles()
  }, [id])

  const uploadFile = useCallback(
    async (fileKey: FileKey, file: File) => {
      if (file.size > MAX_SIZE_BYTES) {
        setUploadStates((prev) => ({
          ...prev,
          [fileKey]: {
            ...prev[fileKey],
            error: `حجم الملف يتجاوز الحد الأقصى (${MAX_SIZE_MB} ميجابايت)`,
          },
        }))
        return
      }

      setUploadStates((prev) => ({
        ...prev,
        [fileKey]: { uploading: true, progress: 0, error: null, uploaded: null },
      }))

      // Show logo preview immediately for better UX
      if (fileKey === "logo" && isImageFile(file.name)) {
        const reader = new FileReader()
        reader.onload = (e) => setLogoPreview(e.target?.result as string)
        reader.readAsDataURL(file)
      }

      try {
        const formData = new FormData()
        formData.append("fileType", fileKey)
        formData.append("file", file)

        // Simulate progress since fetch doesn't expose upload progress
        const progressInterval = setInterval(() => {
          setUploadStates((prev) => {
            const current = prev[fileKey]
            if (!current.uploading) {
              clearInterval(progressInterval)
              return prev
            }
            return {
              ...prev,
              [fileKey]: { ...current, progress: Math.min(current.progress + 15, 85) },
            }
          })
        }, 200)

        const res = await fetch(`/api/projects/${id}/files`, {
          method: "POST",
          body: formData,
        })
        clearInterval(progressInterval)

        const data = await res.json()

        if (!res.ok || !data.success) {
          throw new Error(data.error ?? "فشل رفع الملف")
        }

        setUploadStates((prev) => ({
          ...prev,
          [fileKey]: {
            uploading: false,
            progress: 100,
            error: null,
            uploaded: {
              fileId: data.fileId,
              fileName: file.name,
              url: data.url,
            },
          },
        }))

        if (fileKey === "logo" && data.url) {
          setLogoPreview(data.url)
        }
      } catch (err) {
        setLogoPreview(null)
        setUploadStates((prev) => ({
          ...prev,
          [fileKey]: {
            uploading: false,
            progress: 0,
            error: err instanceof Error ? err.message : "فشل رفع الملف",
            uploaded: null,
          },
        }))
      }
    },
    [id]
  )

  async function handleDelete(fileKey: FileKey) {
    const state = uploadStates[fileKey]
    if (!state.uploaded) return

    try {
      await fetch(`/api/projects/${id}/files?fileId=${state.uploaded.fileId}`, {
        method: "DELETE",
      })
      setUploadStates((prev) => ({
        ...prev,
        [fileKey]: { uploading: false, progress: 0, error: null, uploaded: null },
      }))
      if (fileKey === "logo") setLogoPreview(null)
      if (fileInputRefs.current[fileKey]) {
        fileInputRefs.current[fileKey]!.value = ""
      }
    } catch {
      // ignore
    }
  }

  function handleDrop(fileKey: FileKey, e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(null)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(fileKey, file)
  }

  function handleFileChange(fileKey: FileKey, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadFile(fileKey, file)
  }

  const uploadedCount = FILE_TYPES.filter((ft) => uploadStates[ft.key].uploaded).length
  const requiredDone = FILE_TYPES.filter((ft) => ft.required).every(
    (ft) => uploadStates[ft.key].uploaded
  )

  if (loadingExisting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)]">
        <div className="text-[var(--color-muted)] text-lg">جارٍ التحميل...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-border)] px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-[var(--color-primary)]">فرنشايز ريدي</span>
          <span className="text-[var(--color-muted)] text-sm hidden sm:inline">/ رفع الملفات</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--color-muted)]">
            {uploadedCount} / {FILE_TYPES.length} ملف
          </span>
          {requiredDone && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
              ✓ متطلبات مكتملة
            </span>
          )}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">رفع الملفات الداعمة</h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            ارفع الوثائق والملفات اللازمة لتعزيز تقرير جاهزية الفرنشايز. الحد الأقصى للملف: {MAX_SIZE_MB} ميجابايت.
          </p>
        </div>

        {/* Logo preview */}
        {logoPreview && (
          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5 shadow-sm flex items-center gap-5">
            <div className="w-20 h-20 rounded-xl border border-[var(--color-border)] overflow-hidden flex items-center justify-center bg-[var(--color-surface)] shrink-0">
              <Image
                src={logoPreview}
                alt="شعار المنشأة"
                width={80}
                height={80}
                className="object-contain w-full h-full"
                unoptimized
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-foreground)]">شعار المنشأة</p>
              <p className="text-xs text-[var(--color-muted)] mt-0.5">تمت المعاينة بنجاح</p>
            </div>
          </div>
        )}

        {/* File upload cards */}
        <div className="space-y-4">
          {FILE_TYPES.map((fileType) => {
            const state = uploadStates[fileType.key]
            const isDragging = dragOver === fileType.key

            return (
              <div
                key={fileType.key}
                className="bg-white rounded-2xl border border-[var(--color-border)] p-5 shadow-sm"
              >
                {/* Label row */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-semibold text-[var(--color-foreground)]">
                    {fileType.labelAr}
                  </span>
                  {fileType.required && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">
                      مطلوب
                    </span>
                  )}
                  {state.uploaded && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">
                      ✓ تم الرفع
                    </span>
                  )}
                  <span className="text-xs text-[var(--color-muted)] mr-auto">
                    {fileType.accept}
                  </span>
                </div>

                {/* Uploaded state */}
                {state.uploaded ? (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                    <span className="text-green-600 text-lg">📎</span>
                    <span className="text-sm text-green-800 flex-1 truncate">
                      {state.uploaded.fileName}
                    </span>
                    <button
                      onClick={() => handleDelete(fileType.key)}
                      className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                    >
                      حذف
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Drop zone */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault()
                        setDragOver(fileType.key)
                      }}
                      onDragLeave={() => setDragOver(null)}
                      onDrop={(e) => handleDrop(fileType.key, e)}
                      className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-3 transition-colors cursor-pointer ${
                        isDragging
                          ? "border-[var(--color-primary)] bg-[var(--color-accent)]"
                          : "border-[var(--color-border)] hover:border-[var(--color-primary-light)] hover:bg-[var(--color-surface)]"
                      }`}
                      onClick={() => fileInputRefs.current[fileType.key]?.click()}
                    >
                      <span className="text-3xl">
                        {state.uploading ? "⏳" : "📁"}
                      </span>
                      <div className="text-center">
                        <p className="text-sm font-medium text-[var(--color-foreground)]">
                          {state.uploading ? "جارٍ الرفع..." : "اسحب الملف هنا أو اضغط للاختيار"}
                        </p>
                        <p className="text-xs text-[var(--color-muted)] mt-1">
                          الحد الأقصى: {MAX_SIZE_MB} ميجابايت
                        </p>
                      </div>
                      <input
                        ref={(el) => {
                          fileInputRefs.current[fileType.key] = el
                        }}
                        type="file"
                        accept={fileType.accept}
                        className="sr-only"
                        onChange={(e) => handleFileChange(fileType.key, e)}
                      />
                    </div>

                    {/* Upload progress */}
                    {state.uploading && (
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-xs text-[var(--color-muted)]">
                          <span>جارٍ الرفع...</span>
                          <span>{state.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[var(--color-surface)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-300"
                            style={{ width: `${state.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Error */}
                    {state.error && (
                      <div className="mt-2 flex items-start gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-100">
                        <span className="shrink-0">⚠️</span>
                        <span>{state.error}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8">
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-[var(--color-border)] text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-surface)] transition-colors"
          >
            → العودة للاستبيان
          </button>
          <button
            onClick={() => router.push(`/dashboard/projects/${id}/review`)}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold text-white transition-colors ${
              requiredDone
                ? "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]"
                : "bg-[var(--color-muted)] cursor-not-allowed"
            }`}
            disabled={!requiredDone}
            title={!requiredDone ? "يرجى رفع الملفات المطلوبة أولاً" : undefined}
          >
            ← التالي: تحليل البيانات
          </button>
        </div>
      </div>
    </div>
  )
}
