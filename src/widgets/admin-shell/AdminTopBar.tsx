import type { ComponentProps } from 'react';
import { PageTopBar } from '../../shared/ui/PageTopBar';

/** PageTopBar con la flecha dentro de la columna: a su izquierda está el menú lateral, no un margen libre. */
export function AdminTopBar(props: ComponentProps<typeof PageTopBar>) {
  return <PageTopBar {...props} backInColumn />;
}
