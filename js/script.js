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

    //Verificar se já existe o produto na tabela
    let existeRow = null
    const rows = stockTable.querySelectorAll("tr")

    rows.forEach((row) => {
        const productName = row.querySelector("td").textContent
        if(productName.toLowerCase() === product.toLowerCase()){
            existeRow = row
        }
    });
    
    //Se ja existir, pergunta se quer adicionar/atualizar a quantidade
    if (existeRow) {
        const confirmUpdate = confirm(`${product} já está em estoque. Deseja adicionar a quantidade informada?`)
    
    if(confirmUpdate){
        let quantityCell = existeRow.querySelector("td:nth-child(2)")
        let currentQuantity = parseInt(quantityCell.textContent)
        quantityCell.textContent = currentQuantity + quantity
    }
  } else {
    const newRow = document.createElement("tr")

    newRow.innerHTML = 
   `<td>${product}</td>
    <td>${quantity}</td>
    <td class = "actions">
    <button class="btn-edit"><i class="fa-solid fa-pen-to-square"></i></button>
    <button class="btn-delete"><i class="fa-solid fa-trash"></i></button>
    </td>`
    
    stockTable.appendChild(newRow)
  }

    //Limpar os campos
    inProduct.value = ""
    inQuantity.value = ""
    inProduct.focus()
})

//Event Delegation para botões de Ação
stockTable.addEventListener("click" , (e) => {
    const deleteBtn = e.target.closest(".btn-delete")
    const editBtn = e.target.closest(".btn-edit")

    if(deleteBtn) {
        const row = deleteBtn.closest("tr")
        row.remove(); //remover a linha da tabela
    }

    if(editBtn) {
        const row = editBtn.closest("tr")
        const productName = row.querySelector("td:first-child").textContent
        const productQuantity = row.querySelector("td:nth-child(2)").textContent

        //Prompt para editar
        const newQuantity = prompt(`Editar quantidade do Produto "${productName}":` , productQuantity)

        if(newQuantity !== null && !isNaN(newQuantity) && newQuantity > 0) {
            row.querySelector("td:nth-child(2)").textContent = Number(newQuantity)
        } else if (newQuantity !== null){
            alert("Quantidade inválida!")
        }
    }
})

//Campo de Busca
const inSearch = document.querySelector("#inSearch")

inSearch.addEventListener("input" , () => {
    const filter = inSearch.value.toLowerCase()
    const rows = stockTable.querySelectorAll("tr")

    rows.forEach((row) => {
        const productName = row.querySelector("td").textContent.toLocaleLowerCase()
        if(productName.includes(filter)){
            row.style.display = ""
        } else {
            row.style.display = "none"
        }
    })
})

//Função Mostrar Estoque
const linkStock = document.querySelector("#linkStock")
const sectionStock = document.querySelector("#estoque")

linkStock.addEventListener("click" , (e) => {
    e.preventDefault();


    sectionStock.classList.toggle("ativo") // Alternar a class "ativo"
    

    if(sectionStock.classList.contains("ativo")) //Se estiver ativo, rola até ele
    sectionStock.scrollIntoView({behavior: "smooth"}) /*rolagem suave*/
})
