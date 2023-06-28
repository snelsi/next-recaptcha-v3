"use client";

import { useEffect, useLayoutEffect } from "react";

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
  reCaptchaKey?: string;
  language?: string;
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

// https://usehooks-ts.com/react-hook/use-isomorphic-layout-effect
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
