"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FilePlus } from "lucide-react"; // Added import for FilePlus
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { mockCorporations } from "@/lib/types";
import { useCaseStore } from "@/lib/case-store";

interface NewCaseDialogProps {
  onCaseCreated?: (caseId: string) => void;
}

export function NewCaseDialog({ onCaseCreated }: NewCaseDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedCorporation, setSelectedCorporation] = useState<string>("");
  const [selectedStore, setSelectedStore] = useState<string>("");
  const { createCase } = useCaseStore();

  const selectedCorp = mockCorporations.find((c) => c.id === selectedCorporation);
  const stores = selectedCorp?.stores || [];

  const handleSubmit = () => {
    if (!selectedCorporation || !selectedStore) return;

    const corp = mockCorporations.find((c) => c.id === selectedCorporation);
    const store = corp?.stores.find((s) => s.id === selectedStore);

    if (corp && store) {
      const newCase = createCase(corp.name, store.name);
      setOpen(false);
      setSelectedCorporation("");
      setSelectedStore("");
      onCaseCreated?.(newCase.id);
    }
  };

  const handleCorporationChange = (value: string) => {
    setSelectedCorporation(value);
    setSelectedStore("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <FilePlus className="mr-2 h-4 w-4" /> {/* Updated to use FilePlus */}
          新規案件作成
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>新規案件作成</DialogTitle>
          <DialogDescription>
            案件を作成する法人と店舗を選択してください。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="corporation">法人</Label>
            <Select
              value={selectedCorporation}
              onValueChange={handleCorporationChange}
            >
              <SelectTrigger id="corporation">
                <SelectValue placeholder="法人を選択" />
              </SelectTrigger>
              <SelectContent>
                {mockCorporations.map((corp) => (
                  <SelectItem key={corp.id} value={corp.id}>
                    {corp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="store">店舗</Label>
            <Select
              value={selectedStore}
              onValueChange={setSelectedStore}
              disabled={!selectedCorporation}
            >
              <SelectTrigger id="store">
                <SelectValue placeholder="店舗を選択" />
              </SelectTrigger>
              <SelectContent>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            キャンセル
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedCorporation || !selectedStore}
          >
            登録
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
