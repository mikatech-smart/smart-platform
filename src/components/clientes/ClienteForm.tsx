import Card from "../common/Card/Card";
import Button from "../common/Button/Button";
import Input from "../common/Input/Input";

export default function ClienteForm() {
  return (
    <Card>
      <div className="space-y-10">

        {/* Empresa */}
        <section>
          <h2 className="mb-6 text-xl font-semibold">
            🏢 Empresa
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <Input
              label="Nome da Empresa"
              placeholder="Ex.: RJR LEDs"
            />

            <Input
              label="Categoria"
              placeholder="Ex.: Loja de Iluminação"
            />
          </div>
        </section>

        {/* Contato */}
        <section>
          <h2 className="mb-6 text-xl font-semibold">
            📞 Contato
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <Input
              label="WhatsApp"
              placeholder="(15) 99999-9999"
            />

            <Input
              label="Telefone"
              placeholder="(15) 3333-3333"
            />
          </div>
        </section>

        {/* Redes Sociais */}
        <section>
          <h2 className="mb-6 text-xl font-semibold">
            🌐 Redes Sociais
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <Input
              label="Instagram"
              placeholder="@empresa"
            />

            <Input
              label="Website"
              placeholder="https://"
            />
          </div>
        </section>

        {/* PIX */}
        <section>
          <h2 className="mb-6 text-xl font-semibold">
            💳 PIX
          </h2>

          <Input
            label="Chave PIX"
            placeholder="Digite a chave PIX"
          />
        </section>

        {/* Wi-Fi */}
        <section>
          <h2 className="mb-6 text-xl font-semibold">
            📶 Wi-Fi
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <Input
              label="Nome da Rede"
              placeholder="MiKATECH"
            />

            <Input
              label="Senha"
              type="password"
              placeholder="********"
            />
          </div>
        </section>

        <Button
          variant="primary"
          fullWidth
        >
          Salvar Empresa
        </Button>

      </div>
    </Card>
  );
}