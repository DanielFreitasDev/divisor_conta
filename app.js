// --- Gerenciamento de Estado ---
const State = {
    data: {
        billName: '',
        serviceRate: 10,
        people: [],
        items: []
    },

    load() {
        const saved = localStorage.getItem('divisor_conta_data');
        if (saved) {
            try {
                this.data = JSON.parse(saved);
                if (!this.data.billName) this.data.billName = '';
            } catch (e) {
                console.error('Erro ao carregar dados', e);
            }
        }
    },

    // ALTERAÇÃO AQUI: Adicionado parâmetro 'shouldRender'
    save(shouldRender = true) {
        localStorage.setItem('divisor_conta_data', JSON.stringify(this.data));
        if (shouldRender) UI.render();
    },

    reset() {
        this.data = {billName: '', serviceRate: 10, people: [], items: []};
        this.save();
    },

    addPerson(name = '') {
        const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
        this.data.people.push({id, name});
        this.save(true); // Redesenha para mostrar o novo campo
        return id;
    },

    removePerson(id) {
        this.data.people = this.data.people.filter(p => p.id !== id);
        this.data.items.forEach(item => {
            item.participants = item.participants.filter(pid => pid !== id);
        });
        this.save(true);
    },

    addItem() {
        const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
        this.data.items.push({id, name: '', price: 0, participants: []});
        this.save(true);
        return id;
    },

    removeItem(id) {
        this.data.items = this.data.items.filter(i => i.id !== id);
        this.save(true);
    },

    toggleParticipant(itemId, personId) {
        const item = this.data.items.find(i => i.id === itemId);
        if (!item) return;

        if (item.participants.includes(personId)) {
            item.participants = item.participants.filter(pid => pid !== personId);
        } else {
            item.participants.push(personId);
        }
        // Aqui mantemos o render true para atualizar a cor do chip visualmente
        this.save(true);
    },

    updateItemValue(itemId, field, value) {
        const item = this.data.items.find(i => i.id === itemId);
        if (item) {
            item[field] = value;
            // Se for atualização direta via código, salva sem renderizar para garantir performance
            this.save(false);
        }
    }
};

// --- Utilitários de Formatação ---
const Format = {
    currency: (val) => val.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}),
    currencyRaw: (val) => val.toLocaleString('pt-BR', {minimumFractionDigits: 2}),
    parseMoney: (str) => {
        let clean = str.replace(/\D/g, "");
        return (parseInt(clean || "0", 10) / 100);
    }
};

// --- Gerenciamento da UI ---
const UI = {
    els: {
        peopleList: document.getElementById('peopleList'),
        itemsList: document.getElementById('itemsList'),
        peopleCount: document.getElementById('peopleCount'),
        itemsCount: document.getElementById('itemsCount'),
        billName: document.getElementById('billName'),
        serviceRate: document.getElementById('serviceRate'),
        resultsDialog: document.getElementById('resultsDialog'),
        resultsBody: document.getElementById('resultsBody'),
        optionsDialog: document.getElementById('optionsDialog')
    },

    init() {
        // Bind de Eventos Globais
        document.getElementById('addPersonBtn').addEventListener('click', () => {
            State.addPerson();
            // Pequeno delay para garantir que o DOM atualizou antes de focar
            setTimeout(() => {
                const inputs = document.querySelectorAll('.person-name-input');
                if (inputs.length) inputs[inputs.length - 1].focus();
            }, 50);
        });

        document.getElementById('addItemBtn').addEventListener('click', () => {
            State.addItem();
            setTimeout(() => {
                const rows = document.querySelectorAll('.item-row');
                if (rows.length) {
                    const input = rows[rows.length - 1].querySelector('.item-name-input');
                    if (input) input.focus();
                }
            }, 50);
        });

        document.getElementById('viewResultsBtn').addEventListener('click', () => UI.showResults());
        document.getElementById('closeDialogBtn').addEventListener('click', () => UI.els.resultsDialog.close());

        document.getElementById('optionsBtn').addEventListener('click', () => UI.els.optionsDialog.showModal());
        document.getElementById('closeOptionsBtn').addEventListener('click', () => UI.els.optionsDialog.close());

        document.getElementById('clearDataBtn').addEventListener('click', () => {
            if (confirm('Tem certeza? Isso apagará tudo.')) {
                State.reset();
                UI.els.optionsDialog.close();
            }
        });

        document.getElementById('loadExampleBtn').addEventListener('click', () => {
            UI.loadExample();
            UI.els.optionsDialog.close();
        });

        document.getElementById('themeToggle').addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
        });

        // CORREÇÃO: Salvar nome da conta sem perder foco (false)
        UI.els.billName.addEventListener('input', (e) => {
            State.data.billName = e.target.value;
            State.save(false);
        });

        document.querySelector('[data-action="dec-rate"]').addEventListener('click', () => {
            let v = State.data.serviceRate - 1;
            if (v < 0) v = 0;
            State.data.serviceRate = v;
            State.save(true);
        });
        document.querySelector('[data-action="inc-rate"]').addEventListener('click', () => {
            State.data.serviceRate += 1;
            State.save(true);
        });

        document.getElementById('shareBtn').addEventListener('click', Share.shareResults);

        State.load();

        if (localStorage.getItem('theme') === 'light') document.body.classList.add('light-theme');

        this.render();
    },

    render() {
        UI.els.billName.value = State.data.billName;
        UI.els.serviceRate.value = State.data.serviceRate;
        UI.els.peopleCount.textContent = State.data.people.length;
        UI.els.itemsCount.textContent = State.data.items.length;

        // Renderiza Pessoas
        UI.els.peopleList.innerHTML = '';
        State.data.people.forEach(person => {
            const div = document.createElement('div');
            div.className = 'person-row input-group inline-label';
            div.style.display = 'flex';
            div.style.gap = '0.5rem';

            div.innerHTML = `
                <input type="text" class="person-name-input" value="${person.name}" placeholder="Nome da pessoa">
                <button class="icon-btn remove-person-btn" style="color:var(--danger)">×</button>
            `;

            // CORREÇÃO AQUI: save(false) para não perder o foco
            div.querySelector('input').addEventListener('input', (e) => {
                person.name = e.target.value;
                State.save(false);
                // Atualiza manualmente os nomes nos chips (já que não vamos redesenhar a tela toda)
                document.querySelectorAll(`.chip[data-pid="${person.id}"]`).forEach(c => c.textContent = person.name || 'Pessoa');
            });

            div.querySelector('.remove-person-btn').addEventListener('click', () => State.removePerson(person.id));

            UI.els.peopleList.appendChild(div);
        });

        // Renderiza Itens
        UI.els.itemsList.innerHTML = '';
        State.data.items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'item-row';

            let participantsHTML = '';
            State.data.people.forEach(p => {
                const active = item.participants.includes(p.id) ? 'active' : '';
                participantsHTML += `<span class="chip ${active}" data-pid="${p.id}">${p.name || 'Pessoa'}</span>`;
            });

            if (State.data.people.length === 0) participantsHTML = '<small style="color:var(--text-muted)">Adicione pessoas primeiro</small>';

            div.innerHTML = `
                <div class="item-main">
                    <div style="flex:2">
                        <input type="text" class="item-name-input" value="${item.name}" placeholder="Item (ex: Cerveja)">
                    </div>
                    <div style="flex:1">
                        <input type="text" inputmode="numeric" class="item-price-input" value="${Format.currencyRaw(item.price)}" placeholder="0,00">
                    </div>
                    <button class="icon-btn remove-item-btn" style="color:var(--danger)">🗑️</button>
                </div>
                <div class="item-participants">
                    ${participantsHTML}
                </div>
            `;

            const nameInput = div.querySelector('.item-name-input');
            const priceInput = div.querySelector('.item-price-input');

            // CORREÇÃO AQUI: save(false) para não perder foco
            nameInput.addEventListener('input', (e) => {
                item.name = e.target.value;
                State.save(false);
            });

            // CORREÇÃO AQUI: save(false) para não perder foco durante a digitação do preço
            priceInput.addEventListener('input', (e) => {
                const val = Format.parseMoney(e.target.value);
                item.price = val;
                e.target.value = Format.currencyRaw(val);
                State.save(false);
            });

            div.querySelector('.remove-item-btn').addEventListener('click', () => State.removeItem(item.id));

            div.querySelectorAll('.chip').forEach(chip => {
                chip.addEventListener('click', () => {
                    if (!chip.dataset.pid) return;
                    State.toggleParticipant(item.id, chip.dataset.pid);
                });
            });

            UI.els.itemsList.appendChild(div);
        });
    },

    showResults() {
        const result = Calculator.calculate();
        if (result.error) {
            alert(result.error);
            return;
        }

        let html = `
            <table class="result-table">
                <thead><tr><th>Nome</th><th class="money">Total</th></tr></thead>
                <tbody>
        `;

        result.peopleTotals.forEach(pt => {
            html += `<tr>
                <td>${pt.name}</td>
                <td class="money">${Format.currency(pt.total)}</td>
            </tr>`;
        });

        html += `
            <tr style="border-top: 2px dashed var(--border)">
                <td>Subtotal</td>
                <td class="money">${Format.currency(result.subtotal)}</td>
            </tr>
            <tr>
                <td>Serviço (${result.rate}%)</td>
                <td class="money">${Format.currency(result.serviceTotal)}</td>
            </tr>
            <tr>
                <td><strong>TOTAL</strong></td>
                <td class="money"><strong>${Format.currency(result.grandTotal)}</strong></td>
            </tr>
            </tbody></table>
        `;

        UI.els.resultsBody.innerHTML = html;
        UI.els.resultsDialog.showModal();
    },

    loadExample() {
        State.reset();
        const p1 = State.addPerson('Daniel');
        const p2 = State.addPerson('Lucas');
        const p3 = State.addPerson('Manoel');

        // Para o exemplo, usamos save(true) implícito ao adicionar itens
        const i1 = State.addItem();
        State.updateItemValue(i1, 'name', 'Picanha');
        State.updateItemValue(i1, 'price', 150.00);
        State.toggleParticipant(i1, p1);
        State.toggleParticipant(i1, p2);
        State.toggleParticipant(i1, p3);

        const i2 = State.addItem();
        State.updateItemValue(i2, 'name', 'Cervejas');
        State.updateItemValue(i2, 'price', 80.00);
        State.toggleParticipant(i2, p1);
        State.toggleParticipant(i2, p2);

        State.data.billName = "Exemplo Rápido";
        State.data.serviceRate = 10;
        State.save(true); // Força render final
    }
};

// --- Lógica de Cálculo ---
const Calculator = {
    calculate() {
        if (State.data.people.length === 0) return {error: "Adicione pessoas primeiro."};
        if (State.data.items.length === 0) return {error: "Adicione itens consumidos."};

        let subtotal = 0;
        const peopleMap = {};

        State.data.people.forEach(p => {
            peopleMap[p.id] = {name: p.name || 'Pessoa', share: 0};
        });

        State.data.items.forEach(item => {
            if (item.price > 0 && item.participants.length > 0) {
                subtotal += item.price;
                const splitValue = item.price / item.participants.length;
                item.participants.forEach(pid => {
                    if (peopleMap[pid]) peopleMap[pid].share += splitValue;
                });
            }
        });

        const rate = State.data.serviceRate || 0;
        const serviceTotal = subtotal * (rate / 100);
        const grandTotal = subtotal + serviceTotal;

        const peopleTotals = Object.values(peopleMap).map(p => {
            let serviceShare = 0;
            if (subtotal > 0) {
                serviceShare = (p.share / subtotal) * serviceTotal;
            }
            return {
                name: p.name,
                total: p.share + serviceShare
            };
        }).sort((a, b) => b.total - a.total);

        return {subtotal, serviceTotal, grandTotal, rate, peopleTotals};
    }
};

// --- Compartilhamento ---
const Share = {
    async shareResults() {
        const res = Calculator.calculate();
        if (res.error) return;

        const date = new Date().toLocaleDateString('pt-BR');
        let text = `🧾 *Conta: ${State.data.billName || 'Restaurante'}* (${date})\n`;
        text += `------------------------------\n`;

        res.peopleTotals.forEach(p => {
            text += `👤 ${p.name}: ${Format.currency(p.total)}\n`;
        });

        text += `------------------------------\n`;
        text += `💰 *Total: ${Format.currency(res.grandTotal)}* (inc. ${res.rate}%)\n`;
        text += `\nGerado via App Divisor de Conta`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Divisão da Conta',
                    text: text
                });
            } catch (err) {
                console.log('Compartilhamento cancelado');
            }
        } else {
            try {
                await navigator.clipboard.writeText(text);
                alert('Resumo copiado para a área de transferência!');
            } catch (err) {
                alert('Não foi possível compartilhar automaticamente.');
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    UI.init();
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
        .then(() => console.log('SW registrado'));
}