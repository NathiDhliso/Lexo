import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface DocumentUploadWithProcessingProps {
    matterId: string;
    onUploadComplete: () => void;
}

export const DocumentUploadWithProcessing: React.FC<DocumentUploadWithProcessingProps> = ({
    matterId,
    onUploadComplete,
}) => {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    const handleFiles = async (files: FileList) => {
        const file = files[0];
        if (!file) return;

        setUploading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const fileExt = file.name.split('.').pop();
            const fileName = `${matterId}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('documents')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { error: dbError } = await supabase
                .from('document_uploads')
                .insert({
                    matter_id: matterId,
                    name: file.name,
                    file_type: file.type,
                    file_size: file.size,
                    storage_path: fileName,
                    uploaded_by: user.id,
                });

            if (dbError) throw dbError;

            toast.success('Document uploaded successfully');
            onUploadComplete();
        } catch (error) {
            console.error('Error uploading document:', error);
            toast.error('Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                : 'border-neutral-300 dark:border-metallic-gray-600 hover:border-neutral-400 dark:hover:border-metallic-gray-500'
                }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleChange}
                disabled={uploading}
            />

            <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
            >
                <Upload className={`w-12 h-12 mb-4 ${uploading ? 'text-neutral-400' : 'text-neutral-500 dark:text-neutral-400'}`} />

                {uploading ? (
                    <div className="space-y-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            Uploading document...
                        </p>
                    </div>
                ) : (
                    <>
                        <p className="text-base font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Drop your file here or click to browse
                        </p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Supports PDF, DOC, DOCX, and other common formats
                        </p>
                    </>
                )}
            </label>
        </div>
    );
};
