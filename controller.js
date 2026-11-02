import db from './db.js'

class Controller {

    async create(req, res) {
        try {
            const {title, year, price, author_id} = req.body

            if (!title || !year || !price || !author_id) {
                return res.status(400).json({
                    message: "заполните все поля"
                })
            }

            const isYearValid = Number(year)
            const isPriceValid = Number(price)

            if (isNaN(isPriceValid) || isNaN(isYearValid)) {
                return res.status(400).json({
                    message: "поля price и publication_year должны быть числами"
                })
            }

            const createNew = await db.query(
                'insert into books (title, publication_year, price, author_id) values ($1,$2,$3,$4) returning *', [title, year, price, author_id]
            )

            return res.status(200).json({
                message: "запрос успешно обработан",
                result: createNew.rows[0]
            })

        } catch (e) {
            console.log(e)
            return res.status(500).json({
                message: "скорее всего ошибка на сервере"
            })
        }
    }

    async getOne(req, res) {
        try {
            const {id} = req.params

            const isIdValid = Number(id)
            if (isNaN(isIdValid)) {
                return res.status(400).json({
                    message: "в id должно быть только число"
                })
            }

            const showOneTable = await db.query(
                'select * from books where id = $1', [id]
            )

            if (showOneTable.rows.length === 0) {
                return res.status(400).json({
                    message: "по такому id ничего не зарегистрировано"
                })
            }

            return res.status(200).json({
                message: "запрос успешно обработан",
                result: showOneTable.rows[0]
            })

        } catch (e) {
            return res.status(500).json({
                message: "скорее всего ошибка на сервере"
            })
        }
    }

    async getAll(req, res) {
        try {

            const limit = req.query.limit || 5

            const isLimitValid = Number(limit)
            if (isNaN(isLimitValid)) {
                return res.status(400).json({
                    message: "введите число"
                })
            }

            const showTables = await db.query(
                'select b.title, b.publication_year, b.price, a.full_name from books b join authors a on a.id = b.author_id limit $1', [limit]
            )

            const getBooksCount = await db.query('select count(title) from books')

            return res.status(200).json({
                message: "запрос успешно обработан",
                result: showTables.rows,
                limit: isLimitValid || 5,
                all: Number(getBooksCount.rows[0].count)
            })

        } catch (e) {
            console.log(e)
            return res.status(500).json({
                message: "скорее всего ошибка на сервере"
            })
        }
    }

    async update(req, res) {
        try {

            const {id, title, publication_year, price, author_id} = req.body

            if (!id || !title || !publication_year || !price || !author_id) {
                return res.status(400).json({
                    message: "заполните все поля"
                })
            }

            const isYearValid = Number(publication_year)
            const isPriceValid = Number(price)

            if (isNaN(isPriceValid) || isNaN(isYearValid)) {
                return res.status(400).json({
                    message: "поля price и publication_year должны быть числами"
                })
            }

            const updateTable = await db.query(
                'update books set title = $1, publication_year = $2, price = $3, author_id = $4 where id = $5 returning *',
                [title, publication_year, price, author_id, id]
            )

            return res.status(200).json({
                message: "запрос успешно обработан",
                result: updateTable.rows[0]
            })

        } catch (e) {
            console.log(e)
            return res.status(500).json({
                message: "скорее всего ошибка на сервере"
            })
        }
    }

    async searchTitle(req, res) {
        try {

            const {title} = req.body

            const limit = req.query.limit || 5

            const isLimitValid = Number(limit)
            if (isNaN(isLimitValid)) {
                return res.status(400).json({
                    message: "введите число"
                })
            }

            if (!title) {
                return res.status(400).json({
                    message: "введите название"
                })
            }

            console.log(title)

            const findBook = await db.query(
                'select b.title, b.publication_year, b.price, a.full_name from books b join authors a on a.id = b.author_id where b.title ilike $1 limit $2', [`%${title}%`, limit]
            )

            const getBooksCount = await db.query('select count(title) from books')

            return res.status(200).json({
                message: "запрос успешно обработан",
                result: findBook.rows,
                limit: isLimitValid || 5,
                all: Number(getBooksCount.rows[0].count)
            })

        } catch (e) {
            return res.status(500).json({
                message: `скорее всего ошибка на сервере`,
            })
        }
    }

    async delete(req, res) {

        const client = await db.connect()
        let deleteOriginColum

        try {
            const {id} = req.params

            const isIdValid = Number(id)
            if (isNaN(isIdValid)) {
                return res.status(400).json({
                    message: "в id должно быть только число"
                })
            }

            try {
                await client.query('begin')

                await client.query('delete from loads where id = $1 returning *', [id])
                deleteOriginColum = await client.query('delete from books where id = $1 returning *', [id])

                await client.query('commit')

                if (deleteOriginColum.rows.length === 0) {
                    return res.status(400).json({
                        message: "по такому id ничего не найдено"
                    })
                }

                return res.status(200).json({
                    message: "запрос успешно обработан",
                    result: deleteOriginColum.rows[0]
                })
            } catch (e) {
                if (client) {
                    await client.query('rollback')
                }
                return res.status(400).json({
                    message: "ошибка при закрытии транзакции"
                })
            } finally {
                client.release()
            }

        } catch (e) {
            return res.status(500).json({
                message: `скорее всего ошибка на сервере`,
            })
        }
    }

    async booksAndAuthors(req, res) {
        try {
            const createTable = await db.query(`
                select a.id,
                       a.full_name,
                       a.country,
                       b.title,
                       b.price,
                       b.publication_year,
                       b.author_id,
                       r.full_name as "имя читателя",
                       l.reader_id,
                       l.book_id
                from authors a
                         join books b on a.id = b.author_id
                         join loads l on b.id = l.book_id
                         join readers r on r.id = l.reader_id
            `);

            return res.status(200).json({
                message: "запрос обработан успешно",
                result: createTable.rows
            })

        } catch (e) {
            console.log(e)
            return res.status(500).json({
                message: "скорее всего ошибка на сервере"
            })
        }
    }

    async getTopThreeBooksOfPrice(req, res) {
        try {
            const getTopPrice = await db.query(
                'select * from books order by price desc limit 3'
            )

            return res.status(200).json({
                message: "запрос успешно обработан",
                result: getTopPrice.rows
            })

        } catch (e) {
            console.log(e)
            return res.status(500).json({
                message: "скорее всего ошибка на сервере"
            })
        }
    }

    // функция скидки
    async getDiscountOfId(req, res) {
        try {

            const {b_id, b_percent} = req.query

            if (!b_id || !b_percent) {
                return res.status(400).json({
                    message: "заполните все поля"
                })
            }

            const isIdValid = Number(b_id)
            const isPercentValid = Number(b_percent)

            if (isNaN(isIdValid) || isNaN(isPercentValid)) {
                return res.status(400).json({
                    message: "введите числовые значения"
                })
            }

            const getDiscount = await db.query(
                'select getDiscountOfId($1, $2) as "discountPrice"', [isIdValid, isPercentValid]
            );

            if (!getDiscount.rows[0] || getDiscount.rows[0].discountPrice === null) {
                return res.status(400).json({
                    message: "по указанному id ничего не найдено"
                })
            }

            return res.status(200).json({
                message: "запрос обработан успешно",
                result: getDiscount.rows[0].discountPrice
            })

        } catch (e) {
            console.log(e)
            return res.status(500).json({
                message: "скорее всего ошибка на сервере"
            })
        }
    }

}

export default new Controller()