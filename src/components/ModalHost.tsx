import { useState, ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalState {
  open: boolean;
  title: string;
  content: ReactNode;
  onOk?: () => void;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  width?: number;
  hideCancel?: boolean;
  danger?: boolean;
}

let modalListener: ((s: ModalState) => void) | null = null;

export function confirm(opts: {
  title: string;
  content: ReactNode;
  onOk?: () => void;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  danger?: boolean;
}) {
  if (!modalListener) return;
  modalListener({
    open: true,
    title: opts.title,
    content: opts.content,
    onOk: opts.onOk,
    onCancel: opts.onCancel,
    okText: opts.okText ?? '确定',
    cancelText: opts.cancelText ?? '取消',
    danger: opts.danger,
  });
}

export function ModalHost() {
  const [state, setState] = useState<ModalState>({
    open: false,
    title: '',
    content: null,
  });

  useState(() => {
    modalListener = (s) => setState(s);
    return null;
  });

  if (!state.open) return null;
  return (
    <>
      <div className="woo-modal-mask" />
      <div
        className="woo-modal-wrap"
        onClick={() => {
          state.onCancel?.();
          setState({ ...state, open: false });
        }}
      >
        <div
          className="woo-modal-main"
          style={{ width: state.width ?? 480 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="woo-modal-header">
            <span>{state.title}</span>
            <button
              className="woo-modal-close"
              onClick={() => {
                state.onCancel?.();
                setState({ ...state, open: false });
              }}
            >
              <X size={18} />
            </button>
          </div>
          <div className="woo-modal-body">{state.content}</div>
          <div className="woo-modal-footer">
            {!state.hideCancel && (
              <button
                className="woo-button woo-button-m woo-button-line woo-button-default"
                onClick={() => {
                  state.onCancel?.();
                  setState({ ...state, open: false });
                }}
              >
                {state.cancelText}
              </button>
            )}
            <button
              className={
                'woo-button woo-button-m woo-button-flat ' +
                (state.danger
                  ? 'woo-button-danger'
                  : 'woo-button-primary')
              }
              onClick={() => {
                state.onOk?.();
                setState({ ...state, open: false });
              }}
            >
              {state.okText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
