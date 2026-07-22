/**
 * Il hook restituisce un valore stabilizzato dopo una pausa.
 * Ogni modifica cancella il timer precedente, quindi una digitazione rapida
 * produce un solo aggiornamento al termine della pausa.
 */
import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(value: T, delay = 350) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Il timer sincronizza il valore React con il trascorrere del tempo.
    const timerId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // React esegue la cleanup prima del nuovo Effect e durante l'unmount.
    return () => window.clearTimeout(timerId);
  }, [delay, value]);

  return debouncedValue;
}
