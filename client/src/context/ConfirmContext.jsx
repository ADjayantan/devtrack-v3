import { createContext, useContext, useState, useCallback } from 'react';

const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
  const [state, setState] = useState({ open: false, message: '', resolve: null });

  const confirm = useCallback(
    (message) =>
      new Promise((resolve) => {
        setState({ open: true, message, resolve });
      }),
    []
  );

  const handleChoice = (result) => {
    state.resolve(result);
    setState({ open: false, message: '', resolve: null });
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {state.open && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-navy-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-slide-up">
            <p className="text-slate-200 text-sm mb-6">{state.message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => handleChoice(false)}
                className="btn-ghost text-sm px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={() => handleChoice(true)}
                className="bg-red-900/60 hover:bg-red-800/60 border border-red-700/50 text-red-300 
                           font-medium text-sm px-4 py-2 rounded-lg transition-all active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
};
