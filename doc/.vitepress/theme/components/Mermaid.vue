<template>
  <div class="mermaid-container my-6 flex justify-center overflow-x-auto rounded-xl border border-zinc-200 bg-white/70 p-6 shadow-sm backdrop-blur transition-all dark:border-zinc-800 dark:bg-zinc-900/50">
    <div
      v-if="svgContent"
      class="mermaid-svg flex justify-center w-full [&>svg]:max-w-full [&>svg]:h-auto"
      v-html="svgContent"
    />
    <div
      v-else-if="errorMessage"
      class="rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-mono text-rose-600 dark:text-rose-400"
    >
      <p class="font-bold mb-1">Diagram Render Error</p>
      <pre class="whitespace-pre-wrap">{{ errorMessage }}</pre>
    </div>
    <div
      v-else
      class="py-8 text-center text-xs text-zinc-400 font-mono animate-pulse"
    >
      Rendering diagram...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { useData } from 'vitepress';

const props = defineProps({
  graph: {
    type: String,
    required: true,
  },
});

const svgContent = ref('');
const errorMessage = ref('');
const { isDark } = useData();

function decodeGraph(encoded) {
  if (!encoded) return '';
  try {
    const binary = atob(encoded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return encoded;
  }
}

async function renderChart() {
  if (typeof window === 'undefined') return;

  const rawCode = decodeGraph(props.graph).trim();
  if (!rawCode) return;

  try {
    const mermaidModule = await import('mermaid');
    const mermaid = mermaidModule.default || mermaidModule;

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      theme: isDark.value ? 'dark' : 'default',
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      themeVariables: isDark.value
        ? {
            darkMode: true,
            background: 'transparent',
            primaryColor: '#1e293b',
            primaryTextColor: '#f8fafc',
            primaryBorderColor: '#334155',
            lineColor: '#64748b',
            secondaryColor: '#0f172a',
            tertiaryColor: '#1e293b',
          }
        : {
            darkMode: false,
            background: 'transparent',
          },
    });

    const uniqueId = 'mermaid-' + Math.random().toString(36).substring(2, 9);
    const { svg } = await mermaid.render(uniqueId, rawCode);
    svgContent.value = svg;
    errorMessage.value = '';

    const tempEl = document.getElementById(uniqueId);
    if (tempEl) tempEl.remove();
  } catch (err) {
    console.error('[Mermaid] render error:', err);
    errorMessage.value = err?.message || String(err);
  }
}

onMounted(() => {
  nextTick(() => {
    renderChart();
  });
});

watch(isDark, () => {
  renderChart();
});

watch(
  () => props.graph,
  () => {
    renderChart();
  }
);
</script>
