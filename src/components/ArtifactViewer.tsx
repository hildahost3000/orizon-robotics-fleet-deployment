'use client'

interface ArtifactViewerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  data: Record<string, unknown> | null
}

export function ArtifactViewer({ isOpen, onClose, title, data }: ArtifactViewerProps) {
  if (!isOpen || !data) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-fleet-panel border border-fleet-border rounded-xl w-[700px] max-h-[80vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-fleet-border">
          <div>
            <h2 className="text-sm font-bold text-white">{title}</h2>
            <p className="text-[10px] text-gray-500">Structured JSON artifact from agent workflow</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-6">
          <pre className="text-[11px] text-gray-300 font-mono whitespace-pre-wrap leading-relaxed bg-gray-900/50 rounded-lg p-4 border border-gray-800">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
