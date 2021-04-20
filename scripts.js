// Responsavel pelo pop-up para cadastro de uma nova entrada/saída
const Modal = {
    open(){
        // Abrir modal
        // Adicionar a classe active ao modal
         document.querySelector('.modal-overlay').classList.add('active')
    }, 
    close(){
        // Fechar o modal 
        // remover a classe active do modal
        document.querySelector('.modal-overlay').classList.remove('active')
    }
};

// Responsável plo armazenamento das informações no navegador local
const Storage ={
    // captura as informações
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [] // Transforma a string em array  e retona , caso não tenha o array solicitado , devolve um array vazio
    },

    // define as informações
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions)) // Transforma o array em string por meio de um objeto JSON e defini ele no lolcal storage
    }
}

// Parte lógica dos cards 
const Transaction = {
    all: Storage.get(), // Atribui ao Transactio o local de armazenamento onde se encotrarão os dados

    // Adiciona uma transação
    add(transaction){
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        let income = 0;
        // Pegar todas as transações
        // Para cada transação,
        Transaction.all.forEach(transaction =>{
            // Se ela for maior que zero
            if(transaction.amount > 0) {
                // Somar a uma variavel e retornar a variavel
                income += transaction.amount;
            }
        })
        return income;
    },

    expenses() {
        let expense = 0;
        // Pegar todas as transações
        // Para cada transação,
        Transaction.all.forEach(transaction =>{
            // Se ela for maior que zero
            if(transaction.amount < 0) {
                // Somar a uma variavel e retornar a variavel
                expense += transaction.amount;
            }
        })
        return expense;
    },
    
    // Exibe o total
    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
}

// Responsavel pelo visual
const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index){
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)

    },

    // 02:46:37
    innerHTMLTransaction(transaction, index) {

        const CSSclass =transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)
        const html= ` 
            <td class="description">${transaction.description}</td>
            <td class=${CSSclass}>${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Trannsação">
            </td>
        `

        return html
    },

    // Atualiza o saldo
    updateBalance() {
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())
    },

    // Limpa tela
    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

// Responsavel pela formatação dos valores númericos
const Utils = {
    // Criando a formatação
    formatAmount(value){
        value = Number(value) * 100
        
        return value
    },
    formatDate(date){
        // Split = separar
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "- " : ""

        value = String(value).replace(/\D/g,"")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR",{
            style: "currency",
            currency: "BRL"
        })
        return signal + value
    }
}

// Responsável pela captação de dados (input)
const Form = {
    // Interliga os valores do HTMl com o JavaScript
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    // Retorna todos os valores em apenas um local ( getValues)
    getValues(){
        return{
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        }
    },

    validateFields(){
        // Pega os valores de cada campo do form
        const { description, amount, date } = Form.getValues()
        
        
        // faz uma limpeza dos campos vazios (trim) (|| = ou)
        if(description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            // Retornar um objeto de erro
            throw new Error("Por favor preencha todos os campos")
        }
    },

    formatValues(){
        let { description, amount, date } = Form.getValues()
        // responsavel por aplicar a formatação do amount
        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        // retorna os valores formatados de
        return{
            // Quando o nome da classe é igual ao nome da variavel não precisamos utilizar "description: description,"
            description,
            amount,
            date
        }
        
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event){
        event.preventDefault()

        // Try tenta executar os passos repassados para ele ,Catch responsavel por capturar e tratar o erro
        try {   
            // Verificar se todas as informações foram preenchidas
            Form.validateFields()
            // Formatar os dados para salvar 
            const transaction = Form.formatValues()
            // salvar
            Transaction.add(transaction)
            // apagar os dados do formulário
            Form.clearFields()
            // modal feche
            Modal.close()
            // atualizar a aplicação está incluso no Transaction.add
            
            
        } catch (error) { 
            alert(error.message)
        }

       
    }
}



// Responsável pela execução
const App = {
    // Coloca na tela todos as despesas e balanço atual
    init() {

    // Adiciona as transações existentes
    Transaction.all.forEach((transaction , index) => {
    DOM.addTransaction(transaction, index)
    })

    // Atualiza o valor
    DOM.updateBalance()

    // Define todas as transações existentes
    Storage.set(Transaction.all)


    },

    // Atualiza , limpa a tela e coloca novamente as despesas e balanço atual
    reload() {
        DOM.clearTransactions()
        App.init()
    }
}

App.init()

