import { useState, useEffect, useRef } from 'react';

/**
 * Hook para cache de dados com tempo de expiração
 * Evita re-fetching desnecessário de dados
 */
export const useCache = (key, fetchFunction, ttl = 5 * 60 * 1000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cacheRef = useRef(new Map());

  useEffect(() => {
    const fetchData = async () => {
      // Verificar se há dados em cache
      const cached = cacheRef.current.get(key);
      const now = Date.now();

      if (cached && (now - cached.timestamp) < ttl) {
        setData(cached.data);
        setLoading(false);
        return;
      }

      // Buscar dados
      try {
        setLoading(true);
        const result = await fetchFunction();
        
        // Armazenar em cache
        cacheRef.current.set(key, {
          data: result,
          timestamp: now
        });
        
        setData(result);
        setError(null);
      } catch (err) {
        setError(err);
        console.error(`Erro ao buscar dados (${key}):`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [key, ttl]);

  const invalidate = () => {
    cacheRef.current.delete(key);
  };

  const refetch = async () => {
    invalidate();
    setLoading(true);
    try {
      const result = await fetchFunction();
      cacheRef.current.set(key, {
        data: result,
        timestamp: Date.now()
      });
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, invalidate, refetch };
};

/**
 * Hook para debounce (evitar chamadas excessivas)
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook para detectar se está online/offline
 */
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

/**
 * Hook para lazy loading de imagens
 */
export const useLazyLoad = (ref) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(ref.current);

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref]);

  return isVisible;
};
