//Faz Referência
const frm = document.querySelector("form")
const inProduct = document.querySelector("#inProduct")
const inQuantity = document.querySelector("#inQuantity")
const stockTable = document.querySelector("#bodyStockTable")

//Eventos Formulário
frm.addEventListener("submit" , (e) => {
    e.preventDefault(); // evita envio do formulário

    const product = inProduct.value.trim(); //trim() remove espaços em branco 
    const quantity = Number(inQuantity.value)

    //Verificar se a quantidade é - ou = a 0
    if(!product || quantity <= 0) {
        alert("Preencha os campos corretamente!")
        return
    }

    //Criar a linha
    const row = document.createElement("tr")
    row.innerHTML = `<td>${product}</td><td>${quantity}</td>`

    stockTable.appendChild(row)

    //Limpar os campos
    inProduct.value = ""
    inQuantity.value = ""
    inProduct.focus()
})
