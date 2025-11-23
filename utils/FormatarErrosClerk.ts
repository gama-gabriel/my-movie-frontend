export function formatarErroClerk(error: any) {
  console.log("Erro Clerk:", error);
  switch (error.errors[0]?.code) {
    case "form_password_incorrect":
      return "Senha incorreta. Por favor, tente novamente.";
    case "form_password_validation_failed":
      return "Senha incorreta. Por favor, tente novamente.";
    case "form_password_pwned":
      return "Esta senha foi exposta em uma violação de dados. Por favor, escolha outra senha.";
    case "form_param_format_invalid":
      return "Parâmetros com formato inválido.";
    case "form_identifier_not_found":
      return "E-mail não encontrado. Verifique e tente novamente.";
    case "form_identifier_exists":
      return "E-mail já cadastrado. Utilize outro e-mail.";
    case "form_code_incorrect":
      return "Código incorreto. Verifique o código enviado ao seu e-mail.";
    case "verification_failed":
      return "Você excedeu o número máximo de tentativas. Tente novamente mais tarde.";
    case "strategy_for_user_invalid":
      return "Estratégia inválida para o usuário.";
    default:
      return error.errors[0]?.longMessage || "Ocorreu um erro. Tente novamente.";
  }
}