import { AlertTriangle, X } from 'lucide-react';

/**
 * Custom confirmation dialog component
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the dialog is visible
 * @param {string} props.title - Dialog title
 * @param {string} props.message - Dialog message/description
 * @param {function} props.onConfirm - Callback when user confirms
 * @param {function} props.onCancel - Callback when user cancels
 * @param {string} props.confirmText - Text for confirm button (default: "Delete")
 * @param {string} props.cancelText - Text for cancel button (default: "Cancel")
 * @param {boolean} props.danger - Whether this is a destructive action (red styling)
 */
const ConfirmDialog = ({
    isOpen,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    onConfirm,
    onCancel,
    confirmText = 'Delete',
    cancelText = 'Cancel',
    danger = true
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Dialog */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up">
                {/* Header */}
                <div className="p-5 pb-0">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${danger ? 'bg-red-100' : 'bg-blue-100'}`}>
                            <AlertTriangle size={24} className={danger ? 'text-red-600' : 'text-blue-600'} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                            <p className="text-gray-500 text-sm mt-1">{message}</p>
                        </div>
                        <button
                            onClick={onCancel}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={20} className="text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-5 flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 px-4 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-3 px-4 rounded-xl font-semibold text-white transition-colors ${danger
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
