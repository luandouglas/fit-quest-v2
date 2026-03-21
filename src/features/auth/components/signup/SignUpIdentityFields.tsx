import { FqInput } from "@/shared/ui/form";

type SignUpIdentityFieldsProps = {
  name: string;
  email: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  isEmailValid: (value: string) => boolean;
};

export function SignUpIdentityFields({
  name,
  email,
  onNameChange,
  onEmailChange,
  isEmailValid,
}: SignUpIdentityFieldsProps) {
  return (
    <div className="space-y-4">
      <FqInput
        label="Nome completo"
        placeholder="Seu nome"
        value={name}
        onChange={(event) => onNameChange(event.currentTarget.value)}
        autoComplete="name"
        className="h-12 text-sm"
        errorMessage={
          name.trim().length > 0 && name.trim().length < 3
            ? "Informe pelo menos 3 caracteres."
            : undefined
        }
      />

      <FqInput
        type="email"
        label="E-mail"
        placeholder="seu@email.com"
        value={email}
        onChange={(event) => onEmailChange(event.currentTarget.value)}
        autoComplete="email"
        className="h-12 text-sm"
        errorMessage={
          email.trim().length > 0 && !isEmailValid(email.trim())
            ? "Informe um e-mail valido."
            : undefined
        }
      />
    </div>
  );
}
