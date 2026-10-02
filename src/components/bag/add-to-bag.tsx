"use client";

import { useActionState, useEffect } from "react";

import type { AddToBagState } from "@/app/bag/actions";
import { BagIcon, Button, TextLink } from "@/components/ui";

import { setBagCount } from "./bag-count";

type AddToBagProps = {
  /** `addToBag` with the product slug bound by the server page. */
  action: (state: AddToBagState) => Promise<AddToBagState>;
};

/** "Add to bag" for the product page, with a quiet confirmation under the button. */
export function AddToBag({ action }: AddToBagProps) {
  const [state, formAction, pending] = useActionState(action, {});

  useEffect(() => setBagCount(state.count), [state]);

  return (
    <form action={formAction}>
      <Button type="submit" block disabled={pending}>
        <BagIcon width={16} height={16} />
        {pending ? "Adding…" : "Add to bag"}
      </Button>
      {/* Always rendered (zero height when empty) so screen readers hear the update. */}
      <div role="status" aria-live="polite" className="text-body-sm">
        {!pending && state.status && (
          <p className="mt-3">
            {state.status === "added" ? "Added to your bag." : state.message}{" "}
            <TextLink href="/bag">View bag</TextLink>
          </p>
        )}
        {!pending && state.error && <p className="mt-3 text-sale">{state.error}</p>}
      </div>
    </form>
  );
}
