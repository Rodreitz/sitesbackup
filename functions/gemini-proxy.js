// Importa a biblioteca do Google Generative AI
const { GoogleGenerativeAI } = require("@google/generative-ai");

// A chave de API será pega das variáveis de ambiente da Netlify
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.handler = async function (event, context) {
  // Configurações de segurança
  const headers = {
    'Access-Control-Allow-Origin': '*', // Ou coloque o URL do seu site para mais segurança
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  try {
    // Pega os DADOS BRUTOS enviados pela calculadora
    const data = JSON.parse(event.body);
    let prompt;

    // ** LÓGICA DE CONSTRUÇÃO DO PROMPT NO SERVIDOR (VERSÃO REFINADA) **
    if (data.type === 'description') {
      prompt = `Você é uma artesã que vende suas peças nas redes sociais. Crie uma legenda para Instagram sobre a venda de um(a) "${data.pieceName}" que custa ${data.finalPrice}, feito(a) com ${data.materials.join(', ')}.
A legenda deve:

Ter tom humano, acolhedor e levemente persuasivo.

Ter 2 a 4 parágrafos curtos, fáceis de ler no celular.

Usar uma linguagem simples, com leve toque poético ou visual (descrevendo sensações, detalhes, cores).

Terminar com uma chamada para ação que convida a pessoa a comprar ou perguntar mais detalhes.

Usar no máximo 4 emojis relevantes e distribuídos com naturalidade.

Evitar negrito, caixa alta ou excesso de pontuação.`;
    } else if (data.type === 'suggestions') {
      prompt = `Crie 3 dicas práticas para ajudar a vender um(a) "${data.pieceName}" que custa ${data.finalPrice}.
As dicas devem:

Ser claras, simples e aplicáveis imediatamente.

Mostrar como valorizar o trabalho, comunicar benefícios e gerar urgência.

Ter no máximo 2 frases cada, focando em impacto e ação.

Ser numeradas (1., 2., 3.) para facilitar a leitura.

Usar verbos no imperativo para estimular a ação (ex.: “Mostre”, “Destaque”, “Ofereça”).

Evitar negrito, caixa alta ou excesso de pontuação.`;
    } else {
      throw new Error("Tipo de solicitação inválido.");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20"});
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ text: text }),
    };

  } catch (error) {
    console.error("Erro na função do Gemini:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Ocorreu um erro ao processar sua solicitação." }),
    };
  }
};
