import { ClipboardListIcon } from "lucide-react";

type AudioSource = "microphone" | "tab" | "system" | "file";

interface InstructionsProps {
    audioSource: AudioSource;
    isListening: boolean;
}

export function Instructions({ audioSource, isListening }: InstructionsProps) {
    if (
        isListening ||
        audioSource === "microphone" ||
        audioSource === "file"
    ) {
        return null;
    }

    return (
        <div className="rounded-lg border border-white/20 bg-white/5 p-4">
            <h3 className="font-bold text-white mb-3 text-sm flex items-center gap-2">
                <ClipboardListIcon className="w-4 h-4" />
                <span>
                    {audioSource === "tab"
                        ? "How to capture tab audio"
                        : "How to capture system audio"}
                </span>
            </h3>
            {audioSource === "tab" ? (
                <ol className="list-decimal pl-5 space-y-1.5 text-white/70 text-xs leading-relaxed">
                    <li>
                        Open YouTube/Spotify/etc in a{" "}
                        <strong className="text-white">different tab</strong>
                    </li>
                    <li>Start playing music in that tab</li>
                    <li>Click "Start Visualizer" above</li>
                    <li>
                        In the picker dialog, choose{" "}
                        <strong className="text-white">Chrome Tab</strong>
                    </li>
                    <li>Select the tab and click Share</li>
                    <li>
                        <strong className="text-white">Important:</strong> Ensure{" "}
                        <em>Share tab audio</em> is checked
                    </li>
                </ol>
            ) : (
                <ol className="list-decimal pl-5 space-y-1.5 text-white/70 text-xs leading-relaxed">
                    <li>Start playing music in any application</li>
                    <li>Click "Start Visualizer" above</li>
                    <li>Choose Entire Screen or Window</li>
                    <li>
                        <strong className="text-white">Critical:</strong> Check{" "}
                        <em>Share system audio</em> at the bottom
                    </li>
                    <li>Click Share</li>
                </ol>
            )}
        </div>
    );
}
