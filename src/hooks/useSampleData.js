import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function useSampleData(type = 'bills') {
  const { i18n } = useTranslation();
  const [sampleData, setSampleData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSampleData = async () => {
      try {
        const lang = i18n.language.split('-')[0];
        const dataPath = `../data/sample/${type}/${lang}.json`;
        const { default: data } = await import(dataPath);
        setSampleData(data);
        setIsLoading(false);
      } catch (error) {
        setError(error);
      }
    }

    loadSampleData();
  }, [type, i18n.language]);

  return { sampleData, isLoading, error };
}
