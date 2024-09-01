// /routers/router.js
import { Router } from 'express';

class CustomRouter {
  constructor() {
    this.router = Router();
    this.init();
  }

  getRouter() {
    return this.router;
  }

  get(path, ...callbacks) {
    this.router.get(
      path,
      this.generateCustomResponse,
      this.applyCallbacks(callbacks)
    );
  }

  post(path, ...callbacks) {
    this.router.post(
      path,
      this.generateCustomResponse,
      this.applyCallbacks(callbacks)
    );
  }

  put(path, ...callbacks) {
    this.router.put(
      path,
      this.generateCustomResponse,
      this.applyCallbacks(callbacks)
    );
  }

  delete(path, ...callbacks) {
    this.router.delete(
      path,
      this.generateCustomResponse,
      this.applyCallbacks(callbacks)
    );
  }

  applyCallbacks(callbacks) {
    return callbacks.map((callback) => async (req, res, next) => {
      try {
        await callback(req, res, next);
      } catch (error) {
        res.status(500).send(error);
      }
    });
  }

  generateCustomResponse(req, res, next) {
    res.sendSuccess = (payload) => res.send({ status: 'success', payload });
    res.sendServerError = (error) =>
      res.status(500).send({ status: 'error', error });
    res.sendUserError = (error) =>
      res.status(400).send({ status: 'error', error });
    next();
  }
}

export default CustomRouter;
