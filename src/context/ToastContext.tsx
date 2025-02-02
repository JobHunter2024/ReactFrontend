// src/context/ToastContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

type ToastContextType = {
  showToast: (message: string, variant: "success" | "danger") => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

type ToastProviderProps = {
  children: ReactNode;
};

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<{ message: string; variant: string }[]>(
    []
  );

  const showToast = (message: string, variant: "success" | "danger") => {
    setToasts((prev) => [...prev, { message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.slice(1)); // Remove the oldest toast after 3 seconds
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1050,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {toasts.map((toast, index) => (
          <div
            key={index}
            className={`toast show text-white fw-semibold bg-${toast.variant} rounded-lg shadow-lg w-64 max-w-md text-center font-bold p-3 text-lg mb-4`}
          >
            <div className="toast-body">{toast.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
