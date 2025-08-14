interface SplitViewProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

export function SplitView({ leftPanel, rightPanel }: SplitViewProps) {
  return (
    <div className="flex h-full">
      {/* Left Panel - Charts Area */}
      <div className="flex-1 p-6 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        {leftPanel}
      </div>

      {/* Right Panel - Chat Area */}
      <div className="flex-1 p-6 bg-white dark:bg-gray-900">{rightPanel}</div>
    </div>
  );
}
