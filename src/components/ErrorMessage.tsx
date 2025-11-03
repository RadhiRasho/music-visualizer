import { AlertTriangleIcon } from "lucide-react";

interface ErrorMessageProps {
    message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
    return (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 text-red-200 px-4 py-3 flex items-start gap-2 text-sm">
            <AlertTriangleIcon className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="flex-1">{message}</p>
        </div>
    );
}
