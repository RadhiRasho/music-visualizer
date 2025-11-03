type AudioSource = "microphone" | "tab" | "system" | "file";

interface StatusIndicatorProps {
    isListening: boolean;
    audioSource: AudioSource;
}

export function StatusIndicator({
    isListening,
    audioSource,
}: StatusIndicatorProps) {
    if (!isListening) {
        return null;
    }

    const sourceLabel =
        audioSource === "microphone"
            ? "Mic"
            : audioSource === "tab"
                ? "Tab"
                : audioSource === "file"
                    ? "File"
                    : "System";

    return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-500/20 border border-green-500/30">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 font-medium text-xs">
                {sourceLabel}
            </span>
        </div>
    );
}
