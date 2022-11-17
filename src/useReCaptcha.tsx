import { useCallback, useRef } from "react";
import { useReCaptchaContext } from "./ReCaptchaProvider";
import { useIsomorphicLayoutEffect } from "./utils";
import type { ReCaptchaContextProps } from "./ReCaptchaProvider";

export interface useReCaptchaProps extends ReCaptchaContextProps {
  executeRecaptcha: (action: string) => Promise<string>;
}

/** React Hook to generate ReCaptcha token
 * @example
 * const { executeRecaptcha } = useReCaptcha()
 */
const useReCaptcha = (reCaptchaKey?: string): useReCaptchaProps => {
  const { grecaptcha, reCaptchaKey: contextReCaptchaKey, ...contextProps } = useReCaptchaContext();

  const siteKey = reCaptchaKey || contextReCaptchaKey;

  // Create a ref that stores 'grecaptcha.execute' method to prevent rerenders
  const executeCaptchaRef = useRef(grecaptcha?.execute);

  useIsomorphicLayoutEffect(() => {
    executeCaptchaRef.current = grecaptcha?.execute;
  }, [grecaptcha?.execute]);

  const executeRecaptcha = useCallback(
    async (action: string) => {
      if (typeof executeCaptchaRef.current !== "function") {
        throw new Error("Recaptcha has not been loaded");
      }

      const result = await executeCaptchaRef.current(siteKey, { action });

      return result;
    },
    [siteKey],
  );

  return { ...contextProps, grecaptcha, reCaptchaKey: siteKey, executeRecaptcha };
};

export { useReCaptcha };
