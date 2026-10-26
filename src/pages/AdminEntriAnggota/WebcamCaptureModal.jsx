import { useState, useRef, useEffect, useCallback } from 'react'
import { Camera, X, RefreshCw, Check, AlertCircle } from 'lucide-react'

export default function WebcamCaptureModal({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [capturedImage, setCapturedImage] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const [facingMode, setFacingMode] = useState('user')

  const startCamera = useCallback(async () => {
    setCameraError(null)
    setCapturedImage(null)

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Browser Anda tidak mendukung akses perangkat kamera.')
      return
    }

    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 640 },
          height: { ideal: 853 }, // 3:4 aspect ratio portrait
        },
        audio: false,
      })

      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      console.error('Camera access error:', err)
      if (err.name === 'NotAllowedError') {
        setCameraError('Izin akses kamera ditolak. Silakan izinkan akses kamera di browser Anda.')
      } else if (err.name === 'NotFoundError') {
        setCameraError('Perangkat webcam tidak ditemukan.')
      } else {
        setCameraError('Gagal mengakses kamera: ' + (err.message || 'Error tidak diketahui'))
      }
    }
  }, [facingMode])

  useEffect(() => {
    if (isOpen) {
      startCamera()
    } else {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
        setStream(null)
      }
      setCapturedImage(null)
      setCameraError(null)
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [isOpen])

  const takeSnapshot = () => {
    if (!videoRef.current) return
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 480
    canvas.height = video.videoHeight || 640
    const ctx = canvas.getContext('2d')

    // Horizontal flip if front camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    setCapturedImage(dataUrl)
  }

  const handleRetake = () => {
    setCapturedImage(null)
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Ambil Pas Foto Anggota (3x4)
              </h3>
              <p className="text-[11px] text-slate-500">
                Posisikan wajah di tengah area pandang dengan latar polos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Camera Area */}
        <div className="relative p-6 flex flex-col items-center justify-center bg-slate-900 min-h-[360px]">
          {cameraError ? (
            <div className="text-center p-6 text-white max-w-xs space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
              <p className="text-xs text-rose-200">{cameraError}</p>
              <button
                type="button"
                onClick={startCamera}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg"
              >
                Coba Lagi
              </button>
            </div>
          ) : capturedImage ? (
            <div className="relative w-52 h-[276px] rounded-xl overflow-hidden shadow-2xl border-2 border-emerald-500">
              <img
                src={capturedImage}
                alt="Captured Snapshot"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <Check className="w-3 h-3" /> Foto Terambil
              </div>
            </div>
          ) : (
            <div className="relative w-56 h-[298px] rounded-xl overflow-hidden shadow-2xl border-2 border-blue-400/60 bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />
              {/* Pas foto 3:4 guideline frame */}
              <div className="absolute inset-4 border-2 border-dashed border-white/50 rounded-lg pointer-events-none flex items-center justify-center">
                <span className="text-[10px] text-white/70 bg-black/40 px-2 py-0.5 rounded-sm">
                  Area Pas Foto 3x4
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-white transition-all"
          >
            Tutup
          </button>

          <div className="flex items-center gap-2">
            {capturedImage ? (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Foto Ulang
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-5 py-2 rounded-xl bg-[#0B2256] hover:bg-[#112d6e] text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
                >
                  <Check className="w-4 h-4" />
                  Gunakan Foto Ini
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={takeSnapshot}
                disabled={Boolean(cameraError)}
                className="px-6 py-2.5 rounded-xl bg-[#0B2256] hover:bg-[#112d6e] active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-900/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                Ambil Foto
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
