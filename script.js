document.addEventListener('DOMContentLoaded', function() {
    // --- Elementos do DOM ---
    const detalhesFesta = document.getElementById('detalhesFesta');
    const videoAniversario = document.getElementById('videoAniversario');
    // Elementos para a interação do presente/vídeo
    const imagemDoPresente = document.getElementById('imagemDoPresente');
    const areaPresente = document.getElementById('areaPresente');
    const videoWrapper = document.getElementById('videoWrapper'); // Este é o .video-container que agora tem um ID

    const balloonGameSection = document.getElementById('balloonGameSection');
    const startGameButton = document.getElementById('startGameButton');
    const gameArea = document.getElementById('gameArea');
    const iniciarJogoBtn = document.getElementById('iniciarJogoBtn');
    const balloonsToPopTargetTextEl = document.getElementById('balloonsToPopTargetText');
    const balloonsPoppedCountTextEl = document.getElementById('balloonsPoppedCountText');
    const balloonsTargetCountTextEl = document.getElementById('balloonsTargetCountText');
    const balloonGameFeedbackEl = document.getElementById('balloonGameFeedback');

    // --- Configurações do Jogo de Balões (se aplicável) ---
    const TOTAL_BALLOONS_TO_POP = 10; // Quantos balões o usuário precisa estourar
    const MAX_ACTIVE_BALLOONS = 6;   // Máximo de balões na tela ao mesmo tempo
    const BALLOON_SPAWN_INTERVAL = 1200; // Intervalo para tentar criar um novo balão (em ms)
    const SHIELD_IMAGE_SRC = './escudo.png';
    const SHIELD_POP_SOUND_SRC = './chicote.mp3';
    let shieldPopAudio = new Audio(SHIELD_POP_SOUND_SRC);

    let balloonsPopped = 0;
    let mainObjectiveAchieved = false; // Nova flag para controlar a revelação principal
    let balloonSpawnTimer;
    let gameStarted = false; // Nova flag para controlar se o jogo foi iniciado

    const SURPRISE_MUSIC_SRC = './surpresa.mp3';
    let surpriseMusic = new Audio(SURPRISE_MUSIC_SRC);
    surpriseMusic.loop = false;
    let surpriseMusicPlayed = false;

    // --- Inicialização do Jogo de Balões ---
    if (balloonGameSection && balloonsToPopTargetTextEl && balloonsTargetCountTextEl && balloonsPoppedCountTextEl) {
        function initBalloonGame() {
            balloonsToPopTargetTextEl.textContent = TOTAL_BALLOONS_TO_POP;
            balloonsTargetCountTextEl.textContent = TOTAL_BALLOONS_TO_POP;
            updatePoppedCountDisplay();
            mainObjectiveAchieved = false; // Reseta a flag ao iniciar/reiniciar
            gameStarted = true;
            
            // Esconde o botão e mostra a área do jogo
            if (startGameButton) startGameButton.style.display = 'none';
            if (gameArea) gameArea.style.display = 'block';
            
            // Inicia a geração de escudos
            balloonSpawnTimer = setInterval(spawnBalloon, BALLOON_SPAWN_INTERVAL);
        }
    }

    function spawnBalloon() {
        // Só gera escudos se o jogo estiver ativo
        if (!gameStarted || mainObjectiveAchieved) {
            return;
        }
        
        const activeShields = document.querySelectorAll('.game-shield').length;
        if (activeShields >= MAX_ACTIVE_BALLOONS) {
            return;
        }
        const shield = document.createElement('img');
        shield.classList.add('game-shield');
        shield.src = SHIELD_IMAGE_SRC;
        shield.alt = 'Escudo Mulher Maravilha';
        shield.style.left = Math.random() * (window.innerWidth - 70) + 'px';
        shield.style.animationDuration = (Math.random() * 5 + 6) + 's';
        shield.addEventListener('click', handleBalloonPop);
        shield.addEventListener('animationend', () => {
            if (shield.parentNode) {
                shield.remove();
            }
        });
        document.body.appendChild(shield);
    }

    function handleBalloonPop(event) {
        // Só processa cliques se o jogo estiver ativo
        if (!gameStarted || mainObjectiveAchieved) {
            return;
        }
        
        const poppedShield = event.target;
        poppedShield.remove();
        shieldPopAudio.currentTime = 0;
        shieldPopAudio.volume = 0.2;
        shieldPopAudio.play();
        balloonsPopped++;
        updatePoppedCountDisplay();
        if (balloonsPopped >= TOTAL_BALLOONS_TO_POP && !mainObjectiveAchieved) {
            revealMainContent();
            // Parar de gerar novos escudos
            clearInterval(balloonSpawnTimer);
        }
    }

    function updatePoppedCountDisplay() {
        if (balloonsPoppedCountTextEl) {
            balloonsPoppedCountTextEl.textContent = balloonsPopped;
        }
    }

    function revealMainContent() { // Função para revelar o conteúdo principal após o jogo
        mainObjectiveAchieved = true; // Marca que o objetivo principal foi alcançado

        if (balloonGameFeedbackEl) {
            balloonGameFeedbackEl.textContent = 'Parabéns! Você conseguiu!';
            balloonGameFeedbackEl.className = 'feedback success';
        }

        // Esconde a seção do jogo e mostra os detalhes da festa
        if(balloonGameSection) balloonGameSection.classList.add('hidden'); // Ou style.display = 'none'

        detalhesFesta.classList.remove('hidden');
        detalhesFesta.style.display = 'block'; // Garante visibilidade

        // Os balões continuarão a ser gerados e poderão ser estourados
        // O balloonSpawnTimer NÃO é limpo aqui
        // O vídeo NÃO é iniciado aqui, pois agora ele depende do clique no presente.
    }

    // --- Lógica para o Presente/Vídeo ---
    if (imagemDoPresente && areaPresente && videoWrapper && videoAniversario) {
        imagemDoPresente.addEventListener('click', () => {
            // Esconde a área do presente (imagem e texto de incentivo)
            areaPresente.style.display = 'none';
            
            // 1. Torna o contêiner do vídeo 'displayable' para que a transição CSS possa ocorrer
            videoWrapper.style.display = 'block';

            // 2. Força um reflow/repaint antes de adicionar a classe para garantir que a transição ocorra
            // Adicionar a classe 'visible' em um pequeno timeout ou requestAnimationFrame
            requestAnimationFrame(() => {
                videoWrapper.classList.add('visible');
            });
            // Alternativa com timeout:
            // setTimeout(() => {
            // videoWrapper.classList.add('visible');
            // }, 20); // Um pequeno atraso é suficiente
            
            videoAniversario.muted = false;
            videoAniversario.volume = 1.0; // Define o volume para 100%
            videoAniversario.play().catch(error => {
                console.error("Erro ao tentar reproduzir o vídeo após clique no presente:", error);
                // Navegadores podem ter políticas estritas sobre autoplay com som.
                // Como isso ocorre após uma interação do usuário (clique), geralmente é permitido.
                // Se houver problemas, os controles do vídeo (<video controls>)
                // permitirão que o usuário dê play manualmente.
            });
        });

        // Evento para quando o vídeo terminar
        videoAniversario.addEventListener('ended', () => {
            videoWrapper.classList.remove('visible');
            setTimeout(() => {
                videoWrapper.style.display = 'none';
                areaPresente.style.display = 'block';
                videoAniversario.currentTime = 0;
            }, 400);
            // Toca a música surpresa apenas se não estiver tocando
            if (!surpriseMusicPlayed) {
                surpriseMusicPlayed = true;
                surpriseMusic.currentTime = 0;
                surpriseMusic.volume = 0.2;
                surpriseMusic.play();
                surpriseMusic.onended = () => { surpriseMusicPlayed = false; };
            }
        });

    } else {
        // Log para ajudar a identificar se algum elemento do presente/vídeo não foi encontrado
        console.warn('Não foi possível inicializar a funcionalidade do presente/vídeo. Elementos ausentes:');
        if (!imagemDoPresente) console.warn('- imagemDoPresente não encontrada');
        if (!areaPresente) console.warn('- areaPresente não encontrado');
        if (!videoWrapper) console.warn('- videoWrapper não encontrado');
        if (!videoAniversario) console.warn('- videoAniversario não encontrado');
    }

    // --- Evento do botão para iniciar o jogo ---
    if (iniciarJogoBtn) {
        iniciarJogoBtn.addEventListener('click', function() {
            initBalloonGame();
        });
    }
});
