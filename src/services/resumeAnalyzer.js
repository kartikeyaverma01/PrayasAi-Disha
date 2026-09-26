import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

const SKILLS = [
  'Python','Java','JavaScript','TypeScript','React','Node.js','Express','Flask','FastAPI','SQL','MySQL','MongoDB','Pandas','NumPy','Power BI','Tableau','Excel','Statistics','Machine Learning','TensorFlow','PyTorch','Docker','AWS','Azure','Git','GitHub','HTML','CSS','C++','C#','Kotlin','Android','Figma','UI/UX','Data Science','NLP','Deep Learning','Django','Spring Boot','PostgreSQL','Firebase','Linux','Kubernetes','Cybersecurity','Communication','Leadership','Problem Solving'
]

const normalize = (text) => text.toLowerCase().replace(/[^a-z0-9+#.\- ]/g, ' ')

async function extractPdfText(buffer) {
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  let text = ''
  const canvases = []

  for (let pageNo = 1; pageNo <= pdf.numPages; pageNo += 1) {
    const page = await pdf.getPage(pageNo)
    const content = await page.getTextContent()
    const pageText = content.items.map((item) => item.str || '').join(' ')
    text += `${pageText}\n`

    if (!pageText.trim()) {
      // Keep a small rendered canvas for OCR fallback when the PDF is scanned/image-only.
      const viewport = page.getViewport({ scale: 1.5 })
      const canvas = document.createElement('canvas')
      canvas.width = Math.ceil(viewport.width)
      canvas.height = Math.ceil(viewport.height)
      const context = canvas.getContext('2d', { willReadFrequently: true })
      await page.render({ canvasContext: context, viewport }).promise
      canvases.push(canvas)
    }
  }

  if (text.trim()) return text
  if (!canvases.length) return ''

  try {
    const { createWorker } = await import('tesseract.js')
    const worker = await createWorker('eng')
    let ocrText = ''
    for (const canvas of canvases) {
      const result = await worker.recognize(canvas)
      ocrText += `${result?.data?.text || ''}\n`
    }
    await worker.terminate()
    return ocrText
  } catch (error) {
    console.warn('PDF OCR fallback failed:', error)
    return ''
  }
}

export async function extractResumeText(file) {
  const name = file.name.toLowerCase()
  if (name.endsWith('.txt')) return file.text()

  if (name.endsWith('.pdf')) {
    return extractPdfText(await file.arrayBuffer())
  }

  if (name.endsWith('.docx')) {
    const mammoth = await import('mammoth/mammoth.browser')
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })
    return result.value || ''
  }

  throw new Error('Unsupported resume format')
}

export async function analyzeResumeFile(file) {
  const text = await extractResumeText(file)
  if (!text || text.trim().length < 20) {
    throw new Error('No readable text could be extracted from this resume.')
  }

  const normalized = normalize(text)
  const detectedSkills = SKILLS.filter((skill) => normalized.includes(normalize(skill)))
  const strongSkills = detectedSkills.slice(0, 10)
  const missingSkills = SKILLS.filter((skill) => !detectedSkills.includes(skill)).slice(0, 8)
  const skillLevels = [
    ...strongSkills.map((skill) => ({ skill, level: 85 })),
    ...missingSkills.map((skill) => ({ skill, level: 25 })),
  ]

  return {
    analyzedAt: new Date().toISOString(),
    fileName: file.name,
    extractedTextLength: text.length,
    matchedSkills: strongSkills,
    missingSkills,
    skillLevels,
    matchPercentage: Math.min(95, 45 + strongSkills.length * 5),
    recommendedLearningAreas: missingSkills.slice(0, 6).map((skill) => ({
      skill,
      reason: `Build ${skill} skills to widen internship opportunities.`,
    })),
  }
}
