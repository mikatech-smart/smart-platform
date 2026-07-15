import Card from "../common/Card/Card";
import { FormActions } from "../common/FormActions";
import { FormSection } from "../common/FormSection";
import Button from "../common/Button/Button";
import Input from "../common/Input/Input";

export default function ClienteForm() {
  return (
    <Card>
      <div className="space-y-8">
        <FormSection title="Empresa">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Nome da Empresa" placeholder="Ex.: RJR LEDs" />
            <Input label="Categoria" placeholder="Ex.: Loja de Iluminacao" />
          </div>
        </FormSection>

        <FormSection title="Contato">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="WhatsApp" placeholder="(15) 99999-9999" />
            <Input label="Telefone" placeholder="(15) 3333-3333" />
          </div>
        </FormSection>

        <FormSection title="Redes Sociais">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Instagram" placeholder="@empresa" />
            <Input label="Website" placeholder="https://" />
          </div>
        </FormSection>

        <FormSection title="PIX">
          <Input label="Chave PIX" placeholder="Digite a chave PIX" />
        </FormSection>

        <FormSection title="Wi-Fi">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Nome da Rede" placeholder="Empresa Exemplo" />
            <Input label="Senha" type="password" placeholder="********" />
          </div>
        </FormSection>

        <FormActions>
          <Button variant="primary" fullWidth>
            Salvar Empresa
          </Button>
        </FormActions>
      </div>
    </Card>
  );
}
