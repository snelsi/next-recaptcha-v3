import { useEffect } from "react";
import { useReCaptcha } from "./useReCaptcha";

interface ReCaptchaProps {
  onValidate: (token: string) => void;
  action: string;
  validate?: boolean;
  reCaptchaKey?: string;
}

/** React Component to generate ReCaptcha token
 * @example
 * <ReCaptcha action='form_submit' onValidate={handleToken} />
 */
const ReCaptcha: React.FC<ReCaptchaProps> = ({
  action,
  onValidate,
  validate = true,
  reCaptchaKey,
}) => {
  const { loaded, executeRecaptcha } = useReCaptcha(reCaptchaKey);

  useEffect(() => {
    if (!validate || !loaded) return;
    if (typeof onValidate !== "function") return;

    const handleExecuteRecaptcha = async () => {
      const token = await executeRecaptcha(action);
      onValidate(token);
    };

    handleExecuteRecaptcha();
  }, [action, onValidate, validate, loaded, executeRecaptcha]);

  return null;
};

export { ReCaptcha };
export type { ReCaptchaProps };
