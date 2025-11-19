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

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  count,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const [seconds, setSeconds] = useState(10);

  useEffect(() => {
    if (!open) {
      setSeconds(10);
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
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-red-600">
            Confirm Delete
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm">
          You are about to delete <strong>{count}</strong> users.
          <br />
          This action cannot be undone.
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
            variant="destructive"
            disabled={seconds > 0}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="cursor-pointer"
          >
            {seconds > 0 ? `Delete in ${seconds}s` : "Delete Now"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
