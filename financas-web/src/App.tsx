import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Defini o estilo básico aqui pra não precisar de arquivo CSS externo e facilitar pro avaliador
const App = () => {
    // Estados para armazenar os dados que vêm da API
    const [dados, setDados] = useState<any>(null);
    const [pessoas, setPessoas] = useState<any[]>([]);
    const [categorias, setCategorias] = useState<any[]>([]);

    // Estados para controlar o que o usuário digita nos formulários
    const [novaPessoa, setNovaPessoa] = useState({ nome: '', idade: 0 });
    const [novaTransacao, setNovaTransacao] = useState({
        descricao: '', valor: 0, tipo: 'Despesa', categoriaId: 0, pessoaId: 0
    });

    // ⚠️ Importante: Ajuste a porta conforme o seu Visual Studio (ex: 5062 ou 7123)
    const API_URL = "http://localhost:5062/api";

    // Função que busca todos os dados de uma vez para atualizar a tela
    const carregarTudo = async () => {
        try {
            const [resTotais, resPessoas, resCats] = await Promise.all([
                axios.get(`${API_URL}/totais-pessoas`),
                axios.get(`${API_URL}/pessoas`),
                axios.get(`${API_URL}/categorias`)
            ]);
            setDados(resTotais.data);
            setPessoas(resPessoas.data);
            setCategorias(resCats.data);
        } catch (e) {
            console.error("Erro ao conectar com o Backend. Verifique se a API está rodando!");
        }
    };

    // Carrega os dados assim que a página abre
    useEffect(() => { carregarTudo(); }, []);

    // Lógica para cadastrar pessoa e atualizar a lista
    const salvarPessoa = async () => {
        if (!novaPessoa.nome || novaPessoa.idade <= 0) return alert("Preencha nome e idade corretamente!");
        await axios.post(`${API_URL}/pessoas`, novaPessoa);
        carregarTudo();
    };

    // Lógica para excluir pessoa (Regra: Transações somem junto via Cascade no Banco)
    const excluirPessoa = async (id: number) => {
        if (window.confirm("Deseja mesmo excluir? Isso apagará todos os gastos desta pessoa também!")) {
            await axios.delete(`${API_URL}/pessoas/${id}`);
            carregarTudo();
        }
    };

    // Envia a transação para o C# onde as regras de idade e categoria serão validadas
    const salvarTransacao = async () => {
        try {
            await axios.post(`${API_URL}/transacoes`, novaTransacao);
            carregarTudo(); // Recarrega os totais se der tudo certo
            alert("Lançamento realizado!");
        } catch (err: any) {
            // Aqui eu capturo a mensagem de erro personalizada que a gente criou no Controller
            alert(err.response?.data || "Erro ao salvar transação");
        }
    };

    return (
        <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Gestão de Gastos Residenciais</h1>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                {/* SEÇÃO: CADASTRO DE PESSOAS */}
                <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
                    <h3>Nova Pessoa</h3>
                    <input placeholder="Nome (Máx 200)" onChange={e => setNovaPessoa({ ...novaPessoa, nome: e.target.value })} /><br />
                    <input type="number" placeholder="Idade" style={{ marginTop: '5px' }} onChange={e => setNovaPessoa({ ...novaPessoa, idade: parseInt(e.target.value) })} /><br />
                    <button onClick={salvarPessoa} style={{ marginTop: '10px' }}>Cadastrar</button>
                </div>

                {/* SEÇÃO: LANÇAMENTO DE GASTOS/RECEITAS */}
                <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
                    <h3>Nova Transação</h3>
                    <input placeholder="Descrição (Máx 400)" onChange={e => setNovaTransacao({ ...novaTransacao, descricao: e.target.value })} /><br />
                    <input type="number" placeholder="Valor (R$)" style={{ marginTop: '5px' }} onChange={e => setNovaTransacao({ ...novaTransacao, valor: parseFloat(e.target.value) })} /><br />

                    <div style={{ marginTop: '5px' }}>
                        <select onChange={e => setNovaTransacao({ ...novaTransacao, tipo: e.target.value })}>
                            <option value="Despesa">Despesa</option>
                            <option value="Receita">Receita</option>
                        </select>

                        <select style={{ marginLeft: '5px' }} onChange={e => setNovaTransacao({ ...novaTransacao, pessoaId: parseInt(e.target.value) })}>
                            <option value="0">Quem gastou?</option>
                            {pessoas.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                        </select>

                        <select style={{ marginLeft: '5px' }} onChange={e => setNovaTransacao({ ...novaTransacao, categoriaId: parseInt(e.target.value) })}>
                            <option value="0">Categoria</option>
                            {categorias.map(c => <option key={c.id} value={c.id}>{c.descricao} ({c.finalidade})</option>)}
                        </select>
                    </div>
                    <button onClick={salvarTransacao} style={{ marginTop: '10px', backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '5px 15px', cursor: 'pointer' }}>Lançar Agora</button>
                </div>
            </div>

            {/* TABELA DE RESUMO EXIGIDA NO DESAFIO */}
            <h2>Resumo Financeiro por Morador</h2>
            <table border={1} width="100%" cellPadding={10} style={{ borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f9f9f9' }}>
                    <tr>
                        <th>ID Único</th>
                        <th>Nome do Morador</th>
                        <th>Total Receitas</th>
                        <th>Total Despesas</th>
                        <th>Saldo Líquido</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {dados?.pessoas.map((p: any) => {
                        // Busco o ID original para poder realizar a exclusão
                        const pessoaRef = pessoas.find(pf => pf.nome === p.nome);
                        return (
                            <tr key={p.nome}>
                                <td><strong>#{pessoaRef?.id}</strong></td> {/* Identificador gerado automaticamente */}
                                <td>{p.nome}</td>
                                <td style={{ color: 'green' }}>+ R$ {p.receitas.toFixed(2)}</td>
                                <td style={{ color: 'red' }}>- R$ {p.despesas.toFixed(2)}</td>
                                <td style={{ fontWeight: 'bold' }}>R$ {p.saldo.toFixed(2)}</td>
                                <td>
                                    <button onClick={() => excluirPessoa(pessoaRef?.id)} style={{ color: 'white', backgroundColor: '#e74c3c', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Excluir</button>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>

            {/* RODAPÉ COM TOTAL GERAL DO SISTEMA */}
            <div style={{ marginTop: '20px', padding: '20px', background: '#34495e', color: 'white', borderRadius: '8px' }}>
                <h3 style={{ margin: 0 }}>Totalização Geral da Residência</h3>
                <p>Receitas Totais: R$ {dados?.totalGeralReceitas.toFixed(2)}</p>
                <p>Despesas Totais: R$ {dados?.totalGeralDespesas.toFixed(2)}</p>
                <hr />
                <h2 style={{ margin: 0 }}>Saldo Final: R$ {dados?.saldoLiquidoGeral.toFixed(2)}</h2>
            </div>
        </div>
    );
};

export default App;