let timerInterval;

function startTimer() {
    const timerElement = document.getElementById('timer');
    let seconds = 0;

    timerInterval = setInterval(() => {
        seconds++;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        timerElement.textContent = `Tempo de execucao: ${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    document.getElementById('timer').textContent = 'Tempo de execucao: 00:00';
}

document.getElementById('play').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (!tab || tab.url.startsWith('chrome://') || tab.url.startsWith('about:')) {
            alert('Nao e possivel registrar interacoes nesta pagina.');
            return;
        }

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        }, () => {
            if (chrome.runtime.lastError) {
                alert('Erro ao injetar o script: ' + chrome.runtime.lastError.message);
            } else {
                chrome.tabs.sendMessage(tab.id, { action: 'startRecording' }, (response) => {
                    if (chrome.runtime.lastError) {
                        alert('Erro ao iniciar o registro: ' + chrome.runtime.lastError.message);
                    } else if (response && response.status === 'recordingStarted') {
                        alert('Registro de interacoes iniciado.');
                        document.getElementById('play').disabled = true;
                        document.getElementById('pause').disabled = false;
                        document.getElementById('finalize').disabled = false;
                        document.getElementById('export').disabled = true;
                        document.getElementById('status').textContent = 'Status: Gravando';
                        startTimer();
                    } else {
                        alert('Erro desconhecido ao iniciar o registro.');
                    }
                });
            }
        });
    });
});

document.getElementById('pause').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'pauseRecording' }, (response) => {
            if (chrome.runtime.lastError) {
                alert('Erro ao pausar o registro: ' + chrome.runtime.lastError.message);
            } else {
                alert('Registro pausado.');
                document.getElementById('play').disabled = false;
                document.getElementById('pause').disabled = true;
                document.getElementById('status').textContent = 'Status: Pausado';
                stopTimer();
            }
        });
    });
});

document.getElementById('finalize').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'finalizeRecording' }, (response) => {
            if (chrome.runtime.lastError) {
                alert('Erro ao finalizar o registro: ' + chrome.runtime.lastError.message);
            } else {
                if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                    chrome.storage.local.set({ interactions: response.interactions }, () => {
                        alert('Registro finalizado. Voce pode exportar os cenarios.');
                        document.getElementById('play').disabled = false;
                        document.getElementById('pause').disabled = true;
                        document.getElementById('finalize').disabled = true;
                        document.getElementById('export').disabled = false;
                        document.getElementById('status').textContent = 'Status: Finalizado';
                        stopTimer();
                    });
                } else {
                    alert('Registro finalizado. Voce pode exportar os cenarios. (Sem persistência local)');
                    document.getElementById('play').disabled = false;
                    document.getElementById('pause').disabled = true;
                    document.getElementById('finalize').disabled = true;
                    document.getElementById('export').disabled = false;
                    document.getElementById('status').textContent = 'Status: Finalizado';
                    stopTimer();
                }
            }
        });
    });
});
