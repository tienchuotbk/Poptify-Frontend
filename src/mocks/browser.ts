import { setupWorker } from 'msw/browser';
import { devHandlers } from './dev-handlers';

export const worker = setupWorker(...devHandlers);
