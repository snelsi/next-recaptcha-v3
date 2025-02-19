"use client";

import { useEffect } from "react";
import { useReCaptcha } from "./useReCaptcha.js";

export interface ReCaptchaProps {
  onValidate: (token: string) => void;
  action: string;
  validate?: boolean;
  reCaptchaKey?: string;
}

/** React Component to generate ReCaptcha token
 * @example
 * <ReCaptcha action='form_submit' onValidate={handleToken} />
 */
export const ReCaptcha: React.FC<ReCaptchaProps> = ({
  action,
  onValidate,
  validate = true,
  reCaptchaKey,
}) => {
  const { isLoaded, executeRecaptcha } = useReCaptcha(reCaptchaKey);

  useEffect(() => {
    if (!validate || !isLoaded) return;
    if (typeof onValidate !== "function") return;

    const handleExecuteRecaptcha = async () => {
      const token = await executeRecaptcha(action);
      onValidate(token);
    };

    handleExecuteRecaptcha();
  }, [action, onValidate, validate, isLoaded, executeRecaptcha]);

  return null;
};
