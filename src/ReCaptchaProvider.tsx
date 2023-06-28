"use client";

import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useContext,
  createContext,
  useDebugValue,
} from "react";
import Script, { ScriptProps } from "next/script";
import type { IReCaptcha } from "./recaptcha.types";
import { getRecaptchaScriptSrc } from "./utils";

interface ReCaptchaContextProps {
  /** reCAPTCHA_site_key */
  readonly reCaptchaKey: string | null;
  /** Global ReCaptcha object */
  readonly grecaptcha: IReCaptcha | null;
  /** Is ReCaptcha script loaded */
  readonly loaded: boolean;
  /** Is ReCaptcha failed to load */
  readonly error: boolean;
}

const ReCaptchaContext = createContext<ReCaptchaContextProps>({
  reCaptchaKey: null,
  grecaptcha: null,
  loaded: false,
  error: false,
});

const useReCaptchaContext = () => {
  const values = useContext(ReCaptchaContext);
  useDebugValue(`grecaptcha available: ${values?.loaded ? "Yes" : "No"}`);
  useDebugValue(`ReCaptcha Script: ${values?.loaded ? "Loaded" : "Not Loaded"}`);
  useDebugValue(`Failed to load Script: ${values?.error ? "Yes" : "No"}`);
  return values;
};

interface ReCaptchaProviderProps extends Partial<Omit<ScriptProps, "onLoad">> {
  reCaptchaKey?: string;
  language?: string;
  useRecaptchaNet?: boolean;
  useEnterprise?: boolean;
  children?: React.ReactNode;
  onLoad?: (grecaptcha: IReCaptcha, e: any) => void;
}

const ReCaptchaProvider: React.FC<ReCaptchaProviderProps> = ({
  reCaptchaKey: passedReCaptchaKey,

  useEnterprise = false,
  useRecaptchaNet = false,
  language,
  children,

  id = "google-recaptcha-v3",
  strategy = "afterInteractive",

  src: passedSrc,
  onLoad: passedOnLoad,
  onError: passedOnError,

  ...props
}) => {
  const [grecaptcha, setGreCaptcha] = useState<IReCaptcha | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const reCaptchaKey = passedReCaptchaKey || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || null;

  const src =
    passedSrc ||
    getRecaptchaScriptSrc({ reCaptchaKey, language, useRecaptchaNet, useEnterprise }) ||
    null;

  // Reset state when script src is changed
  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [src]);

  // Handle script load
  const onLoad = useCallback(
    (e?: any) => {
      const grecaptcha = useEnterprise ? window?.grecaptcha?.enterprise : window?.grecaptcha;

      if (grecaptcha) {
        grecaptcha.ready(() => {
          setGreCaptcha(grecaptcha);
          setLoaded(true);
          passedOnLoad?.(grecaptcha, e);
        });
      }
    },
    [passedOnLoad, useEnterprise],
  );

  // Run 'onLoad' function once just in case if grecaptcha is already globally available in window
  useEffect(() => onLoad(), [onLoad]);

  // Handle script error
  const onError = useCallback(
    (e: any) => {
      setError(true);
      passedOnError?.(e);
    },
    [passedOnError],
  );

  // Prevent unnecessary rerenders
  const value = useMemo(
    () => ({ reCaptchaKey, grecaptcha, loaded, error }),
    [reCaptchaKey, grecaptcha, loaded, error],
  );

  return (
    <ReCaptchaContext.Provider value={value}>
      {children}
      <Script id={id} src={src} strategy={strategy} onLoad={onLoad} onError={onError} {...props} />
    </ReCaptchaContext.Provider>
  );
};

export { ReCaptchaContext, useReCaptchaContext, ReCaptchaProvider };
export type { ReCaptchaContextProps, ReCaptchaProviderProps };
