"use client";

import { useState, useTransition } from "react";

import { fitBagToStock } from "@/app/bag/actions";

import { setBagCount } from "./bag-count";

/** Shown above the bag when stock dropped below some lines; one click brings them back in line. */
export function FitBagNotice() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function fit() {
    setError(undefined);
    startTransition(async () => {
      const result = await fitBagToStock();
      setBagCount(result.count);
      setError(result.error);
    });
  }

  return (
    <div role="alert" className="flex flex-col items-center gap-2 bg-surface px-4 py-4 text-center text-body-sm">
      <p className="text-sale">Some pieces in your bag are no longer available in the quantity you chose.</p>
      <button
        type="button"
        className="link cursor-pointer text-caption disabled:cursor-default disabled:text-muted"
        disabled={pending}
        onClick={fit}
      >
        {pending ? "Updating…" : "Update my bag to what’s available"}
      </button>
      {error && <p className="text-sale">{error}</p>}
    </div>
  );
}
