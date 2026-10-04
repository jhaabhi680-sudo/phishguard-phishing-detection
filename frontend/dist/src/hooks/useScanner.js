/**
 * frontend/src/hooks/useScanner.js
 * Custom React hook managing URL scanning, step-by-step loading states, and results.
 */

import { useState, useCallback } from 'react';
import { phishguardApi } from '../services/api.js';

const SCAN_STEPS = [
  'Analyzing URL...',
  'Extracting features...',
  'Running machine learning model...',
];

export function useScanner() {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const scanUrl = useCallback(async (inputUrl) => {
    const targetUrl = (inputUrl !== undefined ? inputUrl : url).trim();
    if (!targetUrl) {
      setError('Please enter a valid URL.');
      return null;
    }

    setError(null);
    setResult(null);
    setIsScanning(true);
    setScanStepIndex(0);

    const step1Timer = setTimeout(() => setScanStepIndex(1), 280);
    const step2Timer = setTimeout(() => setScanStepIndex(2), 560);

    try {
      const [apiResponse] = await Promise.all([
        phishguardApi.predictUrl(targetUrl),
        new Promise((resolve) => setTimeout(resolve, 820)),
      ]);
      setResult(apiResponse);
      return apiResponse;
    } catch (err) {
      setError(err.message || 'Please enter a valid URL.');
      return null;
    } finally {
      clearTimeout(step1Timer);
      clearTimeout(step2Timer);
      setIsScanning(false);
    }
  }, [url]);

  const resetScanner = useCallback(() => {
    setUrl('');
    setResult(null);
    setError(null);
    setIsScanning(false);
  }, []);

  return {
    url,
    setUrl,
    isScanning,
    scanStepText: SCAN_STEPS[scanStepIndex] || SCAN_STEPS[0],
    scanStepIndex,
    scanSteps: SCAN_STEPS,
    result,
    setResult,
    error,
    setError,
    scanUrl,
    resetScanner,
  };
}
