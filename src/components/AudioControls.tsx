import {
    AlertTriangleIcon,
    AudioLinesIcon,
    FileAudioIcon,
    MicIcon,
    MonitorIcon,
    MusicIcon,
    PlayIcon,
    SquareIcon,
    UploadIcon,
} from "lucide-react";
import type { ChangeEvent } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";

type AudioSource = "microphone" | "tab" | "system" | "file";

interface AudioControlsProps {
    audioSource: AudioSource;
    setAudioSource: (source: AudioSource) => void;
    isListening: boolean;
    browserWarning: string;
    onFileUpload: (e: ChangeEvent<HTMLInputElement>) => void;
    onStart: () => void;
    onStop: () => void;
}

export function AudioControls({
    audioSource,
    setAudioSource,
    isListening,
    browserWarning,
    onFileUpload,
    onStart,
    onStop,
}: AudioControlsProps) {
    return (
        <section className="space-y-4">
            <div className="flex flex-col gap-3">
                <Label
                    className="text-xs font-semibold text-white/80 uppercase tracking-wide"
                    htmlFor="audio-source"
                >
                    Audio Source
                </Label>
                <div className="flex gap-2">
                    <Select
                        disabled={isListening}
                        onValueChange={(value) => setAudioSource(value as AudioSource)}
                        value={audioSource}
                    >
                        <SelectTrigger
                            className="bg-white/10 border-white/30 text-white hover:bg-white/20 flex-1"
                            id="audio-source"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent
                            className="bg-black/95 border-white/30 text-white z-100"
                            position="popper"
                            sideOffset={5}
                        >
                            <SelectItem value="tab">
                                <span className="flex items-center gap-2">
                                    <MusicIcon className="w-4 h-4" />
                                    Browser Tab Audio
                                </span>
                            </SelectItem>
                            <SelectItem value="system">
                                <span className="flex items-center gap-2">
                                    <MonitorIcon className="w-4 h-4" />
                                    System Audio
                                </span>
                            </SelectItem>
                            <SelectItem value="microphone">
                                <span className="flex items-center gap-2">
                                    <MicIcon className="w-4 h-4" />
                                    Microphone
                                </span>
                            </SelectItem>
                            <SelectItem value="file">
                                <span className="flex items-center gap-2">
                                    <FileAudioIcon className="w-4 h-4" />
                                    Audio File (Firefox)
                                </span>
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    {audioSource === "file" ? (
                        <>
                            {!isListening ? (
                                <Label
                                    className="inline-flex items-center justify-center gap-2 rounded-lg px-2 py-2.5 font-bold bg-white text-black hover:bg-white/90 cursor-pointer transition-colors shrink-0"
                                    htmlFor="audio-file"
                                >
                                    <UploadIcon className="w-5 h-5" />
                                    Upload
                                </Label>
                            ) : (
                                <Button
                                    className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 font-bold bg-white/20 border border-white/30 text-white hover:bg-white/30 shrink-0"
                                    onClick={onStop}
                                    type="button"
                                    variant="ghost"
                                >
                                    <SquareIcon className="w-5 h-5" />
                                    <span>Stop</span>
                                </Button>
                            )}
                            <input
                                accept="audio/*"
                                className="hidden"
                                id="audio-file"
                                onChange={onFileUpload}
                                type="file"
                            />
                        </>
                    ) : !isListening ? (
                        <Button
                            className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 font-bold bg-white text-black hover:bg-white/90 shrink-0"
                            onClick={onStart}
                            type="button"
                        >
                            <PlayIcon className="w-5 h-5" />
                            <span>Start</span>
                        </Button>
                    ) : (
                        <Button
                            className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 font-bold bg-white/20 border border-white/30 text-white hover:bg-white/30 shrink-0"
                            onClick={onStop}
                            type="button"
                            variant="ghost"
                        >
                            <SquareIcon className="w-5 h-5" />
                            <span>Stop</span>
                        </Button>
                    )}
                </div>
                {browserWarning && (
                    <p className="text-yellow-300 text-xs flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2">
                        <AlertTriangleIcon className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{browserWarning}</span>
                    </p>
                )}
            </div>

            {audioSource === "file" && isListening && (
                <div className="text-white/90 font-semibold text-sm flex items-center gap-2">
                    <AudioLinesIcon className="w-4 h-4" />
                    Playing...
                </div>
            )}
        </section>
    );
}
