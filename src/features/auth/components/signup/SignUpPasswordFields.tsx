import { FqInput } from "@/shared/ui/form";
import { FqIconButton } from "@/shared/ui/primitives";

type SignUpPasswordFieldsProps = {
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onToggleShowPassword: () => void;
  minPasswordLength: number;
};

export function SignUpPasswordFields({
  password,
  confirmPassword,
  showPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  onToggleShowPassword,
  minPasswordLength,
}: SignUpPasswordFieldsProps) {
  const passwordMismatch =
    confirmPassword.trim().length > 0 && password !== confirmPassword;

  return (
    <div className="space-y-4">
      <div className="relative">
        <FqInput
          type={showPassword ? "text" : "password"}
          label="Senha"
          placeholder="********"
          value={password}
          onChange={(event) => onPasswordChange(event.currentTarget.value)}
          autoComplete="new-password"
          className="h-12 pr-12 text-sm"
          errorMessage={
            password.trim().length > 0 && password.trim().length < minPasswordLength
              ? "Use 6 ou mais caracteres."
              : undefined
          }
        />

        <FqIconButton
          icon={showPassword ? "eyeOff" : "eye"}
          label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          onClick={onToggleShowPassword}
          className="absolute right-2 top-10 text-muted-foreground hover:bg-accent"
        />
      </div>

      <FqInput
        type={showPassword ? "text" : "password"}
        label="Confirmar senha"
        placeholder="********"
        value={confirmPassword}
        onChange={(event) => onConfirmPasswordChange(event.currentTarget.value)}
        autoComplete="new-password"
        className="h-12 text-sm"
        errorMessage={passwordMismatch ? "As senhas nao coincidem." : undefined}
      />
    </div>
  );
}
