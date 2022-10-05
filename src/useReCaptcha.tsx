import { useCallback } from "react";
import { useReCaptchaContext } from "./ReCaptchaProvider";
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

  const executeRecaptcha = useCallback(
    async (action: string) => {
      if (typeof grecaptcha?.execute !== "function") {
        throw new Error("Recaptcha has not been loaded");
      }

      const result = await grecaptcha.execute(siteKey, { action });

      return result;
    },
    [grecaptcha, siteKey],
  );

  return { ...contextProps, grecaptcha, reCaptchaKey: siteKey, executeRecaptcha };
};

export { useReCaptcha };
