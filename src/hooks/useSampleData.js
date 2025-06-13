import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const USER_PLACEHOLDER_NAME = '__TheUserName';
const USER_PLACEHOLDER_ID = '__TheUserId';
const USER_PLACEHOLDER_ICON = '__TheUserIcon';

export default function useSampleData(type = 'bills') {
  const { i18n } = useTranslation();
  const [sampleData, setSampleData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

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

  // replace the user placeholder with the user data
  // best way is to stringify the data, replace the placeholders, and then parse it back to an object
  const replaceDataUserPlaceholder = (userData) => {
    if (!userData?.name || !userData?.id || !userData?.icon) return;

    const stringifiedData = JSON.stringify(sampleData);

    const replacedDataWithIcon = stringifiedData.replaceAll(USER_PLACEHOLDER_ICON, userData.icon);
    const replacedDataWithName = replacedDataWithIcon.replaceAll(USER_PLACEHOLDER_NAME, userData.name);
    const replacedDataWithId = replacedDataWithName.replaceAll(USER_PLACEHOLDER_ID, userData.id);
    const replacedData = JSON.parse(replacedDataWithId);

    setSampleData(replacedData);

    // not the best way, but where we need this we are avoiding a re-render
    return replacedData;
  }

  return { sampleData, isLoading, error, replaceDataUserPlaceholder };
}
