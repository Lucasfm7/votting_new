// Verificar se o usuário está logado
if (!sessionStorage.getItem("resultadoLogado")) {
    // Redirecionar para a página principal se não estiver logado
    window.location.href = 'index_base.html';
}

// Função para carregar o percentual de votantes
async function carregarPercentualVotantes() {
    const percentualText = document.getElementById('percentual-text');
    try {
        const response = await fetch('https://django-server-production-f3c5.up.railway.app/api/votos/percentual_votantes/');
        if (!response.ok) {
            throw new Error(`Erro: ${response.status} ${response.statusText}`);
        }
        const dados = await response.json();
        percentualText.textContent = `Percentual de Votantes: ${dados.percentual_votantes}%`;
    } catch (error) {
        console.error('Erro ao carregar o percentual de votantes:', error);
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

        // Calcular total de votos
        const totalVotos = votos.reduce((a, b) => a + b, 0);

        // Calcular percentual de cada candidato
        const percentuais = votos.map(voto => ((voto / totalVotos) * 100).toFixed(2));

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
                    borderRadius: 20, // Maior curvatura nas pontas das barras
                    barPercentage: 0.1, // Reduz ainda mais o tamanho das barras
                    borderSkipped: false // Para garantir bordas arredondadas em todas as partes
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
                        formatter: function(value) {
                            return value + '%'; // Exibir o percentual nas barras
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
                            padding: 10 // Adiciona espaço entre o nome e a barra
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
