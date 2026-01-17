"use client";

import { useCallback } from "react";
import { useReCaptchaContext } from "./ReCaptchaProvider.js";
import type { ReCaptchaContextProps } from "./ReCaptchaProvider.js";
import type { IReCaptcha } from "./recaptcha.types.js";
import { getGrecaptcha, useGrecaptcha } from "./utils.js";

export type ExecuteRecaptchaResult =
  | readonly [token: string, error: null]
  | readonly [token: null, error: Error];

export interface useReCaptchaProps extends ReCaptchaContextProps {
  /** reCAPTCHA instance */
  grecaptcha: IReCaptcha | null;
  /**
   * Executes the reCAPTCHA verification process for a given action.
   * Actions may only contain alphanumeric characters and slashes, and must not be user-specific.
   * @throws Will throw an error if the reCAPTCHA site key is not defined or if reCAPTCHA has not been loaded.
   */
  executeRecaptcha: (action: string) => Promise<string>;
  /**
   * Safely executes the reCAPTCHA verification process for a given action.
   * Returns a tuple containing the token or an error.
   * @returns A tuple where the first element is the token (or null if there was an error) and the second element is an Error object (or null if successful).
   */
  executeRecaptchaSafe: (action: string) => Promise<ExecuteRecaptchaResult>;
}

/**
 * Custom hook to use Google reCAPTCHA v3.
 *
 * @param [reCaptchaKey] - Optional reCAPTCHA site key. If not provided, it will use the key from the context.
 * @returns An object containing the reCAPTCHA context, grecaptcha instance, reCaptchaKey, executeRecaptcha, and executeRecaptchaSafe functions.
 *
 * @example
 * const { executeRecaptcha, executeRecaptchaSafe } = useReCaptcha();
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

  const executeRecaptchaSafe = useCallback(
    async (action: string): Promise<ExecuteRecaptchaResult> => {
      try {
        if (!siteKey) {
          return [null, new Error("ReCaptcha sitekey is not defined")] as const;
        }

        const grecaptcha = getGrecaptcha(useEnterprise);

        if (typeof grecaptcha?.execute !== "function") {
          return [null, new Error("Recaptcha has not been loaded")] as const;
        }

        if (typeof grecaptcha.ready === "function") {
          await new Promise<void>((resolve) => {
            grecaptcha.ready(resolve);
          });
        }

        const result = await grecaptcha.execute(siteKey, { action });

        return [result, null] as const;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        return [null, error] as const;
      }
    },
    [useEnterprise, siteKey],
  );

  return {
    ...context,
    grecaptcha,
    reCaptchaKey: siteKey,
    executeRecaptcha,
    executeRecaptchaSafe,
  };
};
