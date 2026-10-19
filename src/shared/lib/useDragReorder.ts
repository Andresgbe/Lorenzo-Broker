import { useRef, useState, type DragEvent, type MouseEvent } from 'react';

/**
 * Reordenar una lista arrastrando filas por su asa (HTML5 drag & drop).
 *
 * - Cada fila recibe `rowProps(id)`; su asa lleva `data-drag-handle={scope}`.
 *   El arrastre solo empieza desde el asa, así los enlaces y campos de la fila
 *   siguen funcionando.
 * - `scope` separa listas anidadas (módulos que contienen clases): arrastrar
 *   una clase no arrastra su módulo.
 * - Mientras se arrastra, el orden vive en un borrador local; al soltar se llama
 *   `onReorder(ids)` una sola vez y el borrador se descarta cuando termina.
 */
export function useDragReorder<T extends { id: string }>(
  items: T[],
  scope: string,
  onReorder: (orderedIds: string[]) => Promise<unknown> | void
) {
  const [draft, setDraft] = useState<string[] | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  // La fila solo es draggable mientras se presiona su asa: una fila siempre
  // draggable impide seleccionar texto en sus campos (Firefox, Safari).
  const [armedId, setArmedId] = useState<string | null>(null);
  const armedRef = useRef(false);

  const byId = new Map(items.map((item) => [item.id, item]));
  const ordered = draft ? draft.map((id) => byId.get(id)).filter((item): item is T => !!item) : items;

  function rowProps(id: string) {
    return {
      draggable: armedId === id || draggedId === id,
      onMouseDown: (event: MouseEvent<HTMLElement>) => {
        armedRef.current = !!(event.target as HTMLElement).closest(`[data-drag-handle="${scope}"]`);
        setArmedId(armedRef.current ? id : null);
      },
      onMouseUp: () => {
        if (!draggedId) setArmedId(null);
      },
      onDragStart: (event: DragEvent<HTMLElement>) => {
        if (!armedRef.current) {
          event.preventDefault();
          return;
        }
        event.stopPropagation();
        // Firefox no inicia el arrastre si dataTransfer está vacío.
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', id);
        setDraggedId(id);
        setDraft(items.map((item) => item.id));
      },
      onDragOver: (event: DragEvent<HTMLElement>) => {
        if (!draggedId) return;
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = 'move';
        if (draggedId === id) return;
        setDraft((prev) => {
          if (!prev) return prev;
          const from = prev.indexOf(draggedId);
          const to = prev.indexOf(id);
          if (from === -1 || to === -1) return prev;
          const next = [...prev];
          next.splice(from, 1);
          next.splice(to, 0, draggedId);
          return next;
        });
      },
      onDrop: (event: DragEvent<HTMLElement>) => {
        if (draggedId) event.preventDefault();
      },
      onDragEnd: (event: DragEvent<HTMLElement>) => {
        if (!draggedId) return;
        event.stopPropagation();
        armedRef.current = false;
        setArmedId(null);
        setDraggedId(null);
        const final = draft;
        const unchanged = !final || final.join() === items.map((item) => item.id).join();
        if (unchanged) {
          setDraft(null);
          return;
        }
        void Promise.resolve(onReorder(final)).finally(() => setDraft(null));
      },
    };
  }

  return { ordered, draggedId, rowProps };
}
