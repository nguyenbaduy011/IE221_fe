"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BulkActionConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  action: "activate" | "deactivate"; // action type
  onConfirm: () => void;
  waitSeconds?: number; // thời gian chờ trước khi bật nút
}

export function BulkActionConfirmDialog({
  open,
  onOpenChange,
  count,
  action,
  onConfirm,
  waitSeconds = 5, // mặc định 5 giây
}: BulkActionConfirmDialogProps) {
  const [seconds, setSeconds] = useState(waitSeconds);

  useEffect(() => {
    if (!open) {
      setSeconds(waitSeconds);
      return;
    }

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev === 1) {
          clearInterval(timer);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, waitSeconds]);

  const actionText =
    action === "activate"
      ? "Activate selected users"
      : "Deactivate selected users";
  const actionColor =
    action === "activate" ? "text-emerald-600" : "text-red-600";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className={`text-lg font-semibold ${actionColor}`}>
            Confirm {action.charAt(0).toUpperCase() + action.slice(1)}
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm">
          You are about to <strong>{action}</strong> <strong>{count}</strong>{" "}
          users.
        </p>

        <p className="text-sm text-muted-foreground mt-2">
          Please wait <strong>{seconds}s</strong> before confirming.
        </p>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            variant={action === "activate" ? "default" : "destructive"}
            disabled={seconds > 0}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="cursor-pointer"
          >
            {seconds > 0 ? `${actionText} in ${seconds}s` : `${actionText} Now`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
