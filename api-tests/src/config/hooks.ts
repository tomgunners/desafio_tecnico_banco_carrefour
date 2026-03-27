import addContext from 'mochawesome/addContext';
import { attachment } from 'allure-js-commons';
import { ApiUtils } from '../utils/api.utils';

export const mochaHooks = {

  async afterEach(this: Mocha.Context): Promise<void> {
    if (this.currentTest?.state !== 'failed') return;

    const response = ApiUtils.getLastResponse();
    if (!response) return;

    const evidence = {
      status: response.status,
      headers: response.headers,
      body: response.body,
    };

    try {
      addContext(this, {
        title: `HTTP Response — ${response.status}`,
        value: evidence,
      });
    } catch (err) {
      console.warn('[hooks] Falha ao adicionar contexto no Mochawesome:', err);
    }

    try {
      await attachment(
        `HTTP Response — ${response.status}`,
        JSON.stringify(evidence, null, 2),
        'application/json'
      );
    } catch (err) {
      console.warn('[hooks] Falha ao adicionar anexo no Allure:', err);
    }
  },

};
