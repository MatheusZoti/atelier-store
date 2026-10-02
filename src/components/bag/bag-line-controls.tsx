"use client";

import { useState, useTransition } from "react";

import { updateBagQuantity } from "@/app/bag/actions";
import { cx } from "@/lib/cx";

import { setBagCount } from "./bag-count";

type BagLineControlsProps = {
  slug: string;
  name: string;
  quantity: number;
  /** Most this line can hold (stock, capped); the + button stops here. */
  limit: number;
};

const stepButton =
  "inline-flex size-10 cursor-pointer items-center justify-center text-lead transition-colors hover:bg-surface disabled:cursor-default disabled:text-muted disabled:hover:bg-transparent";

/** Quantity stepper and remove link for one bag line. */
export function BagLineControls({ slug, name, quantity, limit }: BagLineControlsProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function change(next: number) {
    setError(undefined);
    startTransition(async () => {
      const result = await updateBagQuantity(slug, next);
      setBagCount(result.count);
      setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className={cx("inline-flex items-center border", pending && "opacity-60")}>
          <button
            type="button"
            className={stepButton}
            aria-label={`Remove one ${name}`}
            disabled={pending || quantity <= 1}
            onClick={() => change(quantity - 1)}
          >
            −
          </button>
          <span className="w-8 text-center text-body-sm tabular-nums" aria-live="polite">
            <span className="sr-only">Quantity </span>
            {quantity}
          </span>
          <button
            type="button"
            className={stepButton}
            aria-label={`Add one more ${name}`}
            disabled={pending || quantity >= limit}
            onClick={() => change(quantity + 1)}
          >
            +
          </button>
        </div>
        <button
          type="button"
          className="link cursor-pointer text-caption disabled:cursor-default disabled:text-muted"
          disabled={pending}
          onClick={() => change(0)}
        >
          Remove<span className="sr-only"> {name}</span>
        </button>
      </div>
      {error && (
        <p role="alert" className="text-body-sm text-sale">
          {error}
        </p>
      )}
    </div>
  );
}
