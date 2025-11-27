/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import { Search } from "lucide-react";
import { userApi } from "@/lib/userApi";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface UserSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: number) => void;
  type: string;
  excludeIds?: number[];
}

export const UserSearchDialog = ({
  isOpen,
  onClose,
  onSelect,
  type,
  excludeIds = [],
}: UserSearchDialogProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchAllUsers = async () => {
        setIsSearching(true);
        try {
          const res = await userApi.getAll();
          const data =
            (res.data as any).data || (res.data as any).results || res.data;
          const safeData = Array.isArray(data) ? data : [];
          setSearchResults(
            safeData.filter((u: User) => !excludeIds.includes(u.id))
          );
        } catch (error) {
          console.error("Failed to fetch users", error);
        } finally {
          setIsSearching(false);
        }
      };
      fetchAllUsers();
    }
  }, [isOpen, excludeIds]);

  const filteredResults = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    const targetRole = type.toUpperCase();
    return searchResults.filter(
      (u) =>
        (!u.role || u.role === targetRole) &&
        (u.full_name?.toLowerCase().includes(lower) ||
          u.email?.toLowerCase().includes(lower))
    );
  }, [searchTerm, searchResults, type]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] z-50">
        <DialogHeader>
          <DialogTitle>
            Add {type === "Supervisor" ? "Trainer" : type}
          </DialogTitle>
          <DialogDescription>Search by name or email.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="flex gap-2">
            <Input
              placeholder="Type name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              disabled={isSearching}
              variant="ghost"
              size="icon"
              className="cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
          <ScrollArea className="h-[200px] border border-border rounded-md p-2">
            {filteredResults.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                No users found.
              </p>
            ) : (
              <div className="space-y-2">
                {filteredResults.map((u) => (
                  <div
                    key={u.id}
                    className="flex justify-between items-center p-2 hover:bg-accent rounded-md border border-transparent hover:border-border"
                  >
                    <div className="overflow-hidden">
                      <p className="font-medium truncate">{u.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {u.email}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        onSelect(u.id);
                        onClose();
                      }}
                      className="cursor-pointer"
                    >
                      Select
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
