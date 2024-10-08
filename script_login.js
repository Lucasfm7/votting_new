// script_login.js

// Verificar se o usuário está logado
if (!sessionStorage.getItem("resultadoLogado")) {
    // Redirecionar para a página principal se não estiver logado
    window.location.href = 'index_base.html';
}

// Variáveis globais para armazenar votos e percentuais
let votosGlobais = [];
let percentuaisGlobais = [];

// Função para carregar o percentual de votantes e o total de votos
async function carregarPercentualVotantes() {
    const percentualText = document.getElementById('percentual-text');
    const totalVotantesText = document.getElementById('total-votantes-text');
    try {
        const response = await fetch('https://django-server-production-f3c5.up.railway.app/api/votos/percentual_votantes/');
        if (!response.ok) {
            throw new Error(`Erro: ${response.status} ${response.statusText}`);
        }
        const dados = await response.json();
        totalVotantesText.textContent = `Total de Votantes: ${dados.total_votantes}`;
        percentualText.textContent = `Percentual de Votantes: ${dados.percentual_votantes}%`;
    } catch (error) {
        console.error('Erro ao carregar os dados de votantes:', error);
        totalVotantesText.textContent = 'Não foi possível carregar o total de votantes.';
        percentualText.textContent = 'Não foi possível carregar o percentual de votantes.';
    }
}

// Função para carregar os resultados por candidato e renderizar o gráfico
async function carregarResultadosCandidatos() {
    try {
        const response = await fetch('https://django-server-production-f3c5.up.railway.app/api/votos/resultados_candidatos/');
        if (!response.ok) {
            throw new Error(`Erro: ${response.status} ${response.statusText}`);
        }
        const dados = await response.json();

        if (dados.length === 0) {
            alert('Nenhum voto registrado.');
            return;
        }

        // Extrair nomes e votos
        const nomes = dados.map(candidato => candidato.candidate_nome);
        const votos = dados.map(candidato => candidato.total_votos);

        // Armazenar votos globalmente para uso nos rótulos
        votosGlobais = votos;

        // Calcular total de votos
        const totalVotos = votos.reduce((a, b) => a + b, 0);

        // Calcular percentual de cada candidato
        const percentuais = votos.map(voto => ((voto / totalVotos) * 100).toFixed(2));

        // Armazenar percentuais globalmente para possíveis usos futuros
        percentuaisGlobais = percentuais;

        // Configurar o gráfico
        const ctx = document.getElementById('candidatos-chart').getContext('2d');
        const candidatosChart = new Chart(ctx, {
            type: 'bar', // Tipo 'bar' com indexAxis 'y' para barras horizontais
            data: {
                labels: nomes,
                datasets: [{
                    label: 'Percentual (%)',
                    data: percentuais,
                    backgroundColor: 'rgba(218, 165, 32, 1)',
                    borderRadius: 10, // Maior curvatura nas pontas das barras
                    barPercentage: 0.8, // Aumenta a largura das barras
                    categoryPercentage: 0.9, // Ajusta a categoria para melhor espaçamento
                    borderSkipped: false, // Para garantir bordas arredondadas em todas as partes
                    votos: votos // Adiciona os votos como propriedade personalizada
                }]
            },
            options: {
                indexAxis: 'y', // Define as barras como horizontais
                responsive: true,
                plugins: {
                    legend: {
                        display: false // Oculta a legenda
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.parsed.x}%`;
                            }
                        }
                    },
                    datalabels: {
                        anchor: 'center', // Posiciona o rótulo no centro da barra
                        align: 'center', // Centraliza o rótulo
                        formatter: function(value, context) {
                            const votos = context.dataset.votos[context.dataIndex];
                            const textoVotos = votos === 1 ? `${votos} Voto` : `${votos} Votos`;
                            return `${textoVotos} ➜ ${value}%`; // Exibir votos e percentual nas barras
                        },
                        color: '#fff', // Cor branca para contraste com o fundo da barra
                        font: {
                            weight: 'bold'
                        }
                    }
                },
                scales: {
                    x: {
                        display: false, // Remove o eixo X
                        grid: {
                            drawBorder: false, // Remove as bordas do grid
                            display: false // Remove as linhas de grade do eixo X
                        }
                    },
                    y: {
                        display: true, // Exibe o eixo Y com os nomes dos candidatos
                        grid: {
                            drawOnChartArea: false, // Garante que nenhuma linha de grade seja desenhada
                            drawBorder: false, // Remove qualquer borda no eixo Y
                            display: false // Remove as linhas de grade do eixo Y
                        },
                        ticks: {
                            padding: 10, // Adiciona espaço entre o nome e a barra
                            font: {
                                size: 14
                            }
                        }
                    }
                },
                layout: {
                    padding: {
                        left: 0,
                        right: 0
                    }
                }
            },
            plugins: [ChartDataLabels] // Habilitar o plugin de rótulos de dados
        });

    } catch (error) {
        console.error('Erro ao carregar os resultados dos candidatos:', error);
        alert('Não foi possível carregar os resultados dos candidatos.');
    }
}

// Função para inicializar o carregamento dos dados
function inicializarResultados() {
    carregarPercentualVotantes();
    carregarResultadosCandidatos();
}

// Chamar a função de inicialização após o carregamento do DOM
document.addEventListener('DOMContentLoaded', inicializarResultados);
