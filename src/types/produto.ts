export interface Produto {
    ID_produto: string;
    nome_produto: string;
    quantidade_produto: number;
    valor_produto: number;
    unidade_medida: string;
    fk_usuario_produto: string;
}

export interface CadastroProdutoResponse {
    mensagem: string;
    produto: Produto;
}

export interface ListarProdutosResponse {
    total: number;
    produtos: Produto[];
}

export interface ObterProdutoResponse {
    produto: Produto;
}

export interface AtualizarProdutoResponse {
    mensagem: string;
    ID_produto: string;
}

export interface DeletarProdutoResponse {
    mensagem: string;
}
