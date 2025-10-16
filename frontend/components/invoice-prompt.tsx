"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InvoicePromptProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (invoiceNumber?: string) => void;
  orderNumber: string;
}

export function InvoicePrompt({ isOpen, onClose, onConfirm, orderNumber }: InvoicePromptProps) {
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const handleConfirm = () => {
    onConfirm(invoiceNumber.trim() || undefined);
    setInvoiceNumber("");
  };

  const handleCancel = () => {
    setInvoiceNumber("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark Order as Received</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            You are about to mark order <strong>{orderNumber}</strong> as received. 
            This will automatically add all items to your inventory.
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="invoice">Invoice Number (Optional)</Label>
            <Input
              id="invoice"
              placeholder="Enter invoice number..."
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              You can leave this blank if no invoice number is available.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="bg-emerald-600 hover:bg-emerald-700">
            Mark as Received
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
