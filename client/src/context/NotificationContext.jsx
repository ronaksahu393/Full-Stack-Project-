import React, { createContext, useContext, useState } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const notify = (message, type = "success", duration = 4200) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {/* Toast Notification Container */}
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0"
        role="region"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          let borderClass = "border-[#C4A46B]/40";
          let bgClass = "bg-[#173F35] text-[#FFFFFF]";
          let icon = <CheckCircle2 className="w-5 h-5 text-[#C4A46B] shrink-0 mt-0.5" />;

          if (toast.type === "error") {
            borderClass = "border-[#B83D3D]/50";
            bgClass = "bg-[#252923] text-[#FFFFFF]";
            icon = <AlertCircle className="w-5 h-5 text-[#B83D3D] shrink-0 mt-0.5" />;
          } else if (toast.type === "warning") {
            borderClass = "border-[#B77924]/50";
            bgClass = "bg-[#252923] text-[#FFFFFF]";
            icon = <AlertTriangle className="w-5 h-5 text-[#B77924] shrink-0 mt-0.5" />;
          } else if (toast.type === "info") {
            borderClass = "border-[#C4A46B]/40";
            bgClass = "bg-[#173F35] text-[#FFFFFF]";
            icon = <Info className="w-5 h-5 text-[#C4A46B] shrink-0 mt-0.5" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 shadow-elevated border ${borderClass} ${bgClass} transition-all duration-300 transform translate-y-0`}
            >
              {icon}
              <div className="flex-1 text-xs sm:text-sm font-light leading-relaxed">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-stone-300 hover:text-white transition-colors p-1"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotify = () => useContext(NotificationContext);
