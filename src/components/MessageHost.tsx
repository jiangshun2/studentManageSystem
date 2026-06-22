import { useState } from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

type MessageType = 'success' | 'error' | 'info' | 'warning';

interface MessageItem {
  id: number;
  type: MessageType;
  content: string;
}

let listener: ((item: MessageItem) => void) | null = null;
let idCounter = 0;

export function message(content: string, type: MessageType = 'info') {
  if (!listener) return;
  listener({ id: ++idCounter, type, content });
}

export function MessageHost() {
  const [items, setItems] = useState<MessageItem[]>([]);

  useState(() => {
    listener = (item) => {
      setItems((prev) => [...prev, item]);
      setTimeout(() => {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
      }, 2500);
    };
    return null;
  });

  const icons = {
    success: <CheckCircle2 size={18} />,
    error: <XCircle size={18} />,
    info: <Info size={18} />,
    warning: <AlertCircle size={18} />,
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 80,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            position: 'static',
            transform: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            minWidth: 200,
            color: '#fff',
            borderRadius: 4,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            background:
              item.type === 'success'
                ? 'rgba(82, 196, 26, 0.95)'
                : item.type === 'error'
                ? 'rgba(225, 65, 35, 0.95)'
                : item.type === 'warning'
                ? 'rgba(250, 173, 20, 0.95)'
                : 'rgba(0, 0, 0, 0.85)',
          }}
        >
          {icons[item.type]}
          <span style={{ flex: 1 }}>{item.content}</span>
          <X
            size={14}
            style={{ cursor: 'pointer', opacity: 0.7 }}
            onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
          />
        </div>
      ))}
    </div>
  );
}
