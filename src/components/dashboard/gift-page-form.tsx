"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { FUNDS } from "@/shared/constants/funds";
import { createGiftPage, updateGiftPage, deleteGiftPage } from "@/lib/actions/gift-pages";
import { GrowthChart } from "@/components/dashboard/growth-chart";

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
    message: string;
  };
}

function getDefaultMessage(childName: string, eventName: string): string {
  const event = eventName ? eventName.toLowerCase() : "upcoming event";
  const name = childName || "[Child's Name]";
  return `Hi everyone! We're so excited to celebrate ${name}'s ${event}. This year, instead of traditional gifts, we're asking friends and family to contribute to their custodial investment account \u2014 a gift that will truly grow over time. Any amount is welcome and deeply appreciated. Thank you for being part of ${name}'s future!`;
}

export function GiftPageForm({ mode, giftPageId, defaultValues }: GiftPageFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fundTicker, setFundTicker] = useState(defaultValues?.fundTicker ?? "VOO");
  const [formError, setFormError] = useState<string | null>(null);
  const [childNameLocal, setChildNameLocal] = useState(defaultValues?.childName ?? "");
  const [eventNameLocal, setEventNameLocal] = useState(defaultValues?.eventName ?? "Birthday");
  const [message, setMessage] = useState(
    defaultValues?.message ?? (mode === "create" ? getDefaultMessage(defaultValues?.childName ?? "", "Birthday") : "")
  );
  const [messageEdited, setMessageEdited] = useState(mode === "edit");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setFormError("Photo must be JPG, PNG, or WebP.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFormError("Photo must be under 2MB.");
      return;
    }
    setFormError(null);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setFormError(null);

    // Inject drag-and-dropped photo into form data
    if (photoFile) {
      formData.set("childPhoto", photoFile);
    }

    let result: { error?: string } | undefined;
    try {
      if (mode === "create") {
        result = await createGiftPage(formData);
      } else if (giftPageId) {
        result = await updateGiftPage(giftPageId, formData);
      }
    } catch {
      // On success, redirect() throws NEXT_REDIRECT — this is expected.
      // Validation errors are returned as { error }, not thrown.
      return;
    }

    // If we're here, the action returned without redirecting — show error.
    if (result?.error) {
      setFormError(result.error);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (giftPageId) {
      await deleteGiftPage(giftPageId);
    }
  };

  const selectedFund = FUNDS.find((f) => f.ticker === fundTicker);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <form action={handleSubmit} className="space-y-6 lg:col-span-3">
        {/* Photo upload — drag & drop + click */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Child&apos;s Photo
          </label>
          <input
            ref={fileInputRef}
            type="file"
            name="childPhoto"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          {photoPreview ? (
            <div className="relative inline-block">
              <Image
                src={photoPreview}
                alt="Preview"
                width={120}
                height={120}
                className="rounded-[var(--radius-md)] object-cover w-[120px] h-[120px]"
              />
              <button
                type="button"
                onClick={clearPhoto}
                className="absolute -top-2 -right-2 w-6 h-6 bg-text-primary text-text-inverse rounded-full flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border-2 border-dashed p-6 cursor-pointer transition-colors ${
                isDragging
                  ? "border-primary bg-primary-light"
                  : "border-border hover:border-primary/50 hover:bg-surface-muted"
              }`}
            >
              <Upload className="h-6 w-6 text-text-secondary" />
              <p className="text-sm text-text-secondary text-center">
                <span className="font-medium text-primary">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-text-secondary">
                JPG, PNG or WebP, max 2MB
              </p>
            </div>
          )}
        </div>

        <Input
          id="childName"
          name="childName"
          label="Child's Name"
          placeholder="e.g., Emma"
          required
          defaultValue={defaultValues?.childName}
          onChange={(e) => {
            const name = e.target.value;
            setChildNameLocal(name);
            if (!messageEdited) setMessage(getDefaultMessage(name, eventNameLocal));
          }}
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
          onChange={(e) => {
            const event = e.target.value;
            setEventNameLocal(event);
            if (!messageEdited) setMessage(getDefaultMessage(childNameLocal, event));
          }}
        />

        {/* Message to givers */}
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-text-primary mb-1.5"
          >
            Message to Givers
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            maxLength={1000}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setMessageEdited(true);
            }}
            className="w-full rounded-[var(--radius-md)] border-2 border-border px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary transition-colors resize-none"
            placeholder="Write a personal message explaining why you're asking for investment gifts..."
          />
          <div className="flex justify-between mt-1.5">
            <p className="text-xs text-text-secondary">
              This message will appear on your gift page.
            </p>
            <p className="text-xs text-text-secondary">
              {message.length}/1000
            </p>
          </div>
        </div>

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

        {formError && (
          <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 rounded-[var(--radius-md)] p-3">
            <span>{formError}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-4">
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
              className="sm:ml-auto"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
          )}
        </div>
      </form>

      {/* Growth projection chart */}
      {selectedFund && (
        <div className="lg:col-span-2 lg:sticky lg:top-8 lg:self-start">
          <GrowthChart fund={selectedFund} />
        </div>
      )}
      </div>

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
