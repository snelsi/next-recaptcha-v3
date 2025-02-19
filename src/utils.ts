"use client";
import { useSyncExternalStore } from "react";
import { IReCaptcha } from "./recaptcha.types.js";

export const RECAPTCHA_LOADED_EVENT = "recaptcha_loaded";

/**
 * Function to generate the src for the script tag
 * Refs: https://developers.google.com/recaptcha/docs/loading
 */
export const getRecaptchaScriptSrc = ({
  reCaptchaKey,
  language,
  useRecaptchaNet = false,
  useEnterprise = false,
}: {
  reCaptchaKey?: string | null;
  language?: string | null;
  useRecaptchaNet?: boolean;
  useEnterprise?: boolean;
} = {}): string => {
  const hostName = useRecaptchaNet ? "recaptcha.net" : "google.com";
  const script = useEnterprise ? "enterprise.js" : "api.js";

  let src = `https://www.${hostName}/recaptcha/${script}?`;
  if (reCaptchaKey) src += `render=${reCaptchaKey}`;
  if (language) src += `&hl=${language}`;

  return src;
};

export const getGrecaptcha = (useEnterprise = false): IReCaptcha | null => {
  if (useEnterprise && window.grecaptcha?.enterprise) return window.grecaptcha.enterprise;
  return window.grecaptcha || null;
};

/**
 * Hook to get the grecaptcha object
 * @param useEnterprise - Use ReCaptcha Enterprise
 */
export const useGrecaptcha = (useEnterprise = false): IReCaptcha | null => {
  const grecaptcha = useSyncExternalStore(
    (callback) => {
      window.addEventListener(RECAPTCHA_LOADED_EVENT, callback);
      return () => window.removeEventListener(RECAPTCHA_LOADED_EVENT, callback);
    },
    () => getGrecaptcha(useEnterprise),
    () => null,
  );

  return grecaptcha;
};
