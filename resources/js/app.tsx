import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import type { ComponentType } from 'react';

type PageModule = { default: ComponentType<Record<string, unknown>> };
const pages = import.meta.glob<PageModule>('./Pages/**/*.tsx');

createInertiaApp({
  resolve: async (name) => {
    const load = pages['./Pages/' + name + '.tsx'];
    if (!load) throw new Error('Unknown page: ' + name);
    return (await load()).default;
  },
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />);
  },
  progress: { color: '#50E3C2' },
});
