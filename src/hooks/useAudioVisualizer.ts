import { useCallback, useEffect, useRef, useState } from "react";

type AudioSource = "microphone" | "tab" | "system" | "file";

const AUDIO_SOURCE_KEY = "music-visualizer-audio-source";

export function useAudioVisualizer() {
	const [isListening, setIsListening] = useState(false);
	const [error, setError] = useState<string>("");
	const [audioSource, setAudioSource] = useState<AudioSource>(() => {
		// Load audio source from sessionStorage
		try {
			const stored = sessionStorage.getItem(AUDIO_SOURCE_KEY);
			if (stored && ["microphone", "tab", "system", "file"].includes(stored)) {
				return stored as AudioSource;
			}
		} catch (error) {
			console.error("Failed to load audio source from sessionStorage:", error);
		}
		return "tab";
	});
	const [browserWarning, setBrowserWarning] = useState<string>("");

	const audioContextRef = useRef<AudioContext | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const dataArrayRef = useRef<Uint8Array | null>(null);
	const sourceRef = useRef<
		MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null
	>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const audioElementRef = useRef<HTMLAudioElement | null>(null);

	// Save audio source to sessionStorage whenever it changes
	useEffect(() => {
		try {
			sessionStorage.setItem(AUDIO_SOURCE_KEY, audioSource);
		} catch (error) {
			console.error("Failed to save audio source to sessionStorage:", error);
		}
	}, [audioSource]);

	// Check browser compatibility
	useEffect(() => {
		const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");
		if (isFirefox && (audioSource === "tab" || audioSource === "system")) {
			setBrowserWarning(
				"Firefox doesn't support tab/system audio capture well. Please use the Audio File option or try Chrome/Edge.",
			);
		} else {
			setBrowserWarning("");
		}
	}, [audioSource]);

	const handleFileUpload = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;

			try {
				const audioContext = new AudioContext();
				const analyser = audioContext.createAnalyser();
				const audio = new Audio(URL.createObjectURL(file));
				const source = audioContext.createMediaElementSource(audio);

				analyser.fftSize = 2048;
				const bufferLength = analyser.frequencyBinCount;
				const dataArray = new Uint8Array(bufferLength);

				source.connect(analyser);
				analyser.connect(audioContext.destination);

				audioContextRef.current = audioContext;
				analyserRef.current = analyser;
				dataArrayRef.current = dataArray;
				sourceRef.current = source;
				audioElementRef.current = audio;

				await audio.play();

				setIsListening(true);
				setError("");
			} catch (err) {
				console.error("Error loading audio file:", err);
				setError("Failed to load audio file. Please try a different file.");
			}
		},
		[],
	);

	const startVisualizer = useCallback(async () => {
		try {
			let stream: MediaStream;
			if (audioSource === "microphone") {
				stream = await navigator.mediaDevices.getUserMedia({
					audio: {
						autoGainControl: false,
						echoCancellation: false,
						noiseSuppression: false,
					},
				});
			} else {
				const displayMediaOptions: DisplayMediaStreamOptions = {
					audio: {
						autoGainControl: false,
						echoCancellation: false,
						noiseSuppression: false,
					} as MediaTrackConstraints,
					video: true,
				};
				if (audioSource === "tab") {
					// @ts-expect-error preferCurrentTab missing in TS types
					displayMediaOptions.preferCurrentTab = false;
					// @ts-expect-error systemAudio missing in TS types
					displayMediaOptions.systemAudio = "exclude";
				} else if (audioSource === "system") {
					// @ts-expect-error systemAudio missing in TS types
					displayMediaOptions.systemAudio = "include";
				}
				stream =
					await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
			}

			const audioTracks = stream.getAudioTracks();
			if (audioTracks.length === 0) {
				throw new Error(
					audioSource === "tab"
						? 'No audio track found. Make sure "Share tab audio" is checked in the dialog.'
						: audioSource === "system"
							? 'No audio track found. Make sure "Share system audio" is checked in the dialog.'
							: "No audio track found. Please allow microphone access.",
				);
			}

			const audioContext = new AudioContext();
			const analyser = audioContext.createAnalyser();
			const source = audioContext.createMediaStreamSource(stream);

			analyser.fftSize = 2048;
			const bufferLength = analyser.frequencyBinCount;
			const dataArray = new Uint8Array(bufferLength);

			source.connect(analyser);

			audioContextRef.current = audioContext;
			analyserRef.current = analyser;
			dataArrayRef.current = dataArray;
			sourceRef.current = source;
			streamRef.current = stream;

			setIsListening(true);
			setError("");
		} catch (err) {
			console.error("Error starting visualizer:", err);
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError(
					"Failed to start visualizer. Please check permissions and try again.",
				);
			}
		}
	}, [audioSource]);

	const stopVisualizer = useCallback(() => {
		if (streamRef.current) {
			streamRef.current.getTracks().forEach((track) => {
				track.stop();
			});
			streamRef.current = null;
		}

		if (audioElementRef.current) {
			audioElementRef.current.pause();
			audioElementRef.current.src = "";
			audioElementRef.current = null;
		}

		if (sourceRef.current) {
			sourceRef.current.disconnect();
			sourceRef.current = null;
		}

		if (audioContextRef.current) {
			audioContextRef.current.close();
			audioContextRef.current = null;
		}

		analyserRef.current = null;
		dataArrayRef.current = null;
		setIsListening(false);
	}, []);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (audioContextRef.current) {
				audioContextRef.current.close();
			}
		};
	}, []);

	return {
		analyserRef,
		audioSource,
		browserWarning,
		dataArrayRef,
		error,
		handleFileUpload,
		isListening,
		setAudioSource,
		startVisualizer,
		stopVisualizer,
	};
}
