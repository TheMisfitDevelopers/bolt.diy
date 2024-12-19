import { type Message as AIMessage } from 'ai';
import { useClipboard } from '~/lib/hooks/useClipboard';
import { useState } from 'react';

interface MessageProps {
  message: AIMessage;
  onEdit?: (newContent: string) => void;
  editable?: boolean;
}

export function Message({ message, onEdit, editable = false }: MessageProps) {
  const { copied, copyToClipboard } = useClipboard();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleEdit = () => {
    onEdit?.(editContent);
    setIsEditing(false);
  };

  return (
    <div className="flex items-start gap-4 p-4 group relative">
      <div className="flex-1">
        {isEditing ? (
          <div className="flex gap-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 bg-bolt-elements-background-depth-2 rounded"
              autoFocus
            />
            <div className="flex flex-col gap-2">
              <button
                onClick={handleEdit}
                className="text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary"
                title="Save edit"
              >
                <span className="i-ph:check" />
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary"
                title="Cancel edit"
              >
                <span className="i-ph:x" />
              </button>
            </div>
          </div>
        ) : (
          <>
            {message.content}
            <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button
                onClick={() => copyToClipboard(message.content)}
                className="text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary"
                title="Copy message"
              >
                {copied ? 'Copied!' : <span className="i-ph:copy" />}
              </button>
              {editable && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary"
                  title="Edit message"
                >
                  <span className="i-ph:pencil" />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
