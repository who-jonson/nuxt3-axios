import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  hooks: {
    'mkdist:entries': (ctx, entries) => {
      entries.push({ input: './src/runtime/composables/', outDir: './dist/runtime/composables', ext: 'cjs', format: 'cjs', builder: 'mkdist' });
    }
  }
});
