import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { useTerminal } from '~/lib/hooks/useTerminal';
import { useEffect } from 'react';

const TERMINAL_GREEN = '#00ff00';

export function Terminal() {
  const { terminalRef, copyTerminalSelection, pasteToTerminal, handleKeyPress } = useTerminal();

  useEffect(() => {
    if (!terminalRef.current) {
      const term = new XTerm({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'monospace',
        theme: {
          background: '#1a1b1e',
          foreground: TERMINAL_GREEN,
          cursor: TERMINAL_GREEN,
          cursorAccent: '#1a1b1e',
        },
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);

      term.attachCustomKeyEventHandler((event) => {
        if (event.ctrlKey || event.metaKey) {
          if (event.key === 'c' && term.hasSelection()) {
            copyTerminalSelection();
            return false;
          }

          if (event.key === 'v') {
            navigator.clipboard.readText().then(pasteToTerminal);
            return false;
          }
        }

        return handleKeyPress(event);
      });

      term.open(document.getElementById('terminal')!);
      terminalRef.current = term;
      fitAddon.fit();
    }
  }, [copyTerminalSelection, pasteToTerminal, handleKeyPress]);

  return (
    <div className="relative h-full">
      <div id="terminal" className="h-full" />
      <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
        <button
          onClick={copyTerminalSelection}
          className="text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary p-1"
          title="Copy selection (Ctrl+C)"
        >
          <span className="i-ph:copy" />
        </button>
      </div>
    </div>
  );
}
