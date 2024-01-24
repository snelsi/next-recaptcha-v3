"use client";

import { useCallback, useRef } from "react";
import { useReCaptchaContext } from "./ReCaptchaProvider.js";
import { useIsomorphicLayoutEffect } from "./utils.js";
import type { ReCaptchaContextProps } from "./ReCaptchaProvider.js";

export interface useReCaptchaProps extends ReCaptchaContextProps {
  executeRecaptcha: (action: string) => Promise<string>;
}

/** React Hook to generate ReCaptcha token
 * @example
 * const { executeRecaptcha } = useReCaptcha()
 */
const useReCaptcha = (reCaptchaKey?: string): useReCaptchaProps => {
  const {
    grecaptcha,
    loaded,
    reCaptchaKey: contextReCaptchaKey,
    ...contextProps
  } = useReCaptchaContext();

  const siteKey = reCaptchaKey || contextReCaptchaKey;

  // Create a ref that stores 'grecaptcha.execute' method to prevent rerenders
  const executeCaptchaRef = useRef(grecaptcha?.execute);

  useIsomorphicLayoutEffect(() => {
    executeCaptchaRef.current = grecaptcha?.execute;
  }, [loaded, grecaptcha?.execute]);

  const executeRecaptcha = useCallback(
    async (action: string) => {
      if (typeof executeCaptchaRef.current !== "function") {
        throw new Error("Recaptcha has not been loaded");
      }

      if (!siteKey) {
        throw new Error("ReCaptcha sitekey is not defined");
      }

      const result = await executeCaptchaRef.current(siteKey, { action });

      return result;
    },
    [siteKey],
  );

  return { ...contextProps, grecaptcha, loaded, reCaptchaKey: siteKey, executeRecaptcha };
};

export { useReCaptcha };
