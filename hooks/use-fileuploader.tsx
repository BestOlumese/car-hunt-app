"use client";
import { useCallback, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { toast } from "./use-toast";
import axios, { AxiosProgressEvent } from "axios";

interface UseFileUploaderProps {
  uploadApiEndpoint: string;
  onFileUrlsReceived: (fileUrls: string[]) => void;
}

interface UseFileUploaderResult {
  getRootProps: ReturnType<typeof useDropzone>["getRootProps"];
  getInputProps: ReturnType<typeof useDropzone>["getInputProps"];
  isDragActive: ReturnType<typeof useDropzone>["isDragActive"];
  files: File[];
  uploading: boolean;
  uploadProgress: number;
//   removeFile: (fileToRemove: File) => void;
  fileRejections: ReturnType<typeof useDropzone>["fileRejections"];
}

const useFileUploader = ({
  uploadApiEndpoint,
  onFileUrlsReceived,
}: UseFileUploaderProps): UseFileUploaderResult => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const uploadFilesToApi = useCallback(
    async (filesToUpload: File[]) => {
        setUploading(true);
        setUploadProgress(0);
        try {
            const formData = new FormData();
            filesToUpload.forEach((file) => {
                formData.append("files", file); 
            });

            const response = await axios.post(uploadApiEndpoint, formData, {
                headers: {"Content-Type": "multipart/form-data"},
                onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                    const progress = progressEvent.total
                        ? Math.round((progressEvent.loaded * 100)/progressEvent.total) : 0;
                    setUploadProgress(progress);
                }
            });

            if (response.status !== 200) {
                toast({
                    title: "Upload failed",
                    description: "Please try again.",
                    variant: "destructive",
                });
                return;
            }
            const fileUrls = response.data?.files.map((file: any) => file.url);
            if(!fileUrls || !Array.isArray(fileUrls)) {
                toast({
                    title: "Upload failed",
                    description: "Please try again.",
                    variant: "destructive",
                });
                return;
            }
            onFileUrlsReceived(fileUrls);
            setFiles([]);
        } catch (error) {
            toast({
                title: "Upload failed",
                description: "Please try again.",
                variant: "destructive",
            });
        } finally {
            setUploading(false);
        }
    },
    []
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
        setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
        if (rejectedFiles.length > 0) {
            toast({
                title: "File type not supported",
                description: "Please upload a valid image file",
                variant: "destructive",
            });
            return;
        }
        await uploadFilesToApi(acceptedFiles);
    },
    []
  );

  const {getRootProps, getInputProps, isDragActive, fileRejections} = useDropzone({
    onDrop,
    accept: {
        "image/png": [".png"],
        "image/jpeg": [".jpg", ".jpeg"],
        "image/webp": [".webp"],
    },
    maxFiles: 7,
    maxSize: 10 * 1024 * 1024,
  });

//   const removeFile = useCallback((fileToRemove: File) => {
//     setFiles((currentFiles) => currentFiles.filter((file) => file !== fileToRemove));
//   }, [])

  return {
    getRootProps,
    getInputProps,
    isDragActive,
    fileRejections,
    files,
    uploading,
    uploadProgress,
  };
};

export default useFileUploader;