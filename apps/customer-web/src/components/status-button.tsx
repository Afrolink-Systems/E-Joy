"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";

export type StatusButtonStatus = "idle" | "loading" | "success" | "error";

export function StatusButton({
  className,
  disabled,
  idleText = "Save",
  loadingText = "Saving",
  successText = "Saved",
  errorText = "Try again",
  onClick,
  status,
  trailing,
}: {
  className?: string;
  disabled?: boolean;
  idleText?: string;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  onClick?: () => void;
  status: StatusButtonStatus;
  trailing?: React.ReactNode;
}) {
  const text = useMemo(() => {
    switch (status) {
      case "idle":
        return idleText;
      case "loading":
        return loadingText;
      case "success":
        return successText;
      case "error":
        return errorText;
    }
  }, [errorText, idleText, loadingText, status, successText]);

  return (
    <div className={cn("relative inline-flex w-full font-sans", className)}>
      <Button
        aria-label={idleText}
        onClick={onClick}
        className={cn(
          "relative h-[54px] w-full min-w-[140px] rounded-[1.05rem] px-6 text-base font-black transition-all duration-300 disabled:opacity-100",
          status === "idle"
            ? "bg-primary text-primary-foreground shadow-[0_18px_32px_rgba(20,20,20,0.18)] hover:bg-primary/90"
            : status === "error"
              ? "bg-red-50 text-red-600 hover:bg-red-50"
              : "cursor-not-allowed border-transparent bg-neutral-100 text-neutral-500 hover:bg-neutral-100",
        )}
        variant="default"
        disabled={disabled || status === "loading" || status === "success"}
      >
        <span className="flex w-full items-center justify-center gap-3">
          <span className="inline-flex min-w-0 justify-center">
            {text.split("").map((char, i) => (
              <span key={`${char}-${i}`} className="inline-block transition-all duration-200">
                {char === " " ? "\u00a0" : char}
              </span>
            ))}
          </span>
          {trailing ? <span className="ml-auto">{trailing}</span> : null}
        </span>
      </Button>

      <div className="pointer-events-none absolute -right-1 -top-1 z-10">
        {status !== "idle" ? (
          <div
            className={cn(
              "relative flex size-6 items-center justify-center overflow-visible rounded-full ring-3 transition-all duration-200",
              status === "success"
                ? "bg-primary text-primary-foreground ring-primary/10"
                : status === "error"
                  ? "bg-red-500 text-white ring-red-50"
                  : "bg-neutral-100 text-neutral-500 ring-neutral-100",
            )}
          >
            {status === "loading" ? <Loader /> : null}
            {status === "success" ? <Check className="size-4" /> : null}
            {status === "error" ? <span className="text-[14px] font-black">!</span> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function SaveButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleClick = () => {
    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2000);
    }, 2500);
  };

  const buttonStatus: StatusButtonStatus =
    status === "success" ? "success" : status === "loading" ? "loading" : "idle";

  return (
    <StatusButton
      className="w-auto"
      idleText="Save"
      loadingText="Saving"
      successText="Saved"
      status={buttonStatus}
      onClick={handleClick}
    />
  );
}

function Loader() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8A8 8 0 0 1 12 20Z"
        opacity=".5"
      />
      <path fill="currentColor" d="M20 12h2A10 10 0 0 0 12 2V4A8 8 0 0 1 20 12Z">
        <animateTransform
          attributeName="transform"
          dur="1s"
          from="0 12 12"
          repeatCount="indefinite"
          to="360 12 12"
          type="rotate"
        />
      </path>
    </svg>
  );
}
