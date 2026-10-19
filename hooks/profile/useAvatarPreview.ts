import { useCallback, useEffect, useRef, useState } from 'react';

export default function useAvatarPreview(initialAvatar: string | undefined, isOpen: boolean) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(initialAvatar);
  const url = useRef<string | null>(null);
  const release = useCallback(() => {
    if (url.current) {
      URL.revokeObjectURL(url.current);
      url.current = null;
    }
  }, []);

  useEffect(() => {
    release();
    setFile(null);
    setPreview(initialAvatar);

    return release;
  }, [initialAvatar, isOpen, release]);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0];

    if (!next) return;

    release();
    url.current = URL.createObjectURL(next);
    setFile(next);
    setPreview(url.current);
  };

  return { file, preview, onChange };
}
