import { Cliente } from "../../types/cliente";

class ClienteService {
  private clientes: Cliente[] = [];

  listar(): Cliente[] {
    return this.clientes;
  }

  buscarPorId(id: string): Cliente | undefined {
    return this.clientes.find((cliente) => cliente.id === id);
  }

  adicionar(cliente: Cliente): void {
    this.clientes.push(cliente);
  }

  atualizar(id: string, dados: Partial<Cliente>): void {
    this.clientes = this.clientes.map((cliente) =>
      cliente.id === id
        ? {
            ...cliente,
            ...dados,
            atualizadoEm: new Date(),
          }
        : cliente
    );
  }

  remover(id: string): void {
    this.clientes = this.clientes.filter(
      (cliente) => cliente.id !== id
    );
  }

  totalClientes(): number {
    return this.clientes.length;
  }

  clientesAtivos(): Cliente[] {
    return this.clientes.filter(
      (cliente) => cliente.status === "Ativo"
    );
  }
}

export const clienteService = new ClienteService();