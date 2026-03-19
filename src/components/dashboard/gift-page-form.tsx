"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { FUNDS } from "@/shared/constants/funds";
import { createGiftPage, updateGiftPage, deleteGiftPage } from "@/lib/actions/gift-pages";

const eventOptions = [
  { value: "Birthday", label: "Birthday" },
  { value: "Holiday", label: "Holiday" },
  { value: "Graduation", label: "Graduation" },
  { value: "Baby Shower", label: "Baby Shower" },
  { value: "Christening", label: "Christening" },
  { value: "Just Because", label: "Just Because" },
  { value: "Other", label: "Other" },
];

const fundOptions = FUNDS.map((fund) => ({
  value: fund.ticker,
  label: `${fund.ticker} — ${fund.name}`,
}));

interface GiftPageFormProps {
  mode: "create" | "edit";
  giftPageId?: string;
  defaultValues?: {
    childName: string;
    childDob: string;
    eventName: string;
    fundTicker: string;
  };
}

export function GiftPageForm({ mode, giftPageId, defaultValues }: GiftPageFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fundTicker, setFundTicker] = useState(defaultValues?.fundTicker ?? "VOO");

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await createGiftPage(formData);
      } else if (giftPageId) {
        await updateGiftPage(giftPageId, formData);
      }
    } catch {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (giftPageId) {
      await deleteGiftPage(giftPageId);
    }
  };

  const selectedFund = FUNDS.find((f) => f.ticker === fundTicker);

  return (
    <>
      <form action={handleSubmit} className="space-y-6">
        {/* Photo upload */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Child&apos;s Photo
          </label>
          <input
            type="file"
            name="childPhoto"
            accept="image/jpeg,image/png"
            className="block text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-primary-light file:text-primary-dark hover:file:bg-primary/20 file:cursor-pointer"
          />
          <p className="mt-1.5 text-xs text-text-secondary">
            Optional. JPG or PNG, max 2MB.
          </p>
        </div>

        <Input
          id="childName"
          name="childName"
          label="Child's Name"
          placeholder="e.g., Emma"
          required
          defaultValue={defaultValues?.childName}
        />

        <Input
          id="childDob"
          name="childDob"
          label="Date of Birth"
          type="date"
          helperText="Optional. Used to calculate projected growth over time."
          defaultValue={defaultValues?.childDob}
        />

        <Select
          id="eventName"
          name="eventName"
          label="Event"
          options={eventOptions}
          placeholder="Choose an occasion"
          required
          defaultValue={defaultValues?.eventName}
        />

        <Select
          id="fundTicker"
          name="fundTicker"
          label="Investment Fund"
          options={fundOptions}
          required
          value={fundTicker}
          onChange={(e) => setFundTicker(e.target.value)}
        />

        {selectedFund && (
          <div className="bg-primary-light rounded-[var(--radius-md)] p-4">
            <p className="text-sm text-primary-dark">
              <strong>{selectedFund.ticker}</strong> — {selectedFund.name}
              <br />
              <span className="text-xs">
                Historical avg. return: {(selectedFund.avgAnnualReturn * 100).toFixed(1)}% per year
              </span>
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="submit" isLoading={isSubmitting}>
            {mode === "create" ? "Create Gift Page" : "Save Changes"}
          </Button>
          <Link href="/gift-pages">
            <Button variant="ghost" type="button">
              Cancel
            </Button>
          </Link>
          {mode === "edit" && (
            <Button
              variant="danger"
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="ml-auto"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
          )}
        </div>
      </form>

      {mode === "edit" && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Gift Page"
        >
          <p className="text-text-secondary mb-6">
            Are you sure you want to delete this gift page? The shareable link will
            stop working.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Gift Page
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
