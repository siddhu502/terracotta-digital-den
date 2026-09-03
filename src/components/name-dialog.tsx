import { Loader2, PenLine } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  open: boolean;
  busy?: boolean;
  confirmLabel: string;
  onConfirm: (name: string) => void;
  onClose: () => void;
};

export function NameDialog({ open, busy, confirmLabel, onConfirm, onClose }: Props) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) setName(localStorage.getItem("buyer_name") ?? "");
  }, [open]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    localStorage.setItem("buyer_name", trimmed);
    onConfirm(trimmed);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent className="max-w-md">
        <form onSubmit={submit}>
          <DialogHeader className="text-left">
            <DialogTitle className="flex items-center gap-2 font-display text-xl">
              <PenLine className="size-5 text-primary" />
              तुमचे नाव लिहा
            </DialogTitle>
            <DialogDescription>
              हे नाव PDF च्या वर ठळक अक्षरात आणि प्रत्येक पानावर तिरक्या वॉटरमार्क म्हणून छापले जाईल.
            </DialogDescription>
          </DialogHeader>
          <div className="my-5 space-y-2">
            <Label htmlFor="buyer-name">पूर्ण नाव</Label>
            <Input
              id="buyer-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="उदा. उज्ज्वला सोनार"
              maxLength={60}
              autoFocus
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
              रद्द करा
            </Button>
            <Button type="submit" disabled={busy || !name.trim()}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              {confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
