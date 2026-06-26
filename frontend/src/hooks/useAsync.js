import { useCallback, useEffect, useState } from "react";

/**
 * Hook reutilizable para cargar datos de la API.
 * Centraliza el manejo de loading/error y expone `reload` para refrescar.
 *
 * @param {Function} asyncFn  Funcion async que devuelve los datos.
 * @param {Array}    deps     Dependencias que disparan una recarga al cambiar.
 */
export function useAsync(asyncFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      setData(result);
    } catch (err) {
      setError(err.uiMessage || "No se pudieron cargar los datos.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  return { data, loading, error, reload: run, setData };
}
