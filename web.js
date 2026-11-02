const mainTable = document.getElementById('showBlock')

const btnGetAll = document.getElementById('getAll')

const btnGetSearch = document.getElementById('getSearch')
const inputGetSearch = document.getElementById('getSearchInput')

btnGetAll.addEventListener('click', async () => {
    const res = await fetch('http://localhost:5000/psql/getAll?limit=3')

    const data = await res.json()

    console.log(data)

    if (!res.ok) {
        console.log(data.message)
        return data.message
    }

    mainTable.innerHTML = ''

    data.result.forEach(book => {
        const showAllBlock = document.createElement('div')
        showAllBlock.className = 'showAllTables_blocks'
        showAllBlock.innerHTML = `
        <h3>${book.title}</h3>
        <p>год выпуска: ${book.publication_year}</p>
        <p>цена книги: $${book.price}</p>
        <p>автор книги: ${book.full_name}</p>
        `
        mainTable.appendChild(showAllBlock)
    })
})

btnGetSearch.addEventListener('click', async () => {

    const title = inputGetSearch.value

    const res = await fetch('http://localhost:5000/psql/searchTitle', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({title})
    })

    const data = await res.json()

    console.log(data.message)

    if (!res.ok) {
        console.log(data.message)
        return data.message
    }

    mainTable.innerHTML = ''

    data.result.forEach(book => {
        const showAllBlock = document.createElement('div')
        showAllBlock.className = 'showAllTables_blocks'
        showAllBlock.innerHTML = `
        <h3>${book.title}</h3>
        <p>год выпуска: ${book.publication_year}</p>
        <p>цена книги: $${book.price}</p>
        <p>автор книги: ${book.full_name}</p>
        `
        mainTable.appendChild(showAllBlock)
    })

})