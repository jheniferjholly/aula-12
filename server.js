// server.js — Integração Express + Supabase (Oficina Mecânica - Aluno 08)
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const supabase = require('./src/config/supabaseClient');

const app = express();
const PORT = process.env.PORT || 3008;

// =========================================================================
// MIDDLEWARES ESSENCIAIS
// =========================================================================
app.use(cors());
app.use(express.json());

// Rota de saúde da API
app.get('/', (req, res) => {
  res.json({ status: 'API Online 🚀', projeto: 'Oficina Mecânica - Aluno 08' });
});

// =========================================================================
// [R] READ — Listar Ordens de Serviço
// =========================================================================
app.get('/api/ordens-servico', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ordens_servico')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      return res.status(400).json({ erro: error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno ao buscar ordens de serviço.' });
  }
});

// =========================================================================
// [C] CREATE — Cadastrar Nova Ordem de Serviço
// =========================================================================
app.post('/api/ordens-servico', async (req, res) => {
  try {
    // 1. Desempacotando o payload JSON enviado pelo cliente
    const { cliente, veiculo, servico, valor_estimado } = req.body;

    // 2. Validação básica antes de acionar o banco na nuvem
    if (!cliente || !veiculo || !servico || valor_estimado === undefined) {
      return res.status(400).json({
        erro: 'Os campos "cliente", "veiculo", "servico" e "valor_estimado" são obrigatórios no JSON!'
      });
    }

    // 3. Persistindo no Supabase e aplicando o Efeito Bumerangue (.select())
    const { data, error } = await supabase
      .from('ordens_servico')
      .insert([
        {
          cliente: cliente,
          veiculo: veiculo,
          servico: servico,
          valor_estimado: valor_estimado
        }
      ])
      .select(); // Retorna o registro recém-criado com ID e created_at

    // 4. Tratamento de erro retornado pelo Supabase/PostgreSQL
    if (error) {
      return res.status(400).json({ erro: error.message });
    }

    // 5. Resposta padrão RESTful para criação bem-sucedida: 201 Created
    return res.status(201).json({
      mensagem: 'Ordem de serviço cadastrada com sucesso na nuvem!',
      registro: data[0]
    });

  } catch (err) {
    console.error('Erro inesperado:', err);
    return res.status(500).json({ erro: 'Falha interna no servidor.' });
  }
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`🔥 Servidor rodando em http://localhost:${PORT}`);
});