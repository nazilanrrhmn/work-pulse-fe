import { useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-store";
import { uploadSignature } from "@/stores/profile/async";

export function useSignatureUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.profile);
  const isUploading = loading === "pending";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setSuccess(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await dispatch(uploadSignature(selectedFile)).unwrap();
      setSuccess(true);
      // Clean up after success
      setTimeout(() => {
        handleRemoveFile();
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return {
    selectedFile,
    previewUrl,
    isUploading,
    error,
    success,
    fileInputRef,
    handleFileChange,
    handleRemoveFile,
    handleUpload,
  };
}
