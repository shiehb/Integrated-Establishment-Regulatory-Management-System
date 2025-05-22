import { createRoot } from "react-dom/client"
import App from "./App"
import "./index.css"
import { Toaster } from "sonner"

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Toaster 
      position="top-center"
      richColors
      expand={true}
      closeButton
      toastOptions={{
        duration: 5000,
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
    />
  </>,
)
