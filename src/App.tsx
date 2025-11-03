import {
  ActivityIcon,
  AudioWaveformIcon,
  ChevronRightIcon,
  MusicIcon,
  SettingsIcon,
} from "lucide-react";
import { AudioControls } from "./components/AudioControls";
import { ErrorMessage } from "./components/ErrorMessage";
import { Instructions } from "./components/Instructions";
import { StatsSection } from "./components/StatsSection";
import { StatusIndicator } from "./components/StatusIndicator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./components/ui/accordion";
import { Button } from "./components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  useSidebar,
} from "./components/ui/sidebar";
import { VisualizerCanvas } from "./components/VisualizerCanvas";
import { VisualizerSettings } from "./components/VisualizerSettings";
import { useAudioVisualizer } from "./hooks/useAudioVisualizer";
import { useConfigStorage } from "./hooks/useConfigStorage";

function AppContent() {
  const {
    isListening,
    error,
    audioSource,
    setAudioSource,
    browserWarning,
    handleFileUpload,
    startVisualizer,
    stopVisualizer,
    analyserRef,
    dataArrayRef,
  } = useAudioVisualizer();

  const [config, setConfig] = useConfigStorage();
  const { toggleSidebar, open } = useSidebar();

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      {/* Full-screen canvas background */}
      <VisualizerCanvas
        analyserRef={analyserRef}
        config={config}
        dataArrayRef={dataArrayRef}
        isListening={isListening}
      />

      <div className="absolute top-0 right-0">
        <Button
          className="bg-black hover:bg-white/5 text-white hover:text-white border-l border-b border-white/30 rounded-r-none rounded-tl-none size-10"
          onClick={toggleSidebar}
          size="icon-lg"
          title="Open Menu"
          variant="ghost"
        >
          <AudioWaveformIcon className="size-6" />
        </Button>
      </div>

      {/* Sidebar overlay - doesn't affect main content */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={
          {
            "--sidebar-width": "24rem",
            "--sidebar-width-mobile": "20rem",
          } as React.CSSProperties
        }
      >
        <Sidebar
          className="pointer-events-auto bg-black p-0"
          collapsible="offcanvas"
          side="right"
          variant="inset"
        >
          {open && (
            <Button
              className="absolute left-0 top-6 -translate-y-1/2 -translate-x-full hover:bg-white/1 bg-white/5 text-white hover:text-white hover:cursor-pointer h-12 w-8 p-0 rounded-tl-none rounded-r-none z-50"
              onClick={toggleSidebar}
              size="icon"
              title="Close Menu"
              variant="ghost"
            >
              <ChevronRightIcon className="size-6" />
            </Button>
          )}

          <SidebarHeader className="bg-black/95">
            <div className="flex items-center gap-3 w-full">
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2 flex-1">
                Music Visualizer
              </h1>
              <div className="shrink-0">
                {isListening && (
                  <StatusIndicator
                    audioSource={audioSource}
                    isListening={isListening}
                  />
                )}
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="gap-0 p-4 bg-black/95 pt-2 overflow-x-hidden">
            <Accordion
              className="w-full"
              defaultValue={["audio", "settings"]}
              type="multiple"
            >
              {/* Audio Controls Section */}
              <AccordionItem className="border-white/10" value="audio">
                <AccordionTrigger className="text-white hover:no-underline">
                  <span className="flex items-center gap-2 text-lg font-bold">
                    <MusicIcon className="w-5 h-5" />
                    Audio Controls
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <AudioControls
                    audioSource={audioSource}
                    browserWarning={browserWarning}
                    isListening={isListening}
                    onFileUpload={handleFileUpload}
                    onStart={startVisualizer}
                    onStop={stopVisualizer}
                    setAudioSource={setAudioSource}
                  />

                  {error && (
                    <div className="mt-4">
                      <ErrorMessage message={error} />
                    </div>
                  )}

                  <div className="mt-4">
                    <Instructions
                      audioSource={audioSource}
                      isListening={isListening}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Settings Section */}
              <AccordionItem className="border-white/10" value="settings">
                <AccordionTrigger className="text-white hover:no-underline">
                  <span className="flex items-center gap-2 text-lg font-bold">
                    <SettingsIcon className="w-5 h-5" />
                    Visualizer Settings
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <VisualizerSettings config={config} onChange={setConfig} />
                </AccordionContent>
              </AccordionItem>

              {/* Stats Section */}
              <AccordionItem className="border-white/10" value="stats">
                <AccordionTrigger className="text-white hover:no-underline">
                  <span className="flex items-center gap-2 text-lg font-bold">
                    <ActivityIcon className="w-5 h-5" />
                    Stats for Nerds
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <StatsSection
                    analyserRef={analyserRef}
                    config={config}
                    dataArrayRef={dataArrayRef}
                    isListening={isListening}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </SidebarContent>
        </Sidebar>
      </div>
    </div>
  );
}

function App() {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppContent />
    </SidebarProvider>
  );
}

export default App;
