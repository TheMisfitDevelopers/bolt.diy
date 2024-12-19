import { useCallback, useRef, useState, useEffect } from 'react';
import { useClipboard } from './useClipboard';
import { logStore } from '~/lib/stores/logs';
import type { Terminal } from '@xterm/xterm';

const MAX_HISTORY = 25;

export function useTerminal() {
  const terminalRef = useRef<Terminal | null>(null);
  const { copyToClipboard } = useClipboard();
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentCommand, setCurrentCommand] = useState('');
  const [currentLineBuffer, setCurrentLineBuffer] = useState('');

  const getCurrentLine = useCallback(() => {
    if (!terminalRef.current) {
      return '';
    }

    const buffer = terminalRef.current.buffer.active;
    const currentRow = buffer.getLine(buffer.cursorY);

    return currentRow?.translateToString() || '';
  }, []);

  const addToHistory = useCallback((command: string) => {
    setCommandHistory((prev) => {
      const newHistory = [command, ...prev.slice(0, MAX_HISTORY - 1)];
      return newHistory;
    });
    setHistoryIndex(-1);
  }, []);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!terminalRef.current) {
        return true;
      }

      if (event.key === 'ArrowUp') {
        const nextIndex = Math.min(historyIndex + 1, commandHistory.length - 1);

        if (nextIndex >= 0 && commandHistory[nextIndex]) {
          if (historyIndex === -1) {
            setCurrentLineBuffer(getCurrentLine());
          }

          setHistoryIndex(nextIndex);
          terminalRef.current.write('\x1b[2K\r' + commandHistory[nextIndex]);
        }

        return false;
      }

      if (event.key === 'ArrowDown') {
        if (historyIndex > 0) {
          const nextIndex = historyIndex - 1;
          setHistoryIndex(nextIndex);
          terminalRef.current.write('\x1b[2K\r' + commandHistory[nextIndex]);
        } else if (historyIndex === 0) {
          setHistoryIndex(-1);
          terminalRef.current.write('\x1b[2K\r' + currentLineBuffer);
        }

        return false;
      }

      if (event.key === 'Enter') {
        const currentLine = getCurrentLine();

        if (currentLine) {
          addToHistory(currentLine);
        }
      }

      return true;
    },
    [commandHistory, historyIndex, currentLineBuffer, getCurrentLine, addToHistory],
  );

  const copyTerminalSelection = useCallback(async () => {
    if (!terminalRef.current) {
      return;
    }

    const selection = terminalRef.current.getSelection();

    if (selection) {
      await copyToClipboard(selection);
      logStore.logUserAction('Terminal selection copied');
    }
  }, [copyToClipboard]);

  const pasteToTerminal = useCallback(async (text: string) => {
    if (!terminalRef.current) {
      return;
    }

    terminalRef.current.paste(text);
    logStore.logUserAction('Text pasted to terminal');
  }, []);

  const handleCommand = (command: string) => {
    setCurrentCommand(command);

    // ... process command
  };

  useEffect(() => {
    if (currentCommand) {
      // do something with currentCommand
    }
  }, [currentCommand]);

  return {
    terminalRef,
    copyTerminalSelection,
    pasteToTerminal,
    commandHistory,
    handleKeyPress,
    handleCommand,
  };
}
