import { register } from 'node:module';
import { pathToFileURL } from 'url';

register('./hooks.mjs', import.meta.url);
