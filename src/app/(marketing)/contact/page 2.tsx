"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        setError(result.error || "Something went wrong. Please try again.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-background py-16 sm:py-24">
        <div className="max-w-lg mx-auto px-4 sm:px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl text-text-primary mb-3">Message sent!</h1>
          <p className="text-text-secondary text-lg">
            Thanks for reaching out. We&apos;ll get back to you as soon as
            possible.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background py-16 sm:py-24">
      <div className="max-w-lg mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">
            Get in Touch
          </p>
          <h1 className="text-3xl sm:text-4xl text-text-primary mb-3">
            Contact Us
          </h1>
          <p className="text-text-secondary">
            Have a question, feedback, or just want to say hello? We&apos;d love
            to hear from you.
          </p>
        </div>

        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                id="name"
                name="name"
                label="Name"
                placeholder="Your name"
                required
              />
              <Input
                id="email"
                name="email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                required
              />
              <Input
                id="subject"
                name="subject"
                label="Subject"
                placeholder="What's this about?"
                required
              />
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-text-primary mb-1.5"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  placeholder="Tell us more..."
                  className="w-full rounded-[var(--radius-md)] border border-border bg-surface px-4 py-2.5 text-base text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                />
              </div>

              {error && (
                <p className="text-sm text-danger">{error}</p>
              )}

              <Button type="submit" isLoading={isSubmitting} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
