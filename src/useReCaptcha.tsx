"use client";

import { useCallback } from "react";
import { useReCaptchaContext } from "./ReCaptchaProvider.js";
import type { ReCaptchaContextProps } from "./ReCaptchaProvider.js";
import type { IReCaptcha } from "./recaptcha.types.js";
import { getGrecaptcha, useGrecaptcha } from "./utils.js";

export interface useReCaptchaProps extends ReCaptchaContextProps {
  /** reCAPTCHA instance */
  grecaptcha: IReCaptcha | null;
  /**
   * Executes the reCAPTCHA verification process for a given action.
   * Actions may only contain alphanumeric characters and slashes, and must not be user-specific.
   */
  executeRecaptcha: (action: string) => Promise<string>;
}

/**
 * Custom hook to use Google reCAPTCHA v3.
 *
 * @param [reCaptchaKey] - Optional reCAPTCHA site key. If not provided, it will use the key from the context.
 * @returns An object containing the reCAPTCHA context, grecaptcha instance, reCaptchaKey, and executeRecaptcha function.
 *
 * @example
 * const { executeRecaptcha } = useReCaptcha();
 *
 * const handleSubmit = async () => {
 *   try {
 *     const token = await executeRecaptcha('your_action');
 *     // Use the token for verification
 *   } catch (error) {
 *     console.error('ReCAPTCHA error:', error);
 *   }
 * };
 */
export const useReCaptcha = (reCaptchaKey?: string): useReCaptchaProps => {
  const context = useReCaptchaContext();

  const { useEnterprise } = context;

  const grecaptcha = useGrecaptcha(useEnterprise);

  const siteKey = reCaptchaKey || context.reCaptchaKey;

  const executeRecaptcha = useCallback(
    async (action: string) => {
      if (!siteKey) {
        throw new Error("ReCaptcha sitekey is not defined");
      }

      const grecaptcha = getGrecaptcha(useEnterprise);

      if (typeof grecaptcha?.execute !== "function") {
        throw new Error("Recaptcha has not been loaded");
      }

      if (typeof grecaptcha.ready === "function") {
        await new Promise<void>((resolve) => {
          grecaptcha.ready(resolve);
        });
      }

      const result = await grecaptcha.execute(siteKey, { action });

      return result;
    },
    [useEnterprise, siteKey],
  );

  return {
    ...context,
    grecaptcha,
    reCaptchaKey: siteKey,
    executeRecaptcha,
  };
};
