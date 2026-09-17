import { FileSignature, UploadCloud, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSignatureUpload } from "../hooks/use-signature-upload";

export default function SignatureUploader() {
  const {
    selectedFile,
    previewUrl,
    isUploading,
    error,
    success,
    fileInputRef,
    handleFileChange,
    handleRemoveFile,
    handleUpload,
  } = useSignatureUpload();

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-6 py-4">
        <h2 className="font-semibold flex items-center gap-2">
          <FileSignature className="size-4" />
          Tanda Tangan (Signature)
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Unggah gambar tanda tangan Anda untuk keperluan dokumen digital
        </p>
      </div>
      
      <div className="p-6">
        {!selectedFile ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 px-6 py-10 transition-colors hover:bg-muted/40">
            <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
              <UploadCloud className="size-6 text-muted-foreground" />
            </div>
            <p className="mb-1 text-sm font-medium">Klik untuk memilih file</p>
            <p className="mb-4 text-xs text-muted-foreground">
              PNG, JPG, JPEG (Max. 2MB)
            </p>
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Pilih Gambar
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative flex items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/20 p-4">
              <img
                src={previewUrl!}
                alt="Preview Tanda Tangan"
                className="max-h-48 object-contain"
              />
              <button
                onClick={handleRemoveFile}
                className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20"
                disabled={isUploading}
              >
                <X className="size-3" />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">
                {selectedFile.name}
              </div>
              <Button
                size="sm"
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? "Mengunggah..." : "Upload Tanda Tangan"}
              </Button>
            </div>
            
            {error && (
              <p className="text-xs font-medium text-destructive">{error}</p>
            )}
            
            {success && (
              <div className="flex items-center gap-1.5 rounded-md bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                <Check className="size-3.5" />
                Tanda tangan berhasil diunggah!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
