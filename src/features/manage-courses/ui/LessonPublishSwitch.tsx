import { useState } from 'react';
import { Button } from '../../../shared/ui/Button';
import { Modal } from '../../../shared/ui/Modal';
import { Switch } from '../../../shared/ui/Switch';

interface LessonPublishSwitchProps {
  /** Lo guardado para la clase. Con el módulo en borrador se muestra apagado, sin tocar este valor. */
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  moduleTitle: string;
  isModulePublished: boolean;
  disabled?: boolean;
}

/**
 * Una clase no se ve publicada si su módulo está en borrador: el interruptor sale apagado y al
 * tocarlo explica por qué. Lo guardado no cambia, así que al publicar el módulo cada clase
 * vuelve a como estaba y no hay que encenderlas una por una.
 */
export function LessonPublishSwitch({ checked, onChange, label, moduleTitle, isModulePublished, disabled }: LessonPublishSwitchProps) {
  const [isExplaining, setIsExplaining] = useState(false);

  return (
    <>
      <Switch
        checked={isModulePublished && checked}
        onChange={(next) => {
          if (isModulePublished) onChange(next);
          else setIsExplaining(true);
        }}
        label={label}
        disabled={disabled}
      />
      <Modal
        open={isExplaining}
        title="Primero publica el módulo"
        description={`“${moduleTitle}” está en borrador. Para publicar esta clase, el módulo tiene que estar publicado.`}
        onClose={() => setIsExplaining(false)}
      >
        <div className="flex justify-end">
          <Button variant="primary" size="sm" onClick={() => setIsExplaining(false)}>
            Entendido
          </Button>
        </div>
      </Modal>
    </>
  );
}
