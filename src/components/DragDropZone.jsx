import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, X, AlertCircle } from 'lucide-react';

/**
 * Drag and drop file upload zone
 * @param {Object} props
 * @param {function} props.onFileSelect - Callback when file is selected
 * @param {boolean} props.isLoading - Whether file is being processed
 * @param {string} props.error - Error message to display
 */
const DragDropZone = ({ onFileSelect, isLoading = false, error = null }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState(null);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleFileInput = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleFile = (file) => {
        const validExtensions = ['xlsx', 'xls', 'csv'];
        const extension = file.name.split('.').pop().toLowerCase();

        if (!validExtensions.includes(extension)) {
            onFileSelect(null, 'Please upload a .xlsx or .csv file');
            return;
        }

        setFileName(file.name);
        onFileSelect(file, null);
    };

    const clearFile = () => {
        setFileName(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="w-full">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isLoading && fileInputRef.current?.click()}
                className={`
          relative overflow-hidden rounded-2xl border-2 border-dashed p-8 
          cursor-pointer transition-all duration-300 ease-out
          ${isDragging
                        ? 'border-blue-400 bg-blue-50/80 scale-[1.02]'
                        : 'border-white/30 bg-white/10 hover:bg-white/20 hover:border-white/50'
                    }
          ${isLoading ? 'pointer-events-none opacity-70' : ''}
        `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileInput}
                    className="hidden"
                />

                <div className="flex flex-col items-center text-center">
                    {isLoading ? (
                        <>
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 animate-pulse">
                                <FileSpreadsheet size={32} className="text-white" />
                            </div>
                            <p className="text-white font-semibold mb-1">Processing...</p>
                            <p className="text-blue-200 text-sm">{fileName}</p>
                        </>
                    ) : fileName ? (
                        <>
                            <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mb-4">
                                <FileSpreadsheet size={32} className="text-green-400" />
                            </div>
                            <p className="text-white font-semibold mb-1">{fileName}</p>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearFile();
                                }}
                                className="text-blue-200 text-sm flex items-center gap-1 hover:text-white transition-colors"
                            >
                                <X size={14} />
                                Remove file
                            </button>
                        </>
                    ) : (
                        <>
                            <div className={`w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 transition-transform ${isDragging ? 'scale-110' : ''}`}>
                                <Upload size={32} className="text-white" />
                            </div>
                            <p className="text-white font-semibold mb-1">
                                {isDragging ? 'Drop your file here' : 'Upload Schedule'}
                            </p>
                            <p className="text-blue-200 text-sm">
                                Drag & drop or click to browse
                            </p>
                            <p className="text-blue-300/60 text-xs mt-2">
                                Supports .xlsx and .csv files
                            </p>
                        </>
                    )}
                </div>
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-400/30 rounded-xl flex items-center gap-3">
                    <AlertCircle size={18} className="text-red-300 shrink-0" />
                    <p className="text-red-200 text-sm">{error}</p>
                </div>
            )}
        </div>
    );
};

export default DragDropZone;
