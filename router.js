import {Router} from "express";
import Controller from "./controller.js";

const router = new Router()

router.post('/create', Controller.create)
router.get('/getOne/:id', Controller.getOne)
router.get('/getAll', Controller.getAll)
router.put('/update', Controller.update)
router.delete('/delete/:id', Controller.delete)

router.post('/searchTitle', Controller.searchTitle)

router.get('/booksAndAuthors', Controller.booksAndAuthors)
router.get('/getTopThreeBooksOfPrice', Controller.getTopThreeBooksOfPrice)
router.post('/getDiscountOfId', Controller.getDiscountOfId)

export default router