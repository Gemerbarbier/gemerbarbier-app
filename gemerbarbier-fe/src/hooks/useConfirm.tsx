import { useCallback, useState } from "react";
import { AlertTriangle } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "destructive" zvýrazní potvrdzovacie tlačidlo červeno (rušenie, deaktivácia) */
  variant?: "default" | "destructive";
}

interface PendingConfirm {
  options: ConfirmOptions;
  resolve: (confirmed: boolean) => void;
}

/**
 * Náhrada natívneho window.confirm dialógom v dizajne stránky.
 *
 * const { confirm, confirmDialog } = useConfirm();
 * if (!(await confirm({ title: "..." }))) return;
 * ...a niekde v JSX vykresliť {confirmDialog}
 */
export function useConfirm() {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => setPending({ options, resolve })),
    [],
  );

  const settle = (confirmed: boolean) => {
    pending?.resolve(confirmed);
    setPending(null);
  };

  const options = pending?.options;
  const isDestructive = options?.variant === "destructive";

  const confirmDialog = (
    <AlertDialog open={pending !== null} onOpenChange={(open) => !open && settle(false)}>
      <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md border-border bg-card">
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0",
                isDestructive ? "bg-destructive/15 text-destructive" : "bg-accent/15 text-accent",
              )}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="min-w-0 space-y-1.5">
              <AlertDialogTitle className="text-base sm:text-lg">{options?.title}</AlertDialogTitle>
              {options?.description && (
                <AlertDialogDescription className="text-xs sm:text-sm">
                  {options.description}
                </AlertDialogDescription>
              )}
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="text-xs sm:text-sm" onClick={() => settle(false)}>
            {options?.cancelLabel ?? "Zrušiť"}
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(
              "text-xs sm:text-sm",
              isDestructive
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-accent text-accent-foreground hover:bg-accent/80",
            )}
            onClick={() => settle(true)}
          >
            {options?.confirmLabel ?? "Potvrdiť"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { confirm, confirmDialog };
}
