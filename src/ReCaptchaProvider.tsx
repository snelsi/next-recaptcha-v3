"use client";

import React, { useMemo, useState, useCallback, useContext, createContext } from "react";
import Script, { ScriptProps } from "next/script.js";

import { getRecaptchaScriptSrc, RECAPTCHA_LOADED_EVENT } from "./utils.js";

type ReCaptchaConfigProps = {
  /** reCAPTCHA_site_key */
  readonly reCaptchaKey: string | null;
  /** Language code */
  readonly language: string | null;
  /** Use ReCaptcha Enterprise */
  readonly useEnterprise: boolean;
  /** Whether to use recaptcha.net for loading the script */
  readonly useRecaptchaNet: boolean;
};

type ReCaptchaStateProps = {
  /** Is ReCaptcha script loaded */
  readonly isLoaded: boolean;
  /** Is there an error while loading ReCaptcha script */
  readonly isError: boolean;
  /** Error received while loading ReCaptcha script */
  readonly error: Error | null;
};

export type ReCaptchaContextProps = ReCaptchaConfigProps & ReCaptchaStateProps;

export const ReCaptchaContext = createContext<ReCaptchaContextProps>({
  reCaptchaKey: null,
  language: null,
  useEnterprise: false,
  useRecaptchaNet: false,

  isLoaded: false,
  isError: false,
  error: null,
});

export const useReCaptchaContext = () => useContext(ReCaptchaContext);

export interface ReCaptchaProviderProps extends Partial<ScriptProps> {
  reCaptchaKey?: string;
  language?: string | null;
  useRecaptchaNet?: boolean;
  useEnterprise?: boolean;
  children?: React.ReactNode;
}

export const ReCaptchaProvider: React.FC<ReCaptchaProviderProps> = ({
  reCaptchaKey: passedReCaptchaKey,

  useEnterprise = false,
  useRecaptchaNet = false,
  language = null,
  children,

  strategy = "afterInteractive",

  src: passedSrc,
  onReady: passedOnReady,
  onError: passedOnError,

  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const isError = !!error;

  const reCaptchaKey = passedReCaptchaKey || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || null;

  const src =
    passedSrc ||
    getRecaptchaScriptSrc({ reCaptchaKey, language, useRecaptchaNet, useEnterprise }) ||
    null;

  // Handle script load
  const onReady = useCallback(() => {
    setError(null);
    setIsLoaded(true);
    window.dispatchEvent(new Event(RECAPTCHA_LOADED_EVENT));
    passedOnReady?.();
  }, [passedOnReady]);

  // Handle script error
  const onError = useCallback(
    (e: Error) => {
      setError(e);
      passedOnError?.(e);
    },
    [passedOnError],
  );

  // Prevent unnecessary rerenders
  const value: ReCaptchaContextProps = useMemo(
    () => ({
      reCaptchaKey,
      language,
      useEnterprise,
      useRecaptchaNet,
      isLoaded: isLoaded,
      isError,
      error,
    }),
    [reCaptchaKey, language, useEnterprise, useRecaptchaNet, isLoaded, isError, error],
  );

  return (
    <ReCaptchaContext.Provider value={value}>
      {children}
      {/* @ts-expect-error: Why are you making my life so hard, Typescript? */}
      <Script src={src} strategy={strategy} onReady={onReady} onError={onError} {...props} />
    </ReCaptchaContext.Provider>
  );
};
